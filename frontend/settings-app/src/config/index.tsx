/**
 * Settings Panel Configuration Context
 */

import React, { createContext, useContext } from 'react';
import { SettingsConfig } from './schema';
import { defaultConfig } from './defaults';

const SettingsConfigContext = createContext<SettingsConfig>(defaultConfig);

export interface SettingsConfigProviderProps {
  value: SettingsConfig;
  children: React.ReactNode;
}

export const SettingsConfigProvider: React.FC<SettingsConfigProviderProps> = ({ value, children }) => {
  return React.createElement(SettingsConfigContext.Provider, { value }, children);
};

export const useSettingsConfig = () => useContext(SettingsConfigContext);

export * from './schema';
export * from './defaults';
export * from './loader';

