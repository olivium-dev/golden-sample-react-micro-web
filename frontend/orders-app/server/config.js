require('dotenv').config();

module.exports = {
  port: process.env.BFF_PORT || 4005,
  frontendPort: process.env.FRONTEND_PORT || 3005,
  backendUrl: process.env.BACKEND_ORDER_SERVICE_URL || 'https://dev-creamat.fds-1.com/order',
  nodeEnv: process.env.NODE_ENV || 'development',
  enableCaching: process.env.ENABLE_CACHING === 'false', // Orders typically shouldn't be cached
  cacheMaxAge: parseInt(process.env.CACHE_MAX_AGE || '300', 10), // 5 minutes default for orders
};

