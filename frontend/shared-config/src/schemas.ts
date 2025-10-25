/**
 * Base configuration schemas for all micro-frontends
 * Uses Zod for runtime validation and type inference
 */

import { z } from 'zod';

/**
 * API Service Schema - defines a backend service endpoint
 */
export const ApiServiceSchema = z.object({
  baseUrl: z.string(),
  timeout: z.number().optional().default(10000),
  retries: z.number().optional().default(3),
});

export type ApiService = z.infer<typeof ApiServiceSchema>;

/**
 * Theme Override Schema - allows runtime theme customization
 */
export const ThemeOverrideSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  mode: z.enum(['light', 'dark', 'auto']).optional(),
  fontFamily: z.string().optional(),
  spacing: z.number().optional(),
});

export type ThemeOverride = z.infer<typeof ThemeOverrideSchema>;

/**
 * Mock Configuration Schema - for standalone testing with MSW
 */
export const MockConfigSchema = z.object({
  enabled: z.boolean().default(false),
  apiDelay: z.number().default(500),
  authBypass: z.boolean().default(false),
  mockData: z.any().optional(),
});

export type MockConfig = z.infer<typeof MockConfigSchema>;

/**
 * Core Configuration Schema - base for all micro-web configs
 */
export const CoreConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  api: z.object({
    services: z.record(z.string(), ApiServiceSchema.partial()).default({}),
  }),
  theme: ThemeOverrideSchema.optional(),
  mock: MockConfigSchema.optional(),
});

export type CoreConfig = z.infer<typeof CoreConfigSchema>;

/**
 * Helper to create app-specific config schema extending CoreConfig
 */
export function extendCoreConfig<T extends z.ZodRawShape>(extension: T) {
  return CoreConfigSchema.merge(z.object(extension));
}

