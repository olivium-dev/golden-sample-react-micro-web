import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ color: '#ffa726', fontSize: '3rem', marginBottom: '2rem' }}>
          ⚙️ Settings Micro-Frontend
        </h1>
        <div style={{
          backgroundColor: '#282c34',
          padding: '2rem',
          borderRadius: '10px',
          border: '2px solid #ffa726',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '1rem' }}>
            ✅ Micro-Frontend Architecture is Working!
          </p>
          <p style={{ fontSize: '1.2rem', color: '#ffa726' }}>
            This is the <strong>Settings</strong> micro-frontend running independently on port 3004
          </p>
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '5px' }}>
            <p style={{ color: '#90ee90', fontSize: '1rem' }}>
              🚀 Ready for GitHub Pages deployment
            </p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
