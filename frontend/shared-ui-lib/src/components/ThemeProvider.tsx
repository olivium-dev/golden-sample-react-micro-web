import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  Theme,
} from '@mui/material';
import { lightTheme, darkTheme, getTheme } from '../theme';
import { applyThemeAsCSS } from '../theme/cssVariables';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  enableCSSVariables?: boolean;
}

/**
 * Shared Theme Provider Component
 * Wraps the application with MUI theme and manages theme switching
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'light',
  enableCSSVariables = true,
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Try to load theme preference from localStorage
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
      return savedMode || defaultMode;
    }
    return defaultMode;
  });

  const theme = useMemo(() => getTheme(mode), [mode]);

  // Apply CSS variables when theme changes
  useEffect(() => {
    if (enableCSSVariables && typeof window !== 'undefined') {
      applyThemeAsCSS(theme);
    }
  }, [theme, enableCSSVariables]);

  // Save theme preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', mode);
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const value: ThemeContextValue = {
    mode,
    theme,
    toggleTheme,
    setTheme: setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

