# Implementation Guide - Frontend API Integration Fix

This guide provides step-by-step instructions to fix the User Management and Catalog frontend API integration with the real backend.

## Part 1: User Management Frontend Fix

### Step 1.1: Update API Types and Interfaces
**File**: `frontend/user-management-app/src/App.tsx`

**Current Interface** (Mock):
```typescript
interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**New Interface** (Real Backend):
```typescript
interface User {
  id?: string; // Some endpoints use 'id', some use 'userId'
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  picture?: string;
  emailVerified?: boolean;
}
```

### Step 1.2: Update fetchUsers Function
**Current**:
```typescript
const fetchUsers = async () => {
  setLoading(true);
  try {
    const response = await axios.get(`${API_BASE_URL}/all`);
    setUsers(response.data.users || response.data);
```

**Should Be**:
```typescript
const fetchUsers = async () => {
  setLoading(true);
  try {
    // BFF proxies /api/users -> backend /api/User
    const response = await axios.get(`${API_BASE_URL}/all?skip=0&limit=50`);
    // Backend returns array directly or wrapped in object
    const userList = Array.isArray(response.data) ? response.data : response.data.users || [];
    setUsers(userList);
```

### Step 1.3: Update Create User Function
**Current Endpoint**: `POST /api/users`
**New Endpoint**: `POST /api/User/register` (via BFF proxy)

**Fix**:
```typescript
const createUser = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      email: formData.email,
      password: generateSecurePassword(), // Need password field
      firstName: formData.full_name.split(' ')[0],
      lastName: formData.full_name.split(' ')[1] || '',
    });
    // Handle response which should include userId
    refreshUsers();
```

### Step 1.4: Update Update User Function
**Current Endpoint**: `PUT /api/users/{id}`
**New Endpoint**: `PUT /api/User/profile/update` (via BFF proxy)

**Fix**:
```typescript
const updateUser = async () => {
  try {
    const response = await axios.put(`${API_BASE_URL}/profile/update`, {
      userId: editingUser?.userId || editingUser?.id,
      firstName: formData.first_name,
      lastName: formData.last_name,
      email: formData.email,
    });
    refreshUsers();
```

### Step 1.5: Update Delete User Function
**Current Endpoint**: `DELETE /api/users/{id}`
**New Endpoint**: `DELETE /api/User/profile/delete` (requires auth token for current user)

**Fix**:
```typescript
const deleteUser = async (userId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/profile/delete`, {
      data: { userId }
    });
    refreshUsers();
```

### Step 1.6: Add Error Handling for Authentication
```typescript
import { useContext } from 'react';
import { AuthContext } from '../../shared-ui-lib/src/auth/AuthContext';

// Inside App function:
const authContext = useContext(AuthContext);

// Check if user is authenticated
useEffect(() => {
  if (!authContext?.isAuthenticated) {
    // Show error or redirect to login
    showSnackbar('User not authenticated', 'error');
  }
}, [authContext?.isAuthenticated]);
```

## Part 2: Catalog Frontend Fix

### Step 2.1: Update Category API Client
**File**: `frontend/catalog-app/src/services/api.ts`

**Current**:
```typescript
export const categoryApi = {
  getCategories: async (pageSize: number, pageNumber: number) => {
    const response = await apiClient.get(`/categories?skip=${pageSize}&limit=${pageNumber}`);
    return response.data;
  },
```

**Should Be**:
```typescript
export const categoryApi = {
  getCategories: async (pageSize: number = 10, pageNumber: number = 1) => {
    // BFF proxies /api/catalog -> backend /api/Catalog
    // Backend endpoint: GET /api/Catalog/Category/All/{pageSize}/{pageNumber}
    try {
      const response = await apiClient.get(`/Category/All/${pageSize}/${pageNumber}`);
      return {
        categories: response.data.categories || response.data,
        totalCount: response.data.totalCount || 0,
        pageSize: pageSize,
        pageNumber: pageNumber,
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
```

### Step 2.2: Update Category Interfaces
**File**: `frontend/catalog-app/src/types/category.ts`

**Update to match backend response**:
```typescript
export interface CategoryResponse {
  guid: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetAllCategoriesResponse {
  categories: CategoryResponse[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface CreateCategoryResponse {
  guid: string;
  name: string;
}

export interface UpdateCategoryRequest {
  guid: string;
  name: string;
  description?: string;
}
```

### Step 2.3: Update Category CRUD Operations
**Create Category**:
```typescript
export const createCategory = async (data: CreateCategoryRequest) => {
  const response = await apiClient.post('/Category', {
    name: data.name,
    description: data.description,
  });
  return response.data;
};
```

**Update Category**:
```typescript
export const updateCategory = async (guid: string, data: UpdateCategoryRequest) => {
  const response = await apiClient.put('/Category', {
    guid: guid,
    name: data.name,
    description: data.description,
  });
  return response.data;
};
```

**Delete Category**:
```typescript
export const deleteCategory = async (guid: string) => {
  const response = await apiClient.delete(`/Category/${guid}`);
  return response.data;
};
```

**Get Single Category**:
```typescript
export const getCategory = async (guid: string) => {
  const response = await apiClient.get(`/Category/${guid}`);
  return response.data;
};
```

### Step 2.4: Update CategoryList Component
**File**: `frontend/catalog-app/src/components/CategoryList.tsx`

Ensure it handles:
1. Correct pagination parameters (pageSize, pageNumber starting from 1)
2. Correct GUID usage instead of numeric IDs
3. Proper error handling for backend responses
4. Loading states and user feedback

### Step 2.5: Update CategoryDialog Component
**File**: `frontend/catalog-app/src/components/CategoryDialog.tsx`

Ensure it:
1. Sends GUID instead of numeric ID for updates
2. Uses correct request format for create/update operations
3. Handles responses properly

## Part 3: Testing the Integration

### Test 1: Backend Connectivity
```bash
# Test User Management Backend
curl -s https://dev-creamat.fds-1.com/api/User/all?skip=0&limit=10

# Test Catalog Backend
curl -s https://dev-creamat.fds-1.com/api/Catalog/Category/All/10/1
```

### Test 2: BFF Proxy
```bash
# Test through User Management BFF
curl -s http://localhost:4001/api/users/all?skip=0&limit=10

# Test through Catalog BFF
curl -s http://localhost:4006/api/catalog/Category/All/10/1
```

### Test 3: Frontend Workflow
1. Start all services (container, BFF servers, backend)
2. Open browser DevTools → Network tab
3. Login with Firebase
4. Navigate to User Management
5. Verify GET /api/users/all request succeeds
6. Try creating/editing/deleting a user
7. Navigate to Catalog
8. Verify GET /api/catalog/Category/All/10/1 request succeeds
9. Try creating/editing/deleting a category

## Part 4: Common Issues and Solutions

### Issue: 404 Not Found on /api/users/all
**Cause**: BFF not running or route not configured
**Solution**: 
1. Check if User Management BFF is running: `curl http://localhost:4001/health`
2. Check container webpack proxy configuration
3. Verify port 4001 is accessible

### Issue: 500 Internal Server Error from Backend
**Cause**: Invalid request format or authentication failure
**Solution**:
1. Check request body format matches backend expectations
2. Verify authentication tokens are correct
3. Check backend logs for detailed error message

### Issue: Empty User/Category List
**Cause**: Response format mismatch or filtering issue
**Solution**:
1. Check actual response format from backend
2. Update interface to match backend response
3. Add console.log to debug response data

### Issue: CORS Errors
**Cause**: Backend CORS not properly configured or BFF not handling it
**Solution**:
1. Verify backend has CORS headers in response
2. Check BFF proxy isn't stripping CORS headers
3. Verify frontend request includes credentials if needed

## Implementation Checklist

- [ ] User Management API types updated
- [ ] User Management fetchUsers function fixed
- [ ] User Management create user function fixed
- [ ] User Management update user function fixed
- [ ] User Management delete user function fixed
- [ ] User Management authentication integration added
- [ ] Catalog API client updated
- [ ] Category interfaces updated to match backend
- [ ] Create category function updated
- [ ] Update category function updated
- [ ] Delete category function updated
- [ ] Get category function updated
- [ ] CategoryList component tested with real data
- [ ] CategoryDialog component tested with real backend
- [ ] Backend connectivity tested
- [ ] BFF proxy tested
- [ ] Frontend workflow end-to-end tested
- [ ] Error scenarios tested
- [ ] All console errors resolved
- [ ] All network errors resolved

