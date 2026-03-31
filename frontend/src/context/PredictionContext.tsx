import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PredictionInput, PredictionResult } from '../types';

interface PredictionContextType {
  result: PredictionResult | null;
  input: PredictionInput | null;
  isLoading: boolean;
  error: string | null;
  setResult: (result: PredictionResult | null) => void;
  setInput: (input: PredictionInput | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const PredictionProvider = ({ children }: { children: ReactNode }) => {
  const [result, setResult]       = useState<PredictionResult | null>(null);
  const [input, setInput]         = useState<PredictionInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const reset = () => {
    setResult(null);
    setInput(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <PredictionContext.Provider value={{
      result, input, isLoading, error,
      setResult, setInput, setIsLoading, setError, reset,
    }}>
      {children}
    </PredictionContext.Provider>
  );
};

export const usePredictionContext = () => {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error('usePredictionContext must be used within PredictionProvider');
  return ctx;
};
