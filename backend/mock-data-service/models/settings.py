from pydantic import BaseModel
from typing import Optional

class SettingsBase(BaseModel):
    theme_mode: str = "light"
    primary_color: str = "#61dafb"
    secondary_color: str = "#ff6b6b"
    language: str = "en"
    timezone: str = "UTC"
    notifications_enabled: bool = True
    email_notifications: bool = True
    push_notifications: bool = False
    auto_save: bool = True
    compact_mode: bool = False

class SettingsUpdate(BaseModel):
    theme_mode: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    auto_save: Optional[bool] = None
    compact_mode: Optional[bool] = None

class Settings(SettingsBase):
    id: int

    class Config:
        from_attributes = True



