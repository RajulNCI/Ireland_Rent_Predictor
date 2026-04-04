export interface PredictionInput {
  city: string;
  beds: number;
  baths: number;
  type: string;
  ber: string;
  location: string;
}

export interface PredictionResult {
  prediction: number;
  lower_bound: number;
  upper_bound: number;
  rmse: number;
  model: string;
  area_average: number;
  city: string;
  tier: 'good' | 'moderate' | 'low';
  r2: number;
  warning: string | null;
  latency_ms: number; 
}

export interface CityOptions {
  locations: string[];
  types: string[];
  bers: string[];
  cities: string[];
  tier: 'good' | 'moderate' | 'low';
  r2: number;
  rows: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}