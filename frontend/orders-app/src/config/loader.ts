/**
 * User Management Configuration Loader
 */

import { merge } from 'lodash';
import { UserManagementConfigSchema, UserManagementConfig } from './schema';
import { defaultConfig } from './defaults';

export async function loadUserConfig(propsOverride?: Partial<UserManagementConfig>): Promise<UserManagementConfig> {
  let runtimeConfig: any = {};

  // 1. Check for props override
  if (propsOverride) {
    runtimeConfig = propsOverride;
    console.log('[User Management] Config loaded from props');
  }
  // 2. Try window.__APP_CONFIG__ (MF mode)
  else if ((window as any).__APP_CONFIG__?.userManagement) {
    runtimeConfig = (window as any).__APP_CONFIG__.userManagement;
    console.log('[User Management] Config loaded from window.__APP_CONFIG__');
  }
  // 3. Try config.project.json (standalone mode)
  else {
    try {
      const projectConfig = await fetch('/config.project.json').then((r) => r.json());
      runtimeConfig = projectConfig;
      console.log('[User Management] Config loaded from /config.project.json');
    } catch {
      // 4. Try config.default.json
      try {
        const defaultJson = await fetch('/config.default.json').then((r) => r.json());
        runtimeConfig = defaultJson;
        console.log('[User Management] Config loaded from /config.default.json');
      } catch {
        console.warn('[User Management] No runtime config found, using hardcoded defaults');
      }
    }
  }

  // Merge defaults with runtime config
  const merged = merge({}, defaultConfig, runtimeConfig);

  // Validate with zod schema
  try {
    const validated = UserManagementConfigSchema.parse(merged);
    console.log('[User Management] Config validated successfully:', validated);
    return validated;
  } catch (error) {
    console.error('[User Management] Config validation failed:', error);
    console.warn('[User Management] Falling back to defaults due to validation error');
    return defaultConfig;
  }
}

