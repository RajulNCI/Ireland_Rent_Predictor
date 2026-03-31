import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid ${theme.colors.border};
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const Text = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.textMuted};
`;

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Predicting...' }) => (
  <Wrapper>
    <Spinner />
    <Text>{text}</Text>
  </Wrapper>
);

export default LoadingSpinner;
