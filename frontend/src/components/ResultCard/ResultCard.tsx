import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import { PredictionResult } from '../../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.xl};
  padding: 2rem;
  box-shadow: ${theme.shadows.md};
  animation: ${fadeIn} 0.4s ease;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.3rem;
  color: ${theme.colors.text};
`;

const ModelBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primary};
  padding: 4px 10px;
  border-radius: ${theme.radii.full};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const PriceDisplay = styled.div`
  text-align: center;
  background: linear-gradient(135deg, ${theme.colors.primaryLight} 0%, #EDF4FF 100%);
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 1.75rem;
  margin-bottom: 1.5rem;
`;

const PriceLabel = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
`;

const Price = styled.div`
  font-family: ${theme.fonts.heading};
  font-size: 3rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  letter-spacing: -0.03em;
  line-height: 1;
`;

const PriceMonth = styled.span`
  font-size: 1rem;
  color: ${theme.colors.textMuted};
  font-family: ${theme.fonts.body};
  font-weight: 400;
`;

const BoundsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const BoundCard = styled.div<{ $type: 'lower' | 'upper' }>`
  background: ${({ $type }) => $type === 'lower' ? theme.colors.successLight : theme.colors.accentLight};
  border: 1px solid ${({ $type }) => $type === 'lower' ? '#B8DFC9' : '#F5D9A0'};
  border-radius: ${theme.radii.md};
  padding: 1rem;
  text-align: center;
`;

const BoundLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.25rem;
`;

const BoundValue = styled.p<{ $type: 'lower' | 'upper' }>`
  font-size: 1.4rem;
  font-weight: 700;
  font-family: ${theme.fonts.mono};
  color: ${({ $type }) => $type === 'lower' ? theme.colors.success : '#B07010'};
`;

const RmseNote = styled.p`
  font-size: 0.8rem;
  color: ${theme.colors.textMuted};
  text-align: center;
  margin-top: -0.5rem;
  margin-bottom: 1.5rem;
`;

const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin-bottom: 1.25rem;
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const Metric = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 1.1rem;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const MetricLabel = styled.div`
  font-size: 0.72rem;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
`;

interface Props {
  result: PredictionResult;
}

const ResultCard: React.FC<Props> = ({ result }) => (
  <Card>
    <CardHeader>
      <CardTitle>Prediction Result</CardTitle>
      <ModelBadge>{result.model}</ModelBadge>
    </CardHeader>

    <PriceDisplay>
      <PriceLabel>Estimated Monthly Rent</PriceLabel>
      <Price>€{result.prediction.toLocaleString()} <PriceMonth>/ mo</PriceMonth></Price>
    </PriceDisplay>

    <BoundsRow>
      <BoundCard $type="lower">
        <BoundLabel>Lower Bound</BoundLabel>
        <BoundValue $type="lower">€{result.lower_bound.toLocaleString()}</BoundValue>
      </BoundCard>
      <BoundCard $type="upper">
        <BoundLabel>Upper Bound</BoundLabel>
        <BoundValue $type="upper">€{result.upper_bound.toLocaleString()}</BoundValue>
      </BoundCard>
    </BoundsRow>

    <RmseNote>Confidence range: ±€{result.rmse.toLocaleString()} based on model RMSE</RmseNote>

    <Divider />

    <MetricsRow>
      <Metric>
        <MetricValue>€{result.rmse}</MetricValue>
        <MetricLabel>RMSE</MetricLabel>
      </Metric>
      <Metric>
        <MetricValue>{((1 - result.rmse / result.prediction) * 100).toFixed(0)}%</MetricValue>
        <MetricLabel>Accuracy</MetricLabel>
      </Metric>
      <Metric>
        <MetricValue>€{result.area_average.toLocaleString()}</MetricValue>
        <MetricLabel>Area Avg</MetricLabel>
      </Metric>
    </MetricsRow>
  </Card>
);

export default ResultCard;
