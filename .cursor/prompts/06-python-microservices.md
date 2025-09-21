# Phase 6: Python Microservices Backend Architecture

## Prompt Template
```
Create a comprehensive Python microservices backend architecture using FastAPI with an API Gateway pattern.

Requirements:
- Create 5 FastAPI services (1 gateway + 4 domain services)
- Use PostgreSQL for relational data, MongoDB for settings, Redis for caching
- Implement JWT authentication and authorization
- Setup service discovery and health checks
- Configure CORS for frontend integration
- Add comprehensive error handling and logging
- Use Docker for containerization

Services Architecture:
1. API Gateway (port 8000) - Request routing, authentication, rate limiting
2. User Service (port 8001) - User management, authentication, RBAC
3. Data Service (port 8002) - Data processing, CRUD operations, file handling
4. Analytics Service (port 8003) - Metrics, reporting, real-time analytics
5. Settings Service (port 8004) - Configuration management, preferences

Create the following structure:
/backend
  /gateway-service
    /app
      - main.py
      - auth.py
      - routing.py
      - middleware.py
    - requirements.txt
    - Dockerfile
  /user-service
    /app
      - main.py
      - models.py
      - schemas.py
      - crud.py
      - auth.py
    - requirements.txt
    - Dockerfile
  /data-service
    /app
      - main.py
      - models.py
      - processing.py
      - file_handler.py
    - requirements.txt
    - Dockerfile
  /analytics-service
    /app
      - main.py
      - analytics.py
      - websocket.py
      - metrics.py
    - requirements.txt
    - Dockerfile
  /settings-service
    /app
      - main.py
      - models.py
      - config.py
    - requirements.txt
    - Dockerfile
  /shared
    - database.py
    - auth_utils.py
    - logging_config.py
    - exceptions.py
  - docker-compose.yml
  - run_all_services.py
```

## Validation Checklist

### After Running the Prompt
- [ ] All 5 FastAPI services created with proper structure
- [ ] Gateway service routes requests to appropriate services
- [ ] User service handles authentication and user management
- [ ] Data service processes and stores data correctly
- [ ] Analytics service provides metrics and real-time updates
- [ ] Settings service manages configuration
- [ ] Docker containers build and run successfully
- [ ] Database connections work for all services
- [ ] CORS configured for frontend integration

### Code Quality Checks
- [ ] All services follow FastAPI best practices
- [ ] Proper error handling with custom exceptions
- [ ] Comprehensive logging implemented
- [ ] Input validation with Pydantic schemas
- [ ] Database models properly defined
- [ ] JWT authentication working across services
- [ ] API documentation auto-generated with Swagger
- [ ] Health check endpoints for all services

### Integration Testing
- [ ] Gateway routes requests correctly
- [ ] Service-to-service communication works
- [ ] Authentication flow end-to-end
- [ ] Database operations successful
- [ ] WebSocket connections for real-time features
- [ ] File upload/download functionality
- [ ] Error responses properly formatted

### Testing Commands
```bash
cd backend
docker-compose up -d  # Start databases
python run_all_services.py  # Start all services

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health

# Test authentication
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

## Expected File Contents

### Gateway Service (main.py)
```python
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import httpx
import logging
from typing import Dict, Any
import os

app = FastAPI(
    title="API Gateway",
    description="Central gateway for micro-frontend services",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", 
                   "http://localhost:3002", "http://localhost:3003", 
                   "http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
SERVICES = {
    "user": "http://localhost:8001",
    "data": "http://localhost:8002", 
    "analytics": "http://localhost:8003",
    "settings": "http://localhost:8004"
}

security = HTTPBearer()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "gateway"}

