/**
 * Global Teardown for Playwright Tests
 * 
 * Runs once after all tests to clean up the environment
 */

import { stopAllServices } from './test-helpers';

async function globalTeardown() {
  console.log('🧹 Global teardown: Cleaning up services...');
  
  // Stop all services
  await stopAllServices();
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;

