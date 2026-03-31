import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Nav = styled.nav`
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${theme.shadows.sm};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  background: ${theme.colors.primary};
  border-radius: ${theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const LogoText = styled.span`
  font-family: ${theme.fonts.heading};
  font-size: 1.1rem;
  font-weight: 700;
  color: ${theme.colors.text};
  letter-spacing: -0.02em;
`;

const LogoSub = styled.span`
  font-size: 0.75rem;
  color: ${theme.colors.textMuted};
  font-weight: 400;
  margin-left: 0.25rem;
`;

const Badge = styled.div`
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primary};
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: ${theme.radii.full};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Navbar: React.FC = () => (
  <Nav>
    <Logo>
      <LogoIcon>🏠</LogoIcon>
      <div>
        <LogoText>DublinRent<LogoSub>Predictor</LogoSub></LogoText>
      </div>
    </Logo>
    <Badge>MSc Cloud ML · NCI Dublin</Badge>
  </Nav>
);

export default Navbar;
