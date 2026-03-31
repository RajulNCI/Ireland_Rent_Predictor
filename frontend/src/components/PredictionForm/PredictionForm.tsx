import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { PredictionInput, CityOptions } from '../../types';
import { getOptions } from '../../api/rentApi';

const Form = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.xl};
  padding: 2rem;
  box-shadow: ${theme.shadows.md};
`;

const FormTitle = styled.h2`
  font-size: 1.3rem;
  color: ${theme.colors.text};
  margin-bottom: 0.25rem;
`;

const FormSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.textMuted};
  margin-bottom: 1.75rem;
  font-family: ${theme.fonts.body};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const FullRow = styled.div`
  grid-column: 1 / -1;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const inputStyles = `
  padding: 0.65rem 0.9rem;
  border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  font-family: ${theme.fonts.body};
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  width: 100%;
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  }
`;

const Select = styled.select`${inputStyles}`;
const Input  = styled.input`${inputStyles}`;

const CitySelect = styled(Select)`
  border-color: ${theme.colors.primary};
  background: ${theme.colors.primaryLight};
  font-weight: 600;
  color: ${theme.colors.primary};
`;

const MockBadge = styled.div`
  background: ${theme.colors.accentLight};
  border: 1px solid #F5D9A0;
  border-radius: ${theme.radii.md};
  padding: 0.5rem 0.75rem;
  font-size: 0.78rem;
  color: #B07010;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin: 1.5rem 0;
`;

const SubmitButton = styled.button<{ $loading: boolean }>`
  width: 100%;
  padding: 0.85rem;
  background: ${({ $loading }) => $loading ? theme.colors.borderStrong : theme.colors.primary};
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: ${theme.radii.md};
  transition: background 0.15s ease, transform 0.15s ease;
  letter-spacing: 0.02em;
  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
    transform: translateY(-1px);
  }
  &:disabled { cursor: not-allowed; }
`;

const CITIES = ["Dublin", "Cork", "Galway", "Limerick", "Waterford"];

interface Props {
  onSubmit: (input: PredictionInput) => void;
  isLoading: boolean;
}

const PredictionForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [city, setCity]       = useState('Dublin');
  const [options, setOptions] = useState<CityOptions | null>(null);
  const [form, setForm]       = useState<PredictionInput>({
    city: 'Dublin', beds: 1, baths: 1,
    type: 'Apartment', ber: 'A2', location: '',
  });

  useEffect(() => {
    getOptions(city).then(opts => {
      setOptions(opts);
      setForm(f => ({
        ...f,
        city,
        location: opts.locations[0] || '',
        type: opts.types.includes(f.type) ? f.type : opts.types[0],
        ber:  opts.bers.includes(f.ber)   ? f.ber  : opts.bers[0],
      }));
    }).catch(console.error);
  }, [city]);

  const set = (key: keyof PredictionInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(f => ({
    ...f,
    [key]: key === 'beds' || key === 'baths' ? Number(e.target.value) : e.target.value
  }));

  return (
    <Form>
      <FormTitle>Property Details</FormTitle>
      <FormSubtitle>Fill in the details below to get an estimated monthly rent.</FormSubtitle>

      {city !== 'Dublin' && (
        <MockBadge>
          ⚠️ Mock data for {city} — real scraped data coming soon
        </MockBadge>
      )}

      <Grid>
        <FullRow>
          <Field>
            <Label>🏙️ City</Label>
            <CitySelect value={city} onChange={e => setCity(e.target.value)}>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </CitySelect>
          </Field>
        </FullRow>

        <Field>
          <Label>📍 Location</Label>
          <Select value={form.location} onChange={set('location')}>
            {options?.locations.map(l => <option key={l}>{l}</option>)}
          </Select>
        </Field>

        <Field>
          <Label>🏢 Property Type</Label>
          <Select value={form.type} onChange={set('type')}>
            {options?.types.map(t => <option key={t}>{t}</option>)}
          </Select>
        </Field>

        <Field>
          <Label>🛏️ Bedrooms</Label>
          <Input type="number" min={0} max={10} value={form.beds} onChange={set('beds')} />
        </Field>

        <Field>
          <Label>🚿 Bathrooms</Label>
          <Input type="number" min={1} max={10} value={form.baths} onChange={set('baths')} />
        </Field>

        <FullRow>
          <Field>
            <Label>⚡ BER Rating</Label>
            <Select value={form.ber} onChange={set('ber')}>
              {options?.bers.map(b => <option key={b}>{b}</option>)}
            </Select>
          </Field>
        </FullRow>
      </Grid>

      <Divider />

      <SubmitButton
        $loading={isLoading}
        disabled={isLoading || !options}
        onClick={() => onSubmit(form)}
      >
        {isLoading ? 'Predicting...' : '🔮 Predict Monthly Rent'}
      </SubmitButton>
    </Form>
  );
};

export default PredictionForm;