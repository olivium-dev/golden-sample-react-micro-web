/**
 * User Management Default Configuration
 * This is the hardcoded fallback configuration
 */

import { UserManagementConfig } from './schema';

export const defaultConfig: UserManagementConfig = {
  version: '1.0.0',
  
  table: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    enableExport: true,
  },
  
  roles: {
    visible: ['admin', 'user', 'viewer'],
  },
  
  features: {
    createEnabled: true,
    deleteEnabled: true,
    bulkActions: true,
  },
  
  api: {
    services: {
      users: {
        baseUrl: 'http://localhost:8000/api',
        timeout: 10000,
        routes: {
          list: '/users',
          create: '/users',
          update: '/users/:id',
          delete: '/users/:id',
        },
      },
    },
  },
  
  theme: {
    primaryColor: '#1976d2',
    tableHeaderBg: '#f5f5f5',
  },
  
  mock: {
    enabled: false,
    apiDelay: 500,
    authBypass: false,
    mockUsers: [
      {
        id: 1,
        email: 'admin@example.com',
        username: 'admin',
        full_name: 'Admin User',
        role: 'admin',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        email: 'user@example.com',
        username: 'user',
        full_name: 'Regular User',
        role: 'user',
        is_active: true,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
      {
        id: 3,
        email: 'viewer@example.com',
        username: 'viewer',
        full_name: 'Viewer User',
        role: 'viewer',
        is_active: true,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      },
    ],
  },
};

