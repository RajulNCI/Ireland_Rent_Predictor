import { PredictionInput, PredictionResult, CityOptions } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const predictRent = async (input: PredictionInput): Promise<PredictionResult> => {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      City:          input.city,
      Beds_Numeric:  input.beds,
      Baths_Numeric: input.baths,
      Type:          input.type,
      BER:           input.ber,
      Location:      input.location,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Prediction failed');
  }

  return response.json();
};

export const getOptions = async (city: string = 'Dublin'): Promise<CityOptions> => {
  const response = await fetch(`${API_BASE}/options?city=${encodeURIComponent(city)}`);
  if (!response.ok) throw new Error('Failed to load options');
  return response.json();
};

export const getCityComparison = async (): Promise<Record<string, number>> => {
  const response = await fetch(`${API_BASE}/cities/compare`);
  if (!response.ok) throw new Error('Failed to load city comparison');
  return response.json();
};