@app.api_route("/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_user_service(request: Request, path: str):
    return await proxy_request(request, "user", path)

@app.api_route("/data/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_data_service(request: Request, path: str):
    return await proxy_request(request, "data", path)

@app.api_route("/analytics/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_analytics_service(request: Request, path: str):
    return await proxy_request(request, "analytics", path)

@app.api_route("/settings/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_settings_service(request: Request, path: str):
    return await proxy_request(request, "settings", path)

async def proxy_request(request: Request, service: str, path: str):
    service_url = SERVICES.get(service)
    if not service_url:
        raise HTTPException(status_code=404, detail="Service not found")
    
    url = f"{service_url}/{path}"
    
    async with httpx.AsyncClient() as client:
        response = await client.request(
            method=request.method,
            url=url,
            headers=dict(request.headers),
            content=await request.body(),
            params=request.query_params
        )
        
        return response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### User Service (main.py)
```python
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional

from .database import get_db, engine
from .models import User, Base
from .schemas import UserCreate, UserResponse, Token, UserLogin
from .crud import create_user, get_user_by_email, get_users, get_user_by_id

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="User Service",
    description="User management and authentication service",
    version="1.0.0"
)

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "user"}

@app.post("/auth/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_data = user.dict()
    user_data["hashed_password"] = hashed_password
    del user_data["password"]
    
    return create_user(db=db, user=user_data)

@app.post("/auth/login", response_model=Token)
async def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=user_credentials.email)
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users", response_model=list[UserResponse])
async def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Data Service (main.py)
```python
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import List, Optional

from .database import get_db, engine
from .models import DataRecord, Base
from .schemas import DataRecordCreate, DataRecordResponse, DataFilter
from .processing import process_data, validate_data

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Data Service",
    description="Data processing and management service",
    version="1.0.0"
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "data"}

@app.get("/data", response_model=List[DataRecordResponse])
async def get_data(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    data = db.query(DataRecord).offset(skip).limit(limit).all()
    return data

@app.post("/data", response_model=DataRecordResponse)
async def create_data_record(
    record: DataRecordCreate, 
    db: Session = Depends(get_db)
):
    db_record = DataRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@app.post("/data/import")
async def import_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files supported")
    
    contents = await file.read()
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Process and validate data
        processed_data = process_data(df)
        
        # Save to database
        records_created = 0
        for _, row in processed_data.iterrows():
            record = DataRecord(**row.to_dict())
            db.add(record)
            records_created += 1
        
        db.commit()
        
        return {
            "message": f"Successfully imported {records_created} records",
            "records_created": records_created
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.get("/data/export")
async def export_data(format: str = "csv", db: Session = Depends(get_db)):
    data = db.query(DataRecord).all()
    
    # Convert to DataFrame
    df = pd.DataFrame([{
        "id": record.id,
        "name": record.name,
        "value": record.value,
        "category": record.category,
        "created_at": record.created_at
    } for record in data])
    
    if format == "csv":
        output = io.StringIO()
        df.to_csv(output, index=False)
        return {"data": output.getvalue(), "format": "csv"}
    elif format == "json":
        return {"data": df.to_json(orient="records"), "format": "json"}
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

@app.post("/data/filter", response_model=List[DataRecordResponse])
async def filter_data(filter_params: DataFilter, db: Session = Depends(get_db)):
    query = db.query(DataRecord)
    
    if filter_params.category:
        query = query.filter(DataRecord.category == filter_params.category)
    if filter_params.min_value:
        query = query.filter(DataRecord.value >= filter_params.min_value)
    if filter_params.max_value:
        query = query.filter(DataRecord.value <= filter_params.max_value)
    
    return query.all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  # Databases
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: microservices_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  # Services
  gateway-service:
    build: ./gateway-service
    ports:
      - "8000:8000"
    depends_on:
      - user-service
      - data-service
      - analytics-service
      - settings-service
    environment:
      - USER_SERVICE_URL=http://user-service:8001
      - DATA_SERVICE_URL=http://data-service:8002
      - ANALYTICS_SERVICE_URL=http://analytics-service:8003
      - SETTINGS_SERVICE_URL=http://settings-service:8004

  user-service:
    build: ./user-service
    ports:
      - "8001:8001"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/microservices_db
      - REDIS_URL=redis://redis:6379

  data-service:
    build: ./data-service
    ports:
      - "8002:8002"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/microservices_db

  analytics-service:
    build: ./analytics-service
    ports:
      - "8003:8003"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/microservices_db
      - REDIS_URL=redis://redis:6379

  settings-service:
    build: ./settings-service
    ports:
      - "8004:8004"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URL=mongodb://admin:password@mongodb:27017

volumes:
  postgres_data:
  mongodb_data:
```

## Common Issues & Solutions

### Issue: Service discovery not working
**Solution**: Use Docker networking or implement service registry with Consul

### Issue: Database connection errors
**Solution**: Ensure proper connection strings and database initialization

### Issue: CORS errors from frontend
**Solution**: Configure CORS middleware with correct origins

### Issue: JWT authentication failing
**Solution**: Ensure consistent secret keys and token validation

## Security Best Practices

### Authentication & Authorization
- [ ] JWT tokens with proper expiration
- [ ] Password hashing with bcrypt
- [ ] Role-based access control (RBAC)
- [ ] API rate limiting
- [ ] Input validation and sanitization

### Data Protection
- [ ] SQL injection prevention with ORM
- [ ] XSS protection with input validation
- [ ] Secure file upload handling
- [ ] Environment variable for secrets
- [ ] HTTPS in production

## Performance Optimization

### Caching Strategy
- [ ] Redis for session storage
- [ ] Database query caching
- [ ] API response caching
- [ ] Static asset caching

### Database Optimization
- [ ] Proper indexing
- [ ] Connection pooling
- [ ] Query optimization
- [ ] Database migrations

## Monitoring & Logging

### Health Checks
- [ ] Service health endpoints
- [ ] Database connectivity checks
- [ ] External service dependency checks
- [ ] Resource utilization monitoring

### Logging
- [ ] Structured logging with JSON
- [ ] Request/response logging
- [ ] Error tracking and alerting
- [ ] Performance metrics collection

## Next Steps
After validation passes, proceed to Phase 7: Frontend-Backend Integration and Real-time Communication.
