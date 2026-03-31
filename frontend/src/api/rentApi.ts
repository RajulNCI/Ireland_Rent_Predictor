import { PredictionInput, PredictionResult } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const predictRent = async (input: PredictionInput): Promise<PredictionResult> => {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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

export const getOptions = async () => {
  const response = await fetch(`${API_BASE}/options`);
  if (!response.ok) throw new Error('Failed to load options');
  return response.json();
};
