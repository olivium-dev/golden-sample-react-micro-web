# Get the Correct saawt-app Firebase Web API Key

## Current Situation

- **Backend BFF**: Using saawt-app firebase-admin.json ✅
- **Frontend**: Needs the correct Web API key for saawt-app ❌

## The Problem

The API key I tried (`AIzaSyCBqiELZcS0Aw2qEqYxJdXzYqVx8Zw8fZ0`) is invalid for the saawt-app project.

## How to Get the Correct API Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the **saawt-app** project
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. Find the **Web app** (should have App ID: `1:111180020195242483280:web:...`)
6. Copy the **Web API Key** value

## What the Configuration Should Look Like

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_SAAWT_API_KEY",  // <-- Need this from Firebase Console
  authDomain: "saawt-app.firebaseapp.com",
  projectId: "saawt-app",
  storageBucket: "saawt-app.appspot.com",
  messagingSenderId: "111180020195242483280",
  appId: "1:111180020195242483280:web:8c9e5f3a4b2d1e6f7a8b9c"
};
```

## Alternative Option

If you can't get the saawt-app API key, we can use Creamati project instead:

1. Frontend: Use Creamati (API Key: `AIzaSyCMs00i-agOpM0Ql8bpVKfgOybVsttbUPU`)
2. Backend: Replace saawt-app firebase-admin.json with creamati firebase-admin.json

But this would require getting the proper creamati firebase-admin.json from Firebase Console.

## Recommendation

Since the backend is already configured with saawt-app, it's better to get the correct saawt-app Web API key from Firebase Console.
