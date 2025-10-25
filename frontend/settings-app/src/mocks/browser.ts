/**
 * MSW Browser Worker Setup for Settings Panel
 */

import { setupWorker } from 'msw/browser';
import { createSettingsMockHandlers } from './handlers';
import { SettingsConfig } from '../config/schema';

export function createMockWorker(config: SettingsConfig) {
  const handlers = createSettingsMockHandlers(config);
  return setupWorker(...handlers);
}

export async function startMocking(config: SettingsConfig) {
  if (!config.mock?.enabled) {
    console.log('[MSW] Mocking disabled by config');
    return null;
  }

  try {
    console.log('[MSW] Starting mock service worker for Settings...');
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

