from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DataRowBase(BaseModel):
    name: str
    category: str
    value: float
    status: str
    description: Optional[str] = None

class DataRowCreate(DataRowBase):
    pass

class DataRowUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    value: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None

class DataRow(DataRowBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

