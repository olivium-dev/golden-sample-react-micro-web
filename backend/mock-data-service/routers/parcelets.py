from fastapi import APIRouter, HTTPException
from typing import List
from models.parcelet import Parcelet, ParceletCreate, ParceletUpdate, ParceletStatusUpdate
from datetime import datetime
import random
import string

router = APIRouter(prefix="/parcelets", tags=["parcelets"])


parcelets_db = [
    {
        "id": 1,
        "order_id": 1,
        "customer_name": "John Doe",
        "customer_email": "john.doe@example.com",
        "product_name": "Wireless Headphones",
        "quantity": 2,
        "shipping_address": "123 Main St, New York, NY 10001",
        "tracking_number": "TRK001234567",
        "status": "delivered",
        "notes": "Delivered to front door",
        "created_at": "2024-10-15T10:30:00",
        "updated_at": "2024-10-18T14:20:00"
    },
    {
        "id": 2,
        "order_id": 2,
        "customer_name": "Jane Smith",
        "customer_email": "jane.smith@example.com",
        "product_name": "Laptop Stand",
        "quantity": 1,
        "shipping_address": "456 Oak Ave, Los Angeles, CA 90210",
        "tracking_number": "TRK001234568",
        "status": "shipped",
        "notes": "Out for delivery",
        "created_at": "2024-10-20T14:15:00",
        "updated_at": "2024-10-22T09:30:00"
    },
    {
        "id": 3,
        "order_id": 3,
        "customer_name": "Mike Johnson",
        "customer_email": "mike.johnson@example.com",
        "product_name": "Bluetooth Speaker",
        "quantity": 1,
        "shipping_address": "789 Pine St, Chicago, IL 60601",
        "tracking_number": "TRK001234569",
        "status": "pending",
        "notes": "Awaiting pickup",
        "created_at": "2024-10-25T09:45:00",
        "updated_at": "2024-10-25T09:45:00"
    },
    {
        "id": 4,
        "order_id": 4,
        "customer_name": "Sarah Wilson",
        "customer_email": "sarah.wilson@example.com",
        "product_name": "USB-C Cable",
        "quantity": 3,
        "shipping_address": "321 Elm St, Houston, TX 77001",
        "tracking_number": "TRK001234570",
        "status": "pending",
        "notes": "Priority delivery requested",
        "created_at": "2024-11-01T16:20:00",
        "updated_at": "2024-11-01T16:20:00"
    },
    {
        "id": 5,
        "order_id": 5,
        "customer_name": "David Brown",
        "customer_email": "david.brown@example.com",
        "product_name": "Wireless Mouse",
        "quantity": 1,
        "shipping_address": "555 Cedar Rd, Miami, FL 33101",
        "tracking_number": "TRK001234571",
        "status": "shipped",
        "notes": "In transit",
        "created_at": "2024-11-02T11:10:00",
        "updated_at": "2024-11-03T08:15:00"
    }
]

def generate_tracking_number():
    """Generate a random tracking number"""
    return "TRK" + ''.join(random.choices(string.digits, k=9))

@router.get("/", response_model=List[Parcelet])
def get_parcelets():
    """Get all parcelets"""
    return parcelets_db

@router.get("/{parcelet_id}", response_model=Parcelet)
def get_parcelet(parcelet_id: int):
    """Get parcelet by ID"""
    parcelet = next((p for p in parcelets_db if p["id"] == parcelet_id), None)
    if not parcelet:
        raise HTTPException(status_code=404, detail="Parcelet not found")
    return parcelet

@router.post("/", response_model=Parcelet, status_code=201)
def create_parcelet(parcelet: ParceletCreate):
    """Create a new parcelet"""
    new_id = max([p["id"] for p in parcelets_db], default=0) + 1
    tracking_number = generate_tracking_number()
    now = datetime.now().isoformat()
    
    new_parcelet = {
        "id": new_id,
        "tracking_number": tracking_number,
        "created_at": now,
        "updated_at": now,
        **(parcelet.model_dump() if hasattr(parcelet, 'model_dump') else parcelet.dict()),
    }
    parcelets_db.append(new_parcelet)
    return new_parcelet

@router.put("/{parcelet_id}", response_model=Parcelet)
def update_parcelet(parcelet_id: int, parcelet: ParceletUpdate):
    """Update parcelet"""
    existing_parcelet = next((p for p in parcelets_db if p["id"] == parcelet_id), None)
    if not existing_parcelet:
        raise HTTPException(status_code=404, detail="Parcelet not found")
    
    update_data = parcelet.dict(exclude_unset=True)
    for key, value in update_data.items():
        existing_parcelet[key] = value
    
    existing_parcelet["updated_at"] = datetime.now().isoformat()
    return existing_parcelet

@router.put("/{parcelet_id}/advance", response_model=Parcelet)
def advance_parcelet_status(parcelet_id: int):
    """Advance parcelet to next status: pending → shipped → delivered"""
    existing_parcelet = next((p for p in parcelets_db if p["id"] == parcelet_id), None)
    if not existing_parcelet:
        raise HTTPException(status_code=404, detail="Parcelet not found")
    
    current_status = existing_parcelet["status"]
    
    status_progression = {
        "pending": "shipped",
        "shipped": "delivered",
        "delivered": "delivered"
    }
    
    if current_status not in status_progression:
        raise HTTPException(status_code=400, detail="Invalid current status")
    
    new_status = status_progression[current_status]
    
    if current_status == "delivered":
        raise HTTPException(status_code=400, detail="Parcelet is already delivered")
    
    existing_parcelet["status"] = new_status
    existing_parcelet["updated_at"] = datetime.now().isoformat()
    
    if new_status == "shipped":
        existing_parcelet["notes"] = "Parcelet has been shipped and is in transit"
    elif new_status == "delivered":
        existing_parcelet["notes"] = "Parcelet has been successfully delivered"
    
    return existing_parcelet

@router.put("/{parcelet_id}/status", response_model=Parcelet)
def update_parcelet_status(parcelet_id: int, status_update: ParceletStatusUpdate):
    """Update parcelet status manually"""
    existing_parcelet = next((p for p in parcelets_db if p["id"] == parcelet_id), None)
    if not existing_parcelet:
        raise HTTPException(status_code=404, detail="Parcelet not found")
    
    existing_parcelet["status"] = status_update.status
    if status_update.notes:
        existing_parcelet["notes"] = status_update.notes
    existing_parcelet["updated_at"] = datetime.now().isoformat()
    
    return existing_parcelet

@router.get("/status/{status}")
def get_parcelets_by_status(status: str):
    """Get parcelets by status"""
    valid_statuses = ["pending", "shipped", "delivered"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    filtered_parcelets = [p for p in parcelets_db if p["status"] == status]
    return filtered_parcelets

@router.get("/order/{order_id}")
def get_parcelets_by_order(order_id: int):
    """Get parcelets for a specific order"""
    filtered_parcelets = [p for p in parcelets_db if p["order_id"] == order_id]
    return filtered_parcelets

@router.delete("/{parcelet_id}", status_code=204)
def delete_parcelet(parcelet_id: int):
    """Delete parcelet"""
    global parcelets_db
    parcelet = next((p for p in parcelets_db if p["id"] == parcelet_id), None)
    if not parcelet:
        raise HTTPException(status_code=404, detail="Parcelet not found")
    
    parcelets_db = [p for p in parcelets_db if p["id"] != parcelet_id]
    return None


