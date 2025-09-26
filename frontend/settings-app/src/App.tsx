import React, { useState } from 'react';
import './App.css';

interface Setting {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'textarea';
  value: any;
  options?: string[];
}

function App() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'notifications',
      label: 'Email Notifications',
      description: 'Receive email notifications for important updates',
      type: 'toggle',
      value: true
    },
    {
      id: 'theme',
      label: 'Theme',
      description: 'Choose your preferred application theme',
      type: 'select',
      value: 'light',
      options: ['light', 'dark', 'auto']
    },
    {
      id: 'language',
      label: 'Language',
      description: 'Select your preferred language',
      type: 'select',
      value: 'en',
      options: ['en', 'es', 'fr', 'de', 'zh']
    },
    {
      id: 'timezone',
      label: 'Timezone',
      description: 'Set your local timezone',
      type: 'select',
      value: 'UTC',
      options: ['UTC', 'EST', 'PST', 'CET', 'JST']
    },
    {
      id: 'company_name',
      label: 'Company Name',
      description: 'Your company or organization name',
      type: 'input',
      value: 'Micro-Frontend Corp'
    },
    {
      id: 'api_endpoint',
      label: 'API Endpoint',
      description: 'Base URL for API requests',
      type: 'input',
      value: 'https://api.example.com'
    },
    {
      id: 'description',
      label: 'System Description',
      description: 'Brief description of your system',
      type: 'textarea',
      value: 'This is a micro-frontend architecture demonstration system.'
    },
    {
      id: 'auto_save',
      label: 'Auto Save',
      description: 'Automatically save changes every 30 seconds',
      type: 'toggle',
      value: false
    },
    {
      id: 'analytics',
      label: 'Analytics Tracking',
      description: 'Enable analytics and usage tracking',
      type: 'toggle',
      value: true
    },
    {
      id: 'backup_frequency',
      label: 'Backup Frequency',
      description: 'How often to create system backups',
      type: 'select',
      value: 'daily',
      options: ['hourly', 'daily', 'weekly', 'monthly']
    }
  ]);

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'integrations' | 'advanced'>('general');

  const updateSetting = (id: string, value: any) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
  };

  const resetToDefaults = () => {
    setSettings(settings.map(setting => ({
      ...setting,
      value: setting.id === 'notifications' ? true :
             setting.id === 'theme' ? 'light' :
             setting.id === 'language' ? 'en' :
             setting.id === 'timezone' ? 'UTC' :
             setting.id === 'company_name' ? 'Micro-Frontend Corp' :
             setting.id === 'api_endpoint' ? 'https://api.example.com' :
             setting.id === 'description' ? 'This is a micro-frontend architecture demonstration system.' :
             setting.id === 'auto_save' ? false :
             setting.id === 'analytics' ? true :
             setting.id === 'backup_frequency' ? 'daily' : setting.value
    })));
  };

  const saveSettings = () => {
    // Simulate saving settings
    alert('Settings saved successfully!');
  };

  const getTabSettings = (tab: string) => {
    switch (tab) {
      case 'general':
        return settings.filter(s => ['notifications', 'theme', 'language', 'timezone', 'company_name'].includes(s.id));
      case 'security':
        return settings.filter(s => ['analytics', 'auto_save'].includes(s.id));
      case 'integrations':
        return settings.filter(s => ['api_endpoint'].includes(s.id));
      case 'advanced':
        return settings.filter(s => ['description', 'backup_frequency'].includes(s.id));
      default:
        return [];
    }
  };

  const renderSetting = (setting: Setting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>
              {setting.label}
            </label>
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => updateSetting(setting.id, e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer'
              }}
            />
          </div>
        );
      
      case 'select':
        return (
          <div>
            <label style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '0.5rem' }}>
              {setting.label}
            </label>
            <select
              value={setting.value}
              onChange={(e) => updateSetting(setting.id, e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '200px'
              }}
            >
              {setting.options?.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'input':
        return (
          <div>
            <label style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '0.5rem' }}>
              {setting.label}
            </label>
            <input
              type="text"
              value={setting.value}
              onChange={(e) => updateSetting(setting.id, e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                width: '100%',
                maxWidth: '400px'
              }}
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div>
            <label style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '0.5rem' }}>
              {setting.label}
            </label>
            <textarea
              value={setting.value}
              onChange={(e) => updateSetting(setting.id, e.target.value)}
              rows={4}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                width: '100%',
                maxWidth: '500px',
                resize: 'vertical'
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' }
  ];

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
          borderBottom: '2px solid #ffa726'
        }}>
          <h1 style={{ color: '#ffa726', fontSize: '2.5rem', margin: 0 }}>
            ⚙️ System Settings
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={resetToDefaults}
              style={{
                backgroundColor: '#6c757d',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Reset to Defaults
            </button>
            <button
              onClick={saveSettings}
              style={{
                backgroundColor: '#ffa726',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #e9ecef'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                backgroundColor: activeTab === tab.id ? '#ffa726' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#333',
                border: 'none',
                padding: '1rem 1.5rem',
                borderRadius: '8px 8px 0 0',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderBottom: activeTab === tab.id ? '2px solid #ffa726' : '2px solid transparent'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div style={{
          display: 'grid',
          gap: '2rem'
        }}>
          {getTabSettings(activeTab).map(setting => (
            <div key={setting.id} style={{
              backgroundColor: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ 
                  color: '#333', 
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {setting.label}
                </h3>
                <p style={{ 
                  color: '#666', 
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  {setting.description}
                </p>
              </div>
              {renderSetting(setting)}
            </div>
          ))}
        </div>

        {/* System Status */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #2196f3'
        }}>
          <h3 style={{ color: '#1976d2', margin: '0 0 1rem 0' }}>System Status</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#1976d2', fontWeight: 'bold' }}>Micro-Frontends</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>4/4 Online</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#1976d2', fontWeight: 'bold' }}>Last Backup</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>2 hours ago</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#1976d2', fontWeight: 'bold' }}>System Health</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>98%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
