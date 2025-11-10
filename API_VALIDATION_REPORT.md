# API Validation Report - User Management and Catalog

## Phase 1: Backend API Validation

### User Management Backend Endpoints (Gateway: http://localhost:5000 or https://dev-creamat.fds-1.com)

#### Authentication Endpoints

1. **Social Login (Firebase)**
   - **Path**: `POST /api/User/social`
   - **Purpose**: Authenticate user with Firebase ID token
   - **Request Body**:
     ```json
     {
       "socialId": "firebase_user_id",
       "socialPlatform": "google.com",
       "email": "user@example.com",
       "name": "User Name",
       "picture": "picture_url",
       "emailVerified": true
     }
     ```
   - **Response**: `SocialLoginResponse` with `userId`, `authToken`, `refreshToken`
   - **Status Codes**: 200 OK, 403 Forbidden, 500 Internal Server Error
   - **Authorization**: None required

2. **Login (Email/Password)**
   - **Path**: `POST /api/User/login`
   - **Purpose**: Authenticate user with email and password
   - **Request Body**:
     ```json
     {
       "email": "user@example.com",
       "password": "password123"
     }
     ```
   - **Response**: `LoginResponse` with authentication tokens
   - **Status Codes**: 200 OK, 403 Forbidden, 500 Internal Server Error
   - **Authorization**: None required

3. **Logout**
   - **Path**: `POST /api/User/logout`
   - **Purpose**: Logout user and invalidate tokens
   - **Request Body**:
     ```json
     {
       "userId": "user_id",
       "refreshToken": "refresh_token"
     }
     ```
   - **Response**: `LogoutResponse`
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: None required

#### User CRUD Endpoints

1. **Get All Users**
   - **Path**: `GET /api/User/all?skip=0&limit=50&onActive=null`
   - **Purpose**: List all users with pagination
   - **Query Parameters**: 
     - `skip` (int): Number of users to skip
     - `limit` (int): Number of users to return
     - `onActive` (bool): Filter by active status
   - **Response**: `GetAllUsersResponse` with list of users
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: Optional (may require token)

2. **Get User Profile**
   - **Path**: `GET /api/User/profile/{userId}`
   - **Purpose**: Get specific user profile
   - **Path Parameters**:
     - `userId` (string): User ID to retrieve
   - **Response**: `UserProfileResponse`
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: Required (Bearer token)

3. **Register User**
   - **Path**: `POST /api/User/register`
   - **Purpose**: Register new user
   - **Request Body**:
     ```json
     {
       "email": "user@example.com",
       "password": "password123",
       "firstName": "First",
       "lastName": "Last"
     }
     ```
   - **Response**: `RegisterUserResponse`
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: None required

4. **Update User Profile**
   - **Path**: `PUT /api/User/profile/update`
   - **Purpose**: Update user profile information
   - **Request Body**: `UpdateUserProfileRequest`
   - **Response**: Updated user profile
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: Required (Bearer token)

5. **Delete User Profile**
   - **Path**: `DELETE /api/User/profile/delete`
   - **Purpose**: Delete user account
   - **Response**: `DeleteUserProfileResponse`
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: Required (Bearer token)

### Catalog Backend Endpoints (Gateway: http://localhost:5000 or https://dev-creamat.fds-1.com)

#### Category Operations

1. **Get All Categories**
   - **Path**: `GET /api/Catalog/Category/All/{pageSize}/{pageNumber}`
   - **Purpose**: List all categories with pagination
   - **Path Parameters**:
     - `pageSize` (int): Items per page
     - `pageNumber` (int): Page number (1-indexed)
   - **Response**: `GetAllCategoriesResponse` with list of categories
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: None required (note: has @ServiceAuth attribute)

2. **Get Category by ID**
   - **Path**: `GET /api/Catalog/Category/{guid}`
   - **Purpose**: Get specific category details
   - **Path Parameters**:
     - `guid` (string): Category GUID
   - **Response**: `CategoryResponse`
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: None required

3. **Create Category**
   - **Path**: `POST /api/Catalog/Category`
   - **Purpose**: Create new category
   - **Request Body**: `CreateCategoryRequest`
   - **Response**: `CreateCategoryResponse`
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: None required (note: has @ServiceAuth attribute)

4. **Update Category**
   - **Path**: `PUT /api/Catalog/Category`
   - **Purpose**: Update existing category
   - **Request Body**: `UpdateCategoryRequest`
   - **Response**: `UpdateCategoryResponse`
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: None required (note: has @ServiceAuth attribute)

5. **Delete Category**
   - **Path**: `DELETE /api/Catalog/Category/{guid}`
   - **Purpose**: Delete category
   - **Path Parameters**:
     - `guid` (string): Category GUID
   - **Response**: `DeleteCategoryResponse`
   - **Status Codes**: 200 OK, 500 Internal Server Error
   - **Authorization**: None required (note: has @ServiceAuth attribute)

## Phase 2: BFF Integration

### User Management BFF
- **Port**: 4001
- **Frontend Routes**: `/api/users/*` → Backend `/api/User/*`
- **Special Handling**: `/api/users/social` - Firebase token verification → backend `/api/User/social`

### Catalog BFF
- **Port**: 4006
- **Frontend Routes**: `/api/catalog/*` → Backend `/api/Catalog/*`
- **Frontend Routes**: `/api/cdn/*` → Backend `/api/CDN/*`

## Phase 3: Frontend Integration

### Container App
- **Port**: 3000
- **Proxy Configuration**:
  - `/api/users/*` → http://localhost:4001 (User Management BFF)
  - `/api/catalog/*` → http://localhost:4006 (Catalog BFF)
  - `/api/cdn/*` → http://localhost:4006 (CDN via Catalog BFF)
  - `/api/orders/*` → http://localhost:4005 (Orders BFF)

## Testing Strategy

### Backend Testing (Direct)
1. Test authentication endpoints with curl/Postman
2. Test CRUD operations with valid tokens
3. Verify CORS headers in responses
4. Test error scenarios (invalid tokens, missing data, etc.)

### BFF Testing
1. Test proxy routing from frontend paths to backend
2. Verify token transformation (Firebase → Backend JWT)
3. Test error handling and response transformation
4. Verify authentication bypass prevention

### Frontend Testing (End-to-End)
1. Test login flow with real backend
2. Test user CRUD operations
3. Test category management operations
4. Test session persistence and token refresh
5. Test error handling and user feedback

## Current Status

- [ ] Backend endpoints validated
- [ ] BFF proxy routing verified
- [ ] Frontend API integration working
- [ ] Authentication flow tested
- [ ] User CRUD operations tested
- [ ] Category operations tested

