require('dotenv').config();

module.exports = {
  port: process.env.BFF_PORT || 4001,
  frontendPort: process.env.FRONTEND_PORT || 3001,
  backendUrl: process.env.BACKEND_USER_SERVICE_URL || 'https://dev-jaiker.fanusdigital.site/user',
  nodeEnv: process.env.NODE_ENV || 'development',
  enableCaching: process.env.ENABLE_CACHING === 'true',
  cacheMaxAge: parseInt(process.env.CACHE_MAX_AGE || '3600', 10), // 1 hour default
};

