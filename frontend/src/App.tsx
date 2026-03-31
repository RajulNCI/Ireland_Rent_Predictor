import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { PredictionProvider } from './context/PredictionContext';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/Home/HomePage';
import PredictionPage from './pages/Prediction/PredictionPage';

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <PredictionProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"        element={<HomePage />} />
          <Route path="/predict" element={<PredictionPage />} />
        </Routes>
      </BrowserRouter>
    </PredictionProvider>
  </ThemeProvider>
);

export default App;
