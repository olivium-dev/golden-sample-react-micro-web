from fastapi import APIRouter
from models.analytics import AnalyticsData
from mock_data import generate_analytics_data

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/", response_model=AnalyticsData)
def get_analytics():
    """Get analytics data"""
    return generate_analytics_data()

@router.get("/metrics")
def get_metrics():
    """Get metric cards only"""
    data = generate_analytics_data()
    return data["metrics"]

@router.get("/charts/line")
def get_line_chart():
    """Get line chart data"""
    data = generate_analytics_data()
    return data["lineChart"]

@router.get("/charts/bar")
def get_bar_chart():
    """Get bar chart data"""
    data = generate_analytics_data()
    return data["barChart"]

@router.get("/charts/pie")
def get_pie_chart():
    """Get pie chart data"""
    data = generate_analytics_data()
    return data["pieChart"]

