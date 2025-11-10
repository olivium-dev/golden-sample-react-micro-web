const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const compression = require('compression');
const config = require('./config');

const app = express();

// Simple in-memory cache for catalog data
const cache = new Map();
const CACHE_TTL = config.cacheMaxAge * 1000; // Convert to milliseconds

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[CATALOG-BFF] ${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'catalog-bff',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Cache middleware for GET requests
const cacheMiddleware = (req, res, next) => {
  if (config.enableCaching && req.method === 'GET') {
    const cacheKey = req.originalUrl;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[CATALOG-BFF] Cache HIT for ${cacheKey}`);
      return res.json(cached.data);
    }
    
    // Store original json method
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      console.log(`[CATALOG-BFF] Cache SET for ${cacheKey}`);
      return originalJson(data);
    };
  }
  next();
};

// API Proxy - Proxy /api/catalog/* to backend catalog service
app.use(
  '/api/catalog',
  cacheMiddleware,
  createProxyMiddleware({
    target: config.catalogBackendUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/catalog': '', // Remove /api/catalog prefix
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add any authentication headers here
      const token = req.headers.authorization;
      if (token) {
        proxyReq.setHeader('Authorization', token);
      }
      // Add API key if needed
      if (process.env.API_KEY) {
        proxyReq.setHeader('X-API-Key', process.env.API_KEY);
      }
      console.log(`[CATALOG-BFF] Proxying ${req.method} ${req.path} to ${config.catalogBackendUrl}${req.path.replace('/api/catalog', '')}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[CATALOG-BFF] Response: ${proxyRes.statusCode} for ${req.path}`);
    },
    onError: (err, req, res) => {
      console.error(`[CATALOG-BFF] Proxy error: ${err.message}`);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
  })
);

// API Proxy - Proxy /api/cdn/* to backend CDN service
app.use(
  '/api/cdn',
  createProxyMiddleware({
    target: config.cdnBackendUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/cdn': '', // Remove /api/cdn prefix
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add any authentication headers here
      const token = req.headers.authorization;
      if (token) {
        proxyReq.setHeader('Authorization', token);
      }
      // Add API key if needed
      if (process.env.API_KEY) {
        proxyReq.setHeader('X-API-Key', process.env.API_KEY);
      }
      console.log(`[CATALOG-BFF] Proxying ${req.method} ${req.path} to ${config.cdnBackendUrl}${req.path.replace('/api/cdn', '')}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[CATALOG-BFF] Response: ${proxyRes.statusCode} for ${req.path}`);
    },
    onError: (err, req, res) => {
      console.error(`[CATALOG-BFF] Proxy error: ${err.message}`);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
  })
);

// Serve static files from dist directory (production)
if (config.nodeEnv === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  // Fallback to index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Development mode - proxy to webpack-dev-server
  app.use(
    '/',
    createProxyMiddleware({
      target: `http://localhost:${config.frontendPort}`,
      changeOrigin: true,
      ws: true, // Enable websocket proxying for HMR
      logLevel: 'debug',
    })
  );
}

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`[CATALOG-BFF] Server running on port ${PORT}`);
  console.log(`[CATALOG-BFF] Environment: ${config.nodeEnv}`);
  console.log(`[CATALOG-BFF] Catalog Backend URL: ${config.catalogBackendUrl}`);
  console.log(`[CATALOG-BFF] CDN Backend URL: ${config.cdnBackendUrl}`);
  console.log(`[CATALOG-BFF] Caching: ${config.enableCaching ? 'ENABLED' : 'DISABLED'}`);
  if (config.nodeEnv === 'development') {
    console.log(`[CATALOG-BFF] Proxying frontend to http://localhost:${config.frontendPort}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[CATALOG-BFF] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[CATALOG-BFF] SIGINT received, shutting down gracefully');
  process.exit(0);
});

