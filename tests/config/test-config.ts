/**
 * Test Configuration for Micro-Frontend Golden Sample
 * 
 * Defines ports, URLs, selectors, expected content, and timeouts
 * for all micro-webs in both standalone and Module Federation modes.
 */

export interface ServiceConfig {
  name: string;
  port: number;
  mfPort?: number; // Module Federation port (different from standalone)
  path: string; // Working directory relative to project root
  startCommand: string;
  healthPath?: string; // Path to check if service is ready
  expectedContent: string[]; // Content that must be present on the page
  selectors: {
    [key: string]: string; // CSS selectors for key elements
  };
}

export interface TestConfig {
  // Service definitions
  services: {
    backend: ServiceConfig;
    container: ServiceConfig;
    userManagement: ServiceConfig;
    dataGrid: ServiceConfig;
    analytics: ServiceConfig;
    settings: ServiceConfig;
  };
  
  // Test timeouts
  timeouts: {
    serviceStart: number;
    pageLoad: number;
    compilation: number;
    assertion: number;
  };
  
  // URLs
  urls: {
    backend: string;
    container: string;
    standalone: {
      userManagement: string;
      dataGrid: string;
      analytics: string;
      settings: string;
    };
    moduleFederation: {
      userManagement: string;
      dataGrid: string;
      analytics: string;
      settings: string;
    };
  };
  
  // Auth bypass tokens (fake JWT tokens for testing)
  auth: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      name: string;
      role: string;
    };
  };
  
  // Expected console messages
  console: {
    success: string[];
    errors: string[]; // Expected errors (like CORS when backend is down)
    ignore: string[]; // Messages to ignore (webpack HMR, etc.)
  };
}

