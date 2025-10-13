from fastapi import APIRouter, HTTPException
from typing import List
from models.user import User, UserCreate, UserUpdate
from mock_data import users_db
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[User])
def get_users():
    """Get all users"""
    return users_db

@router.get("/{user_id}", response_model=User)
def get_user(user_id: int):
    """Get user by ID"""
    user = next((u for u in users_db if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=User, status_code=201)
def create_user(user: UserCreate):
    """Create a new user"""
    new_id = max([u["id"] for u in users_db], default=0) + 1
    new_user = {
        "id": new_id,
        **user.dict(),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    users_db.append(new_user)
    return new_user

@router.put("/{user_id}", response_model=User)
def update_user(user_id: int, user: UserUpdate):
    """Update user"""
    existing_user = next((u for u in users_db if u["id"] == user_id), None)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user.dict(exclude_unset=True)
    for key, value in update_data.items():
        existing_user[key] = value
    existing_user["updated_at"] = datetime.now()
    
    return existing_user

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int):
    """Delete user"""
    global users_db
    user = next((u for u in users_db if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    users_db = [u for u in users_db if u["id"] != user_id]
    return None

