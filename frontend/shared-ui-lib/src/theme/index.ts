import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { colors, typography, spacing, breakpoints, shadows } from '../tokens';

/**
 * Light Theme Configuration
 */
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrastText,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    grey: colors.grey,
  },
  typography: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeightLight: typography.fontWeightLight,
    fontWeightRegular: typography.fontWeightRegular,
    fontWeightMedium: typography.fontWeightMedium,
    fontWeightBold: typography.fontWeightBold,
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    h4: typography.h4,
    h5: typography.h5,
    h6: typography.h6,
    body1: typography.body1,
    body2: typography.body2,
    button: typography.button,
    caption: typography.caption,
  },
  spacing: spacing.unit,
  breakpoints: {
    values: breakpoints,
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: shadows.card,
          '&:hover': {
            boxShadow: shadows.cardHover,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: shadows.card,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: shadows.cardHover,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: shadows.appBar,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: shadows.drawer,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: shadows.card,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
};

/**
 * Dark Theme Configuration
 */
const darkThemeOptions: ThemeOptions = {
  ...lightThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrastText,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
    },
    background: {
      default: colors.background.dark,
      paper: colors.background.darker,
    },
    grey: colors.grey,
  },
};

/**
 * Create light theme
 */
export const lightTheme: Theme = createTheme(lightThemeOptions);

/**
 * Create dark theme
 */
export const darkTheme: Theme = createTheme(darkThemeOptions);

/**
 * Get theme by mode
 */
export const getTheme = (mode: 'light' | 'dark' = 'light'): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Create custom theme with overrides
 */
export const createCustomTheme = (
  overrides: ThemeOptions,
  mode: 'light' | 'dark' = 'light'
): Theme => {
  const baseTheme = mode === 'dark' ? darkThemeOptions : lightThemeOptions;
  return createTheme({
    ...baseTheme,
    ...overrides,
    palette: {
      ...baseTheme.palette,
      ...overrides.palette,
    },
    typography: {
      ...baseTheme.typography,
      ...overrides.typography,
    },
  });
};

export default lightTheme;



