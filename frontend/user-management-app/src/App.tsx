import React, { useState } from 'react';
import './App.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john.doe@company.com', role: 'Admin', status: 'active', lastLogin: '2025-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', role: 'User', status: 'active', lastLogin: '2025-01-14' },
    { id: 3, name: 'Bob Johnson', email: 'bob.johnson@company.com', role: 'Manager', status: 'inactive', lastLogin: '2025-01-10' },
    { id: 4, name: 'Alice Brown', email: 'alice.brown@company.com', role: 'User', status: 'active', lastLogin: '2025-01-15' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie.wilson@company.com', role: 'User', status: 'active', lastLogin: '2025-01-13' }
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User' });
  const [showAddForm, setShowAddForm] = useState(false);

  const addUser = () => {
    if (newUser.name && newUser.email) {
      const user: User = {
        id: users.length + 1,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'active',
        lastLogin: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'User' });
      setShowAddForm(false);
    }
  };

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
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
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #61dafb'
        }}>
          <h1 style={{ color: '#61dafb', fontSize: '2.5rem', margin: 0 }}>
            🧑‍💼 User Management
          </h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: '#61dafb',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Add User
          </button>
        </div>

        {showAddForm && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '2px solid #61dafb'
          }}>
            <h3 style={{ color: '#61dafb', marginTop: 0 }}>Add New User</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  minWidth: '200px'
                }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  minWidth: '200px'
                }}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                <option value="User">User</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <button
                onClick={addUser}
                style={{
                  backgroundColor: '#28a745',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Add User
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  backgroundColor: '#dc3545',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
              <tr style={{ backgroundColor: '#61dafb', color: '#ffffff' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.1rem' }}>Last Login</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <td style={{ padding: '1rem', fontSize: '1rem' }}>{user.id}</td>
                  <td style={{ padding: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>{user.name}</td>
                  <td style={{ padding: '1rem', fontSize: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem', fontSize: '1rem' }}>
                    <span style={{
                      backgroundColor: user.role === 'Admin' ? '#dc3545' : user.role === 'Manager' ? '#ffc107' : '#28a745',
                      color: user.role === 'Manager' ? '#000' : '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '1rem' }}>
                    <span style={{
                      backgroundColor: user.status === 'active' ? '#28a745' : '#dc3545',
                      color: '#ffffff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '1rem' }}>{user.lastLogin}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      style={{
                        backgroundColor: user.status === 'active' ? '#dc3545' : '#28a745',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #61dafb'
        }}>
          <p style={{ margin: 0, color: '#1976d2', fontSize: '1rem' }}>
            📊 <strong>Statistics:</strong> {users.length} total users | {users.filter(u => u.status === 'active').length} active | {users.filter(u => u.status === 'inactive').length} inactive
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
