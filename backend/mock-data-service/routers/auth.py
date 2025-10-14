"""
Authentication router with login, logout, refresh, and me endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends, Response
from fastapi.responses import JSONResponse
from models.auth import LoginRequest, TokenResponse, TokenRefreshRequest, UserAuth
from auth.security import verify_password
from auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)
from auth.user_store import user_store, refresh_token_store
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, response: Response):
    """
    Login endpoint - authenticate user and return tokens
    
    Args:
        credentials: LoginRequest with email and password
        response: FastAPI response to set cookies
        
    Returns:
        TokenResponse with access_token and refresh_token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user from store
    user = user_store.get_user_by_email(credentials.email)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create tokens
    token_data = {
        "sub": user["email"],
        "user_id": user["id"],
        "role": user["role"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Store refresh token
    refresh_token_store.store_token(refresh_token, user["id"])
    
    # Set refresh token in httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_request: TokenRefreshRequest, response: Response):
    """
    Refresh token endpoint - get new access token using refresh token
    
    Args:
        refresh_request: TokenRefreshRequest with refresh_token
        response: FastAPI response to set cookies
        
    Returns:
        TokenResponse with new access_token and refresh_token
        
    Raises:
        HTTPException: If refresh token is invalid or revoked
    """
    token = refresh_request.refresh_token
    
    # Check if token is valid (not revoked)
    if not refresh_token_store.is_valid(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked refresh token"
        )
    
    # Decode refresh token
    token_data = decode_refresh_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user
    user = user_store.get_user_by_email(token_data.sub)
    
    if user is None or not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Revoke old refresh token
    refresh_token_store.revoke_token(token)
    
    # Create new tokens
    new_token_data = {
        "sub": user["email"],
        "user_id": user["id"],
        "role": user["role"]
    }
    
    new_access_token = create_access_token(new_token_data)
    new_refresh_token = create_refresh_token(new_token_data)
    
    # Store new refresh token
    refresh_token_store.store_token(new_refresh_token, user["id"])
    
    # Set new refresh token in httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )


@router.post("/logout")
async def logout(
    refresh_request: TokenRefreshRequest,
    response: Response,
    current_user: UserAuth = Depends(get_current_user)
):
    """
    Logout endpoint - revoke refresh token
    
    Args:
        refresh_request: TokenRefreshRequest with refresh_token to revoke
        response: FastAPI response to clear cookies
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    # Revoke refresh token
    refresh_token_store.revoke_token(refresh_request.refresh_token)
    
    # Clear refresh token cookie
    response.delete_cookie(key="refresh_token")
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserAuth)
async def get_current_user_info(current_user: UserAuth = Depends(get_current_user)):
    """
    Get current user info endpoint
    
    Args:
        current_user: Current authenticated user from dependency
        
    Returns:
        UserAuth with current user data
    """
    return current_user


@router.get("/demo-users")
async def get_demo_users():
    """
    Get list of demo users for testing (development only)
    
    Returns:
        List of demo user credentials
    """
    return {
        "message": "Demo users for testing",
        "users": [
            {
                "email": "admin@example.com",
                "password": "admin123",
                "role": "admin"
            },
            {
                "email": "user@example.com",
                "password": "user123",
                "role": "user"
            },
            {
                "email": "viewer@example.com",
                "password": "viewer123",
                "role": "viewer"
            }
        ]
    }

