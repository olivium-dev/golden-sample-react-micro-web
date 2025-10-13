from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, data, analytics, settings, errors

app = FastAPI(
    title="Mock Data Service API",
    description="Mock backend service for micro-frontend golden sample",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(errors.router)

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Mock Data Service API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

