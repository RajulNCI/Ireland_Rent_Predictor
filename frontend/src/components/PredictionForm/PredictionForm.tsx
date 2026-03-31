import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { PredictionInput } from '../../types';

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
  transition: border-color ${theme.transitions.fast}, box-shadow ${theme.transitions.fast};
  width: 100%;
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  }
`;

const Select = styled.select`${inputStyles}`;
const Input  = styled.input`${inputStyles}`;

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
  transition: background ${theme.transitions.fast}, transform ${theme.transitions.fast};
  letter-spacing: 0.02em;
  &:hover:not(:disabled) {
    background: ${theme.colors.primaryHover};
    transform: translateY(-1px);
  }
  &:disabled { cursor: not-allowed; }
`;

const LOCATIONS = ['Dublin 1','Dublin 2','Dublin 3','Dublin 4','Dublin 5','Dublin 6',
  'Dublin 8','Dublin 9','Dublin 12','Dublin 13','Dublin 14','Dublin 18','Other Dublin'];
const TYPES     = ['Apartment', 'Studio'];
const BERS      = ['A1','A1A2','A2','A2A3','A3','B1'];

interface Props {
  onSubmit: (input: PredictionInput) => void;
  isLoading: boolean;
}

const PredictionForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [form, setForm] = useState<PredictionInput>({
    beds: 1, baths: 1, type: 'Apartment', ber: 'A2', location: 'Dublin 4',
  });

  const set = (key: keyof PredictionInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [key]: key === 'beds' || key === 'baths' ? Number(e.target.value) : e.target.value }));

  return (
    <Form>
      <FormTitle>Property Details</FormTitle>
      <FormSubtitle>Fill in the details below to get an estimated monthly rent.</FormSubtitle>

      <Grid>
        <Field>
          <Label>Location</Label>
          <Select value={form.location} onChange={set('location')}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </Select>
        </Field>

        <Field>
          <Label>Property Type</Label>
          <Select value={form.type} onChange={set('type')}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </Select>
        </Field>

        <Field>
          <Label>Bedrooms</Label>
          <Input type="number" min={0} max={10} value={form.beds} onChange={set('beds')} />
        </Field>

        <Field>
          <Label>Bathrooms</Label>
          <Input type="number" min={1} max={10} value={form.baths} onChange={set('baths')} />
        </Field>

        <Field style={{ gridColumn: '1 / -1' }}>
          <Label>BER Rating</Label>
          <Select value={form.ber} onChange={set('ber')}>
            {BERS.map(b => <option key={b}>{b}</option>)}
          </Select>
        </Field>
      </Grid>

      <Divider />

      <SubmitButton $loading={isLoading} disabled={isLoading} onClick={() => onSubmit(form)}>
        {isLoading ? 'Predicting...' : '🔮 Predict Monthly Rent'}
      </SubmitButton>
    </Form>
  );
};

export default PredictionForm;
