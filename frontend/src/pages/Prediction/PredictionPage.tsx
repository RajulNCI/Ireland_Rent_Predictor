import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import PredictionForm from '../../components/PredictionForm/PredictionForm';
import ResultCard from '../../components/ResultCard/ResultCard';
import RentChart from '../../components/RentChart/RentChart';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { usePrediction } from '../../hooks/usePrediction';
import { usePredictionContext } from '../../context/PredictionContext';

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
  font-family: ${theme.fonts.body};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 1.5rem;
  align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ErrorBox = styled.div`
  background: ${theme.colors.dangerLight};
  border: 1px solid #F5C0BB;
  border-radius: ${theme.radii.md};
  padding: 1rem 1.25rem;
  color: ${theme.colors.danger};
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  background: ${theme.colors.surface};
  border: 1.5px dashed ${theme.colors.border};
  border-radius: ${theme.radii.xl};
  padding: 3rem;
  text-align: center;
  color: ${theme.colors.textMuted};
  font-size: 0.9rem;
  line-height: 1.7;
`;

const PredictionPage: React.FC = () => {
  const { predict, isLoading, error } = usePrediction();
  const { result, input } = usePredictionContext();

  return (
    <Page>
      <PageHeader>
        <PageTitle>Rent Predictor</PageTitle>
        <PageSubtitle>Powered by Gradient Boosting · Trained on Dublin rental listings</PageSubtitle>
      </PageHeader>

      <Grid>
        <PredictionForm onSubmit={predict} isLoading={isLoading} />

        <RightColumn>
          {error && <ErrorBox>⚠️ {error}</ErrorBox>}

          {isLoading && <LoadingSpinner />}

          {!isLoading && result && input && (
            <>
              <ResultCard result={result} />
              <RentChart result={result} input={input} />
            </>
          )}

          {!isLoading && !result && !error && (
            <EmptyState>
              🏠 Fill in the property details on the left<br />
              and click <strong>Predict Monthly Rent</strong> to get started.
            </EmptyState>
          )}
        </RightColumn>
      </Grid>
    </Page>
  );
};

export default PredictionPage;
