/**
 * Application Configuration
 */

export const appConfig = {
  api: {
    baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:8000') + '/api',
    timeout: 10000,
  },
  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
  categories: ['Sales', 'Marketing', 'Engineering', 'Support', 'Finance', 'Operations'],
  statuses: ['active', 'pending', 'completed', 'archived'],
};





