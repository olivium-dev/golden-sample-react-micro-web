/**
 * Design Tokens for the Micro-Frontend Platform
 * These tokens define the core design system values
 */

export const colors = {
  // Primary colors
  primary: {
    main: '#61dafb',
    light: '#9fecff',
    dark: '#2ba9c8',
    contrastText: '#000000',
  },
  // Secondary colors
  secondary: {
    main: '#ff6b6b',
    light: '#ff9b9b',
    dark: '#c73e3e',
    contrastText: '#ffffff',
  },
  // Additional theme colors
  analytics: {
    main: '#4ecdc4',
    light: '#7edcd5',
    dark: '#3a9e97',
  },
  settings: {
    main: '#ffa726',
    light: '#ffb851',
    dark: '#cc851e',
  },
  // Neutral colors
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Background colors
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    dark: '#282c34',
    darker: '#1a1a1a',
  },
  // Status colors
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
};

export const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 500,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.66,
  },
};

export const spacing = {
  unit: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export const shadows = {
  card: '0 4px 6px rgba(0, 0, 0, 0.1)',
  cardHover: '0 8px 12px rgba(0, 0, 0, 0.15)',
  drawer: '2px 0 4px rgba(0, 0, 0, 0.1)',
  appBar: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
};

export const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

