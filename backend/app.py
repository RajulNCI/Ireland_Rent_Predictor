"""
Dublin Rent Predictor — Flask Backend
======================================
Routes:
  GET  /health    — health check
  GET  /options   — dropdown values for the frontend
  POST /predict   — predict rent, log to DynamoDB

Requirements:
  pip install -r requirements.txt
"""

import os
import io
import uuid
import logging
from datetime import datetime, timezone

import boto3
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# ──────────────────────────────────────────────
# App setup
# ──────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Config from environment variables
# ──────────────────────────────────────────────
AWS_REGION      = os.environ.get("AWS_REGION",      "eu-west-1")
S3_BUCKET       = os.environ.get("S3_BUCKET",       "dublin-rent-predictor")
DYNAMO_TABLE    = os.environ.get("DYNAMO_TABLE",    "rent-predictions")
PIPELINE_KEY    = os.environ.get("PIPELINE_KEY",    "dublin_rent_pipeline.pkl")
METRICS_KEY     = os.environ.get("METRICS_KEY",     "model_metrics.pkl")
DATA_KEY        = os.environ.get("DATA_KEY",        "Dublin_Rent_Cleaned.csv")

# ──────────────────────────────────────────────
# AWS clients
# ──────────────────────────────────────────────
s3      = boto3.client("s3",       region_name=AWS_REGION)
dynamo  = boto3.resource("dynamodb", region_name=AWS_REGION)
table   = dynamo.Table(DYNAMO_TABLE)

# ──────────────────────────────────────────────
# Load model + data from S3 (once at startup)
# ──────────────────────────────────────────────
def load_from_s3(key: str):
    log.info(f"Loading {key} from S3 bucket {S3_BUCKET}")
    obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
    return io.BytesIO(obj["Body"].read())

try:
    pipeline = joblib.load(load_from_s3(PIPELINE_KEY))
    metrics  = joblib.load(load_from_s3(METRICS_KEY))
    df_ref   = pd.read_csv(load_from_s3(DATA_KEY))
    log.info("✅ Model, metrics and data loaded from S3")
except Exception as e:
    log.warning(f"⚠️ Could not load from S3: {e} — falling back to local files")
    pipeline = joblib.load("dublin_rent_pipeline.pkl")
    metrics  = joblib.load("model_metrics.pkl")
    df_ref   = pd.read_csv("Dublin_Rent_Cleaned.csv")

# ──────────────────────────────────────────────
# Pre-compute dropdown options from data
# ──────────────────────────────────────────────
OPTIONS = {
    "locations": sorted(df_ref["Location"].dropna().unique().tolist()),
    "types":     sorted(df_ref["Type"].dropna().unique().tolist()),
    "bers":      sorted(df_ref["BER"].dropna().unique().tolist()),
    "beds_min":  int(df_ref["Beds_Numeric"].min()),
    "beds_max":  int(df_ref["Beds_Numeric"].max()),
    "baths_min": int(df_ref["Baths_Numeric"].min()),
    "baths_max": int(df_ref["Baths_Numeric"].max()),
}

# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": metrics.get("model", "unknown")}), 200


@app.route("/options", methods=["GET"])
def options():
    return jsonify(OPTIONS), 200


@app.route("/predict", methods=["POST"])
def predict():
    body = request.get_json(force=True)

    # ── Validate required fields ──
    required = ["Beds_Numeric", "Baths_Numeric", "Type", "BER", "Location"]
    missing  = [f for f in required if f not in body]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        input_df = pd.DataFrame([{
            "Beds_Numeric":  float(body["Beds_Numeric"]),
            "Baths_Numeric": float(body["Baths_Numeric"]),
            "Type":          str(body["Type"]),
            "BER":           str(body["BER"]),
            "Location":      str(body["Location"]),
        }])

        prediction = round(float(pipeline.predict(input_df)[0]))
        rmse       = round(float(metrics["rmse"]))

        # Area average from reference data
        area_avg = df_ref[df_ref["Location"] == body["Location"]]["Monthly_Price"].mean()
        area_avg = round(float(area_avg)) if not pd.isna(area_avg) else prediction

        result = {
            "prediction":   prediction,
            "lower_bound":  max(0, prediction - rmse),
            "upper_bound":  prediction + rmse,
            "rmse":         rmse,
            "model":        metrics.get("model", "Gradient Boosting"),
            "area_average": area_avg,
        }

        # ── Log to DynamoDB ──
        try:
            table.put_item(Item={
                "id":          str(uuid.uuid4()),
                "timestamp":   datetime.now(timezone.utc).isoformat(),
                "location":    body["Location"],
                "beds":        str(body["Beds_Numeric"]),
                "baths":       str(body["Baths_Numeric"]),
                "type":        body["Type"],
                "ber":         body["BER"],
                "prediction":  str(prediction),
                "area_avg":    str(area_avg),
            })
            log.info(f"Logged prediction to DynamoDB: €{prediction}")
        except Exception as e:
            log.warning(f"DynamoDB log failed (non-fatal): {e}")

        return jsonify(result), 200

    except Exception as e:
        log.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


# ──────────────────────────────────────────────
# Run
# ──────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
