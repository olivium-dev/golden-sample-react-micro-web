"""
FastAPI dependencies for authentication
"""
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from auth.jwt_handler import decode_access_token
from auth.user_store import user_store
from models.auth import UserAuth, TokenData

# HTTP Bearer token security
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserAuth:
    """
    Dependency to get the current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials containing the JWT token
        
    Returns:
        UserAuth object with current user data
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    
    # Decode token
    token_data: Optional[TokenData] = decode_access_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from store
    user = user_store.get_user_by_email(token_data.sub)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return UserAuth(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"],
        is_active=user["is_active"]
    )


async def get_current_active_user(
    current_user: UserAuth = Depends(get_current_user)
) -> UserAuth:
    """
    Dependency to get current active user
    
    Args:
        current_user: Current user from get_current_user dependency
        
    Returns:
        UserAuth object
        
    Raises:
        HTTPException: If user is not active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


async def get_optional_current_user(
    request: Request,
) -> Optional[UserAuth]:
    """
    Dependency to get current user if authenticated, None otherwise
    Used for endpoints that work both authenticated and unauthenticated
    
    Args:
        request: FastAPI request
        
    Returns:
        UserAuth if authenticated, None otherwise
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.replace("Bearer ", "")
    token_data = decode_access_token(token)
    
    if token_data is None:
        return None
    
    user = user_store.get_user_by_email(token_data.sub)
    
    if user is None or not user.get("is_active", False):
        return None
    
    return UserAuth(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"],
        is_active=user["is_active"]
    )





