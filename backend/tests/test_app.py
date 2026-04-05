"""
Backend Tests
=============
Run with: pytest tests/ -v
"""
import json
import pytest
from unittest.mock import MagicMock, patch
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer


# ── Build a tiny mock pipeline so tests don't need real .pkl ──
def make_mock_pipeline():
    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), ['Beds_Numeric', 'Baths_Numeric']),
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['Type', 'BER', 'Location']),
    ])
    pipe = Pipeline([('preprocessor', preprocessor), ('model', LinearRegression())])
    X = pd.DataFrame([
        {'Beds_Numeric': 1, 'Baths_Numeric': 1, 'Type': 'Apartment', 'BER': 'A2', 'Location': 'Dublin 4'},
        {'Beds_Numeric': 2, 'Baths_Numeric': 1, 'Type': 'Studio',    'BER': 'A3', 'Location': 'Dublin 2'},
    ])
    y = [2500, 3000]
    pipe.fit(X, y)
    return pipe


MOCK_PIPELINE = make_mock_pipeline()
MOCK_METRICS  = {"rmse": 370, "mae": 187, "r2": 0.80, "model": "Gradient Boosting"}
MOCK_DF       = pd.DataFrame([
    {'Location': 'Dublin 4', 'Type': 'Apartment', 'BER': 'A2',
     'Beds_Numeric': 2, 'Baths_Numeric': 1, 'Monthly_Price': 2800},
    {'Location': 'Dublin 2', 'Type': 'Studio', 'BER': 'A3',
     'Beds_Numeric': 1, 'Baths_Numeric': 1, 'Monthly_Price': 2200},
])

SUPPORTED_CITIES = [
    "Dublin", "Cork", "Galway", "Kildare", "Meath",
    "Louth", "Limerick", "Waterford", "Wexford", "Kerry"
]

# Mock pipelines, metrics, city_data for all cities
MOCK_PIPELINES = {city: MOCK_PIPELINE for city in SUPPORTED_CITIES}
MOCK_METRICS_ALL = {city: MOCK_METRICS for city in SUPPORTED_CITIES}
MOCK_CITY_DATA = {city: MOCK_DF for city in SUPPORTED_CITIES}


@pytest.fixture
def client():
    # Patch AWS and S3 loading before importing app
    with patch('boto3.client'), \
         patch('boto3.resource'), \
         patch('joblib.load', return_value=MOCK_PIPELINE), \
         patch('pandas.read_csv', return_value=MOCK_DF):

        import app as flask_app

        # Inject mocks into the multi-city dictionaries
        flask_app.pipelines  = MOCK_PIPELINES
        flask_app.metrics    = MOCK_METRICS_ALL
        flask_app.city_data  = MOCK_CITY_DATA
        flask_app.table      = MagicMock()
        flask_app.app.config['TESTING'] = True

        with flask_app.app.test_client() as c:
            yield c


# ──────────────────────────────────────────────
# Tests
# ──────────────────────────────────────────────

def test_health(client):
    res = client.get('/health')
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data['status'] == 'ok'


def test_options(client):
    res = client.get('/options?city=Dublin')
    assert res.status_code == 200
    data = json.loads(res.data)
    assert 'locations' in data
    assert 'types' in data
    assert 'bers' in data


def test_predict_success(client):
    payload = {
        'City':          'Dublin',
        'Beds_Numeric':  2,
        'Baths_Numeric': 1,
        'Type':          'Apartment',
        'BER':           'A2',
        'Location':      'Dublin 4',
    }
    res  = client.post('/predict', json=payload)
    assert res.status_code == 200
    data = json.loads(res.data)
    assert 'prediction'   in data
    assert 'lower_bound'  in data
    assert 'upper_bound'  in data
    assert 'area_average' in data
    assert data['prediction'] > 0


def test_predict_missing_fields(client):
    res = client.post('/predict', json={'Beds_Numeric': 2})
    assert res.status_code == 400
    data = json.loads(res.data)
    assert 'error' in data


def test_predict_bounds(client):
    payload = {
        'City':          'Dublin',
        'Beds_Numeric':  1,
        'Baths_Numeric': 1,
        'Type':          'Studio',
        'BER':           'A3',
        'Location':      'Dublin 2',
    }
    res  = client.post('/predict', json=payload)
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data['lower_bound'] < data['prediction']
    assert data['upper_bound'] > data['prediction']