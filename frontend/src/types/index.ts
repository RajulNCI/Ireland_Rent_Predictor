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
}

export interface CityOptions {
  locations: string[];
  types: string[];
  bers: string[];
  cities: string[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
}