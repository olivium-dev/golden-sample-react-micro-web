from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ErrorLogBase(BaseModel):
    timestamp: int
    type: str  # 'react' | 'api' | 'network' | 'moduleFederation' | 'unknown'
    message: str
    stack: Optional[str] = None
    appName: str
    url: str
    userAgent: str
    componentStack: Optional[str] = None
    props: Optional[Dict[str, Any]] = None
    severity: str = "medium"  # 'low' | 'medium' | 'high' | 'critical'

class ErrorLogCreate(ErrorLogBase):
    pass

class ErrorLogUpdate(BaseModel):
    message: Optional[str] = None
    severity: Optional[str] = None
    resolved: Optional[bool] = None

class ErrorLog(ErrorLogBase):
    id: str
    created_at: datetime
    resolved: bool = False

    class Config:
        from_attributes = True

class ErrorLogResponse(BaseModel):
    id: str
    saved: bool
    message: str = "Error logged successfully"

class ErrorStatsResponse(BaseModel):
    total: int
    by_type: Dict[str, int]
    by_app: Dict[str, int]
    by_severity: Dict[str, int]
    recent: int  # errors in last 5 minutes
    resolved: int
    unresolved: int
