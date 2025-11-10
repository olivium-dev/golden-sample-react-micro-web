# API Testing Guide - Gateway Architecture

## Understanding the Nginx Routing

Based on `server-cremati/nginx-config/main/nginx.conf`, here's how APIs should be tested:

### **Gateway Route (PRIMARY - All APIs Must Use This)**

**Location**: Lines 52-73
```nginx
location /gateway/ {
    rewrite ^/gateway/(.*)$ /$1 break;
    proxy_pass http://localhost:10000;  # Gateway service
}
```

**How it works**:
- Request: `https://dev-creamat.fds-1.com/gateway/api/User/all`
- Nginx strips `/gateway/` → becomes `/api/User/all`
- Proxies to: `http://localhost:10000/api/User/all` (Gateway service)
- Gateway (ASP.NET Core) then routes internally to microservices

### **Direct Routes (BYPASS Gateway - NOT RECOMMENDED)**

These routes bypass the gateway and go directly to microservices:
- `/api/` → `localhost:10100` (Catalog service directly)
- `/api/order/` → `localhost:10111` (Order service directly)  
- `/catalog/` → `localhost:10100` (Catalog service directly)
- `/order/` → `localhost:10111` (Order service directly)
- `/user-management/` → `localhost:10001` (User Management service directly)

**⚠️ These should NOT be used - all APIs must go through gateway**

---

## Correct API Testing with Curl

### **1. User Management APIs (Through Gateway)**

```bash
# Social Login
curl --insecure -X POST "https://dev-creamat.fds-1.com/gateway/api/User/social" \
  -H "Content-Type: application/json" \
  -d '{
    "socialId": "dqMYwi3hooROnUDOeCWqDrfyxQ93",
    "socialToken": "YOUR_FIREBASE_TOKEN",
    "socialPlatform": "google.com"
  }'

# Get All Users
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/api/User/all?skip=0&limit=10"

# Get User Profile
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/api/User/profile/{userId}" \
  -H "Authorization: Bearer {JWT_TOKEN}"

# Register User
curl --insecure -X POST "https://dev-creamat.fds-1.com/gateway/api/User/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "First",
    "lastName": "Last"
  }'
```

### **2. Catalog APIs (Through Gateway)**

```bash
# Get All Categories
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/api/Catalog/Category/All/10/1"

# Get Category by GUID
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/api/Catalog/Category/{guid}"

# Create Category
curl --insecure -X POST "https://dev-creamat.fds-1.com/gateway/api/Catalog/Category" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Category",
    "description": "Description"
  }'
```

### **3. Orders APIs (Through Gateway)**

```bash
# Get Orders (check what endpoint gateway expects)
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/api/Order/..."

# Note: Need to check gateway routing for correct Orders endpoint structure
```

---

## Testing Sequence

### **Step 1: Test Gateway Health**
```bash
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/health"
# or
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/api/User/check"
```

### **Step 2: Test Authentication**
```bash
# Use your Firebase token
curl --insecure -X POST "https://dev-creamat.fds-1.com/gateway/api/User/social" \
  -H "Content-Type: application/json" \
  -d '{
    "socialId": "dqMYwi3hooROnUDOeCWqDrfyxQ93",
    "socialToken": "eyJhbGciOiJSUzI1NiIs...",
    "socialPlatform": "google.com"
  }'
```

### **Step 3: Test User Management**
```bash
# Get users (after authentication)
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/api/User/all?skip=0&limit=10"
```

### **Step 4: Test Catalog**
```bash
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/api/Catalog/Category/All/10/1"
```

### **Step 5: Test Orders**
```bash
# Need to identify correct endpoint structure from gateway
curl --insecure -X GET "https://dev-creamat.fds-1.com/gateway/api/Order/..."
```

---

## Key Points

1. **All APIs must use `/gateway/` prefix** - This routes through the ASP.NET Core gateway
2. **Gateway strips `/gateway/`** - So `/gateway/api/User/all` becomes `/api/User/all` to gateway
3. **Gateway routes internally** - Gateway (port 10000) then routes to correct microservice
4. **Direct routes bypass gateway** - `/api/`, `/catalog/`, `/order/` go directly to services (NOT recommended)
5. **BFF servers should proxy to gateway** - Not directly to microservices

---

## BFF Configuration Issue

**Current Problem**: BFF servers are trying to connect directly to backend microservices, but they should:
1. Connect to gateway at `https://dev-creamat.fds-1.com/gateway/`
2. Use the `/gateway/` prefix for all API calls
3. Gateway handles routing to microservices internally

**Fix Required**: Update BFF server configurations to point to gateway instead of direct microservice URLs.

---

## Example: Correct BFF Proxy Configuration

**User Management BFF should proxy to**:
```
https://dev-creamat.fds-1.com/gateway/api/User/...
```

**NOT**:
```
https://dev-creamat.fds-1.com/api/User/...  (bypasses gateway)
http://localhost:10001/...  (direct to microservice)
```

