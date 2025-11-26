# Phase 3: Setup Analytics Dashboard Remote Application

## Prompt Template
```
Create a React TypeScript remote application for analytics dashboard using Webpack Module Federation and MUI Charts.

Requirements:
- Use create-react-app with TypeScript template
- Configure Webpack Module Federation as remote
- Expose AnalyticsPage component via "./AnalyticsPage"
- Create dashboard with MUI Charts and widgets
- Include real-time data visualization
- Configure to run on port 3003
- Match shared dependencies with container
- **NO BFF**: Call backend API directly at https://dev-creamat.fds-1.com/gateway/api/analytics

Create the following structure:
/analytics-app
  /src
    /components
      - DashboardCard.tsx
      - MetricWidget.tsx
      - ChartWidget.tsx
      - StatsGrid.tsx
    /pages
      - AnalyticsPage.tsx
    /hooks
      - useAnalyticsData.ts
    /types
      - analytics.types.ts
    /services
      - api.ts (calls backend directly)
    - App.tsx
    - index.tsx
  - webpack.config.js
  - package.json

AnalyticsPage should include:
- Grid layout with responsive MUI cards
- Real-time metrics (users, revenue, growth, etc.)
- MUI Charts for data visualization
- Loading states for data fetching
- Responsive design for mobile/desktop
- Accessibility features
```

## Validation Checklist

### After Running the Prompt
- [ ] Analytics app project created with TypeScript
- [ ] webpack.config.js configured as Module Federation remote
- [ ] App starts on port 3003 without errors
- [ ] AnalyticsPage component exports properly
- [ ] remoteEntry.js accessible at http://localhost:3003/remoteEntry.js
- [ ] Dashboard cards render in responsive grid
- [ ] Real-time data displays correctly
- [ ] MUI Charts render properly

### Code Quality Checks
- [ ] TypeScript interfaces for all data types and props
- [ ] Responsive grid layout works on different screen sizes
- [ ] Loading states implemented for data fetching
- [ ] Components are accessible (ARIA labels, semantic HTML)
- [ ] Charts have proper labels and descriptions
- [ ] No console errors or warnings

### Module Federation Specific
- [ ] webpack config exposes "./AnalyticsPage" correctly
- [ ] shared dependencies match container (React, ReactDOM, MUI as singletons)
- [ ] Module Federation name is "analyticsApp"
- [ ] filename is "remoteEntry.js"
- [ ] App can run independently on port 3003

### Testing Commands
```bash
cd analytics-app
npm start  # Should start on port 3003
# Visit http://localhost:3003 - should show analytics dashboard
# Visit http://localhost:3003/remoteEntry.js - should download file
# Test responsive layout on different screen sizes
# Verify all widgets display data correctly
```

## Expected File Contents

### webpack.config.js
```javascript
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  devServer: {
    port: 3003,
    historyApiFallback: true,
    // NO PROXY - Call https://dev-creamat.fds-1.com/gateway/ directly
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "analyticsApp",
      filename: "remoteEntry.js",
      exposes: {
        "./AnalyticsPage": "./src/pages/AnalyticsPage",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "@mui/material": { singleton: true },
        "@mui/x-charts": { singleton: true },
      },
    }),
  ],
};
```

### API Service (src/services/api.ts)
```typescript
import axios from 'axios';

const API_BASE_URL = 'https://dev-creamat.fds-1.com/gateway/api/analytics';

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

export const analyticsApi = {
  getMetrics: () => apiClient.get('/metrics'),
  getRevenue: (period: string) => apiClient.get(`/revenue?period=${period}`),
  getUserGrowth: () => apiClient.get('/user-growth'),
  getOrderStats: () => apiClient.get('/order-stats'),
};
```

### AnalyticsPage.tsx Structure
```typescript
import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
import { LineChart, BarChart, PieChart } from "@mui/x-charts";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import StatsGrid from "../components/StatsGrid";
import ChartWidget from "../components/ChartWidget";
import MetricWidget from "../components/MetricWidget";

const AnalyticsPage: React.FC = () => {
  const { data, loading, error } = useAnalyticsData();

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading analytics...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 3 }}>Error loading analytics data</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Overview of your key metrics and performance
      </Typography>
      
      <StatsGrid stats={data?.stats} />
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <ChartWidget 
            title="Revenue Trend"
            data={data?.revenue}
            chartType="line"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWidget 
            title="User Growth"
            data={data?.userGrowth}
            chartType="bar"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
```

## Backend Integration

### API Endpoints
- **Base URL**: https://dev-creamat.fds-1.com/gateway/api/analytics
- **Authentication**: JWT tokens from Firebase
- **Endpoints**:
  - `GET /metrics` - Get current metrics
  - `GET /revenue?period=30d` - Get revenue data
  - `GET /user-growth` - Get user growth data
  - `GET /order-stats` - Get order statistics

## Common Issues & Solutions

### Issue: MUI Charts not rendering
**Solution**: Ensure @mui/x-charts is installed and properly shared in webpack config

### Issue: Responsive layout breaking
**Solution**: Use MUI Grid with proper breakpoints (xs, sm, md, lg, xl)

### Issue: Data loading states not working
**Solution**: Implement proper loading/error states with useEffect and useState

### Issue: CORS errors when calling backend
**Solution**: Backend should have proper CORS headers configured

## Integration Test with Container

After analytics app is working:
1. Start analytics-app: `cd analytics-app && npm start`
2. Start container: `cd container && npm start`
3. Navigate to http://localhost:3000/analytics
4. Verify analytics dashboard loads within container
5. Test responsive behavior
6. Check all widgets and charts display correctly

## Performance Considerations
- [ ] Implement React.memo for expensive chart components
- [ ] Use proper loading states to prevent layout shifts
- [ ] Optimize chart rendering for large datasets
- [ ] Consider data caching for frequently accessed metrics

## Next Steps
After validation passes, proceed to Phase 4: Setup Orders Remote App.
