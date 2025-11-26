# Phase 4: Setup Orders Remote Application

## Prompt Template
```
Create a React TypeScript remote application for order management using Webpack Module Federation and MUI Data Grid.

Requirements:
- Use create-react-app with TypeScript template
- Configure Webpack Module Federation as remote
- Expose OrdersPage component via "./OrdersPage"
- Create order management interface with MUI Data Grid
- Include order details, status tracking, and filtering
- Configure to run on port 3005
- Match shared dependencies with container
- **NO BFF**: Call backend API directly at https://dev-creamat.fds-1.com/gateway/api/Order

Create the following structure:
/orders-app
  /src
    /components
      - OrderList.tsx
      - OrderDetails.tsx
      - OrderForm.tsx
      - OrderFilters.tsx
    /pages
      - OrdersPage.tsx
    /hooks
      - useOrders.ts
      - useOrderDetails.ts
    /types
      - order.types.ts
    /services
      - api.ts (calls backend directly)
    - App.tsx
    - index.tsx
  - webpack.config.js
  - package.json

OrdersPage should include:
- Order list with MUI Data Grid
- Order details view
- Status tracking and updates
- Filtering and search functionality
- Form validation and error handling
- Loading states for API calls
- Responsive design
- Accessibility features
```

## Validation Checklist

### After Running the Prompt
- [ ] Orders app project created with TypeScript
- [ ] webpack.config.js configured as Module Federation remote
- [ ] App starts on port 3005 without errors
- [ ] OrdersPage component exports properly
- [ ] remoteEntry.js accessible at http://localhost:3005/remoteEntry.js
- [ ] Order list displays with MUI Data Grid
- [ ] Order details view works
- [ ] CRUD operations work with backend API

### Code Quality Checks
- [ ] TypeScript interfaces for all order data and props
- [ ] Form validation provides clear error messages
- [ ] Loading states implemented for API calls
- [ ] Components are accessible (labels, ARIA attributes, keyboard navigation)
- [ ] Responsive design works on mobile and desktop
- [ ] No console errors or warnings

### Module Federation Specific
- [ ] webpack config exposes "./OrdersPage" correctly
- [ ] shared dependencies match container (React, ReactDOM, MUI as singletons)
- [ ] Module Federation name is "ordersApp"
- [ ] filename is "remoteEntry.js"
- [ ] App can run independently on port 3005

### Testing Commands
```bash
cd orders-app
npm start  # Should start on port 3005
# Visit http://localhost:3005 - should show orders page
# Visit http://localhost:3005/remoteEntry.js - should download file
# Test order list and filtering
# Test order CRUD operations
```

## Expected File Contents

### webpack.config.js
```javascript
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  devServer: {
    port: 3005,
    historyApiFallback: true,
    // NO PROXY - Call https://dev-creamat.fds-1.com/gateway/ directly
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "ordersApp",
      filename: "remoteEntry.js",
      exposes: {
        "./OrdersPage": "./src/pages/OrdersPage",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "@mui/material": { singleton: true },
        "@mui/x-data-grid": { singleton: true },
      },
    }),
  ],
};
```

### API Service (src/services/api.ts)
```typescript
import axios from 'axios';

const API_BASE_URL = 'https://dev-creamat.fds-1.com/gateway/api/Order';

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

export const ordersApi = {
  getOrders: (userId: string) => apiClient.get(`/User/${userId}`),
  getOrderById: (id: string) => apiClient.get(`/${id}`),
  createOrder: (data: any) => apiClient.post('/', data),
  updateOrder: (id: string, data: any) => apiClient.put(`/${id}`, data),
  deleteOrder: (id: string) => apiClient.delete(`/${id}`),
  updateStatus: (id: string, status: string) => apiClient.patch(`/${id}/status`, { status }),
};
```

### OrdersPage.tsx Structure
```typescript
import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useOrders } from "../hooks/useOrders";
import OrderDetails from "../components/OrderDetails";
import OrderForm from "../components/OrderForm";
import OrderFilters from "../components/OrderFilters";

const OrdersPage: React.FC = () => {
  const { orders, loading, createOrder, updateOrder, deleteOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Order ID', width: 120 },
    { field: 'customerName', headerName: 'Customer', width: 180 },
    { field: 'total', headerName: 'Total', width: 120, type: 'number' },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'createdAt', headerName: 'Date', width: 180, type: 'dateTime' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Order Management
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => setShowForm(true)}
        >
          Create Order
        </Button>
        <OrderFilters />
      </Box>

      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        onRowClick={(params) => setSelectedOrder(params.row)}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
      />

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={updateOrder}
          onDelete={deleteOrder}
        />
      )}

      {showForm && (
        <OrderForm
          onSave={(data) => {
            createOrder(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </Box>
  );
};

export default OrdersPage;
```

## Backend Integration

### API Endpoints
- **Base URL**: https://dev-creamat.fds-1.com/gateway/api/Order
- **Authentication**: JWT tokens from Firebase
- **Endpoints**:
  - `GET /User/:userId` - Get orders for user
  - `GET /:id` - Get order by ID
  - `POST /` - Create new order
  - `PUT /:id` - Update order
  - `DELETE /:id` - Delete order
  - `PATCH /:id/status` - Update order status

## Common Issues & Solutions

### Issue: MUI Data Grid not rendering
**Solution**: Ensure @mui/x-data-grid is installed and properly shared

### Issue: Date formatting issues
**Solution**: Use proper date formatting libraries or MUI date utilities

### Issue: CORS errors when calling backend
**Solution**: Backend should have proper CORS headers configured

### Issue: Order status updates not reflecting
**Solution**: Implement proper state management and refetch after updates

## Integration Test with Container

After orders app is working:
1. Start orders-app: `cd orders-app && npm start`
2. Start container: `cd container && npm start`
3. Navigate to http://localhost:3000/orders
4. Verify orders page loads within container
5. Test order list and filtering
6. Test all CRUD operations
7. Verify responsive behavior

## Next Steps
After validation passes, proceed to Phase 5: Setup Catalog Remote App.
