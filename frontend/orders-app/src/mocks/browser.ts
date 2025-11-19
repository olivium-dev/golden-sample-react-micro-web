/**
 * MSW Browser Worker Setup
 * Initializes mock service worker for browser-based mocking
 */

import { setupWorker } from 'msw/browser';
import { createUserMockHandlers } from './handlers';
import { UserManagementConfig } from '../config/schema';

export function createMockWorker(config: UserManagementConfig) {
  const handlers = createUserMockHandlers(config);
  return setupWorker(...handlers);
}

export async function startMocking(config: UserManagementConfig) {
  if (!config.mock?.enabled) {
    console.log('[MSW] Mocking disabled by config');
    return null;
  }

  console.log('[MSW] Starting mock service worker...');
  const worker = createMockWorker(config);
  
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });

  console.log('[MSW] Mock service worker started');
  console.log('[MSW] Mock users loaded:', config.mock?.mockUsers?.length ?? 0);
  console.log('[MSW] Auth bypass:', config.mock?.authBypass ? 'ENABLED' : 'disabled');

  return worker;
}

