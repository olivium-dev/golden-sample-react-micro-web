# ⚠️ FIREBASE ADMIN SDK SERVICE ACCOUNT KEY REQUIRED

## Current Status
- ✅ Firebase Client SDK configured correctly (Creamati project)
- ✅ Google Sign-In works on frontend
- ✅ Firebase ID token obtained successfully
- ❌ **Backend verification blocked**: Missing Firebase Admin SDK service account key

## What's Needed

### Firebase Admin SDK Service Account Key
The BFF server needs the service account key to verify Firebase ID tokens. This is **NOT** the same as the `cremat-firebase.json` file you have (which is for mobile apps).

## How to Get the Service Account Key

1. **Go to Firebase Console**
   - URL: https://console.firebase.google.com/
   - Select the **Creamati** project

2. **Navigate to Service Accounts**
   - Click the gear icon (⚙️) → **Project Settings**
   - Click on **Service accounts** tab

3. **Generate Private Key**
   - Click **Generate new private key** button
   - Confirm the security warning
   - A JSON file will download

4. **Save the File**
   - Save it as: `/creamati-cms/secrets/creamati-firebase-admin.json`
   - This file contains sensitive credentials - do NOT commit to git

## What the File Should Look Like

```json
{
  "type": "service_account",
  "project_id": "creamati",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@creamati.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Current Error Response
The BFF server is correctly returning a 503 Service Unavailable error:
```json
{
  "error": "Service Unavailable",
  "message": "Firebase Admin SDK not configured. Service account key required.",
  "details": "Please provide the Firebase Admin SDK service account key for Creamati project"
}
```

## No Workarounds
Per the mandatory development rules:
- ❌ NO mock implementations
- ❌ NO fake data
- ❌ NO workaround solutions
- ✅ ONLY real implementations with actual backend services

## Next Steps
1. Get the service account key from Firebase Console
2. Save it to the correct location
3. The BFF server will automatically use it once available
4. Authentication will then work end-to-end

## Alternative: Use gcloud CLI
If you have Google Cloud SDK installed and are authenticated:
```bash
gcloud iam service-accounts keys create creamati-firebase-admin.json \
  --iam-account=firebase-adminsdk-xxxxx@creamati.iam.gserviceaccount.com
```
(Replace xxxxx with the actual service account ID from Firebase Console)
