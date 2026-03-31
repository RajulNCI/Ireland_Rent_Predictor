import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.fonts.body};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4 {
    font-family: ${theme.fonts.heading};
    line-height: 1.2;
    color: ${theme.colors.text};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.fast};
    &:hover { color: ${theme.colors.primaryHover}; }
  }

  button {
    font-family: ${theme.fonts.body};
    cursor: pointer;
    border: none;
    outline: none;
  }

  input, select {
    font-family: ${theme.fonts.body};
  }

  ::selection {
    background: ${theme.colors.primaryLight};
    color: ${theme.colors.primary};
  }
`;
