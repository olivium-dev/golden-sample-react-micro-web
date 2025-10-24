# Mock Data Service

A FastAPI-based mock backend service providing REST APIs for the micro-frontend platform.

## Features

- **Users API**: CRUD operations for user management
- **Data API**: CRUD operations for data grid with filtering
- **Analytics API**: Real-time analytics data for dashboards
- **Settings API**: Application settings management
- **CORS Support**: Configured for all frontend micro-frontends
- **OpenAPI Documentation**: Interactive API docs at `/api/docs`

## Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Service

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

## API Documentation

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## API Endpoints

### Users (`/api/users`)
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Data (`/api/data`)
- `GET /api/data` - Get all data rows (with filtering)
- `GET /api/data/{data_id}` - Get data row by ID
- `POST /api/data` - Create new data row
- `PUT /api/data/{data_id}` - Update data row
- `DELETE /api/data/{data_id}` - Delete data row

Query parameters:
- `category` - Filter by category
- `status` - Filter by status
- `skip` - Pagination offset
- `limit` - Pagination limit

### Analytics (`/api/analytics`)
- `GET /api/analytics` - Get all analytics data
- `GET /api/analytics/metrics` - Get metric cards
- `GET /api/analytics/charts/line` - Get line chart data
- `GET /api/analytics/charts/bar` - Get bar chart data
- `GET /api/analytics/charts/pie` - Get pie chart data

### Settings (`/api/settings`)
- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/reset` - Reset to defaults

## Mock Data

The service uses Faker to generate realistic mock data:
- **50 users** with various roles and statuses
- **100 data rows** across multiple categories
- **Real-time analytics data** with charts and metrics
- **Configurable settings** with theme support

All data is stored in memory and resets on restart.

## CORS Configuration

Configured to allow requests from:
- Container app (port 3000)
- User Management app (port 3001)
- Data Grid app (port 3002)
- Analytics app (port 3003)
- Settings app (port 3004)

## Testing

Use the interactive API documentation at `/api/docs` to test all endpoints.

Example with curl:

```bash
# Get all users
curl http://localhost:8000/api/users

# Create a user
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "full_name": "Test User",
    "role": "user",
    "is_active": true
  }'

# Get analytics data
curl http://localhost:8000/api/analytics
```

## Production Deployment

For production, use a proper WSGI server:

```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Environment Variables

- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `RELOAD`: Enable auto-reload (default: True in dev)

## License

MIT

