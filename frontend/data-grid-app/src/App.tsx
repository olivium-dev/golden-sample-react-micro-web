import React, { useState } from 'react';
import './App.css';

interface DataRow {
  id: number;
  product: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  rating: number;
  status: 'active' | 'inactive';
}

function App() {
  const [data, setData] = useState<DataRow[]>([
    { id: 1, product: 'Laptop Pro', category: 'Electronics', price: 1299.99, stock: 45, sales: 234, rating: 4.8, status: 'active' },
    { id: 2, product: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock: 120, sales: 567, rating: 4.5, status: 'active' },
    { id: 3, product: 'Office Chair', category: 'Furniture', price: 199.99, stock: 23, sales: 89, rating: 4.2, status: 'active' },
    { id: 4, product: 'Coffee Maker', category: 'Appliances', price: 89.99, stock: 67, sales: 156, rating: 4.6, status: 'inactive' },
    { id: 5, product: 'Desk Lamp', category: 'Furniture', price: 49.99, stock: 89, sales: 234, rating: 4.3, status: 'active' },
    { id: 6, product: 'Bluetooth Speaker', category: 'Electronics', price: 79.99, stock: 34, sales: 123, rating: 4.7, status: 'active' },
    { id: 7, product: 'Notebook Set', category: 'Office Supplies', price: 12.99, stock: 200, sales: 456, rating: 4.1, status: 'active' },
    { id: 8, product: 'Monitor Stand', category: 'Electronics', price: 39.99, stock: 78, sales: 189, rating: 4.4, status: 'active' }
  ]);

  const [sortField, setSortField] = useState<keyof DataRow>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = ['all', ...Array.from(new Set(data.map(item => item.category)))];

  const filteredData = data
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .filter(item => item.product.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

  const handleSort = (field: keyof DataRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleStatus = (id: number) => {
    setData(data.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
        : item
    ));
  };

  const totalValue = filteredData.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0);
  const avgRating = filteredData.length > 0 
    ? (filteredData.reduce((sum, item) => sum + item.rating, 0) / filteredData.length).toFixed(1)
    : '0.0';

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
          borderBottom: '2px solid #ff6b6b'
        }}>
          <h1 style={{ color: '#ff6b6b', fontSize: '2.5rem', margin: 0 }}>
            📊 Data Grid Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '200px'
              }}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #2196f3',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#1976d2', margin: '0 0 0.5rem 0' }}>Total Items</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>
              {filteredData.length}
            </p>
          </div>
          <div style={{
            backgroundColor: '#e8f5e8',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #4caf50',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#388e3c', margin: '0 0 0.5rem 0' }}>Total Value</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388e3c', margin: 0 }}>
              ${totalValue.toLocaleString()}
            </p>
          </div>
          <div style={{
            backgroundColor: '#fff3e0',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #ff9800',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#f57c00', margin: '0 0 0.5rem 0' }}>Total Sales</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00', margin: 0 }}>
              {totalSales.toLocaleString()}
            </p>
          </div>
          <div style={{
            backgroundColor: '#fce4ec',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e91e63',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#c2185b', margin: '0 0 0.5rem 0' }}>Avg Rating</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#c2185b', margin: 0 }}>
              {avgRating} ⭐
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#ff6b6b', color: '#ffffff' }}>
                <th 
                  style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem', cursor: 'pointer' }}
                  onClick={() => handleSort('id')}
                >
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem', cursor: 'pointer' }}
                  onClick={() => handleSort('product')}
                >
                  Product {sortField === 'product' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem', cursor: 'pointer' }}
                  onClick={() => handleSort('category')}
                >
                  Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'right', fontSize: '1.1rem', cursor: 'pointer' }}
                  onClick={() => handleSort('price')}
                >
                  Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'right', fontSize: '1.1rem', cursor: 'pointer' }}
                  onClick={() => handleSort('stock')}
                >
                  Stock {sortField === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'right', fontSize: '1.1rem', cursor: 'pointer' }}
                  onClick={() => handleSort('sales')}
                >
                  Sales {sortField === 'sales' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem', cursor: 'pointer' }}
                  onClick={() => handleSort('rating')}
                >
                  Rating {sortField === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem', cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id} style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <td style={{ padding: '1rem', fontSize: '1rem' }}>{item.id}</td>
                  <td style={{ padding: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>{item.product}</td>
                  <td style={{ padding: '1rem', fontSize: '1rem' }}>
                    <span style={{
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                    ${item.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '1rem', textAlign: 'right' }}>
                    <span style={{
                      backgroundColor: item.stock < 50 ? '#ffebee' : '#e8f5e8',
                      color: item.stock < 50 ? '#c62828' : '#2e7d32',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {item.stock}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                    {item.sales.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '1rem', textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: item.rating >= 4.5 ? '#e8f5e8' : item.rating >= 4.0 ? '#fff3e0' : '#ffebee',
                      color: item.rating >= 4.5 ? '#2e7d32' : item.rating >= 4.0 ? '#f57c00' : '#c62828',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {item.rating} ⭐
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '1rem' }}>
                    <span style={{
                      backgroundColor: item.status === 'active' ? '#e8f5e8' : '#ffebee',
                      color: item.status === 'active' ? '#2e7d32' : '#c62828',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleStatus(item.id)}
                      style={{
                        backgroundColor: item.status === 'active' ? '#dc3545' : '#28a745',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {item.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666666',
            fontSize: '1.2rem'
          }}>
            No data found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
