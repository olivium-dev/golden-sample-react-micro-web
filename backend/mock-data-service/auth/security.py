"""
Security utilities for password hashing and verification
"""
import hashlib
import secrets
from passlib.context import CryptContext

# Try to use bcrypt, fallback to sha256 if there are issues
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    USE_BCRYPT = True
except Exception:
    USE_BCRYPT = False


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt or fallback to sha256
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    if USE_BCRYPT:
        try:
            # Truncate password to 72 bytes for bcrypt compatibility
            password_bytes = password.encode('utf-8')[:72]
            password_truncated = password_bytes.decode('utf-8', errors='ignore')
            return pwd_context.hash(password_truncated)
        except Exception:
            pass
    
    # Fallback to sha256 with salt for development
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"sha256${salt}${password_hash}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    # Check if it's a sha256 hash (fallback method)
    if hashed_password.startswith("sha256$"):
        try:
            _, salt, stored_hash = hashed_password.split("$", 2)
            password_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
            return password_hash == stored_hash
        except ValueError:
            return False
    
    # Try bcrypt verification
    if USE_BCRYPT:
        try:
            # Truncate password to 72 bytes for bcrypt compatibility
            password_bytes = plain_password.encode('utf-8')[:72]
            password_truncated = password_bytes.decode('utf-8', errors='ignore')
            return pwd_context.verify(password_truncated, hashed_password)
        except Exception:
            return False
    
    return False





