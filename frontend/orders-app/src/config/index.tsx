/**
 * User Management Configuration Context
 */

import React, { createContext, useContext } from 'react';
import { UserManagementConfig } from './schema';
import { defaultConfig } from './defaults';

const UserConfigContext = createContext<UserManagementConfig>(defaultConfig);

export interface UserConfigProviderProps {
  value: UserManagementConfig;
  children: React.ReactNode;
}

export const UserConfigProvider: React.FC<UserConfigProviderProps> = ({ value, children }) => {
  return React.createElement(UserConfigContext.Provider, { value }, children);
};

export const useUserConfig = () => useContext(UserConfigContext);

export * from './schema';
export * from './defaults';
export * from './loader';

