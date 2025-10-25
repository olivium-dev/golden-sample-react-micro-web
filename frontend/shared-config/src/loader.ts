/**
 * Configuration loader utilities
 * Handles loading config from multiple sources with proper precedence
 */

import { merge } from 'lodash';
import { z } from 'zod';

/**
 * Configuration loading precedence:
 * 1. Props (runtime, programmatic)
 * 2. window.__APP_CONFIG__[appName] (MF mode)
 * 3. /config.project.json (standalone mode)
 * 4. /config.default.json (bundled fallback)
 * 5. hardcoded defaults
 */
export async function loadConfigWithPrecedence<T>(
  appName: string,
  schema: z.ZodSchema<T>,
  hardcodedDefaults: T,
  propsOverride?: Partial<T>
): Promise<T> {
  let runtimeConfig: any = {};

  // 1. Check for props override
  if (propsOverride) {
    runtimeConfig = propsOverride;
    console.log(`[${appName}] Config loaded from props`);
  }
  // 2. Try window.__APP_CONFIG__ (MF mode)
  else if ((window as any).__APP_CONFIG__?.[appName]) {
    runtimeConfig = (window as any).__APP_CONFIG__[appName];
    console.log(`[${appName}] Config loaded from window.__APP_CONFIG__`);
  }
  // 3. Try config.project.json (standalone mode)
  else {
    try {
      const projectConfig = await fetch('/config.project.json').then((r) => r.json());
      runtimeConfig = projectConfig;
      console.log(`[${appName}] Config loaded from /config.project.json`);
    } catch {
      // 4. Try config.default.json
      try {
        const defaultJson = await fetch('/config.default.json').then((r) => r.json());
        runtimeConfig = defaultJson;
        console.log(`[${appName}] Config loaded from /config.default.json`);
      } catch {
        console.warn(`[${appName}] No runtime config found, using hardcoded defaults`);
      }
    }
  }

  // Merge defaults with runtime config (runtime takes precedence)
  const merged = merge({}, hardcodedDefaults, runtimeConfig);

  // Validate with zod schema
  try {
    const validated = schema.parse(merged);
    console.log(`[${appName}] Config validated successfully:`, validated);
    return validated;
  } catch (error) {
    console.error(`[${appName}] Config validation failed:`, error);
    console.warn(`[${appName}] Falling back to defaults due to validation error`);
    return hardcodedDefaults;
  }
}

/**
 * Synchronous config loader (for when config is already in window)
 */
export function loadConfigSync<T>(
  appName: string,
  schema: z.ZodSchema<T>,
  hardcodedDefaults: T,
  propsOverride?: Partial<T>
): T {
  let runtimeConfig: any = {};

  // 1. Check for props override
  if (propsOverride) {
    runtimeConfig = propsOverride;
  }
  // 2. Try window.__APP_CONFIG__
  else if ((window as any).__APP_CONFIG__?.[appName]) {
    runtimeConfig = (window as any).__APP_CONFIG__[appName];
  }

  // Merge and validate
  const merged = merge({}, hardcodedDefaults, runtimeConfig);
  
  try {
    return schema.parse(merged);
  } catch (error) {
    console.error(`[${appName}] Config validation failed:`, error);
    return hardcodedDefaults;
  }
}

/**
 * Helper to create window.__APP_CONFIG__ injection script
 * Used by container to inject config before mounting remotes
 */
export function createConfigInjectionScript(configs: Record<string, any>): string {
  return `
    <script>
      window.__APP_CONFIG__ = ${JSON.stringify(configs, null, 2)};
      console.log('App configs injected:', window.__APP_CONFIG__);
    </script>
  `;
}

