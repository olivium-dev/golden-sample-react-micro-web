from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class OrderBase(BaseModel):
    customer_name: str
    customer_email: EmailStr
    product_name: str
    quantity: int
    unit_price: float
    status: Literal["pending", "processing", "shipped", "delivered", "cancelled"]
    shipping_address: str
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    product_name: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    status: Optional[Literal["pending", "processing", "shipped", "delivered", "cancelled"]] = None
    shipping_address: Optional[str] = None
    notes: Optional[str] = None

class Order(OrderBase):
    id: int
    total_amount: float
    order_date: datetime
    
    class Config:
        from_attributes = True



