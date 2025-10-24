"""
In-memory user store with pre-seeded demo users
"""
from typing import Dict, Optional
from auth.security import hash_password


class UserStore:
    """In-memory user storage"""
    
    def __init__(self):
        """Initialize user store with demo users"""
        self.users: Dict[str, dict] = {}
        self.seed_demo_users()
    
    def seed_demo_users(self):
        """Pre-seed the store with demo users"""
        demo_users = [
            {
                "id": 1,
                "email": "admin@example.com",
                "username": "admin",
                "full_name": "Admin User",
                "role": "admin",
                "is_active": True,
                "password": "admin123"
            },
            {
                "id": 2,
                "email": "user@example.com",
                "username": "user",
                "full_name": "Regular User",
                "role": "user",
                "is_active": True,
                "password": "user123"
            },
            {
                "id": 3,
                "email": "viewer@example.com",
                "username": "viewer",
                "full_name": "Viewer User",
                "role": "viewer",
                "is_active": True,
                "password": "viewer123"
            }
        ]
        
        for user in demo_users:
            # Hash the password
            hashed_password = hash_password(user["password"])
            user_data = {
                **user,
                "hashed_password": hashed_password
            }
            # Remove plain password
            del user_data["password"]
            
            # Store by email
            self.users[user["email"]] = user_data
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """
        Get user by email
        
        Args:
            email: User email
            
        Returns:
            User dict if found, None otherwise
        """
        return self.users.get(email)
    
    def get_user_by_id(self, user_id: int) -> Optional[dict]:
        """
        Get user by ID
        
        Args:
            user_id: User ID
            
        Returns:
            User dict if found, None otherwise
        """
        for user in self.users.values():
            if user["id"] == user_id:
                return user
        return None


# Global user store instance
user_store = UserStore()


class RefreshTokenStore:
    """In-memory refresh token storage for invalidation"""
    
    def __init__(self):
        """Initialize refresh token store"""
        self.tokens: Dict[str, dict] = {}
    
    def store_token(self, token: str, user_id: int):
        """
        Store a refresh token
        
        Args:
            token: Refresh token
            user_id: Associated user ID
        """
        self.tokens[token] = {
            "user_id": user_id,
            "created_at": None  # Could add timestamp if needed
        }
    
    def is_valid(self, token: str) -> bool:
        """
        Check if a refresh token is valid (not revoked)
        
        Args:
            token: Refresh token
            
        Returns:
            True if valid, False if revoked or not found
        """
        return token in self.tokens
    
    def revoke_token(self, token: str):
        """
        Revoke a refresh token
        
        Args:
            token: Refresh token to revoke
        """
        if token in self.tokens:
            del self.tokens[token]
    
    def revoke_all_user_tokens(self, user_id: int):
        """
        Revoke all refresh tokens for a user
        
        Args:
            user_id: User ID
        """
        tokens_to_revoke = [
            token for token, data in self.tokens.items()
            if data["user_id"] == user_id
        ]
        for token in tokens_to_revoke:
            del self.tokens[token]


# Global refresh token store instance
refresh_token_store = RefreshTokenStore()





