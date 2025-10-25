/**
 * Global Setup for Playwright Tests
 * 
 * Runs once before all tests to prepare the environment
 */

import { stopAllServices } from './test-helpers';

async function globalSetup() {
  console.log('🔧 Global setup: Cleaning up any existing services...');
  
  // Stop any services that might be running from previous test runs
  await stopAllServices();
  
  // Wait a moment for ports to be freed
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
