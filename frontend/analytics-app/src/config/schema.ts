/**
 * Analytics Dashboard Micro-Web Configuration Schema
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
 * Analytics Dashboard specific configuration schema
 */
export const AnalyticsConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  
  // Charts configuration
  charts: z.object({
    enabled: z.boolean().default(true),
    types: z.array(z.string()).default(['line', 'bar', 'pie']),
  }).default({
    enabled: true,
    types: ['line', 'bar', 'pie'],
  }),
  
  // Metrics configuration
  metrics: z.object({
    cards: z.array(z.string()).default(['users', 'revenue', 'conversion', 'pageViews']),
    order: z.array(z.string()).optional(),
  }).default({
    cards: ['users', 'revenue', 'conversion', 'pageViews'],
  }),
  
  // Refresh configuration
  refreshIntervalMs: z.number().default(60000),
  autoRefresh: z.boolean().default(true),
  
  // Date range configuration
  dateRange: z.object({
    default: z.string().default('7d'),
    options: z.array(z.string()).default(['24h', '7d', '30d', '90d']),
  }).default({
    default: '7d',
    options: ['24h', '7d', '30d', '90d'],
  }),
  
  // API configuration
  api: z.object({
    services: z.object({
      analytics: z.object({
        baseUrl: z.string(),
        timeout: z.number().optional().default(10000),
        routes: z.object({
          summary: z.string().default('/analytics/summary'),
          chartData: z.string().default('/analytics/chart'),
        }).default({
          summary: '/analytics/summary',
          chartData: '/analytics/chart',
        }),
      }),
    }),
  }),
  
  // Theme overrides
  theme: z.object({
    chartColors: z.array(z.string()).optional(),
  }).optional(),
  
  // Mock configuration
  mock: z.object({
    enabled: z.boolean().default(false),
    apiDelay: z.number().default(500),
    authBypass: z.boolean().default(false),
    mockMetrics: z.object({
      cards: z.array(z.object({
        title: z.string(),
        value: z.string(),
        change: z.number(),
        trend: z.string(),
        icon: z.string(),
      })).optional(),
      chartData: z.array(z.object({
        name: z.string(),
        value: z.number(),
      })).optional(),
    }).optional(),
  }).optional(),
});

export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;

