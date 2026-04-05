"""
Ireland Rent Predictor — Flask Backend (10 Counties, Real Models)
=================================================================
Routes:
  GET  /health          — health check
  GET  /options?city=   — dropdown values per city
  POST /predict         — predict rent, log to DynamoDB
  GET  /cities/compare  — avg rent per city for comparison chart
"""

import os
import io
import uuid
import logging
import time
from datetime import datetime, timezone

import boto3
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

AWS_REGION   = os.environ.get("AWS_REGION",   "eu-west-1")
S3_BUCKET    = os.environ.get("S3_BUCKET",    "ireland-rent-predictor-models-4a766eff")
DYNAMO_TABLE = os.environ.get("DYNAMO_TABLE", "rent-predictions")

# ──────────────────────────────────────────────
# All supported counties
# ──────────────────────────────────────────────
SUPPORTED_CITIES = [
    "Dublin", "Cork", "Galway", "Kildare", "Meath",
    "Louth", "Limerick", "Waterford", "Wexford", "Kerry"
]

# Data quality tiers based on training results
CITY_TIERS = {
    "Dublin":    {"tier": "good",     "r2": 0.69, "rows": 801},
    "Kildare":   {"tier": "good",     "r2": 0.71, "rows": 75},
    "Waterford": {"tier": "good",     "r2": 0.81, "rows": 54},
    "Kerry":     {"tier": "good",     "r2": 0.72, "rows": 32},
    "Galway":    {"tier": "moderate", "r2": 0.53, "rows": 103},
    "Meath":     {"tier": "moderate", "r2": 0.59, "rows": 53},
    "Louth":     {"tier": "moderate", "r2": 0.46, "rows": 54},
    "Cork":      {"tier": "moderate", "r2": 0.39, "rows": 179},
    "Wexford":   {"tier": "moderate", "r2": 0.48, "rows": 45},
    "Limerick":  {"tier": "low",      "r2": -0.01, "rows": 61},
}

# ──────────────────────────────────────────────
# AWS clients
# ──────────────────────────────────────────────
try:
    s3     = boto3.client("s3",        region_name=AWS_REGION)
    dynamo = boto3.resource("dynamodb", region_name=AWS_REGION)
    table  = dynamo.Table(DYNAMO_TABLE)
except Exception as e:
    log.warning(f"AWS init failed: {e}")
    table = None

# ──────────────────────────────────────────────
# Load all city models (local files)
# ──────────────────────────────────────────────
pipelines = {}
metrics   = {}
city_data = {}

def load_from_s3(key):
    obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
    return io.BytesIO(obj["Body"].read())

for city in SUPPORTED_CITIES:
    city_lower = city.lower()
    try:
        pipelines[city] = joblib.load(load_from_s3(f"{city_lower}_pipeline.pkl"))
        metrics[city]   = joblib.load(load_from_s3(f"{city_lower}_metrics.pkl"))
        city_data[city] = pd.read_csv(load_from_s3(f"cleaned_{city_lower}.csv"))
        log.info(f"✅ Loaded {city} model from S3 — R²: {metrics[city]['r2']}")
    except Exception as e:
        log.warning(f"⚠️ Could not load {city} model: {e}")

log.info(f"Loaded {len(pipelines)}/{len(SUPPORTED_CITIES)} city models")

# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":  "ok",
        "cities":  SUPPORTED_CITIES,
        "loaded":  list(pipelines.keys()),
        "tiers":   CITY_TIERS,
    }), 200


@app.route("/options", methods=["GET"])
def options():
    city = request.args.get("city", "Dublin")
    if city not in city_data:
        return jsonify({"error": f"City '{city}' not supported"}), 400

    df = city_data[city]
    return jsonify({
        "locations": sorted(df["Location"].dropna().unique().tolist()),
        "types":     sorted(df["Type"].dropna().unique().tolist()),
        "bers":      sorted(df["BER"].dropna().unique().tolist()),
        "cities":    SUPPORTED_CITIES,
        "tier":      CITY_TIERS.get(city, {}).get("tier", "unknown"),
        "r2":        CITY_TIERS.get(city, {}).get("r2", 0),
        "rows":      CITY_TIERS.get(city, {}).get("rows", 0),
    }), 200


@app.route("/predict", methods=["POST"])
def predict():
    body    = request.get_json(force=True)
    missing = [f for f in ["Beds_Numeric", "Baths_Numeric", "Type", "BER", "Location"] if f not in body]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    city = body.get("City", "Dublin")

    if city not in pipelines:
        return jsonify({"error": f"City '{city}' not supported or model not loaded"}), 400

    try:
        input_df = pd.DataFrame([{
            "Beds_Numeric":  float(body["Beds_Numeric"]),
            "Baths_Numeric": float(body["Baths_Numeric"]),
            "Type":          str(body["Type"]),
            "BER":           str(body["BER"]),
            "Location":      str(body["Location"]),
        }])

        start_time = time.time()
        prediction = round(float(pipelines[city].predict(input_df)[0]))
        latency_ms = round((time.time() - start_time) * 1000, 2)
        rmse       = round(float(metrics[city]["rmse"]))
        model_name = metrics[city].get("model", "ML Model")
        tier       = CITY_TIERS.get(city, {}).get("tier", "unknown")
        r2         = CITY_TIERS.get(city, {}).get("r2", 0)

        df         = city_data[city]
        area_avg   = df[df["Location"] == body["Location"]]["Monthly_Price"].mean()
        area_avg   = round(float(area_avg)) if not pd.isna(area_avg) else round(float(df["Monthly_Price"].mean()))

        # Confidence warning for low data cities
        warning = None
        if tier == "low":
            warning = f"⚠️ Low confidence — only {CITY_TIERS[city]['rows']} training samples for {city}"
        elif tier == "moderate":
            warning = f"ℹ️ Moderate confidence — R² {r2} ({CITY_TIERS[city]['rows']} training samples)"

        result = {
            "prediction":   prediction,
            "lower_bound":  max(0, prediction - rmse),
            "upper_bound":  prediction + rmse,
            "rmse":         rmse,
            "model":        model_name,
            "area_average": area_avg,
            "city":         city,
            "tier":         tier,
            "r2":           r2,
            "warning":      warning,
            "latency_ms":   latency_ms,
        }

        # Log to DynamoDB
        try:
            if table:
                table.put_item(Item={
                    "id":         str(uuid.uuid4()),
                    "timestamp":  datetime.now(timezone.utc).isoformat(),
                    "city":       city,
                    "location":   body["Location"],
                    "beds":       str(body["Beds_Numeric"]),
                    "baths":      str(body["Baths_Numeric"]),
                    "type":       body["Type"],
                    "ber":        body["BER"],
                    "prediction": str(prediction),
                    "rmse":       str(rmse),
                    "tier":       tier,
                })
        except Exception as e:
            log.warning(f"DynamoDB log failed (non-fatal): {e}")

        return jsonify(result), 200

    except Exception as e:
        log.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/cities/compare", methods=["GET"])
def compare_cities():
    comparison = {}
    for city, df in city_data.items():
        comparison[city] = {
            "avg_rent": round(float(df["Monthly_Price"].mean())),
            "tier":     CITY_TIERS.get(city, {}).get("tier", "unknown"),
            "r2":       CITY_TIERS.get(city, {}).get("r2", 0),
            "rows":     CITY_TIERS.get(city, {}).get("rows", 0),
        }
    return jsonify(comparison), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)