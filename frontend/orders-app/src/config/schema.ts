/**
 * User Management Micro-Web Configuration Schema
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
 * User Management specific configuration schema
 */
export const UserManagementConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  
  // Table configuration
  table: z.object({
    defaultPageSize: z.number().default(25),
    pageSizeOptions: z.array(z.number()).default([10, 25, 50, 100]),
    enableExport: z.boolean().default(true),
  }).default({
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    enableExport: true,
  }),
  
  // Roles configuration
  roles: z.object({
    visible: z.array(z.string()).default(['admin', 'user', 'viewer']),
  }).default({
    visible: ['admin', 'user', 'viewer'],
  }),
  
  // Feature flags
  features: z.object({
    createEnabled: z.boolean().default(true),
    deleteEnabled: z.boolean().default(true),
    bulkActions: z.boolean().default(true),
  }).default({
    createEnabled: true,
    deleteEnabled: true,
    bulkActions: true,
  }),
  
  // API configuration
  api: z.object({
    services: z.object({
      users: z.object({
        baseUrl: z.string(),
        timeout: z.number().optional().default(10000),
        routes: z.object({
          list: z.string().default('/users'),
          create: z.string().default('/users'),
          update: z.string().default('/users/:id'),
          delete: z.string().default('/users/:id'),
        }).default({
          list: '/users',
          create: '/users',
          update: '/users/:id',
          delete: '/users/:id',
        }),
      }),
    }),
  }),
  
  // Theme overrides
  theme: z.object({
    primaryColor: z.string().optional(),
    tableHeaderBg: z.string().optional(),
  }).optional(),
  
  // Mock configuration for testing
  mock: z.object({
    enabled: z.boolean().default(false),
    apiDelay: z.number().default(500),
    authBypass: z.boolean().default(false),
    mockUsers: z.array(z.object({
      id: z.number(),
      email: z.string(),
      username: z.string(),
      full_name: z.string(),
      role: z.string(),
      is_active: z.boolean(),
      created_at: z.string(),
      updated_at: z.string(),
    })).optional(),
  }).optional(),
});

export type UserManagementConfig = z.infer<typeof UserManagementConfigSchema>;

