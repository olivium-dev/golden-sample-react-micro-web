# Phase 2: Setup User Management Remote Application

## Prompt Template
```
Create a React TypeScript remote application for user management using Webpack Module Federation and Firebase Authentication.

Requirements:
- Use create-react-app with TypeScript template
- Configure Webpack Module Federation as remote
- Expose UserManagementPage component via "./UserManagementPage"
- Integrate Firebase Authentication (login/register)
- Create user management interface with MUI Data Grid
- Implement form validation
- Configure to run on port 3001
- Match shared dependencies with container
- **NO BFF**: Call backend API directly at https://dev-creamat.fds-1.com/gateway/api/user

Create the following structure:
/user-management-app
  /src
    /components
      - LoginForm.tsx
      - RegisterForm.tsx
      - UserList.tsx
      - UserForm.tsx
    /pages
      - UserManagementPage.tsx
    /hooks
      - useAuth.ts
      - useUsers.ts
    /types
      - user.types.ts
    /services
      - api.ts (calls backend directly)
    - App.tsx
    - index.tsx
  - webpack.config.js
  - package.json

UserManagementPage should include:
- Firebase authentication (login/register)
- User list with MUI Data Grid
- CRUD operations for users
- Form validation with error messages
- Loading states for API calls
- Responsive design
- Accessibility features
```

## Validation Checklist

### After Running the Prompt
- [ ] User management app project created with TypeScript
- [ ] webpack.config.js configured as Module Federation remote
- [ ] App starts on port 3001 without errors
- [ ] UserManagementPage component exports properly
- [ ] remoteEntry.js accessible at http://localhost:3001/remoteEntry.js
- [ ] Firebase authentication works (login/register)
- [ ] User list displays with MUI Data Grid
- [ ] CRUD operations work with backend API

### Code Quality Checks
- [ ] TypeScript interfaces for all form data and props
- [ ] Form validation provides clear error messages
- [ ] Loading states implemented during API calls
- [ ] Forms are accessible (labels, ARIA attributes, keyboard navigation)
- [ ] Responsive design works on mobile and desktop
- [ ] No console errors or warnings

### Module Federation Specific
- [ ] webpack config exposes "./UserManagementPage" correctly
- [ ] shared dependencies match container (React, ReactDOM as singletons)
- [ ] Module Federation name is "userApp"
- [ ] filename is "remoteEntry.js"
- [ ] App can run independently on port 3001

### Testing Commands
```bash
cd user-management-app
npm start  # Should start on port 3001
# Visit http://localhost:3001 - should show user management page
# Visit http://localhost:3001/remoteEntry.js - should download file
# Test Firebase authentication
# Test user CRUD operations
```

## Expected File Contents

### webpack.config.js
```javascript
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  devServer: {
    port: 3001,
    historyApiFallback: true,
    // NO PROXY - Call https://dev-creamat.fds-1.com/gateway/ directly
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "userApp",
      filename: "remoteEntry.js",
      exposes: {
        "./UserManagementPage": "./src/pages/UserManagementPage",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
};
```

### API Service (src/services/api.ts)
```typescript
import axios from 'axios';

const API_BASE_URL = 'https://dev-creamat.fds-1.com/gateway/api/user';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userApi = {
  getUsers: () => apiClient.get('/users'),
  getUser: (id: string) => apiClient.get(`/users/${id}`),
  createUser: (data: any) => apiClient.post('/users', data),
  updateUser: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),
};
```

### UserManagementPage.tsx Structure
```typescript
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Box, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import LoginForm from "../components/LoginForm";
import UserForm from "../components/UserForm";

const UserManagementPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);

  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={() => setSelectedUser({})}
        sx={{ mb: 2 }}
      >
        Add User
      </Button>

      <DataGrid
        rows={users}
        columns={[
          { field: 'id', headerName: 'ID', width: 90 },
          { field: 'name', headerName: 'Name', width: 150 },
          { field: 'email', headerName: 'Email', width: 200 },
          { field: 'role', headerName: 'Role', width: 120 },
        ]}
        loading={loading}
        onRowClick={(params) => setSelectedUser(params.row)}
      />

      {selectedUser && (
        <UserForm
          user={selectedUser}
          onSave={(data) => {
            if (data.id) {
              updateUser(data.id, data);
            } else {
              createUser(data);
            }
            setSelectedUser(null);
          }}
          onCancel={() => setSelectedUser(null)}
        />
      )}
    </Box>
  );
};

export default UserManagementPage;
```

## Backend Integration

### API Endpoints
- **Base URL**: https://dev-creamat.fds-1.com/gateway/api/user
- **Authentication**: Firebase Auth + JWT tokens
- **Endpoints**:
  - `GET /users` - List all users
  - `GET /users/:id` - Get user by ID
  - `POST /users` - Create new user
  - `PUT /users/:id` - Update user
  - `DELETE /users/:id` - Delete user

### Firebase Configuration
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

## Common Issues & Solutions

### Issue: remoteEntry.js not accessible
**Solution**: Check webpack devServer configuration and ensure app is running.

### Issue: Module not found errors in container
**Solution**: Ensure user-management-app is running before starting container.

### Issue: React version conflicts
**Solution**: Verify shared dependencies configuration matches container exactly.

### Issue: CORS errors when calling backend
**Solution**: Backend should have proper CORS headers. Check network tab for details.

### Issue: Firebase authentication not working
**Solution**: Verify Firebase configuration and API keys in environment variables.

## Integration Test with Container

After user management app is working:
1. Start user-management-app: `cd user-management-app && npm start`
2. Start container: `cd container && npm start`
3. Navigate to http://localhost:3000/users
4. Verify user management page loads within container
5. Test Firebase authentication
6. Test all CRUD operations

## Next Steps
After validation passes, proceed to Phase 3: Setup Catalog Remote App.
