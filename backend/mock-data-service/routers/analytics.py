from fastapi import APIRouter, Depends
from models.analytics import AnalyticsData
from models.auth import UserAuth
from mock_data import generate_analytics_data
from auth.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/", response_model=AnalyticsData)
def get_analytics():
    """Get analytics data (temporarily public for testing)"""
    return generate_analytics_data()

@router.get("/metrics")
def get_metrics():
    """Get metric cards only (temporarily public for testing)"""
    data = generate_analytics_data()
    return data["metrics"]

@router.get("/charts/line")
def get_line_chart():
    """Get line chart data (temporarily public for testing)"""
    data = generate_analytics_data()
    return data["lineChart"]

@router.get("/charts/bar")
def get_bar_chart():
    """Get bar chart data (temporarily public for testing)"""
    data = generate_analytics_data()
    return data["barChart"]

@router.get("/charts/pie")
def get_pie_chart():
    """Get pie chart data (temporarily public for testing)"""
    data = generate_analytics_data()
    return data["pieChart"]

