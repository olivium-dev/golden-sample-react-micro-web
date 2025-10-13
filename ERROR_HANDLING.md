# Error Handling System Documentation

## Overview

This micro-frontend platform includes a comprehensive error handling system that captures, logs, displays, and monitors errors across all applications in real-time. The system is designed to help developers quickly identify and resolve issues in both development and production environments.

## Architecture

### Components

1. **Shared Error Infrastructure** (`frontend/shared-ui-lib/src/errors/`)
   - `ErrorLogger` - Centralized error logging service
   - `ErrorCapture` - Global error capture mechanisms
   - `ErrorBoundary` - React error boundary component
   - `ErrorPanel` - Collapsible error display panel
   - `ErrorToast` - Toast notifications for new errors
   - `useErrorMonitor` - React hook for error monitoring

2. **Backend Error API** (`backend/mock-data-service/routers/errors.py`)
   - RESTful API for error logging and retrieval
   - Persistent storage in JSON format
   - Error statistics and filtering

3. **Error Monitoring Dashboard** (`frontend/container/src/pages/ErrorMonitor.tsx`)
   - Real-time error visualization
   - Charts and statistics
   - Error filtering and management

4. **Automated Testing** (`test_errors.py`, `test_all_errors.sh`)
   - Browser automation for error detection
   - Comprehensive testing across all micro-frontends
   - HTML and JSON reporting

## Error Types

The system categorizes errors into five types:

- **`react`** - React component errors, lifecycle issues
- **`api`** - API request/response errors
- **`network`** - Network connectivity issues
- **`moduleFederation`** - Module Federation loading errors
- **`unknown`** - Uncategorized errors

## Error Severity Levels

- **`critical`** - System-breaking errors (Module Federation failures)
- **`high`** - Component-breaking errors (React errors)
- **`medium`** - Feature-impacting errors (API errors)
- **`low`** - Minor issues (warnings, non-critical failures)

## Getting Started

### 1. Basic Error Logging

```typescript
import { ErrorLogger, ErrorCapture } from 'shared-ui-lib';

// Manual error logging
ErrorLogger.logError('Something went wrong', 'api', error);

// API error capture
try {
  const response = await fetch('/api/data');
} catch (error) {
  ErrorCapture.captureApiError(error, '/api/data', 'GET');
}

// React error capture (automatic with ErrorBoundary)
<ErrorBoundary componentName="MyComponent">
  <MyComponent />
</ErrorBoundary>
```

### 2. Error Monitoring Hook

```typescript
import { useErrorMonitor } from 'shared-ui-lib';

function MyComponent() {
  const { errors, stats, clearErrors, removeError } = useErrorMonitor();
  
  return (
    <div>
      <p>Total errors: {stats.total}</p>
      <button onClick={clearErrors}>Clear All</button>
      {errors.map(error => (
        <div key={error.id}>
          {error.message}
          <button onClick={() => removeError(error.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Error Boundary Usage

```typescript
import { ErrorBoundary } from 'shared-ui-lib';

