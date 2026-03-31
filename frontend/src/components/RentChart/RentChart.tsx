import React from 'react';
import styled from 'styled-components';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { theme } from '../../styles/theme';
import { PredictionResult, PredictionInput } from '../../types';

const Card = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.xl};
  padding: 2rem;
  box-shadow: ${theme.shadows.md};
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  color: ${theme.colors.text};
  margin-bottom: 0.25rem;
`;

const ChartSubtitle = styled.p`
  font-size: 0.8rem;
  color: ${theme.colors.textMuted};
  margin-bottom: 1.5rem;
  font-family: ${theme.fonts.body};
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radii.md,
        padding: '0.75rem 1rem',
        boxShadow: theme.shadows.md,
        fontFamily: theme.fonts.body,
        fontSize: '0.875rem',
      }}>
        <p style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>{label}</p>
        <p style={{ color: theme.colors.primary, fontWeight: 600 }}>
          €{payload[0].value.toLocaleString()} / mo
        </p>
      </div>
    );
  }
  return null;
};

interface Props {
  result: PredictionResult;
  input: PredictionInput;
}

const RentChart: React.FC<Props> = ({ result, input }) => {
  // Beds vs rent data (simulated based on prediction)
  const bedsData = [0, 1, 2, 3].map(beds => ({
    label: beds === 0 ? 'Studio' : `${beds} Bed${beds > 1 ? 's' : ''}`,
    value: Math.round(result.area_average * (0.7 + beds * 0.22)),
    isSelected: beds === input.beds,
  }));

  return (
    <Card>
      <ChartTitle>Rent by Bedroom Count</ChartTitle>
      <ChartSubtitle>Average estimated rent in {input.location} by number of bedrooms</ChartSubtitle>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={bedsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.fonts.body }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: theme.colors.textMuted, fontSize: 11, fontFamily: theme.fonts.mono }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `€${(v/1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.colors.overlay }} />
          <ReferenceLine
            y={result.prediction}
            stroke={theme.colors.accent}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: 'Your prediction', position: 'right', fill: theme.colors.accent, fontSize: 11 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {bedsData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isSelected ? theme.colors.primary : theme.colors.primaryLight}
                stroke={entry.isSelected ? theme.colors.primaryHover : theme.colors.border}
                strokeWidth={entry.isSelected ? 1.5 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RentChart;
