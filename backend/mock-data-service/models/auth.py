"""
Authentication-related Pydantic models
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """Login request model"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    """Token refresh request model"""
    refresh_token: str


class UserAuth(BaseModel):
    """Authenticated user model"""
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool


class TokenData(BaseModel):
    """Token payload data"""
    sub: str  # Subject (user email)
    user_id: int
    role: str
    type: str  # "access" or "refresh"

