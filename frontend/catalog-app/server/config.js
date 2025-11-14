require('dotenv').config();

module.exports = {
  port: process.env.BFF_PORT || 4006,
  frontendPort: process.env.FRONTEND_PORT || 3005,
  catalogBackendUrl: process.env.BACKEND_CATALOG_SERVICE_URL || 'https://dev-creamat.fds-1.com/catalog',
  cdnBackendUrl: process.env.BACKEND_CDN_SERVICE_URL || 'https://dev-creamat.fds-1.com/cdn',
  nodeEnv: process.env.NODE_ENV || 'development',
  enableCaching: process.env.ENABLE_CACHING === 'true',
  cacheMaxAge: parseInt(process.env.CACHE_MAX_AGE || '3600', 10), // 1 hour default
};

