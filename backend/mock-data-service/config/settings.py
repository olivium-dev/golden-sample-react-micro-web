"""
Configuration settings loaded from environment variables and Docker secrets
"""
import os
from typing import List
from pathlib import Path


class Settings:
    """Application settings"""
    
    # JWT Configuration
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
    ]
    
    def __init__(self):
        """Load configuration from environment or Docker secrets"""
        self.load_secrets()
        self.load_env_vars()
    
    def load_secrets(self):
        """Load secrets from Docker secrets files if available"""
        # Try to load JWT secret from Docker secret
        jwt_secret_file = os.getenv("JWT_SECRET_KEY_FILE")
        if jwt_secret_file and Path(jwt_secret_file).exists():
            with open(jwt_secret_file, "r") as f:
                self.JWT_SECRET_KEY = f.read().strip()
        else:
            # Fallback to environment variable
            self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
        
        # Try to load refresh secret from Docker secret
        refresh_secret_file = os.getenv("JWT_REFRESH_SECRET_KEY_FILE")
        if refresh_secret_file and Path(refresh_secret_file).exists():
            with open(refresh_secret_file, "r") as f:
                self.JWT_REFRESH_SECRET_KEY = f.read().strip()
        else:
            # Fallback to environment variable
            self.JWT_REFRESH_SECRET_KEY = os.getenv(
                "JWT_REFRESH_SECRET_KEY", 
                "dev-refresh-secret-key-change-in-production"
            )
    
    def load_env_vars(self):
        """Load configuration from environment variables"""
        self.JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", self.JWT_ALGORITHM)
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", self.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        self.REFRESH_TOKEN_EXPIRE_DAYS = int(
            os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", self.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        self.API_HOST = os.getenv("API_HOST", self.API_HOST)
        self.API_PORT = int(os.getenv("API_PORT", self.API_PORT))
        
        # Parse CORS origins from comma-separated string
        cors_origins = os.getenv("CORS_ORIGINS")
        if cors_origins:
            self.CORS_ORIGINS = [origin.strip() for origin in cors_origins.split(",")]


# Global settings instance
settings = Settings()

