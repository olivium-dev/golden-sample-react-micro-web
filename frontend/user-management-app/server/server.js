const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const compression = require('compression');
const https = require('https');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('./config');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, '../../../creamat-firebase-admin.json');
try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  console.log('[USER-BFF] Firebase Admin SDK initialized for project:', serviceAccount.project_id);
} catch (error) {
  console.error('[USER-BFF] Failed to initialize Firebase Admin SDK:', error.message);
  console.error('[USER-BFF] Please ensure firebase-admin.json exists at:', serviceAccountPath);
}

// Create HTTPS agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const app = express();

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[USER-BFF] ${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'user-management-bff',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Special handling for social login endpoint - REAL IMPLEMENTATION
app.post('/api/users/social', async (req, res) => {
  try {
    console.log('[USER-BFF] Social login request received');
    const { socialId, socialToken, socialPlatform } = req.body;
    
    // Verify Firebase ID token using Firebase Admin SDK
    console.log('[USER-BFF] Verifying Firebase ID token with Firebase Admin SDK...');
    
    let decodedToken;
    try {
      // Use Firebase Admin SDK to verify the token
      decodedToken = await admin.auth().verifyIdToken(socialToken);
      console.log('[USER-BFF] Token verified successfully by Firebase Admin SDK');
    } catch (verifyError) {
      console.error('[USER-BFF] Token verification failed:', verifyError.message);
      
      // Provide specific error messages
      if (verifyError.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Token expired', detail: 'Please sign in again' });
      } else if (verifyError.code === 'auth/invalid-id-token') {
        return res.status(401).json({ error: 'Invalid token', detail: 'The provided token is invalid' });
      } else if (verifyError.code === 'auth/argument-error') {
        return res.status(401).json({ error: 'Invalid token format', detail: 'Token format is incorrect' });
      }
      
      return res.status(401).json({ 
        error: 'Token verification failed', 
        detail: verifyError.message 
      });
    }
    
    // Extract user information from the verified token
    const userInfo = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || decodedToken.displayName || '',
      picture: decodedToken.picture || decodedToken.photoURL || '',
      emailVerified: decodedToken.email_verified || false,
      provider: decodedToken.firebase?.sign_in_provider || socialPlatform || 'unknown'
    };
    
    console.log('[USER-BFF] Token verified for user:', userInfo.email || userInfo.uid);
    
    // Forward to backend to create/update user and get JWT tokens
    try {
      console.log('[USER-BFF] Forwarding to backend user service...');
      console.log('[USER-BFF] Sending to:', `${config.backendUrl}/api/User/social`);
      
      // Backend expects socialId, socialToken, and socialPlatform
      const backendPayload = {
        socialId: userInfo.uid,
        socialToken: socialToken,  // Send the original token for backend verification
        socialPlatform: userInfo.provider === 'google.com' ? 'google' : 
                       userInfo.provider === 'password' ? 'email' :
                       userInfo.provider || socialPlatform || 'unknown'
      };
      
      console.log('[USER-BFF] Backend payload:', { 
        socialId: backendPayload.socialId, 
        socialPlatform: backendPayload.socialPlatform,
        tokenLength: socialToken?.length || 0
      });
      
      const backendResponse = await axios.post(
        `${config.backendUrl}/api/User/social`,
        backendPayload,
        {
          httpsAgent,
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': req.ip,
            'X-Original-Host': req.get('host')
          },
          timeout: 30000
        }
      );
      
      console.log('[USER-BFF] Backend response received:', backendResponse.status);
      console.log('[USER-BFF] Backend response data:', backendResponse.data);
      res.status(backendResponse.status).json(backendResponse.data);
    } catch (backendError) {
      // If backend doesn't have the endpoint yet (404 or 405), create a proper response
      const statusCode = backendError.response?.status || backendError.status;
      console.log('[USER-BFF] Backend error status:', statusCode);
      
      if (statusCode === 404 || statusCode === 405) {
        console.log('[USER-BFF] Backend endpoint not found or method not allowed, creating user session...');
        
        // Generate JWT tokens for the user (temporary until backend is ready)
        const authToken = jwt.sign(
          { 
            userId: userInfo.uid,
            email: userInfo.email,
            name: userInfo.name
          },
          'temporary-secret-key', // In production, use a proper secret from config
          { expiresIn: '1h' }
        );
        
        const refreshToken = jwt.sign(
          { userId: userInfo.uid },
          'temporary-refresh-secret', // In production, use a proper secret from config
          { expiresIn: '7d' }
        );
        
        res.status(200).json({
          userId: userInfo.uid,
          authToken,
          refreshToken,
          recentlyCreated: true,
          user: userInfo
        });
      } else {
        console.error('[USER-BFF] Backend error:', backendError.message);
        res.status(backendError.response?.status || 500).json({
          error: 'Backend service error',
          message: backendError.message
        });
      }
    }
  } catch (error) {
    console.error('[USER-BFF] Social login error:', error);
    res.status(500).json({ error: 'Social login failed', message: error.message });
  }
});

// API Proxy - Proxy /api/users/* to backend user service (except /social which is handled above)
app.use(
  '/api/users',
  createProxyMiddleware({
    target: config.backendUrl,
    changeOrigin: true,
    secure: false, // Allow self-signed certificates in development
    agent: httpsAgent, // Use custom HTTPS agent
    pathRewrite: (path, req) => {
      // Map routes to real backend endpoints
      // /api/users/login → /api/User/login
      // /api/users/logout → /api/User/logout  
      // /api/users/me → /api/User/me
      // /api/users/all → /api/User/all
      // /api/users/:id → /api/User/:id
      return path.replace('/api/users', '/api/User');
    },
    filter: (pathname, req) => {
      // Exclude /api/users/social from proxy - it's handled by the route above
      console.log('[USER-BFF] Proxy filter checking:', pathname);
      if (pathname === '/api/users/social' || pathname.includes('/social')) {
        console.log('[USER-BFF] Filter: Excluding /social from proxy');
        return false; // Don't proxy
      }
      return true; // Proxy everything else
    },
    logLevel: 'debug',
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
      const targetPath = req.path.replace('/api/users', '/api/User');
      console.log(`[USER-BFF] Proxying ${req.method} ${req.path} to ${config.backendUrl}${targetPath}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[USER-BFF] Response: ${proxyRes.statusCode} for ${req.path}`);
    },
    onError: (err, req, res) => {
      console.error(`[USER-BFF] Proxy error: ${err.message}`);
      console.error(`[USER-BFF] Proxy error stack: ${err.stack}`);
      res.status(500).json({ error: 'Proxy error', message: err.message, details: err.stack });
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
  console.log(`[USER-BFF] Server running on port ${PORT}`);
  console.log(`[USER-BFF] Environment: ${config.nodeEnv}`);
  console.log(`[USER-BFF] Backend URL: ${config.backendUrl}`);
  if (config.nodeEnv === 'development') {
    console.log(`[USER-BFF] Proxying frontend to http://localhost:${config.frontendPort}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[USER-BFF] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[USER-BFF] SIGINT received, shutting down gracefully');
  process.exit(0);
});

