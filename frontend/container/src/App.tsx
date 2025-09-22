import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [sideMenuOpen, setSideMenuOpen] = useState(true);

  const openMicroFrontend = (tabName: string) => {
    setActiveTab(tabName);
  };

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Dashboard', color: '#61dafb' },
    { id: 'users', icon: '🧑‍💼', label: 'User Management', color: '#61dafb' },
    { id: 'data', icon: '📊', label: 'Data Grid', color: '#ff6b6b' },
    { id: 'analytics', icon: '📈', label: 'Analytics', color: '#4ecdc4' },
    { id: 'settings', icon: '⚙️', label: 'Settings', color: '#ffa726' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* Header */}
      <header style={{
        backgroundColor: '#282c34',
        color: '#ffffff',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setSideMenuOpen(!sideMenuOpen)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#61dafb',
              fontSize: '1.5rem',
              cursor: 'pointer',
              marginRight: '1rem',
              padding: '0.5rem'
            }}
          >
            ☰
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#61dafb' }}>
            🏠 Micro-Frontend Platform
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#cccccc' }}>Welcome, Admin</span>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#61dafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 'bold'
          }}>
            A
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Side Menu */}
        <aside style={{
          width: sideMenuOpen ? '250px' : '60px',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
        }}>
          <nav style={{ padding: '1rem 0' }}>
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openMicroFrontend(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  cursor: 'pointer',
                  backgroundColor: activeTab === item.id ? 'rgba(97, 218, 251, 0.2)' : 'transparent',
                  borderLeft: activeTab === item.id ? `4px solid ${item.color}` : '4px solid transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    (e.target as HTMLElement).style.backgroundColor = 'rgba(97, 218, 251, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.5rem', marginRight: sideMenuOpen ? '1rem' : '0' }}>
                  {item.icon}
                </span>
                {sideMenuOpen && (
                  <span style={{ 
                    fontSize: '1rem', 
                    color: activeTab === item.id ? item.color : '#ffffff',
                    fontWeight: activeTab === item.id ? 'bold' : 'normal'
                  }}>
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#ffffff',
          overflow: 'auto'
        }}>
          {activeTab === 'home' ? (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#282c34', marginBottom: '0.5rem' }}>
                  Dashboard Overview
                </h2>
                <p style={{ color: '#666666', margin: 0 }}>
                  Welcome to the Micro-Frontend Platform. Select a module from the side menu to get started.
                </p>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {menuItems.slice(1).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openMicroFrontend(item.id)}
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '2rem',
                      borderRadius: '12px',
                      border: `2px solid ${item.color}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.transform = 'translateY(-5px)';
                      (e.target as HTMLElement).style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.transform = 'translateY(0)';
                      (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ 
                      fontSize: '3rem', 
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      {item.icon}
                    </div>
                    <h3 style={{ 
                      color: item.color, 
                      margin: '0 0 1rem 0',
                      textAlign: 'center',
                      fontSize: '1.3rem'
                    }}>
                      {item.label}
                    </h3>
                    <p style={{ 
                      color: '#666666', 
                      textAlign: 'center',
                      margin: '0 0 1rem 0',
                      fontSize: '0.9rem'
                    }}>
                      {item.id === 'users' && 'Manage users, roles, and permissions'}
                      {item.id === 'data' && 'View and manage data with advanced filtering'}
                      {item.id === 'analytics' && 'Real-time analytics and reporting'}
                      {item.id === 'settings' && 'System configuration and preferences'}
                    </p>
                    <div style={{
                      textAlign: 'center',
                      padding: '0.5rem 1rem',
                      backgroundColor: item.color,
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      Open Module →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ 
                  color: menuItems.find(item => item.id === activeTab)?.color || '#282c34',
                  margin: '0 0 0.5rem 0'
                }}>
                  {menuItems.find(item => item.id === activeTab)?.icon} {' '}
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p style={{ color: '#666666', margin: 0 }}>
                  Micro-frontend deployed on GitHub Pages
                </p>
              </div>
              
              <div style={{
                border: '2px solid #e9ecef',
                borderRadius: '10px',
                overflow: 'hidden',
                height: 'calc(100vh - 200px)'
              }}>
                <iframe
                  src={
                    activeTab === 'users' ? 'https://olivium-dev.github.io/golden-sample-react-micro-web/user-management/' :
                    activeTab === 'data' ? 'https://olivium-dev.github.io/golden-sample-react-micro-web/data-grid/' :
                    activeTab === 'analytics' ? 'https://olivium-dev.github.io/golden-sample-react-micro-web/analytics/' :
                    activeTab === 'settings' ? 'https://olivium-dev.github.io/golden-sample-react-micro-web/settings/' : ''
                  }
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title={`${activeTab} micro-frontend`}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#282c34',
        color: '#ffffff',
        padding: '1rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid #444444'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cccccc' }}>
              © 2025 Micro-Frontend Platform. Built with React + GitHub Pages.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#888888' }}>
              🚀 All Services Running
            </span>
            <span style={{ fontSize: '0.8rem', color: '#888888' }}>
              ⚡ Live Reload Active
            </span>
            <span style={{ fontSize: '0.8rem', color: '#888888' }}>
              🔧 Development Mode
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
