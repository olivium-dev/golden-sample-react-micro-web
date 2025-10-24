import { Theme } from '@mui/material/styles';

/**
 * CSS Variables for Runtime Theming
 * These variables can be injected at runtime to support multi-tenancy and brand customization
 */

export interface CSSVariables {
  '--primary-main': string;
  '--primary-light': string;
  '--primary-dark': string;
  '--primary-contrast-text': string;
  '--secondary-main': string;
  '--secondary-light': string;
  '--secondary-dark': string;
  '--secondary-contrast-text': string;
  '--background-default': string;
  '--background-paper': string;
  '--background-dark': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--divider': string;
  '--error-main': string;
  '--warning-main': string;
  '--info-main': string;
  '--success-main': string;
}

/**
 * Generate CSS variables from MUI theme
 */
export const generateCSSVariables = (theme: Theme): CSSVariables => {
  return {
    '--primary-main': theme.palette.primary.main,
    '--primary-light': theme.palette.primary.light,
    '--primary-dark': theme.palette.primary.dark,
    '--primary-contrast-text': theme.palette.primary.contrastText,
    '--secondary-main': theme.palette.secondary.main,
    '--secondary-light': theme.palette.secondary.light,
    '--secondary-dark': theme.palette.secondary.dark,
    '--secondary-contrast-text': theme.palette.secondary.contrastText,
    '--background-default': theme.palette.background.default,
    '--background-paper': theme.palette.background.paper,
    '--background-dark': theme.palette.mode === 'dark' ? '#1a1a1a' : '#282c34',
    '--text-primary': theme.palette.text.primary,
    '--text-secondary': theme.palette.text.secondary,
    '--divider': theme.palette.divider,
    '--error-main': theme.palette.error.main,
    '--warning-main': theme.palette.warning.main,
    '--info-main': theme.palette.info.main,
    '--success-main': theme.palette.success.main,
  };
};

/**
 * Inject CSS variables into the document root
 */
export const injectCSSVariables = (variables: CSSVariables): void => {
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

/**
 * Apply theme as CSS variables
 */
export const applyThemeAsCSS = (theme: Theme): void => {
  const variables = generateCSSVariables(theme);
  injectCSSVariables(variables);
};

/**
 * Get CSS variable value from document
 */
export const getCSSVariable = (variableName: keyof CSSVariables): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

/**
 * Update a single CSS variable
 */
export const updateCSSVariable = (
  variableName: keyof CSSVariables,
  value: string
): void => {
  document.documentElement.style.setProperty(variableName, value);
};



