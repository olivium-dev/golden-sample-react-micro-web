from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.data_row import DataRow, DataRowCreate, DataRowUpdate
from mock_data import data_rows_db
from datetime import datetime

router = APIRouter(prefix="/data", tags=["data"])

@router.get("/", response_model=List[DataRow])
def get_data_rows(
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all data rows with optional filtering"""
    filtered_data = data_rows_db
    
    if category:
        filtered_data = [d for d in filtered_data if d["category"] == category]
    if status:
        filtered_data = [d for d in filtered_data if d["status"] == status]
    
    return filtered_data[skip:skip + limit]

@router.get("/{data_id}", response_model=DataRow)
def get_data_row(data_id: int):
    """Get data row by ID"""
    data_row = next((d for d in data_rows_db if d["id"] == data_id), None)
    if not data_row:
        raise HTTPException(status_code=404, detail="Data row not found")
    return data_row

@router.post("/", response_model=DataRow, status_code=201)
def create_data_row(data_row: DataRowCreate):
    """Create a new data row"""
    new_id = max([d["id"] for d in data_rows_db], default=0) + 1
    new_data_row = {
        "id": new_id,
        **data_row.dict(),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    data_rows_db.append(new_data_row)
    return new_data_row

@router.put("/{data_id}", response_model=DataRow)
def update_data_row(data_id: int, data_row: DataRowUpdate):
    """Update data row"""
    existing_data_row = next((d for d in data_rows_db if d["id"] == data_id), None)
    if not existing_data_row:
        raise HTTPException(status_code=404, detail="Data row not found")
    
    update_data = data_row.dict(exclude_unset=True)
    for key, value in update_data.items():
        existing_data_row[key] = value
    existing_data_row["updated_at"] = datetime.now()
    
    return existing_data_row

@router.delete("/{data_id}", status_code=204)
def delete_data_row(data_id: int):
    """Delete data row"""
    global data_rows_db
    data_row = next((d for d in data_rows_db if d["id"] == data_id), None)
    if not data_row:
        raise HTTPException(status_code=404, detail="Data row not found")
    
    data_rows_db = [d for d in data_rows_db if d["id"] != data_id]
    return None

