/**
 * Settings Panel Default Configuration
 */

import { SettingsConfig } from './schema';

export const defaultConfig: SettingsConfig = {
  version: '1.0.0',
  
  sections: {
    enabled: ['appearance', 'notifications', 'language', 'advanced'],
  },
  
  theme: {
    allowUserSwitch: true,
    modes: ['light', 'dark', 'auto'],
    defaultMode: 'light',
    brandColors: ['#1976d2', '#d32f2f', '#388e3c', '#f57c00'],
  },
  
  notifications: {
    channels: ['email', 'push', 'sms'],
    defaultEnabled: true,
  },
  
  language: {
    supported: ['en', 'es', 'fr', 'de'],
    default: 'en',
  },
  
  advanced: {
    showDebug: false,
  },
  
  api: {
    services: {
      settings: {
        baseUrl: 'http://localhost:8000/api',
        timeout: 10000,
        routes: {
          get: '/settings',
          save: '/settings',
          reset: '/settings/reset',
        },
      },
    },
  },
  
  mock: {
    enabled: true,
    apiDelay: 500,
    authBypass: true,
    mockSettings: {
      id: 1,
      theme_mode: 'light',
      primary_color: '#1976d2',
      secondary_color: '#dc004e',
      language: 'en',
      timezone: 'UTC',
      notifications_enabled: true,
      email_notifications: true,
      push_notifications: false,
      auto_save: true,
      compact_mode: false,
    },
  },
};

