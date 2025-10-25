/**
 * Settings Panel Micro-Web Configuration Schema
 */

import { z } from 'zod';

// Base schemas (inlined to avoid workspace complexity)
const ApiServiceSchema = z.object({
  baseUrl: z.string(),
  timeout: z.number().optional().default(10000),
  retries: z.number().optional().default(3),
});

const ThemeOverrideSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  mode: z.enum(['light', 'dark', 'auto']).optional(),
});

/**
 * Settings Panel specific configuration schema
 */
export const SettingsConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  
  // Sections configuration
  sections: z.object({
    enabled: z.array(z.string()).default(['appearance', 'notifications', 'language', 'advanced']),
    order: z.array(z.string()).optional(),
  }).default({
    enabled: ['appearance', 'notifications', 'language', 'advanced'],
  }),
  
  // Theme configuration
  theme: z.object({
    allowUserSwitch: z.boolean().default(true),
    modes: z.array(z.string()).default(['light', 'dark', 'auto']),
    defaultMode: z.string().default('light'),
    brandColors: z.array(z.string()).optional(),
  }).default({
    allowUserSwitch: true,
    modes: ['light', 'dark', 'auto'],
    defaultMode: 'light',
  }),
  
  // Notifications configuration
  notifications: z.object({
    channels: z.array(z.string()).default(['email', 'push', 'sms']),
    defaultEnabled: z.boolean().default(true),
  }).default({
    channels: ['email', 'push', 'sms'],
    defaultEnabled: true,
  }),
  
  // Language configuration
  language: z.object({
    supported: z.array(z.string()).default(['en', 'es', 'fr']),
    default: z.string().default('en'),
  }).default({
    supported: ['en', 'es', 'fr'],
    default: 'en',
  }),
  
  // Advanced configuration
  advanced: z.object({
    showDebug: z.boolean().default(false),
  }).default({
    showDebug: false,
  }),
  
  // API configuration
  api: z.object({
    services: z.object({
      settings: z.object({
        baseUrl: z.string(),
        timeout: z.number().optional().default(10000),
        routes: z.object({
          get: z.string().default('/settings'),
          save: z.string().default('/settings'),
          reset: z.string().default('/settings/reset'),
        }).default({
          get: '/settings',
          save: '/settings',
          reset: '/settings/reset',
        }),
      }),
    }),
  }),
  
  // Mock configuration
  mock: z.object({
    enabled: z.boolean().default(false),
    apiDelay: z.number().default(500),
    authBypass: z.boolean().default(false),
    mockSettings: z.object({
      id: z.number(),
      theme_mode: z.string(),
      primary_color: z.string(),
      secondary_color: z.string(),
      language: z.string(),
      timezone: z.string(),
      notifications_enabled: z.boolean(),
      email_notifications: z.boolean(),
      push_notifications: z.boolean(),
      auto_save: z.boolean(),
      compact_mode: z.boolean(),
    }).optional(),
  }).optional(),
});

export type SettingsConfig = z.infer<typeof SettingsConfigSchema>;

