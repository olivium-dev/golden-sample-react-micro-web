from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
import json
import os
import uuid
from models.error_log import ErrorLog, ErrorLogCreate, ErrorLogUpdate, ErrorLogResponse, ErrorStatsResponse

router = APIRouter(prefix="/api/errors", tags=["errors"])

# File to store errors
ERROR_STORE_FILE = "error_store.json"

def load_errors() -> List[dict]:
    """Load errors from JSON file"""
    if not os.path.exists(ERROR_STORE_FILE):
        return []
    
    try:
        with open(ERROR_STORE_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_errors(errors: List[dict]) -> None:
    """Save errors to JSON file"""
    try:
        with open(ERROR_STORE_FILE, 'w') as f:
            json.dump(errors, f, indent=2, default=str)
    except Exception as e:
        print(f"Failed to save errors: {e}")

def generate_error_id() -> str:
    """Generate unique error ID"""
    return f"error_{int(datetime.now().timestamp())}_{str(uuid.uuid4())[:8]}"

@router.post("/", response_model=ErrorLogResponse)
async def create_error_log(error: ErrorLogCreate):
    """Log a new error"""
    try:
        errors = load_errors()
        
        error_dict = error.dict()
        error_dict["id"] = generate_error_id()
        error_dict["created_at"] = datetime.now().isoformat()
        error_dict["resolved"] = False
        
        errors.append(error_dict)
        
        # Keep only the last 1000 errors to prevent file from growing too large
        if len(errors) > 1000:
            errors = errors[-1000:]
        
        save_errors(errors)
        
        return ErrorLogResponse(
            id=error_dict["id"],
            saved=True,
            message="Error logged successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log error: {str(e)}")

@router.get("/", response_model=List[ErrorLog])
async def get_errors(
    type: Optional[str] = Query(None, description="Filter by error type"),
    app_name: Optional[str] = Query(None, description="Filter by app name"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    resolved: Optional[bool] = Query(None, description="Filter by resolved status"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of errors to return"),
    offset: int = Query(0, ge=0, description="Number of errors to skip"),
    start_time: Optional[int] = Query(None, description="Start timestamp (Unix timestamp)"),
    end_time: Optional[int] = Query(None, description="End timestamp (Unix timestamp)")
):
    """Get errors with optional filtering"""
    try:
        errors = load_errors()
        
        # Apply filters
        filtered_errors = []
        for error in errors:
            # Type filter
            if type and error.get("type") != type:
                continue
            
            # App name filter
            if app_name and error.get("appName") != app_name:
                continue
            
            # Severity filter
            if severity and error.get("severity") != severity:
                continue
            
            # Resolved filter
            if resolved is not None and error.get("resolved", False) != resolved:
                continue
            
            # Time range filter
            if start_time and error.get("timestamp", 0) < start_time:
                continue
            
            if end_time and error.get("timestamp", 0) > end_time:
                continue
            
            filtered_errors.append(error)
        
        # Sort by timestamp (newest first)
        filtered_errors.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
        
        # Apply pagination
        paginated_errors = filtered_errors[offset:offset + limit]
        
        return paginated_errors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve errors: {str(e)}")

@router.get("/stats", response_model=ErrorStatsResponse)
async def get_error_stats():
    """Get error statistics"""
    try:
        errors = load_errors()
        
        total = len(errors)
        by_type = {}
        by_app = {}
        by_severity = {}
        resolved = 0
        recent = 0
        
        # Calculate stats
        five_minutes_ago = int((datetime.now() - timedelta(minutes=5)).timestamp() * 1000)
        
        for error in errors:
            # Count by type
            error_type = error.get("type", "unknown")
            by_type[error_type] = by_type.get(error_type, 0) + 1
            
            # Count by app
            app_name = error.get("appName", "unknown")
            by_app[app_name] = by_app.get(app_name, 0) + 1
            
            # Count by severity
            severity = error.get("severity", "medium")
            by_severity[severity] = by_severity.get(severity, 0) + 1
            
            # Count resolved
            if error.get("resolved", False):
                resolved += 1
            
            # Count recent (last 5 minutes)
            if error.get("timestamp", 0) >= five_minutes_ago:
                recent += 1
        
        return ErrorStatsResponse(
            total=total,
            by_type=by_type,
            by_app=by_app,
            by_severity=by_severity,
            recent=recent,
            resolved=resolved,
            unresolved=total - resolved
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get error stats: {str(e)}")

@router.get("/{error_id}", response_model=ErrorLog)
async def get_error(error_id: str):
    """Get a specific error by ID"""
    try:
        errors = load_errors()
        
        for error in errors:
            if error.get("id") == error_id:
                return error
        
        raise HTTPException(status_code=404, detail="Error not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve error: {str(e)}")

@router.patch("/{error_id}", response_model=ErrorLog)
async def update_error(error_id: str, update_data: ErrorLogUpdate):
    """Update an error (e.g., mark as resolved)"""
    try:
        errors = load_errors()
        
        for i, error in enumerate(errors):
            if error.get("id") == error_id:
                # Update fields
                update_dict = update_data.dict(exclude_unset=True)
                errors[i].update(update_dict)
                
                save_errors(errors)
                return errors[i]
        
        raise HTTPException(status_code=404, detail="Error not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update error: {str(e)}")

@router.delete("/{error_id}")
async def delete_error(error_id: str):
    """Delete a specific error"""
    try:
        errors = load_errors()
        
        for i, error in enumerate(errors):
            if error.get("id") == error_id:
                del errors[i]
                save_errors(errors)
                return {"message": "Error deleted successfully"}
        
        raise HTTPException(status_code=404, detail="Error not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete error: {str(e)}")

@router.delete("/")
async def clear_all_errors():
    """Clear all errors"""
    try:
        save_errors([])
        return {"message": "All errors cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear errors: {str(e)}")

@router.post("/bulk-resolve")
async def bulk_resolve_errors(
    type: Optional[str] = Query(None, description="Resolve errors of specific type"),
    app_name: Optional[str] = Query(None, description="Resolve errors from specific app"),
    severity: Optional[str] = Query(None, description="Resolve errors of specific severity")
):
    """Mark multiple errors as resolved based on filters"""
    try:
        errors = load_errors()
        resolved_count = 0
        
        for error in errors:
            # Check if error matches filters
            if type and error.get("type") != type:
                continue
            if app_name and error.get("appName") != app_name:
                continue
            if severity and error.get("severity") != severity:
                continue
            
            # Mark as resolved
            if not error.get("resolved", False):
                error["resolved"] = True
                resolved_count += 1
        
        save_errors(errors)
        
        return {
            "message": f"Marked {resolved_count} errors as resolved",
            "resolved_count": resolved_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resolve errors: {str(e)}")

@router.get("/export/json")
async def export_errors_json():
    """Export all errors as JSON"""
    try:
        errors = load_errors()
        return {
            "exported_at": datetime.now().isoformat(),
            "total_errors": len(errors),
            "errors": errors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export errors: {str(e)}")
