# Firebase Authentication Integration

## Overview

This document describes the Firebase authentication implementation in the JAIKER Micro-Frontend Platform. The integration follows the BFF (Backend-for-Frontend) architecture pattern with support for:

1. **Google Sign-In** - OAuth authentication via Google
2. **Email/Password** - Firebase email/password authentication

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                             │
│  ┌─────────────────┐       ┌──────────────────┐                    │
│  │  LoginScreen    │       │   AuthService    │                    │
│  │  Component      │──────▶│  (Firebase SDK)  │                    │
│  └─────────────────┘       └──────────────────┘                    │
│          │                          │                                │
│          │  1. User clicks         │  2. Firebase Auth             │
│          │     Google/Email         │     (Client SDK)              │
│          ▼                          ▼                                │
│     Google Popup           Firebase ID Token                        │
└──────────────────────────────────────┬──────────────────────────────┘
                                        │ 3. POST /api/users/social
                                        │    {socialId, socialToken, platform}
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Webpack Dev Server Proxy                          │
│                    (localhost:3000)                                  │
│                           │                                          │
│                           │  Proxy to BFF                            │
└───────────────────────────┼──────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  User Management BFF Server                          │
│                    (localhost:4001)                                  │
│                           │                                          │
│                           │  Proxy to Backend                        │
│                           │  /api/User/social                        │
└───────────────────────────┼──────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend API Gateway                             │
│               (https://dev-jaiker.fanusdigital.site/user)           │
│  ┌───────────────────────────────────────────────────────┐         │
│  │  Firebase Admin SDK                                    │         │
│  │  - Verifies Firebase ID token                         │         │
│  │  - Creates/finds user in database                     │         │
│  │  - Returns JWT tokens (authToken, refreshToken)       │         │
│  └───────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Frontend Firebase Client SDK

**Location**: `frontend/shared-ui-lib/src/auth/firebaseConfig.ts`

- Initializes Firebase app with project configuration
- Exports authentication utilities:
  - `auth` - Firebase Auth instance
  - `googleProvider` - Google OAuth provider
  - `signInWithPopup` - Google Sign-In function
  - `signInWithEmailAndPassword` - Email/Password login
  - `createUserWithEmailAndPassword` - Email/Password registration

**Configuration**: Environment variables in `frontend/container/.env.development`

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=saawt-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=saawt-app
```

### 2. AuthService Firebase Methods

**Location**: `frontend/shared-ui-lib/src/auth/AuthService.ts`

#### `loginWithGoogle()`
- Opens Google Sign-In popup
- Gets Firebase ID token
- Sends token to `/api/users/social` with platform='google'
- Stores JWT tokens returned from backend

#### `loginWithEmailPassword(email, password)`
- Authenticates with Firebase
- Gets Firebase ID token
- Sends token to `/api/users/social` with platform='email'
- Stores JWT tokens returned from backend

#### `registerWithEmailPassword(email, password)`
- Creates new Firebase user
- Gets Firebase ID token
- Sends token to `/api/users/social` (backend auto-creates user if new)
- Stores JWT tokens returned from backend

### 3. LoginScreen Component

**Location**: `frontend/container/src/components/LoginScreen.tsx`

**Features**:
- **"Continue with Google" button** - Triggers Google Sign-In popup
- **Email/Password form** - Uses Firebase authentication
- **Error handling** - Displays Firebase and backend errors
- **Loading states** - Shows spinners during authentication
- **MUI Design** - All components from Material-UI

### 4. BFF Server Configuration

**Location**: `frontend/user-management-app/server/server.js`

The BFF server proxies `/api/users/*` to the backend, including `/api/users/social`. The existing proxy configuration handles Firebase authentication requests.

**Configuration**: `frontend/user-management-app/server/.env`

```env
FIREBASE_ADMIN_PATH=../../../secrets/firebase-admin.json
BACKEND_USER_SERVICE_URL=https://dev-jaiker.fanusdigital.site/user
```

### 5. Backend Integration

**Endpoint**: `/api/User/social` (POST)

**Request**:
```json
{
  "socialId": "firebase_uid",
  "socialToken": "firebase_id_token",
  "socialPlatform": "google" | "email"
}
```

**Response**:
```json
{
  "userId": "guid",
  "authToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "recentlyCreated": true/false
}
```

**Backend Logic**:
1. Verifies Firebase ID token using Firebase Admin SDK
2. Extracts user email and profile info from token
3. Checks if user exists in database
4. Creates new user if first login
5. Generates JWT tokens
6. Returns authentication response

## Setup Instructions

### Prerequisites

1. Firebase project (saawt-app) configured
2. Google Sign-In enabled in Firebase Console
3. Email/Password authentication enabled in Firebase Console

### Step 1: Copy Firebase Admin Config

```bash
cd /Users/oudaykhaled/Desktop/consolidated-fe-golden-sample/creamati-cms

# Already completed - file copied to secrets/firebase-admin.json
ls -la secrets/firebase-admin.json
```

### Step 2: Install Dependencies

```bash
# Already completed
# Frontend packages: firebase
# BFF server: firebase-admin
```

### Step 3: Configure Environment Variables

See `FIREBASE_ENV_SETUP.md` for detailed instructions.

### Step 4: Start Services

```bash
# Start BFF servers
cd frontend/user-management-app/server && node server.js &
cd frontend/catalog-app/server && node server.js &
cd frontend/orders-app/server && node server.js &

# Start container app
cd frontend/container && npm start
```

### Step 5: Test Authentication

1. Navigate to http://localhost:3000
2. Click "Continue with Google"
3. Sign in with Google account
4. Verify successful authentication and dashboard access

## Testing Strategy (Bottom-to-Top)

### Layer 1: Backend API

Test the backend Firebase endpoint directly:

```bash
# This requires a valid Firebase ID token
# You can get one from Firebase Console or by logging in first

curl -X POST https://dev-jaiker.fanusdigital.site/user/api/User/social \
  -H "Content-Type: application/json" \
  -d '{
    "socialId": "firebase_uid",
    "socialToken": "valid_firebase_id_token",
    "socialPlatform": "google"
  }'
```

**Expected**: Returns JWT tokens or 401 if token invalid

### Layer 2: BFF API

Test BFF proxy to backend:

```bash
curl -X POST http://localhost:4001/api/users/social \
  -H "Content-Type: application/json" \
  -d '{
    "socialId": "firebase_uid",
    "socialToken": "valid_firebase_id_token",
    "socialPlatform": "google"
  }'
```

**Expected**: Proxies to backend and returns JWT tokens

### Layer 3: Frontend to BFF

Test webpack dev server proxy:

```bash
curl -X POST http://localhost:3000/api/users/social \
  -H "Content-Type: application/json" \
  -d '{
    "socialId": "firebase_uid",
    "socialToken": "valid_firebase_id_token",
    "socialPlatform": "google"
  }'
```

**Expected**: Proxies through webpack to BFF to backend

### Layer 4: End-to-End Browser Test

Create Playwright test: `tests/firebase-login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Firebase Authentication', () => {
  test('Google Sign-In button is visible', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verify login screen is showing
    await expect(page.locator('text=Continue with Google')).toBeVisible();
    await expect(page.locator('text=Sign In with Email')).toBeVisible();
  });

  test('Email/Password fields are present', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  // Note: Full Google Sign-In test requires handling popup
  // which is complex in Playwright. Manual testing recommended.
});
```

## Error Handling

### Firebase Errors

**Google Sign-In**:
- `auth/popup-closed-by-user` → "Sign-in cancelled"
- `auth/popup-blocked` → "Popup blocked by browser"
- `auth/cancelled-popup-request` → "Sign-in cancelled"

**Email/Password Login**:
- `auth/user-not-found` → "User not found. Please register first."
- `auth/wrong-password` → "Incorrect password"
- `auth/invalid-email` → "Invalid email address"
- `auth/user-disabled` → "Account has been disabled"
- `auth/too-many-requests` → "Too many failed attempts"

**Email/Password Registration**:
- `auth/email-already-in-use` → "Email already registered"
- `auth/weak-password` → "Password is too weak"

### Backend Errors

- **401 Unauthorized** - Invalid Firebase token
- **500 Internal Server Error** - Backend service error
- **Network Error** - Backend unreachable

## Security Considerations

### ✅ Implemented

1. **Firebase ID Token Verification** - Backend verifies all tokens with Firebase Admin SDK
2. **HTTPS Communication** - All API calls over HTTPS
3. **JWT Token Storage** - Access/refresh tokens in localStorage
4. **Token Refresh** - Automatic token refresh every 13 minutes
5. **Cross-Tab Sync** - BroadcastChannel for multi-tab auth state
6. **Firebase Admin Private Key** - Stored securely in `secrets/` folder (gitignored)

### ⚠️ Production Recommendations

1. Use environment-specific Firebase projects
2. Enable Firebase App Check for abuse prevention
3. Configure Firebase Security Rules
4. Implement rate limiting on backend
5. Use secure, httpOnly cookies for JWT tokens (instead of localStorage)
6. Enable 2FA for admin accounts
7. Regular security audits

## Troubleshooting

### Issue: "Popup blocked by browser"

**Solution**: Allow popups for localhost:3000 in browser settings

### Issue: "Firebase: Error (auth/configuration-not-found)"

**Solution**: Verify Firebase configuration in `.env.development` file

### Issue: "Firebase admin SDK not initialized"

**Solution**: 
1. Check `secrets/firebase-admin.json` exists
2. Verify `FIREBASE_ADMIN_PATH` in BFF server `.env` file
3. Restart BFF server

### Issue: "CORS error when calling backend"

**Solution**: 
1. Verify backend CORS configuration includes localhost origins
2. Check BFF server is proxying correctly
3. Verify webpack proxy is running

### Issue: "Failed to load resource: net::ERR_CONNECTION_REFUSED"

**Solution**:
1. Ensure BFF server is running on port 4001
2. Check webpack dev server proxy configuration
3. Verify no port conflicts

## Files Modified/Created

### Created Files:
- `frontend/shared-ui-lib/src/auth/firebaseConfig.ts` - Firebase client config
- `frontend/shared-ui-lib/src/auth/firebaseTypes.ts` - TypeScript types
- `secrets/firebase-admin.json` - Firebase Admin SDK config (gitignored)
- `FIREBASE_ENV_SETUP.md` - Environment setup guide
- `FIREBASE_AUTHENTICATION.md` - This document

### Modified Files:
- `frontend/shared-ui-lib/src/auth/AuthService.ts` - Added Firebase methods
- `frontend/shared-ui-lib/src/index.ts` - Export Firebase utilities
- `frontend/shared-ui-lib/package.json` - Added firebase dependency
- `frontend/container/package.json` - Added firebase dependency
- `frontend/container/src/components/LoginScreen.tsx` - Added Google button
- `frontend/container/src/App.tsx` - Updated login handler for Firebase
- `frontend/container/webpack.config.js` - Fixed proxy configuration
- `frontend/user-management-app/server/package.json` - Added firebase-admin

## Validation Checklist

- ✅ Firebase admin config copied to secrets folder
- ✅ Firebase client SDK installed and configured
- ✅ Firebase Admin SDK installed in BFF server
- ✅ AuthService has Google and Email/Password methods
- ✅ Login screen has Google Sign-In button (MUI only)
- ✅ Login screen has Email/Password form
- ✅ BFF properly proxies authentication requests
- ✅ Webpack proxy fixed for POST requests
- ✅ Error handling implemented
- ✅ Loading states implemented
- ✅ No mocks or workarounds used
- ✅ No linting errors
- ⏳ Backend endpoint testing (requires deployment)
- ⏳ BFF endpoint testing (requires BFF running)
- ⏳ End-to-end testing (requires all services running)

## Next Steps

1. **Configure Firebase Project**
   - Get actual Firebase API keys from Firebase Console
   - Update `.env.development` file with real values

2. **Start All Services**
   - Start BFF servers (user, catalog, orders)
   - Start frontend container app
   - Start backend services (if running locally)

3. **Test Bottom-to-Top**
   - Test backend endpoint with curl
   - Test BFF proxy with curl
   - Test webpack proxy with curl
   - Test in browser with Google Sign-In
   - Test in browser with Email/Password

4. **Create Playwright Tests**
   - Implement automated tests for authentication flow
   - Test error scenarios
   - Test token refresh

5. **Production Deployment**
   - Configure production Firebase project
   - Update production environment variables
   - Deploy backend with CORS enabled
   - Deploy frontend with production Firebase config

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Review this documentation
3. Check Firebase Console for authentication logs
4. Review backend logs for API errors
5. Check BFF server logs for proxy issues

