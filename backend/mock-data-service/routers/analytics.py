from fastapi import APIRouter, Depends
from models.analytics import AnalyticsData
from models.auth import UserAuth
from mock_data import generate_analytics_data
from auth.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/", response_model=AnalyticsData)
def get_analytics(current_user: UserAuth = Depends(get_current_user)):
    """Get analytics data (requires authentication)"""
    return generate_analytics_data()

@router.get("/metrics")
def get_metrics(current_user: UserAuth = Depends(get_current_user)):
    """Get metric cards only (requires authentication)"""
    data = generate_analytics_data()
    return data["metrics"]

@router.get("/charts/line")
def get_line_chart(current_user: UserAuth = Depends(get_current_user)):
    """Get line chart data (requires authentication)"""
    data = generate_analytics_data()
    return data["lineChart"]

@router.get("/charts/bar")
def get_bar_chart(current_user: UserAuth = Depends(get_current_user)):
    """Get bar chart data"""
    data = generate_analytics_data()
    return data["barChart"]

@router.get("/charts/pie")
def get_pie_chart(current_user: UserAuth = Depends(get_current_user)):
    """Get pie chart data"""
    data = generate_analytics_data()
    return data["pieChart"]

