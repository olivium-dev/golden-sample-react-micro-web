/**
 * MSW Mock Handlers for Analytics Dashboard
 */

import { http, HttpResponse } from 'msw';
import { AnalyticsConfig } from '../config/schema';

const defaultMockMetrics = {
  cards: [
    { title: 'Total Users', value: '1,234', change: 12, trend: 'up', icon: 'People' },
    { title: 'Revenue', value: '$45,678', change: 8, trend: 'up', icon: 'TrendingUp' },
    { title: 'Conversion Rate', value: '3.2%', change: -2, trend: 'down', icon: 'Assessment' },
    { title: 'Page Views', value: '98,765', change: 15, trend: 'up', icon: 'Timeline' },
  ],
  chartData: [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 700 },
  ],
};

export function createAnalyticsMockHandlers(config: AnalyticsConfig) {
  const baseUrl = config.api.services.analytics.baseUrl;
  const routes = config.api.services.analytics.routes;
  const delay = config.mock?.apiDelay ?? 500;
  const mockData = config.mock?.mockMetrics ?? defaultMockMetrics;

  return [
    // GET /analytics - Summary data
    http.get(`${baseUrl}${routes.summary}`, async () => {
      console.log('[MSW] GET /analytics');
      await new Promise(r => setTimeout(r, delay));
      return HttpResponse.json(mockData);
    }),

    // GET /analytics/chart - Chart data
    http.get(`${baseUrl}${routes.chartData}`, async () => {
      console.log('[MSW] GET /analytics/chart');
      await new Promise(r => setTimeout(r, delay));
      return HttpResponse.json(mockData.chartData);
    }),
  ];
}

