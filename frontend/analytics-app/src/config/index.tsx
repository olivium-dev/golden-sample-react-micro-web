/**
 * Analytics Dashboard Configuration Context
 */

import React, { createContext, useContext } from 'react';
import { AnalyticsConfig } from './schema';
import { defaultConfig } from './defaults';

const AnalyticsConfigContext = createContext<AnalyticsConfig>(defaultConfig);

export interface AnalyticsConfigProviderProps {
  value: AnalyticsConfig;
  children: React.ReactNode;
}

export const AnalyticsConfigProvider: React.FC<AnalyticsConfigProviderProps> = ({ value, children }) => {
  return React.createElement(AnalyticsConfigContext.Provider, { value }, children);
};

export const useAnalyticsConfig = () => useContext(AnalyticsConfigContext);

export * from './schema';
export * from './defaults';
export * from './loader';

