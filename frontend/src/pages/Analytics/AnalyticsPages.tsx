import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell,
} from 'recharts';
import { theme } from '../../styles/theme';
import { getCityComparison } from '../../api/rentApi';

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  color: ${theme.colors.text};
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
`;

const PageSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${theme.colors.textMuted};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  @media (max-width: 800px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.xl};
  padding: 1.5rem;
  box-shadow: ${theme.shadows.md};
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  color: ${theme.colors.text};
  margin-bottom: 0.25rem;
`;

const CardSubtitle = styled.p`
  font-size: 0.78rem;
  color: ${theme.colors.textMuted};
  margin-bottom: 1.25rem;
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 1.25rem;
  box-shadow: ${theme.shadows.sm};
  text-align: center;
`;

const StatValue = styled.div`
  font-family: ${theme.fonts.heading};
  font-size: 1.8rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  letter-spacing: -0.02em;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.6rem 0.75rem;
  background: ${theme.colors.background};
  color: ${theme.colors.textSecondary};
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid ${theme.colors.border};
`;

const Td = styled.td`
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
`;

const TierDot = styled.span<{ $tier: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background: ${({ $tier }) =>
    $tier === 'good'     ? theme.colors.success :
    $tier === 'moderate' ? '#E8A020' :
    theme.colors.danger};
`;

const TIER_COLORS: Record<string, string> = {
  good:     '#1A7F4B',
  moderate: '#E8A020',
  low:      '#C0392B',
};

const COUNTY_TIERS: Record<string, string> = {
  Dublin: 'good', Kildare: 'good', Waterford: 'good', Kerry: 'good',
  Galway: 'moderate', Meath: 'moderate', Louth: 'moderate',
  Cork: 'moderate', Wexford: 'moderate', Limerick: 'low',
};

const MODEL_DATA = [
  { county: 'Dublin',    rows: 801, r2: 0.69, rmse: 352, model: 'Gradient Boosting', tier: 'good' },
  { county: 'Kildare',   rows: 75,  r2: 0.71, rmse: 264, model: 'Random Forest',     tier: 'good' },
  { county: 'Waterford', rows: 54,  r2: 0.81, rmse: 131, model: 'Gradient Boosting', tier: 'good' },
  { county: 'Kerry',     rows: 32,  r2: 0.72, rmse: 160, model: 'Gradient Boosting', tier: 'good' },
  { county: 'Galway',    rows: 103, r2: 0.53, rmse: 448, model: 'Ridge',             tier: 'moderate' },
  { county: 'Meath',     rows: 53,  r2: 0.59, rmse: 426, model: 'Ridge',             tier: 'moderate' },
  { county: 'Louth',     rows: 54,  r2: 0.46, rmse: 286, model: 'Ridge',             tier: 'moderate' },
  { county: 'Cork',      rows: 179, r2: 0.39, rmse: 382, model: 'Ridge',             tier: 'moderate' },
  { county: 'Wexford',   rows: 45,  r2: 0.48, rmse: 337, model: 'Ridge',             tier: 'moderate' },
  { county: 'Limerick',  rows: 61,  r2: -0.01,rmse: 406, model: 'Ridge',             tier: 'low' },
];

// Simulated prediction history (replace with real DynamoDB data)
const MOCK_HISTORY = [
  { id: 1, county: 'Dublin',    location: 'Dublin 4',           beds: 2, type: 'Apartment', prediction: 2850, latency: 2.1, tier: 'good' },
  { id: 2, county: 'Cork',      location: 'Cork City Centre',    beds: 1, type: 'Apartment', prediction: 1750, latency: 1.8, tier: 'moderate' },
  { id: 3, county: 'Galway',    location: 'Galway Salthill',     beds: 2, type: 'House',     prediction: 2100, latency: 2.3, tier: 'moderate' },
  { id: 4, county: 'Dublin',    location: 'Dublin 2',            beds: 1, type: 'Studio',    prediction: 2200, latency: 1.9, tier: 'good' },
  { id: 5, county: 'Waterford', location: 'Waterford City',      beds: 3, type: 'House',     prediction: 1650, latency: 1.4, tier: 'good' },
  { id: 6, county: 'Kerry',     location: 'Kerry Tralee',        beds: 2, type: 'House',     prediction: 1580, latency: 1.6, tier: 'good' },
  { id: 7, county: 'Limerick',  location: 'Limerick Dooradoyle', beds: 2, type: 'Apartment', prediction: 1900, latency: 1.7, tier: 'low' },
  { id: 8, county: 'Dublin',    location: 'Dublin 8',            beds: 2, type: 'Apartment', prediction: 2450, latency: 2.0, tier: 'good' },
];

// Simulated rent trend over months
const TREND_DATA = [
  { month: 'Oct', Dublin: 2420, Cork: 2080, Galway: 2150 },
  { month: 'Nov', Dublin: 2450, Cork: 2100, Galway: 2180 },
  { month: 'Dec', Dublin: 2380, Cork: 2050, Galway: 2100 },
  { month: 'Jan', Dublin: 2490, Cork: 2140, Galway: 2200 },
  { month: 'Feb', Dublin: 2510, Cork: 2160, Galway: 2250 },
  { month: 'Mar', Dublin: 2495, Cork: 2161, Galway: 2269 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.md, padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
        <p style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: €{p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsPage: React.FC = () => {
  const [cityAvgs, setCityAvgs] = useState<Record<string, number>>({});

  useEffect(() => {
    getCityComparison().then(data => {
      const avgs: Record<string, number> = {};
      Object.entries(data).forEach(([city, val]: [string, any]) => {
        avgs[city] = typeof val === 'object' ? val.avg_rent : val;
      });
      setCityAvgs(avgs);
    }).catch(() => {});
  }, []);

  const totalPredictions = MOCK_HISTORY.length;
  const avgLatency = (MOCK_HISTORY.reduce((s, p) => s + p.latency, 0) / MOCK_HISTORY.length).toFixed(1);
  const avgPrediction = Math.round(MOCK_HISTORY.reduce((s, p) => s + p.prediction, 0) / MOCK_HISTORY.length);
  const goodTierCount = MODEL_DATA.filter(m => m.tier === 'good').length;

  const cityBarData = MODEL_DATA.map(m => ({
    county: m.county,
    'Avg Rent': cityAvgs[m.county] || 0,
    tier: m.tier,
  })).filter(d => d['Avg Rent'] > 0);

  return (
    <Page>
      <PageHeader>
        <PageTitle>Analytics & Model Performance</PageTitle>
        <PageSubtitle>Prediction history, model metrics and county comparison across Ireland</PageSubtitle>
      </PageHeader>

      {/* Stats row */}
      <StatRow>
        <StatCard>
          <StatValue>{totalPredictions}</StatValue>
          <StatLabel>Total Predictions</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{avgLatency}ms</StatValue>
          <StatLabel>Avg Latency</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>€{avgPrediction.toLocaleString()}</StatValue>
          <StatLabel>Avg Predicted Rent</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{goodTierCount}/10</StatValue>
          <StatLabel>High Confidence Models</StatLabel>
        </StatCard>
      </StatRow>

      <Grid>
        {/* Average rent by county */}
        <Card>
          <CardTitle>Average Rent by County</CardTitle>
          <CardSubtitle>Based on training data — colour by model confidence tier</CardSubtitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cityBarData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
              <XAxis dataKey="county" tick={{ fill: theme.colors.textSecondary, fontSize: 11 }} angle={-40} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: theme.colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v/1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.colors.overlay }} />
              <Bar dataKey="Avg Rent" radius={[4,4,0,0]}>
                {cityBarData.map((entry, i) => (
                  <Cell key={i} fill={TIER_COLORS[entry.tier] + '33'} stroke={TIER_COLORS[entry.tier]} strokeWidth={1.5} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Rent trend over time */}
        <Card>
          <CardTitle>Rent Trend Over Time</CardTitle>
          <CardSubtitle>Average predicted rent — Dublin, Cork, Galway (last 6 months)</CardSubtitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={TREND_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: theme.colors.textSecondary, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: theme.colors.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v/1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Dublin" stroke={theme.colors.primary} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Cork" stroke="#E8A020" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Galway" stroke={theme.colors.success} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Grid>

      {/* Model performance table */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardTitle>Model Performance by County</CardTitle>
        <CardSubtitle>R², RMSE and best model per county — colour coded by confidence tier</CardSubtitle>
        <Table>
          <thead>
            <tr>
              <Th>County</Th>
              <Th>Training Rows</Th>
              <Th>Best Model</Th>
              <Th>RMSE (€)</Th>
              <Th>R²</Th>
              <Th>Tier</Th>
            </tr>
          </thead>
          <tbody>
            {MODEL_DATA.map(m => (
              <tr key={m.county}>
                <Td style={{ fontWeight: 600 }}>{m.county}</Td>
                <Td>{m.rows}</Td>
                <Td>{m.model}</Td>
                <Td>€{m.rmse}</Td>
                <Td style={{ fontFamily: theme.fonts.mono }}>{m.r2.toFixed(2)}</Td>
                <Td>
                  <TierDot $tier={m.tier} />
                  {m.tier === 'good' ? 'High confidence' : m.tier === 'moderate' ? 'Moderate' : 'Insufficient data'}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Prediction history */}
      <Card>
        <CardTitle>Recent Prediction History</CardTitle>
        <CardSubtitle>Last predictions logged to DynamoDB</CardSubtitle>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>County</Th>
              <Th>Location</Th>
              <Th>Beds</Th>
              <Th>Type</Th>
              <Th>Prediction</Th>
              <Th>Latency</Th>
              <Th>Confidence</Th>
            </tr>
          </thead>
          <tbody>
            {MOCK_HISTORY.map(p => (
              <tr key={p.id}>
                <Td style={{ color: theme.colors.textMuted }}>{p.id}</Td>
                <Td style={{ fontWeight: 600 }}>{p.county}</Td>
                <Td>{p.location}</Td>
                <Td>{p.beds}</Td>
                <Td>{p.type}</Td>
                <Td style={{ fontFamily: theme.fonts.mono, fontWeight: 600, color: theme.colors.primary }}>€{p.prediction.toLocaleString()}</Td>
                <Td style={{ fontFamily: theme.fonts.mono }}>{p.latency}ms</Td>
                <Td><TierDot $tier={p.tier} />{p.tier}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Page>
  );
};

export default AnalyticsPage;