/**
 * Analytics Dashboard Default Configuration
 */

import { AnalyticsConfig } from './schema';

export const defaultConfig: AnalyticsConfig = {
  version: '1.0.0',
  
  charts: {
    enabled: true,
    types: ['line', 'bar', 'pie'],
  },
  
  metrics: {
    cards: ['users', 'revenue', 'conversion', 'pageViews'],
  },
  
  refreshIntervalMs: 60000,
  autoRefresh: true,
  
  dateRange: {
    default: '7d',
    options: ['24h', '7d', '30d', '90d'],
  },
  
  api: {
    services: {
      analytics: {
        baseUrl: 'http://localhost:8000/api',
        timeout: 10000,
        routes: {
          summary: '/analytics',
          chartData: '/analytics/chart',
        },
      },
    },
  },
  
  theme: {
    chartColors: ['#1976d2', '#dc004e', '#388e3c', '#f57c00', '#7b1fa2'],
  },
  
  mock: {
    enabled: false,
    apiDelay: 500,
    authBypass: false,
    mockMetrics: {
      cards: [
        {
          title: 'Total Users',
          value: '1,234',
          change: 12,
          trend: 'up',
          icon: 'People',
        },
        {
          title: 'Revenue',
          value: '$45,678',
          change: 8,
          trend: 'up',
          icon: 'TrendingUp',
        },
        {
          title: 'Conversion Rate',
          value: '3.2%',
          change: -2,
          trend: 'down',
          icon: 'Assessment',
        },
        {
          title: 'Page Views',
          value: '98,765',
          change: 15,
          trend: 'up',
          icon: 'Timeline',
        },
      ],
      chartData: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Apr', value: 800 },
        { name: 'May', value: 500 },
        { name: 'Jun', value: 700 },
      ],
    },
  },
};

