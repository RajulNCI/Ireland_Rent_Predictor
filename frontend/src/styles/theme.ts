export const theme = {
  colors: {
    primary: '#0F4C81',
    primaryHover: '#0A3660',
    primaryLight: '#E8F0FA',
    accent: '#E8A020',
    accentLight: '#FDF3E3',
    success: '#1A7F4B',
    successLight: '#E6F5EE',
    danger: '#C0392B',
    dangerLight: '#FDECEA',
    background: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceHover: '#F0F4FA',
    border: '#DDE3EE',
    borderStrong: '#B8C4D8',
    text: '#0D1B2E',
    textSecondary: '#4A5568',
    textMuted: '#8A96A8',
    overlay: 'rgba(13, 27, 46, 0.04)',
  },
  fonts: {
    heading: "'Outfit', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'DM Mono', monospace",
  },
  shadows: {
    sm: '0 1px 3px rgba(13,27,46,0.06), 0 1px 2px rgba(13,27,46,0.04)',
    md: '0 4px 12px rgba(13,27,46,0.08), 0 2px 4px rgba(13,27,46,0.04)',
    lg: '0 12px 32px rgba(13,27,46,0.10), 0 4px 8px rgba(13,27,46,0.06)',
    xl: '0 24px 48px rgba(13,27,46,0.12), 0 8px 16px rgba(13,27,46,0.06)',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.4s ease',
  },
};

export type Theme = typeof theme;