export const testConfig: TestConfig = {
  services: {
    backend: {
      name: 'Backend API',
      port: 30001,
      path: 'backend/mock-data-service',
      startCommand: 'python3 main.py',
      healthPath: '/api/health',
      expectedContent: [],
      selectors: {},
    },
    
    container: {
      name: 'Container App',
      port: 30002,
      path: 'frontend/container',
      startCommand: 'npm start',
      healthPath: '/',
      expectedContent: [
        'Micro-Frontend Platform',
        'User Management',
        'Data Grid',
        'Analytics',
        'Settings'
      ],
      selectors: {
        title: '[data-testid="app-title"], h1, .MuiTypography-h4',
        navigation: '[data-testid="navigation"], .MuiList-root',
        userMenu: '[data-testid="user-menu"]',
        logoutButton: '[data-testid="logout-button"]',
        menuItems: '[data-testid="menu-item"], .MuiListItemButton-root',
      },
    },
    
    userManagement: {
      name: 'User Management',
      port: 30103, // Standalone port
      mfPort: 30003, // Module Federation port
      path: 'frontend/user-management-app',
      startCommand: 'npm run start:isolated',
      healthPath: '/',
      expectedContent: [
        'User Management',
        'Add User',
        'Username',
        'Email',
        'Role',
        'Actions'
      ],
      selectors: {
        title: '[data-testid="user-management-title"], h1, h4',
        addButton: '[data-testid="add-user-button"], button:has-text("Add User")',
        dataGrid: '[data-testid="users-grid"], .MuiDataGrid-root',
        searchField: '[data-testid="search-field"], input[placeholder*="Search"]',
        refreshButton: '[data-testid="refresh-button"], button:has-text("Refresh")',
      },
    },
    
    dataGrid: {
      name: 'Data Grid',
      port: 30104,
      mfPort: 30004,
      path: 'frontend/data-grid-app',
      startCommand: 'npm run start:isolated',
      healthPath: '/',
      expectedContent: [
        'Data Grid',
        'table',
        'pagination',
        'rows'
      ],
      selectors: {
        title: '[data-testid="data-grid-title"], h1, h4',
        grid: '[data-testid="data-grid"], .MuiDataGrid-root',
        toolbar: '[data-testid="grid-toolbar"], .MuiDataGrid-toolbarContainer',
        pagination: '[data-testid="pagination"], .MuiDataGrid-footerContainer',
      },
    },
    
    analytics: {
      name: 'Analytics Dashboard',
      port: 30105,
      mfPort: 30005,
      path: 'frontend/analytics-app',
      startCommand: 'npm run start:isolated',
      healthPath: '/',
      expectedContent: [
        'Analytics Dashboard',
        'Standalone Mode',
        'Chart',
        'Performance'
      ],
      selectors: {
        title: '[data-testid="analytics-title"], h1, h4',
        metricCards: '[data-testid="metric-card"], .MuiCard-root',
        chart: '[data-testid="chart"], .recharts-wrapper, canvas',
        refreshButton: '[data-testid="refresh-analytics"]',
      },
    },
    
    settings: {
      name: 'Settings Panel',
      port: 30106,
      mfPort: 30006,
      path: 'frontend/settings-app',
      startCommand: 'npm run start:isolated',
      healthPath: '/',
      expectedContent: [
        'Settings Panel',
        'Appearance',
        'Notifications',
        'Language'
      ],
      selectors: {
        title: '[data-testid="settings-title"], h1, h4',
        appearanceSection: '[data-testid="appearance-section"]',
        notificationsSection: '[data-testid="notifications-section"]',
        saveButton: '[data-testid="save-settings"], button:has-text("Save")',
        resetButton: '[data-testid="reset-settings"], button:has-text("Reset")',
      },
    },
  },
  
  timeouts: {
    serviceStart: 30000, // 30 seconds to start a service
    pageLoad: 30000, // 30 seconds to load a page
    compilation: 25000, // 25 seconds for webpack compilation
    assertion: 10000, // 10 seconds for assertions
  },
  
  urls: {
    backend: 'http://localhost:30001',
    container: 'http://localhost:30002',
    standalone: {
      userManagement: 'http://localhost:30103',
      dataGrid: 'http://localhost:30104',
      analytics: 'http://localhost:30105',
      settings: 'http://localhost:30106',
    },
    moduleFederation: {
      userManagement: 'http://localhost:30003',
      dataGrid: 'http://localhost:30004',
      analytics: 'http://localhost:30005',
      settings: 'http://localhost:30006',
    },
  },
  
  auth: {
    // Fake JWT tokens for testing (bypassing real auth)
    accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5LCJyb2xlIjoiYWRtaW4ifQ.test',
    refreshToken: 'refresh_token_test',
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    },
  },
  
  console: {
    success: [
      'Compiled successfully',
      'webpack compiled',
      'Config loaded',
      'MSW] Mock service worker started',
      'started in standalone mode',
    ],
    errors: [
      // Expected errors when backend is not running
      'Access to XMLHttpRequest',
      'CORS',
      'Failed to load resource',
      'net::ERR_FAILED',
      'net::ERR_CONNECTION_REFUSED',
    ],
    ignore: [
      'Download the React DevTools',
      '[HMR]',
      '[webpack-dev-server]',
      'webpack-internal',
      'LiveReload enabled',
      'Hot Module Replacement enabled',
    ],
  },
};

// Navigation routes for E2E testing
export const navigationRoutes = [
  { path: '/', name: 'Home', service: 'container' },
  { path: '/users', name: 'User Management', service: 'userManagement' },
  { path: '/data', name: 'Data Grid', service: 'dataGrid' },
  { path: '/analytics', name: 'Analytics', service: 'analytics' },
  { path: '/settings', name: 'Settings', service: 'settings' },
];

// Helper functions
export function getServiceUrl(serviceName: keyof TestConfig['services'], mode: 'standalone' | 'mf' = 'standalone'): string {
  const service = testConfig.services[serviceName];
  if (serviceName === 'backend') {
    return testConfig.urls.backend;
  }
  if (serviceName === 'container') {
    return testConfig.urls.container;
  }
  
  const port = mode === 'standalone' ? service.port : service.mfPort;
  return `http://localhost:${port}`;
}

export function getExpectedContent(serviceName: keyof TestConfig['services']): string[] {
  return testConfig.services[serviceName].expectedContent;
}

export function getSelectors(serviceName: keyof TestConfig['services']) {
  return testConfig.services[serviceName].selectors;
}
