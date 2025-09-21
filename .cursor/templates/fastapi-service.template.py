"""
FastAPI Microservice Template
Replace {{SERVICE_NAME}}, {{PORT}}, and {{DESCRIPTION}} with actual values
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, ValidationError
import logging
import os
import time
from typing import List, Optional, Dict, Any
import uvicorn

# Import your models, schemas, and database
from .database import get_db, engine
from .models import Base  # Your SQLAlchemy models
from .schemas import *  # Your Pydantic schemas
from .auth import verify_token  # JWT verification
from .exceptions import CustomException

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="{{SERVICE_NAME}} Service",
    description="{{DESCRIPTION}}",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security
security = HTTPBearer()

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Container app
        "http://localhost:3001",  # User management app
        "http://localhost:3002",  # Data grid app
        "http://localhost:3003",  # Analytics app
        "http://localhost:3004",  # Settings app
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} - {process_time:.4f}s")
    
    return response

# Exception handlers
@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "VALIDATION_ERROR",
            "message": "Invalid input data",
            "details": exc.errors()
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP_ERROR",
            "message": exc.detail,
            "details": None
        }
    )

# Dependency for authentication
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = verify_token(credentials.credentials)
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for service monitoring"""
    return {
        "status": "healthy",
        "service": "{{SERVICE_NAME}}",
        "version": "1.0.0",
        "timestamp": time.time()
    }

# Database health check
@app.get("/health/db")
async def database_health_check(db: Session = Depends(get_db)):
    """Database connectivity health check"""
    try:
        # Simple query to test database connection
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed"
        )

# CRUD Endpoints Template

@app.get("/{{RESOURCE_NAME}}", response_model=List[{{RESPONSE_MODEL}}])
async def list_{{RESOURCE_NAME}}(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all {{RESOURCE_NAME}} with pagination"""
    try:
        # Implement your list logic here
        items = db.query({{MODEL_CLASS}}).offset(skip).limit(limit).all()
        return items
    except Exception as e:
        logger.error(f"Error listing {{RESOURCE_NAME}}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve {{RESOURCE_NAME}}"
        )

@app.get("/{{RESOURCE_NAME}}/{item_id}", response_model={{RESPONSE_MODEL}})
async def get_{{RESOURCE_NAME}}_by_id(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific {{RESOURCE_NAME}} by ID"""
    try:
        item = db.query({{MODEL_CLASS}}).filter({{MODEL_CLASS}}.id == item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="{{RESOURCE_NAME}} not found"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving {{RESOURCE_NAME}} {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve {{RESOURCE_NAME}}"
        )

@app.post("/{{RESOURCE_NAME}}", response_model={{RESPONSE_MODEL}}, status_code=status.HTTP_201_CREATED)
async def create_{{RESOURCE_NAME}}(
    item: {{CREATE_MODEL}},
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new {{RESOURCE_NAME}}"""
    try:
        # Create new item
        db_item = {{MODEL_CLASS}}(**item.dict())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        logger.info(f"Created {{RESOURCE_NAME}} with ID: {db_item.id}")
        return db_item
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating {{RESOURCE_NAME}}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create {{RESOURCE_NAME}}"
        )

@app.put("/{{RESOURCE_NAME}}/{item_id}", response_model={{RESPONSE_MODEL}})
async def update_{{RESOURCE_NAME}}(
    item_id: int,
    item: {{UPDATE_MODEL}},
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an existing {{RESOURCE_NAME}}"""
    try:
        db_item = db.query({{MODEL_CLASS}}).filter({{MODEL_CLASS}}.id == item_id).first()
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="{{RESOURCE_NAME}} not found"
            )
        
        # Update item
        for field, value in item.dict(exclude_unset=True).items():
            setattr(db_item, field, value)
        
        db.commit()
        db.refresh(db_item)
        
        logger.info(f"Updated {{RESOURCE_NAME}} with ID: {item_id}")
        return db_item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating {{RESOURCE_NAME}} {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update {{RESOURCE_NAME}}"
        )

@app.delete("/{{RESOURCE_NAME}}/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_{{RESOURCE_NAME}}(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a {{RESOURCE_NAME}}"""
    try:
        db_item = db.query({{MODEL_CLASS}}).filter({{MODEL_CLASS}}.id == item_id).first()
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="{{RESOURCE_NAME}} not found"
            )
        
        db.delete(db_item)
        db.commit()
        
        logger.info(f"Deleted {{RESOURCE_NAME}} with ID: {item_id}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting {{RESOURCE_NAME}} {item_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete {{RESOURCE_NAME}}"
        )

# Bulk operations
@app.post("/{{RESOURCE_NAME}}/bulk", response_model=Dict[str, Any])
async def bulk_create_{{RESOURCE_NAME}}(
    items: List[{{CREATE_MODEL}}],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create multiple {{RESOURCE_NAME}} in bulk"""
    try:
        created_items = []
        for item_data in items:
            db_item = {{MODEL_CLASS}}(**item_data.dict())
            db.add(db_item)
            created_items.append(db_item)
        
        db.commit()
        
        for item in created_items:
            db.refresh(item)
        
        logger.info(f"Bulk created {len(created_items)} {{RESOURCE_NAME}}")
        return {
            "created_count": len(created_items),
            "items": created_items
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error in bulk create {{RESOURCE_NAME}}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bulk create {{RESOURCE_NAME}}"
        )

# Search endpoint
@app.get("/{{RESOURCE_NAME}}/search", response_model=List[{{RESPONSE_MODEL}}])
async def search_{{RESOURCE_NAME}}(
    q: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Search {{RESOURCE_NAME}} by query string"""
    try:
        # Implement your search logic here
        # This is a simple example - adjust based on your model fields
        items = db.query({{MODEL_CLASS}}).filter(
            {{MODEL_CLASS}}.name.ilike(f"%{q}%")
        ).offset(skip).limit(limit).all()
        
        return items
    except Exception as e:
        logger.error(f"Error searching {{RESOURCE_NAME}}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search {{RESOURCE_NAME}}"
        )

# Statistics endpoint
@app.get("/{{RESOURCE_NAME}}/stats")
async def get_{{RESOURCE_NAME}}_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get statistics for {{RESOURCE_NAME}}"""
    try:
        total_count = db.query({{MODEL_CLASS}}).count()
        
        # Add more statistics as needed
        stats = {
            "total_count": total_count,
            "timestamp": time.time()
        }
        
        return stats
    except Exception as e:
        logger.error(f"Error getting {{RESOURCE_NAME}} stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get {{RESOURCE_NAME}} statistics"
        )

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info(f"{{SERVICE_NAME}} service starting up...")
    # Add any startup logic here (database connections, cache warming, etc.)

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info(f"{{SERVICE_NAME}} service shutting down...")
    # Add any cleanup logic here

# Main entry point
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port={{PORT}},
        log_level="info",
        reload=True  # Set to False in production
    )

# Usage Example:
# 
# To create a new service:
# 1. Replace {{SERVICE_NAME}} with your service name (e.g., "User")
# 2. Replace {{PORT}} with your service port (e.g., 8001)
# 3. Replace {{DESCRIPTION}} with service description
# 4. Replace {{RESOURCE_NAME}} with your resource name (e.g., "users")
# 5. Replace {{MODEL_CLASS}} with your SQLAlchemy model class
# 6. Replace {{RESPONSE_MODEL}}, {{CREATE_MODEL}}, {{UPDATE_MODEL}} with your Pydantic schemas
# 7. Implement your specific business logic in each endpoint
