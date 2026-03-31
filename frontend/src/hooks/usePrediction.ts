import { usePredictionContext } from '../context/PredictionContext';
import { predictRent } from '../api/rentApi';
import { PredictionInput } from '../types';

export const usePrediction = () => {
  const { setResult, setInput, setIsLoading, setError, reset, result, isLoading, error } =
    usePredictionContext();

  const predict = async (input: PredictionInput) => {
    setIsLoading(true);
    setError(null);
    setInput(input);
    try {
      const result = await predictRent(input);
      setResult(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return { predict, result, isLoading, error, reset };
};
