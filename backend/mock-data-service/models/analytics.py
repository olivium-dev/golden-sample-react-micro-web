from pydantic import BaseModel
from typing import List, Dict, Any

class MetricCard(BaseModel):
    title: str
    value: str
    change: float
    trend: str  # 'up' or 'down'
    icon: str

class ChartData(BaseModel):
    labels: List[str]
    data: List[float]

class LineChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

class BarChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

class PieChartData(BaseModel):
    labels: List[str]
    data: List[float]

class AnalyticsData(BaseModel):
    metrics: List[MetricCard]
    lineChart: LineChartData
    barChart: BarChartData
    pieChart: PieChartData

