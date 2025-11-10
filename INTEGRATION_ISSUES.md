# Integration Issues - User Management and Catalog

## Critical Issues Identified

### 1. User Management Frontend Issues

#### Issue 1.1: Incorrect API Base URL
**File**: `frontend/user-management-app/src/App.tsx`
**Current**: Uses `/api/users` but the data structure expects different format
**Problem**: The app is using a mock data structure (id, username, email, etc.) instead of the real backend response format
**Expected Response Format from Backend**:
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "First",
      "lastName": "Last",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100
}
```

**Action Required**:
1. Update the User interface to match actual backend response
2. Fix the fetchUsers endpoint to handle real response format
3. Update create/update/delete operations to use correct backend endpoints

#### Issue 1.2: Missing CRUD Operation Endpoints
**Current Endpoints in Code**:
- GET `/api/users` (returns all users)
- POST `/api/users` (create user)
- PUT `/api/users/:id` (update user)
- DELETE `/api/users/:id` (delete user)

**Actual Backend Endpoints** (from UserController.cs):
- GET `/api/User/all?skip={skip}&limit={limit}` (get all users)
- POST `/api/User/register` (create user)
- PUT `/api/User/profile/update` (update user)
- DELETE `/api/User/profile/delete` (delete user)
- GET `/api/User/profile/{userId}` (get user details)

**Action Required**:
1. Update all API calls to use correct backend paths
2. Map request/response formats correctly
3. Handle pagination parameters correctly

#### Issue 1.3: Missing Authentication Context Integration
**File**: `frontend/user-management-app/src/App.tsx`
**Current**: No integration with AuthContext
**Problem**: User Management app doesn't know about logged-in user or auth tokens
**Action Required**:
1. Import and use AuthContext from shared-ui-lib
2. Get current user from auth context
3. Pass auth token to BFF for user requests

### 2. Catalog Frontend Issues

#### Issue 2.1: API Response Format Mismatch
**File**: `frontend/catalog-app/src/services/api.ts`
**Current**: Expects `categories` array directly in response
**Problem**: Backend returns paginated response with category list nested differently
**Expected Response Format**:
```json
{
  "categories": [...],
  "totalCount": 100,
  "pageNumber": 1,
  "pageSize": 10
}
```

**Action Required**:
1. Update API client to handle correct response structure
2. Ensure pagination parameters are correct (pageSize, pageNumber)
3. Handle API errors properly

#### Issue 2.2: Category CRUD Endpoint Mismatch
**Current Endpoints in Code**:
- GET `/api/catalog/categories` (list categories)
- POST `/api/catalog/categories` (create category)
- PUT `/api/catalog/categories/:id` (update category)
- DELETE `/api/catalog/categories/:id` (delete category)

**Actual Backend Endpoints** (from CatalogController.cs):
- GET `/api/Catalog/Category/All/{pageSize}/{pageNumber}` (get all categories)
- POST `/api/Catalog/Category` (create category)
- PUT `/api/Catalog/Category` (update category)
- DELETE `/api/Catalog/Category/{guid}` (delete category)
- GET `/api/Catalog/Category/{guid}` (get specific category)

**Action Required**:
1. Update all API calls to use correct backend paths
2. Fix pagination parameter format
3. Use GUID instead of numeric ID

#### Issue 2.3: ServiceAuth Attribute on Catalog Endpoints
**File**: `cremat/Controllers/CatalogController.cs`
**Current**: Controller has `[ServiceAuth]` attribute
**Problem**: May require special service authentication headers
**Action Required**:
1. Check what ServiceAuth expects
2. Update BFF to include required headers if needed
3. Or update backend to remove ServiceAuth for now

### 3. BFF Integration Issues

#### Issue 3.1: User Management BFF Token Handling
**File**: `frontend/user-management-app/server/server.js`
**Current**: Handles Firebase token verification for `/api/users/social`
**Problem**: Other endpoints may not have proper auth token forwarding
**Action Required**:
1. Ensure auth tokens are correctly forwarded to backend
2. Handle token refresh properly
3. Test with real backend responses

#### Issue 3.2: Catalog BFF Proxy Configuration
**File**: `frontend/catalog-app/server/config.js`
**Current**: Points to deployed backend
**Problem**: May have issues with ServiceAuth attribute
**Action Required**:
1. Verify backend URL is correct
2. Test proxy routing for all endpoints
3. Handle error responses properly

#### Issue 3.3: Container App Proxy Configuration
**File**: `frontend/container/webpack.config.js`
**Current**: Routes `/api/users` → 4001, `/api/catalog` → 4006
**Problem**: BFF servers may not be running or configured correctly
**Action Required**:
1. Ensure all BFF servers are running
2. Verify proxy routes are correct
3. Test with browser DevTools network tab

### 4. Response Data Structure Issues

#### User Management Response Format
**Backend Returns**: (from UserManagementClient)
```json
{
  "userId": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "isActive": boolean,
  "createdAt": "datetime"
}
```

**Frontend Expects** (current mock):
```json
{
  "id": "number",
  "email": "string",
  "username": "string",
  "full_name": "string",
  "role": "string",
  "is_active": "boolean"
}
```

**Action Required**: Update frontend interface to match backend

#### Catalog Response Format
**Backend Returns**: (from CatalogServiceClient)
```json
{
  "guid": "string",
  "name": "string",
  "description": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Frontend Expects**: (needs verification)
```json
{
  "guid": "string",
  "name": "string",
  "image_url": "string",
  "details": []
}
```

**Action Required**: Update frontend interface to match backend

## Testing Checklist

- [ ] Backend API endpoints are accessible and return correct status codes
- [ ] BFF servers properly route requests to backend
- [ ] User Management frontend fetches real users from backend
- [ ] User Management CRUD operations work with real backend
- [ ] Catalog frontend fetches real categories from backend
- [ ] Catalog CRUD operations work with real backend
- [ ] Authentication tokens are properly handled throughout
- [ ] Error handling works correctly
- [ ] Loading states display correctly
- [ ] CORS is properly configured
- [ ] Session persistence works across page reloads
- [ ] Token refresh mechanism works properly

## Implementation Priority

1. **Phase 1**: Fix User Management API integration
   - Update API endpoints to match backend
   - Fix data structure mapping
   - Test with backend responses
   
2. **Phase 2**: Fix Catalog API integration
   - Update API endpoints to match backend
   - Fix pagination handling
   - Test with backend responses

3. **Phase 3**: End-to-end testing
   - Test complete user workflows
   - Test error scenarios
   - Validate CORS and auth

4. **Phase 4**: Production validation
   - Performance testing
   - Security testing
   - Error recovery

