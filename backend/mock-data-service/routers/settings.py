from fastapi import APIRouter, Depends
from models.settings import Settings, SettingsUpdate
from models.auth import UserAuth
from mock_data import settings_db
from auth.dependencies import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", response_model=Settings)
def get_settings(current_user: UserAuth = Depends(get_current_user)):
    """Get current settings (requires authentication)"""
    return settings_db

@router.put("/", response_model=Settings)
def update_settings(settings: SettingsUpdate, current_user: UserAuth = Depends(get_current_user)):
    """Update settings (requires authentication)"""
    global settings_db
    update_data = settings.dict(exclude_unset=True)
    for key, value in update_data.items():
        settings_db[key] = value
    return settings_db

@router.post("/reset", response_model=Settings)
def reset_settings():
    """Reset settings to defaults"""
    global settings_db
    settings_db = {
        "id": 1,
        "theme_mode": "light",
        "primary_color": "#61dafb",
        "secondary_color": "#ff6b6b",
        "language": "en",
        "timezone": "UTC",
        "notifications_enabled": True,
        "email_notifications": True,
        "push_notifications": False,
        "auto_save": True,
        "compact_mode": False
    }
    return settings_db

