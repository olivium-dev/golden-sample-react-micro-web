/**
 * MSW Mock Handlers for Settings Panel
 */

import { http, HttpResponse } from 'msw';
import { SettingsConfig } from '../config/schema';

const defaultMockSettings = {
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
};

export function createSettingsMockHandlers(config: SettingsConfig) {
  const baseUrl = config.api.services.settings.baseUrl;
  const routes = config.api.services.settings.routes;
  const delay = config.mock?.apiDelay ?? 500;
  
  let currentSettings = config.mock?.mockSettings ?? defaultMockSettings;

  return [
    // GET /settings - Get settings
    http.get(`${baseUrl}${routes.get}`, async () => {
      console.log('[MSW] GET /settings');
      await new Promise(r => setTimeout(r, delay));
      return HttpResponse.json(currentSettings);
    }),

    // PUT /settings - Save settings
    http.put(`${baseUrl}${routes.save}`, async ({ request }) => {
      const body = await request.json();
      console.log('[MSW] PUT /settings', body);
      
      currentSettings = { ...currentSettings, ...body };
      
      await new Promise(r => setTimeout(r, delay));
      return HttpResponse.json(currentSettings);
    }),

    // POST /settings/reset - Reset settings
    http.post(`${baseUrl}${routes.reset}`, async () => {
      console.log('[MSW] POST /settings/reset');
      
      currentSettings = config.mock?.mockSettings ?? defaultMockSettings;
      
      await new Promise(r => setTimeout(r, delay));
      return HttpResponse.json(currentSettings);
    }),
  ];
}

