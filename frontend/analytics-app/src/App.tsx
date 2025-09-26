import React, { useState, useEffect } from 'react';
import './App.css';

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface ChartData {
  month: string;
  revenue: number;
  users: number;
  orders: number;
}

function App() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Simulate data loading based on time range
    const loadData = () => {
      const baseData = {
        '7d': {
          metrics: [
            { label: 'Total Revenue', value: 125000, change: 12.5, trend: 'up' as const },
            { label: 'Active Users', value: 2840, change: 8.2, trend: 'up' as const },
            { label: 'New Orders', value: 156, change: -3.1, trend: 'down' as const },
            { label: 'Conversion Rate', value: 3.2, change: 0.8, trend: 'up' as const },
            { label: 'Avg Order Value', value: 89.50, change: 5.2, trend: 'up' as const },
            { label: 'Customer Satisfaction', value: 4.6, change: 0.1, trend: 'stable' as const }
          ],
          chartData: [
            { month: 'Jan 8', revenue: 18000, users: 1200, orders: 45 },
            { month: 'Jan 9', revenue: 22000, users: 1350, orders: 52 },
            { month: 'Jan 10', revenue: 19500, users: 1280, orders: 48 },
            { month: 'Jan 11', revenue: 25000, users: 1420, orders: 58 },
            { month: 'Jan 12', revenue: 21000, users: 1300, orders: 49 },
            { month: 'Jan 13', revenue: 23000, users: 1380, orders: 55 },
            { month: 'Jan 14', revenue: 26500, users: 1450, orders: 62 }
          ]
        },
        '30d': {
          metrics: [
            { label: 'Total Revenue', value: 485000, change: 15.3, trend: 'up' as const },
            { label: 'Active Users', value: 12400, change: 12.8, trend: 'up' as const },
            { label: 'New Orders', value: 2340, change: 8.7, trend: 'up' as const },
            { label: 'Conversion Rate', value: 3.8, change: 1.2, trend: 'up' as const },
            { label: 'Avg Order Value', value: 92.30, change: 7.5, trend: 'up' as const },
            { label: 'Customer Satisfaction', value: 4.7, change: 0.3, trend: 'up' as const }
          ],
          chartData: [
            { month: 'Week 1', revenue: 120000, users: 3100, orders: 580 },
            { month: 'Week 2', revenue: 135000, users: 3200, orders: 620 },
            { month: 'Week 3', revenue: 118000, users: 3050, orders: 570 },
            { month: 'Week 4', revenue: 112000, users: 3050, orders: 570 }
          ]
        },
        '90d': {
          metrics: [
            { label: 'Total Revenue', value: 1420000, change: 22.1, trend: 'up' as const },
            { label: 'Active Users', value: 35600, change: 18.5, trend: 'up' as const },
            { label: 'New Orders', value: 6780, change: 15.2, trend: 'up' as const },
            { label: 'Conversion Rate', value: 4.1, change: 2.8, trend: 'up' as const },
            { label: 'Avg Order Value', value: 95.80, change: 12.3, trend: 'up' as const },
            { label: 'Customer Satisfaction', value: 4.8, change: 0.5, trend: 'up' as const }
          ],
          chartData: [
            { month: 'Month 1', revenue: 450000, users: 10500, orders: 2100 },
            { month: 'Month 2', revenue: 480000, users: 12000, orders: 2300 },
            { month: 'Month 3', revenue: 490000, users: 13100, orders: 2380 }
          ]
        },
        '1y': {
          metrics: [
            { label: 'Total Revenue', value: 5200000, change: 28.7, trend: 'up' as const },
            { label: 'Active Users', value: 125000, change: 25.3, trend: 'up' as const },
            { label: 'New Orders', value: 24500, change: 22.8, trend: 'up' as const },
            { label: 'Conversion Rate', value: 4.5, change: 4.2, trend: 'up' as const },
            { label: 'Avg Order Value', value: 98.50, change: 18.7, trend: 'up' as const },
            { label: 'Customer Satisfaction', value: 4.9, change: 1.2, trend: 'up' as const }
          ],
          chartData: [
            { month: 'Q1', revenue: 1200000, users: 28000, orders: 5800 },
            { month: 'Q2', revenue: 1350000, users: 32000, orders: 6500 },
            { month: 'Q3', revenue: 1420000, users: 35000, orders: 6800 },
            { month: 'Q4', revenue: 1230000, users: 30000, orders: 5400 }
          ]
        }
      };

      setMetrics(baseData[timeRange].metrics);
      setChartData(baseData[timeRange].chartData);
    };

    loadData();
  }, [timeRange]);

  const formatValue = (value: number, label: string) => {
    if (label.includes('Revenue')) return `$${value.toLocaleString()}`;
    if (label.includes('Rate') || label.includes('Satisfaction')) return `${value}%`;
    if (label.includes('Value')) return `$${value.toFixed(2)}`;
    return value.toLocaleString();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up') return '#28a745';
    if (trend === 'down') return '#dc3545';
    return '#6c757d';
  };

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #4ecdc4'
        }}>
          <h1 style={{ color: '#4ecdc4', fontSize: '2.5rem', margin: 0 }}>
            📈 Analytics Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {metrics.map((metric, index) => (
            <div key={index} style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{ 
                  color: '#333', 
                  margin: 0, 
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  {metric.label}
                </h3>
                <span style={{ fontSize: '1.5rem' }}>
                  {getTrendIcon(metric.trend)}
                </span>
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#4ecdc4',
                marginBottom: '0.5rem'
              }}>
                {formatValue(metric.value, metric.label)}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  color: getTrendColor(metric.trend, metric.change),
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  vs previous period
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ 
            color: '#4ecdc4', 
            marginBottom: '2rem',
            fontSize: '1.8rem',
            textAlign: 'center'
          }}>
            Performance Trends
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#ffffff'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#4ecdc4', color: '#ffffff' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem' }}>Period</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '1.1rem' }}>Revenue</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '1.1rem' }}>Users</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '1.1rem' }}>Orders</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((data, index) => (
                  <tr key={index} style={{
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    <td style={{ padding: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>
                      {data.month}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                      ${data.revenue.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '1rem', textAlign: 'right' }}>
                      {data.users.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '1rem', textAlign: 'right' }}>
                      {data.orders.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{
                        width: '60px',
                        height: '30px',
                        backgroundColor: '#4ecdc4',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        margin: '0 auto'
                      }}>
                        📈
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            backgroundColor: '#e8f5e8',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #4caf50',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#2e7d32', margin: '0 0 0.5rem 0' }}>Growth Rate</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32', margin: 0 }}>
              +{metrics[0]?.change || 0}%
            </p>
          </div>
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #2196f3',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#1976d2', margin: '0 0 0.5rem 0' }}>Top Metric</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>
              Revenue Growth
            </p>
          </div>
          <div style={{
            backgroundColor: '#fff3e0',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #ff9800',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#f57c00', margin: '0 0 0.5rem 0' }}>Data Points</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00', margin: 0 }}>
              {chartData.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
