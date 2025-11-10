# Firebase Environment Variables Setup

## Required Environment Variables

### 1. Frontend Container App

Create file: `frontend/container/.env.development`

```env
# Firebase Configuration for Development
REACT_APP_FIREBASE_API_KEY=AIzaSyC-your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=saawt-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=saawt-app
REACT_APP_FIREBASE_STORAGE_BUCKET=saawt-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=111180020195242483280
REACT_APP_FIREBASE_APP_ID=1:111180020195242483280:web:your-app-id

# API Configuration
REACT_APP_API_URL=http://localhost:3000
```

### 2. User Management BFF Server

Create file: `frontend/user-management-app/server/.env`

```env
# Server Configuration
BFF_PORT=4001
FRONTEND_PORT=3001
NODE_ENV=development

# Backend Service URL
BACKEND_USER_SERVICE_URL=https://dev-jaiker.fanusdigital.site/user

# Firebase Admin SDK Configuration
FIREBASE_ADMIN_PATH=../../../secrets/firebase-admin.json

# Caching Configuration
ENABLE_CACHING=false
CACHE_MAX_AGE=3600
```

## How to Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (saawt-app)
3. Go to Project Settings → General
4. Scroll down to "Your apps" section
5. Click on the Web app or add a new one
6. Copy the configuration values

## Setup Instructions

```bash
# 1. Create environment files
cd /Users/oudaykhaled/Desktop/consolidated-fe-golden-sample/creamati-cms

# Frontend container
cat > frontend/container/.env.development << 'EOF'
REACT_APP_FIREBASE_API_KEY=YOUR_ACTUAL_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=saawt-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=saawt-app
REACT_APP_FIREBASE_STORAGE_BUCKET=saawt-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=111180020195242483280
REACT_APP_FIREBASE_APP_ID=YOUR_ACTUAL_APP_ID
REACT_APP_API_URL=http://localhost:3000
EOF

# User BFF Server
cat > frontend/user-management-app/server/.env << 'EOF'
BFF_PORT=4001
FRONTEND_PORT=3001
NODE_ENV=development
BACKEND_USER_SERVICE_URL=https://dev-jaiker.fanusdigital.site/user
FIREBASE_ADMIN_PATH=../../../secrets/firebase-admin.json
ENABLE_CACHING=false
CACHE_MAX_AGE=3600
EOF
```

## Verification

Run these commands to verify the setup:

```bash
# Check if Firebase admin config exists
ls -la secrets/firebase-admin.json

# Check if environment files exist
ls -la frontend/container/.env.development
ls -la frontend/user-management-app/server/.env

# Verify environment variables are loaded
cd frontend/container && npm start
# Check console for Firebase initialization message
```

## Security Notes

- ✅ `.env` files are git-ignored for security
- ✅ Firebase Admin SDK private key is stored in `secrets/` folder
- ✅ Never commit `.env` files or `secrets/` folder to git
- ✅ Use different Firebase projects for development/production

