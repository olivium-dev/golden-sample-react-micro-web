const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const compression = require('compression');
const config = require('./config');

const app = express();

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[ORDERS-BFF] ${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'orders-bff',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Proxy - Proxy /api/orders/* to backend order service
app.use(
  '/api/orders',
  createProxyMiddleware({
    target: config.backendUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/orders': '/api', // Remove /api/orders prefix, keep /api
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
      console.log(`[ORDERS-BFF] Proxying ${req.method} ${req.path} to ${config.backendUrl}${req.path.replace('/api/orders', '/api')}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[ORDERS-BFF] Response: ${proxyRes.statusCode} for ${req.path}`);
    },
    onError: (err, req, res) => {
      console.error(`[ORDERS-BFF] Proxy error: ${err.message}`);
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
  console.log(`[ORDERS-BFF] Server running on port ${PORT}`);
  console.log(`[ORDERS-BFF] Environment: ${config.nodeEnv}`);
  console.log(`[ORDERS-BFF] Backend URL: ${config.backendUrl}`);
  if (config.nodeEnv === 'development') {
    console.log(`[ORDERS-BFF] Proxying frontend to http://localhost:${config.frontendPort}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[ORDERS-BFF] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[ORDERS-BFF] SIGINT received, shutting down gracefully');
  process.exit(0);
});