// Basic usage
<ErrorBoundary componentName="User List">
  <UserList />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary 
  componentName="Dashboard"
  fallback={(error, errorInfo, retry) => (
    <div>
      <h2>Dashboard Error</h2>
      <p>{error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  )}
>
  <Dashboard />
</ErrorBoundary>
```

## User Interface

### Error Panel

The error panel is accessible through:
- **Keyboard shortcut**: `Ctrl/Cmd + Shift + E`
- **Footer error badge**: Click the error count chip
- **Programmatically**: `setErrorPanelOpen(true)`

Features:
- Real-time error list with filtering
- Error details with stack traces
- Export functionality
- Individual error removal

### Error Monitor Dashboard

Access via the "Error Monitor" menu item in the container app.

Features:
- **Statistics Cards**: Total errors, recent errors, affected apps, resolved errors
- **Error Timeline**: 24-hour error trend chart
- **Error Distribution**: Pie chart by error type
- **App Analysis**: Bar chart showing errors per application
- **Detailed Error List**: Expandable error entries with full details
- **Filtering**: By type, app, severity, and time range
- **Export**: JSON report generation

### Error Toasts

Automatic toast notifications appear for new errors with:
- Error type and severity indicators
- App name and timestamp
- Auto-dismiss after 6 seconds
- Manual dismiss option

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + E` | Toggle error panel |
| `Ctrl/Cmd + Shift + C` | Clear all errors |
| `Ctrl/Cmd + Shift + M` | Open error monitor dashboard |

## Backend API

### Endpoints

#### POST /api/errors
Log a new error

```json
{
  "timestamp": 1640995200000,
  "type": "api",
  "message": "Failed to fetch user data",
  "stack": "Error: Failed to fetch...",
  "appName": "user-management",
  "url": "http://localhost:3001",
  "userAgent": "Mozilla/5.0...",
  "severity": "medium"
}
```

#### GET /api/errors
Retrieve errors with optional filtering

Query parameters:
- `type` - Filter by error type
- `app_name` - Filter by application name
- `severity` - Filter by severity level
- `resolved` - Filter by resolved status
- `limit` - Maximum number of results (default: 100)
- `offset` - Pagination offset
- `start_time` - Start timestamp filter
- `end_time` - End timestamp filter

#### GET /api/errors/stats
Get error statistics

```json
{
  "total": 42,
  "by_type": {
    "react": 15,
    "api": 20,
    "network": 5,
    "moduleFederation": 2,
    "unknown": 0
  },
  "by_app": {
    "container": 10,
    "user-management": 15,
    "data-grid": 12,
    "analytics": 3,
    "settings": 2
  },
  "by_severity": {
    "critical": 2,
    "high": 8,
    "medium": 25,
    "low": 7
  },
  "recent": 5,
  "resolved": 10,
  "unresolved": 32
}
```

#### PATCH /api/errors/{error_id}
Update error (mark as resolved)

```json
{
  "resolved": true,
  "message": "Updated error message"
}
```

#### DELETE /api/errors/{error_id}
Delete specific error

#### DELETE /api/errors
Clear all errors

#### GET /api/errors/export/json
Export all errors as JSON

## Configuration

### ErrorLogger Configuration

```typescript
import { ErrorLogger } from 'shared-ui-lib';

ErrorLogger.configure({
  maxErrors: 100,              // Maximum errors to store
  enableConsoleLog: true,      // Log to console
  enableRemoteLogging: true,   // Send to backend
  remoteEndpoint: 'http://localhost:8000/api/errors',
  enableToasts: true,          // Show toast notifications
  enableLocalStorage: true,    // Persist to localStorage
});
```

### Error Capture Configuration

Error capture is automatically initialized in each micro-frontend:

```typescript
import { ErrorCapture } from 'shared-ui-lib';

// Initialize in index.tsx of each app
ErrorCapture.initialize();
```

## Testing

### Manual Testing

1. **Start all services**:
   ```bash
   ./run.sh
   ```

2. **Open the container app**: http://localhost:3000

3. **Test error panel**:
   - Press `Ctrl/Cmd + Shift + E` to open error panel
   - Navigate between micro-frontends
   - Check for any captured errors

4. **Test error monitor**:
   - Click "Error Monitor" in the sidebar
   - View error statistics and charts
   - Test filtering and export functionality

### Automated Testing

Run comprehensive error tests:

```bash
# Run with browser visible
./test_all_errors.sh

# Run in headless mode
./test_all_errors.sh --headless

# Keep services running after tests
./test_all_errors.sh --keep-services

# Custom output directory
./test_all_errors.sh --output-dir my_test_results
```

The automated tests will:
- Start all services
- Test each micro-frontend individually
- Navigate through the container app
- Capture console errors and warnings
- Check ErrorLogger data
- Take screenshots of issues
- Generate HTML and JSON reports
- Stop services (unless `--keep-services` is used)

### Test Reports

Generated reports include:
- **HTML Report**: Visual report with charts and screenshots
- **JSON Report**: Machine-readable detailed results
- **Screenshots**: Captured during error conditions

## Troubleshooting

### Common Issues

#### 1. ErrorLogger not available
**Problem**: `window.ErrorLogger is undefined`
**Solution**: Ensure `ErrorCapture.initialize()` is called in the app's index.tsx

#### 2. Errors not appearing in panel
**Problem**: Errors logged but not visible in UI
**Solution**: 
- Check if ErrorPanel is properly imported and rendered
- Verify useErrorMonitor hook is working
- Check browser console for ErrorLogger errors

#### 3. Backend API not receiving errors
**Problem**: Errors not saved to backend
**Solution**:
- Verify backend service is running on port 8000
- Check CORS configuration
- Verify API endpoint URL in ErrorLogger config

#### 4. Module Federation errors not captured
**Problem**: Remote module loading errors not detected
**Solution**:
- Ensure ErrorBoundary wraps remote components
- Check webpack configuration for proper Module Federation setup
- Verify remote entry points are accessible

#### 5. Error toasts not showing
**Problem**: New errors don't trigger toast notifications
**Solution**:
- Check ErrorToast component is rendered in container app
- Verify useErrorMonitor subscription is working
- Check toast configuration in ErrorLogger

### Debugging Tips

1. **Check ErrorLogger state**:
   ```javascript
   // In browser console
   console.log(window.ErrorLogger.getErrors());
   console.log(window.ErrorLogger.getStats());
   ```

2. **Monitor network requests**:
   - Open browser DevTools → Network tab
   - Look for POST requests to `/api/errors`
   - Check for CORS or network errors

3. **Check localStorage**:
   ```javascript
   // In browser console
   console.log(localStorage.getItem('micro-frontend-errors'));
   ```

4. **Verify error boundaries**:
   - Temporarily throw an error in a component
   - Check if ErrorBoundary catches it
   - Verify error appears in ErrorLogger

## Best Practices

### 1. Error Boundary Placement

```typescript
// ✅ Good: Wrap individual features
<ErrorBoundary componentName="User Profile">
  <UserProfile userId={userId} />
</ErrorBoundary>

// ✅ Good: Wrap remote micro-frontends
<ErrorBoundary componentName="Analytics App">
  <Suspense fallback={<Loading />}>
    <AnalyticsApp />
  </Suspense>
</ErrorBoundary>

// ❌ Avoid: Too granular
<ErrorBoundary componentName="Button">
  <Button>Click me</Button>
</ErrorBoundary>
```

### 2. Error Logging

```typescript
// ✅ Good: Provide context
ErrorLogger.logError(
  'Failed to load user profile',
  'api',
  error,
  'user-management',
  { userId, endpoint: '/api/users/123' }
);

// ✅ Good: Use appropriate severity
ErrorLogger.logError(
  'Module Federation remote failed to load',
  'moduleFederation',
  error,
  'container',
  { severity: 'critical', remoteName: 'userApp' }
);

// ❌ Avoid: Generic messages
ErrorLogger.logError('Error occurred', 'unknown', error);
```

### 3. API Error Handling

```typescript
// ✅ Good: Comprehensive error capture
async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    ErrorCapture.captureApiError(error, `/api/users/${userId}`, 'GET');
    throw error; // Re-throw for component handling
  }
}

// ❌ Avoid: Silent failures
async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    return await response.json();
  } catch (error) {
    return null; // Silent failure
  }
}
```

### 4. Error Recovery

```typescript
// ✅ Good: Provide recovery options
<ErrorBoundary 
  componentName="Data Table"
  fallback={(error, errorInfo, retry) => (
    <div>
      <h3>Failed to load data</h3>
      <p>There was an error loading the data table.</p>
      <button onClick={retry}>Try Again</button>
      <button onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  )}
>
  <DataTable />
</ErrorBoundary>
```

## Performance Considerations

### 1. Error Storage Limits

The ErrorLogger automatically limits stored errors:
- Default maximum: 100 errors
- Oldest errors are removed when limit is reached
- Configure via `maxErrors` option

### 2. Network Optimization

- Errors are batched when possible
- Failed remote logging doesn't block the UI
- Local storage is used as fallback

### 3. Memory Management

- Error objects are cleaned up automatically
- Screenshots are stored as files, not in memory
- Event listeners are properly removed

## Security Considerations

### 1. Sensitive Data

- Error messages may contain sensitive information
- Stack traces can reveal implementation details
- Consider sanitizing errors in production

### 2. Error Logging Limits

- Rate limiting on backend API prevents abuse
- Client-side limits prevent memory exhaustion
- Error data is not exposed to unauthorized users

### 3. CORS Configuration

Backend CORS is configured for development:
```python
allow_origins=[
    "http://localhost:3000",  # Container
    "http://localhost:3001",  # User Management
    "http://localhost:3002",  # Data Grid
    "http://localhost:3003",  # Analytics
    "http://localhost:3004",  # Settings
]
```

## Production Deployment

### 1. Environment Configuration

Update ErrorLogger configuration for production:

```typescript
ErrorLogger.configure({
  enableConsoleLog: false,     // Disable in production
  remoteEndpoint: 'https://your-api.com/api/errors',
  maxErrors: 50,               // Reduce for production
});
```

### 2. Backend Scaling

- Use a proper database instead of JSON files
- Implement proper authentication and authorization
- Add rate limiting and request validation
- Set up log rotation and archival

### 3. Monitoring Integration

Integrate with monitoring services:
- Send critical errors to alerting systems
- Set up dashboards for error trends
- Configure automated notifications

## Contributing

When adding new error handling:

1. **Follow the error type taxonomy**
2. **Provide meaningful error messages**
3. **Include relevant context data**
4. **Add appropriate severity levels**
5. **Test error scenarios thoroughly**
6. **Update documentation as needed**

## Support

For issues with the error handling system:

1. Check this documentation
2. Review the troubleshooting section
3. Run automated tests to verify setup
4. Check browser console for ErrorLogger messages
5. Verify backend API is accessible

---

*This error handling system is designed to provide comprehensive error monitoring and debugging capabilities for the micro-frontend platform. It should be regularly updated and maintained as the platform evolves.*
