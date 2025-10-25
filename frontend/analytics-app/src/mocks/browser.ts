/**
 * MSW Browser Worker Setup for Analytics Dashboard
 */

import { setupWorker } from 'msw/browser';
import { createAnalyticsMockHandlers } from './handlers';
import { AnalyticsConfig } from '../config/schema';

export function createMockWorker(config: AnalyticsConfig) {
  const handlers = createAnalyticsMockHandlers(config);
  return setupWorker(...handlers);
}

export async function startMocking(config: AnalyticsConfig) {
  if (!config.mock?.enabled) {
    console.log('[MSW] Mocking disabled by config');
    return null;
  }

  try {
    console.log('[MSW] Starting mock service worker for Analytics...');
    const worker = createMockWorker(config);
    
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });

    console.log('[MSW] Mock service worker started successfully');
    console.log('[MSW] Auth bypass:', config.mock?.authBypass ? 'ENABLED' : 'disabled');

    return worker;
  } catch (error) {
    console.error('[MSW] Failed to start mock service worker:', error);
    console.warn('[MSW] Continuing without mocking');
    return null;
  }
}

