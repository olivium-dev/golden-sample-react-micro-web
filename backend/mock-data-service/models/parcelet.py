from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class ParceletBase(BaseModel):
    order_id: int
    customer_name: str
    customer_email: EmailStr
    product_name: str
    quantity: int
    shipping_address: str
    tracking_number: Optional[str] = None
    status: Literal["pending", "shipped", "delivered"] = "pending"
    notes: Optional[str] = None

class ParceletCreate(ParceletBase):
    pass

class ParceletUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    product_name: Optional[str] = None
    quantity: Optional[int] = None
    shipping_address: Optional[str] = None
    tracking_number: Optional[str] = None
    status: Optional[Literal["pending", "shipped", "delivered"]] = None
    notes: Optional[str] = None

class ParceletStatusUpdate(BaseModel):
    status: Literal["pending", "shipped", "delivered"]
    notes: Optional[str] = None

class Parcelet(ParceletBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


