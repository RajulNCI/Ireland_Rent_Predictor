"""
Dublin Rent Predictor — Flask Backend (Multi-City)
====================================================
Routes:
  GET  /health          — health check
  GET  /options?city=   — dropdown values per city
  POST /predict         — predict rent, log to DynamoDB
  GET  /cities/compare  — avg rent per city for comparison chart

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

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

AWS_REGION   = os.environ.get("AWS_REGION",   "eu-west-1")
S3_BUCKET    = os.environ.get("S3_BUCKET",    "dublin-rent-predictor")
DYNAMO_TABLE = os.environ.get("DYNAMO_TABLE", "rent-predictions")
PIPELINE_KEY = os.environ.get("PIPELINE_KEY", "dublin_rent_pipeline.pkl")
METRICS_KEY  = os.environ.get("METRICS_KEY",  "model_metrics.pkl")
DATA_KEY     = os.environ.get("DATA_KEY",     "Dublin_Rent_Cleaned.csv")

CITY_MOCK = {
    "Cork": {
        "locations": ["Cork City Centre","Cork Blackrock","Cork Douglas","Cork Ballincollig","Cork Bishopstown","Cork Mahon","Cork Togher","Cork Wilton","Cork Glanmire","Other Cork"],
        "avg_rent_by_location": {"Cork City Centre":1850,"Cork Blackrock":1950,"Cork Douglas":1750,"Cork Ballincollig":1600,"Cork Bishopstown":1700,"Cork Mahon":1650,"Cork Togher":1500,"Cork Wilton":1800,"Cork Glanmire":1550,"Other Cork":1600},
        "base_avg": 1700,
    },
    "Galway": {
        "locations": ["Galway City Centre","Galway Salthill","Galway Knocknacarra","Galway Renmore","Galway Castlegar","Galway Ballybane","Galway Rahoon","Galway Newcastle","Other Galway"],
        "avg_rent_by_location": {"Galway City Centre":1750,"Galway Salthill":1850,"Galway Knocknacarra":1650,"Galway Renmore":1550,"Galway Castlegar":1400,"Galway Ballybane":1350,"Galway Rahoon":1500,"Galway Newcastle":1600,"Other Galway":1450},
        "base_avg": 1550,
    },
    "Limerick": {
        "locations": ["Limerick City Centre","Limerick Castletroy","Limerick Dooradoyle","Limerick Raheen","Limerick Annacotty","Limerick Caherdavin","Limerick Corbally","Other Limerick"],
        "avg_rent_by_location": {"Limerick City Centre":1500,"Limerick Castletroy":1450,"Limerick Dooradoyle":1350,"Limerick Raheen":1400,"Limerick Annacotty":1300,"Limerick Caherdavin":1250,"Limerick Corbally":1350,"Other Limerick":1300},
        "base_avg": 1350,
    },
    "Waterford": {
        "locations": ["Waterford City Centre","Waterford Dunmore East","Waterford Tramore","Waterford Ferrybank","Waterford Kilcohan","Waterford Lisduggan","Other Waterford"],
        "avg_rent_by_location": {"Waterford City Centre":1350,"Waterford Dunmore East":1450,"Waterford Tramore":1300,"Waterford Ferrybank":1200,"Waterford Kilcohan":1150,"Waterford Lisduggan":1100,"Other Waterford":1150},
        "base_avg": 1200,
    },
}

SUPPORTED_CITIES = ["Dublin", "Cork", "Galway", "Limerick", "Waterford"]
ALL_TYPES = ["Apartment", "Studio", "House", "Terraced House", "Semi-Detached"]
ALL_BERS  = ["A1", "A1A2", "A2", "A2A3", "A3", "B1", "B2", "B3", "C1", "C2", "C3"]

try:
    s3     = boto3.client("s3",        region_name=AWS_REGION)
    dynamo = boto3.resource("dynamodb", region_name=AWS_REGION)
    table  = dynamo.Table(DYNAMO_TABLE)
except Exception as e:
    log.warning(f"AWS init failed: {e}")
    table = None

def load_from_s3(key):
    obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
    return io.BytesIO(obj["Body"].read())

try:
    log.info(f"Loading {PIPELINE_KEY} from S3 bucket {S3_BUCKET}")
    pipeline = joblib.load(load_from_s3(PIPELINE_KEY))
    metrics  = joblib.load(load_from_s3(METRICS_KEY))
    df_ref   = pd.read_csv(load_from_s3(DATA_KEY))
    log.info("✅ Loaded from S3")
except Exception as e:
    log.warning(f"⚠️ S3 load failed: {e} — falling back to local files")
    pipeline = joblib.load("dublin_rent_pipeline.pkl")
    metrics  = joblib.load("model_metrics.pkl")
    df_ref   = pd.read_csv("Dublin_Rent_Cleaned.csv")

DUBLIN_OPTIONS = {
    "locations": sorted(df_ref["Location"].dropna().unique().tolist()),
    "types":     sorted(df_ref["Type"].dropna().unique().tolist()),
    "bers":      sorted(df_ref["BER"].dropna().unique().tolist()),
}

def predict_dublin(body):
    input_df = pd.DataFrame([{
        "Beds_Numeric":  float(body["Beds_Numeric"]),
        "Baths_Numeric": float(body["Baths_Numeric"]),
        "Type":          str(body["Type"]),
        "BER":           str(body["BER"]),
        "Location":      str(body["Location"]),
    }])
    prediction = round(float(pipeline.predict(input_df)[0]))
    area_avg   = df_ref[df_ref["Location"] == body["Location"]]["Monthly_Price"].mean()
    area_avg   = round(float(area_avg)) if not pd.isna(area_avg) else prediction
    rmse       = round(float(metrics["rmse"]))
    return prediction, rmse, area_avg, metrics.get("model", "Gradient Boosting")

def predict_other_city(body, city):
    city_data   = CITY_MOCK[city]
    base        = city_data["avg_rent_by_location"].get(body["Location"], city_data["base_avg"])
    beds        = float(body["Beds_Numeric"])
    bed_factor  = 1.0 + (beds - 1) * 0.18
    ber_bonus   = {"A1": 80, "A2": 60, "A3": 40, "B1": 20}.get(body["BER"], 0)
    type_factor = 1.15 if body["Type"] in ["House", "Semi-Detached", "Terraced House"] else 1.0
    prediction  = round(base * bed_factor * type_factor + ber_bonus)
    rmse        = round(prediction * 0.12)
    area_avg    = base
    return prediction, rmse, area_avg, "Mock Model (real data coming soon)"

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": metrics.get("model", "unknown"), "cities": SUPPORTED_CITIES}), 200

@app.route("/options", methods=["GET"])
def options():
    city = request.args.get("city", "Dublin")
    if city == "Dublin":
        return jsonify({**DUBLIN_OPTIONS, "cities": SUPPORTED_CITIES}), 200
    if city not in CITY_MOCK:
        return jsonify({"error": f"City '{city}' not supported"}), 400
    return jsonify({"locations": CITY_MOCK[city]["locations"], "types": ALL_TYPES, "bers": ALL_BERS, "cities": SUPPORTED_CITIES}), 200

@app.route("/predict", methods=["POST"])
def predict():
    body    = request.get_json(force=True)
    missing = [f for f in ["Beds_Numeric", "Baths_Numeric", "Type", "BER", "Location"] if f not in body]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400
    city = body.get("City", "Dublin")
    try:
        if city == "Dublin":
            prediction, rmse, area_avg, model_name = predict_dublin(body)
        elif city in CITY_MOCK:
            prediction, rmse, area_avg, model_name = predict_other_city(body, city)
        else:
            return jsonify({"error": f"City '{city}' not supported"}), 400
        result = {"prediction": prediction, "lower_bound": max(0, prediction - rmse), "upper_bound": prediction + rmse, "rmse": rmse, "model": model_name, "area_average": area_avg, "city": city}
        try:
            if table:
                table.put_item(Item={"id": str(uuid.uuid4()), "timestamp": datetime.now(timezone.utc).isoformat(), "city": city, "location": body["Location"], "beds": str(body["Beds_Numeric"]), "baths": str(body["Baths_Numeric"]), "type": body["Type"], "ber": body["BER"], "prediction": str(prediction), "area_avg": str(area_avg)})
        except Exception as e:
            log.warning(f"DynamoDB log failed (non-fatal): {e}")
        return jsonify(result), 200
    except Exception as e:
        log.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/cities/compare", methods=["GET"])
def compare_cities():
    return jsonify({"Dublin": round(float(df_ref["Monthly_Price"].mean())), "Cork": CITY_MOCK["Cork"]["base_avg"], "Galway": CITY_MOCK["Galway"]["base_avg"], "Limerick": CITY_MOCK["Limerick"]["base_avg"], "Waterford": CITY_MOCK["Waterford"]["base_avg"]}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)