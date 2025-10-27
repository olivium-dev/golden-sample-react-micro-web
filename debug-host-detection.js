#!/usr/bin/env node

// Debug script to see what window.location.host actually is
const { chromium } = require('playwright');

async function debugHostDetection() {
  console.log('🔍 Debugging host detection...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📱 Loading subdomain application...');
    await page.goto('https://golden-sample.dev-creamat.fds-1.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // Check what the actual host is
    const hostInfo = await page.evaluate(() => {
      return {
        host: window.location.host,
        hostname: window.location.hostname,
        href: window.location.href,
        origin: window.location.origin,
        protocol: window.location.protocol
      };
    });
    
    console.log('\n📊 Location Info:');
    console.log('Host:', hostInfo.host);
    console.log('Hostname:', hostInfo.hostname);
    console.log('Href:', hostInfo.href);
    console.log('Origin:', hostInfo.origin);
    console.log('Protocol:', hostInfo.protocol);
    
    // Test the URL detection logic
    const urlDetection = await page.evaluate(() => {
      function getApiUrl() {
        if (typeof window !== 'undefined') {
          // Check for React environment variables
          const reactApiUrl = process.env.REACT_APP_API_URL;
          if (reactApiUrl) {
            return `ENV: ${reactApiUrl}`;
          }
          
          // Check for global config
          const globalConfig = window.__APP_CONFIG__;
          if (globalConfig && globalConfig.apiUrl) {
            return `GLOBAL: ${globalConfig.apiUrl}`;
          }
          
          // Determine based on current domain
          const currentHost = window.location.host;
          if (currentHost.includes('golden-sample.dev-creamat.fds-1.com')) {
            return `SUBDOMAIN: https://golden-sample.dev-creamat.fds-1.com`;
          } else if (currentHost.includes('dev-creamat.fds-1.com')) {
            return `MAIN: https://dev-creamat.fds-1.com`;
          } else if (currentHost.includes('192.168.2.73')) {
            return `IP: http://192.168.2.73:30001`;
          }
        }
        
        return `FALLBACK: http://localhost:30001`;
      }
      
      return {
        detectedUrl: getApiUrl(),
        currentHost: window.location.host,
        hasSubdomain: window.location.host.includes('golden-sample.dev-creamat.fds-1.com'),
        hasMainDomain: window.location.host.includes('dev-creamat.fds-1.com'),
        hasIP: window.location.host.includes('192.168.2.73')
      };
    });
    
    console.log('\n🎯 URL Detection Results:');
    console.log('Detected URL:', urlDetection.detectedUrl);
    console.log('Current Host:', urlDetection.currentHost);
    console.log('Has Subdomain:', urlDetection.hasSubdomain);
    console.log('Has Main Domain:', urlDetection.hasMainDomain);
    console.log('Has IP:', urlDetection.hasIP);
    
    return true;
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the debug
debugHostDetection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Debug error:', error);
  process.exit(1);
});
