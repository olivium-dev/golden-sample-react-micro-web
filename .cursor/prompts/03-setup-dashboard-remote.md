# Phase 3: Setup Dashboard Remote Application

## Prompt Template
```
Create a React TypeScript remote application for dashboard using Webpack Module Federation.

Requirements:
- Use create-react-app with TypeScript template
- Configure Webpack Module Federation as remote
- Expose DashboardPage component via "./DashboardPage"
- Create dashboard with widgets/cards
- Include sample data visualization
- Configure to run on port 3002
- Match shared dependencies with container

Create the following structure:
/dashboard-app
  /src
    /components
      - DashboardCard.tsx
      - MetricWidget.tsx
      - ChartWidget.tsx
      - StatsGrid.tsx
    /pages
      - DashboardPage.tsx
    /hooks
      - useDashboardData.ts
    /types
      - dashboard.types.ts
    /utils
      - chartHelpers.ts
    - App.tsx
    - index.tsx
  - webpack.config.js
  - package.json

DashboardPage should include:
- Grid layout with responsive cards
- Sample metrics (users, revenue, growth, etc.)
- Simple chart/graph visualization
- Loading states for data fetching
- Responsive design for mobile/desktop
- Accessibility features
```

## Validation Checklist

### After Running the Prompt
- [ ] Dashboard app project created with TypeScript
- [ ] webpack.config.js configured as Module Federation remote
- [ ] App starts on port 3002 without errors
- [ ] DashboardPage component exports properly
- [ ] remoteEntry.js accessible at http://localhost:3002/remoteEntry.js
- [ ] Dashboard cards render in responsive grid
- [ ] Sample data displays correctly
- [ ] Charts/visualizations render properly

### Code Quality Checks
- [ ] TypeScript interfaces for all data types and props
- [ ] Responsive grid layout works on different screen sizes
- [ ] Loading states implemented for data fetching
- [ ] Components are accessible (ARIA labels, semantic HTML)
- [ ] Charts have proper labels and descriptions
- [ ] No console errors or warnings

### Module Federation Specific
- [ ] webpack config exposes "./DashboardPage" correctly
- [ ] shared dependencies match container (React, ReactDOM as singletons)
- [ ] Module Federation name is "dashboard"
- [ ] filename is "remoteEntry.js"
- [ ] App can run independently on port 3002

### Testing Commands
```bash
cd dashboard-app
npm start  # Should start on port 3002
# Visit http://localhost:3002 - should show dashboard
# Visit http://localhost:3002/remoteEntry.js - should download file
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
    port: 3002,
    historyApiFallback: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "dashboard",
      filename: "remoteEntry.js",
      exposes: {
        "./DashboardPage": "./src/pages/DashboardPage",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
};
```

### DashboardPage.tsx Structure
```typescript
import React, { useEffect, useState } from "react";
import StatsGrid from "../components/StatsGrid";
import ChartWidget from "../components/ChartWidget";
import MetricWidget from "../components/MetricWidget";
import { DashboardData } from "../types/dashboard.types";
import { useDashboardData } from "../hooks/useDashboardData";

const DashboardPage: React.FC = () => {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Error loading dashboard data</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of your key metrics</p>
      </header>
      
      <div className="dashboard-content">
        <StatsGrid stats={data?.stats} />
        
        <div className="dashboard-widgets">
          <MetricWidget 
            title="Revenue Trend"
            data={data?.revenue}
            type="currency"
          />
          <ChartWidget 
            title="User Growth"
            data={data?.userGrowth}
            chartType="line"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
```

### Required Widget Types
1. **StatsGrid**: 2x2 or 3x2 grid of key metrics
2. **MetricWidget**: Single metric with trend indicator
3. **ChartWidget**: Simple line/bar chart visualization
4. **DashboardCard**: Reusable card container

### Sample Data Structure
```typescript
interface DashboardData {
  stats: {
    totalUsers: number;
    revenue: number;
    growth: number;
    orders: number;
  };
  revenue: Array<{ date: string; amount: number }>;
  userGrowth: Array<{ month: string; users: number }>;
}
```

## Common Issues & Solutions

### Issue: Chart library not rendering
**Solution**: Use simple CSS-based charts or lightweight libraries like Chart.js

### Issue: Responsive layout breaking
**Solution**: Use CSS Grid with proper media queries and flexible units

### Issue: Data loading states not working
**Solution**: Implement proper loading/error states with useEffect and useState

### Issue: TypeScript errors with chart data
**Solution**: Define proper interfaces for all data structures

## Integration Test with Container

After dashboard app is working:
1. Start dashboard app: `cd dashboard-app && npm start`
2. Start container: `cd container && npm start`
3. Navigate to http://localhost:3000/dashboard
4. Verify dashboard loads within container
5. Test responsive behavior
6. Check all widgets display correctly

## Performance Considerations
- [ ] Implement React.memo for expensive chart components
- [ ] Use proper loading states to prevent layout shifts
- [ ] Optimize chart rendering for large datasets
- [ ] Consider virtualization for large data lists

## Next Steps
After validation passes, proceed to Phase 4: Setup Profile Remote App.
