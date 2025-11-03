from fastapi import APIRouter, HTTPException
from typing import List
from models.order import Order, OrderCreate, OrderUpdate
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["orders"])

# Mock orders database
orders_db = [
    {
        "id": 1,
        "customer_name": "John Doe",
        "customer_email": "john.doe@example.com",
        "product_name": "Wireless Headphones",
        "quantity": 2,
        "unit_price": 99.99,
        "total_amount": 199.98,
        "status": "delivered",
        "order_date": "2024-10-15T10:30:00",
        "shipping_address": "123 Main St, New York, NY 10001",
        "notes": "Please deliver to front door"
    },
    {
        "id": 2,
        "customer_name": "Jane Smith",
        "customer_email": "jane.smith@example.com",
        "product_name": "Laptop Stand",
        "quantity": 1,
        "unit_price": 45.50,
        "total_amount": 45.50,
        "status": "processing",
        "order_date": "2024-10-20T14:15:00",
        "shipping_address": "456 Oak Ave, Los Angeles, CA 90210",
        "notes": "Call before delivery"
    },
    {
        "id": 3,
        "customer_name": "Mike Johnson",
        "customer_email": "mike.johnson@example.com",
        "product_name": "Bluetooth Speaker",
        "quantity": 1,
        "unit_price": 79.99,
        "total_amount": 79.99,
        "status": "shipped",
        "order_date": "2024-10-25T09:45:00",
        "shipping_address": "789 Pine St, Chicago, IL 60601",
        "notes": None
    },
    {
        "id": 4,
        "customer_name": "Sarah Wilson",
        "customer_email": "sarah.wilson@example.com",
        "product_name": "USB-C Cable",
        "quantity": 3,
        "unit_price": 12.99,
        "total_amount": 38.97,
        "status": "pending",
        "order_date": "2024-11-01T16:20:00",
        "shipping_address": "321 Elm St, Houston, TX 77001",
        "notes": "Urgent delivery needed"
    }
]

@router.get("/", response_model=List[Order])
def get_orders():
    """Get all orders (temporarily public for testing)"""
    return orders_db

@router.get("/{order_id}", response_model=Order)
def get_order(order_id: int):
    """Get order by ID (temporarily public for testing)"""
    order = next((o for o in orders_db if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=Order, status_code=201)
def create_order(order: OrderCreate):
    """Create a new order (temporarily public for testing)"""
    new_id = max([o["id"] for o in orders_db], default=0) + 1
    total_amount = order.quantity * order.unit_price
    new_order = {
        "id": new_id,
        **(order.model_dump() if hasattr(order, 'model_dump') else order.dict()),
        "total_amount": total_amount,
        "order_date": datetime.now().isoformat()
    }
    orders_db.append(new_order)
    return new_order

@router.put("/{order_id}", response_model=Order)
def update_order(order_id: int, order: OrderUpdate):
    """Update order (temporarily public for testing)"""
    existing_order = next((o for o in orders_db if o["id"] == order_id), None)
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = order.dict(exclude_unset=True)
    for key, value in update_data.items():
        existing_order[key] = value
    
    # Recalculate total amount if quantity or unit_price changed
    if "quantity" in update_data or "unit_price" in update_data:
        existing_order["total_amount"] = existing_order["quantity"] * existing_order["unit_price"]
    
    return existing_order

@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int):
    """Delete order (temporarily public for testing)"""
    global orders_db
    order = next((o for o in orders_db if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    orders_db = [o for o in orders_db if o["id"] != order_id]
    return None

@router.get("/status/{status}")
def get_orders_by_status(status: str):
    """Get orders by status (temporarily public for testing)"""
    filtered_orders = [o for o in orders_db if o["status"] == status]
    return filtered_orders

@router.put("/{order_id}/status")
def update_order_status(order_id: int, status: str):
    """Update order status only (temporarily public for testing)"""
    existing_order = next((o for o in orders_db if o["id"] == order_id), None)
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    existing_order["status"] = status
    return existing_order

