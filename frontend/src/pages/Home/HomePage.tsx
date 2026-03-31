import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';

const Page = styled.div`
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
`;

const Tag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primary};
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: ${theme.radii.full};
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 700;
  color: ${theme.colors.text};
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
  max-width: 640px;
  line-height: 1.15;
`;

const Subtitle = styled.p`
  font-size: 1.05rem;
  color: ${theme.colors.textSecondary};
  max-width: 500px;
  margin-bottom: 2.5rem;
  line-height: 1.7;
`;

const CTAButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.9rem 2.5rem;
  border-radius: ${theme.radii.md};
  transition: all ${theme.transitions.normal};
  box-shadow: ${theme.shadows.md};
  letter-spacing: 0.01em;
  &:hover {
    background: ${theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 3rem;
  margin-top: 4rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Stat = styled.div`
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
  font-size: 0.8rem;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Page>
      <Tag>🤖 ML-Powered · Gradient Boosting</Tag>
      <Title>Predict Dublin Rental Prices with Machine Learning</Title>
      <Subtitle>
        Enter your property details and get an instant rent estimate powered by a
        Gradient Boosting model trained on real Dublin listings.
      </Subtitle>
      <CTAButton onClick={() => navigate('/predict')}>
        Get Rent Prediction →
      </CTAButton>

      <StatsRow>
        <Stat>
          <StatValue>106</StatValue>
          <StatLabel>Training Listings</StatLabel>
        </Stat>
        <Stat>
          <StatValue>80%</StatValue>
          <StatLabel>Model R² Score</StatLabel>
        </Stat>
        <Stat>
          <StatValue>€370</StatValue>
          <StatLabel>Avg RMSE Error</StatLabel>
        </Stat>
        <Stat>
          <StatValue>4</StatValue>
          <StatLabel>Models Compared</StatLabel>
        </Stat>
      </StatsRow>
    </Page>
  );
};

export default HomePage;
