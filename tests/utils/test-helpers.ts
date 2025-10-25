/**
 * Shared Test Utilities for Micro-Frontend Golden Sample
 * 
 * Provides utilities for starting/stopping services, waiting for readiness,
 * capturing errors, taking screenshots, and generating reports.
 */

import { Page, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { testConfig, TestConfig, getServiceUrl, getExpectedContent } from '../config/test-config';
import * as fs from 'fs';
import * as path from 'path';
import * as nodeProcess from 'process';

export interface ServiceProcess {
  name: string;
  process: ChildProcess;
  port: number;
  pid?: number;
}

export interface TestResult {
  serviceName: string;
  url: string;
  success: boolean;
  loadTime: number;
  contentVerified: boolean;
  expectedContentFound: string[];
  consoleErrors: string[];
  consoleWarnings: string[];
  typescriptErrors: number;
  runtimeErrors: number;
  screenshotPath?: string;
  error?: string;
}

export interface TestReport {
  timestamp: string;
  environment: {
    nodeVersion: string;
    playwrightVersion: string;
    platform: string;
  };
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
  results: TestResult[];
}

// Global state for managing processes
const runningProcesses: ServiceProcess[] = [];

/**
 * Start the Python FastAPI backend
 */
export async function startBackend(): Promise<ServiceProcess> {
  console.log('🚀 Starting backend service...');
  
  const backendConfig = testConfig.services.backend;
  const projectRoot = nodeProcess.cwd();
  const workingDir = path.join(projectRoot, backendConfig.path);
  
  // Check if backend is already running
  const isRunning = await isServiceRunning(testConfig.urls.backend);
  if (isRunning) {
    console.log('✅ Backend already running');
    return { name: 'backend', process: null as any, port: backendConfig.port };
  }
  
  const process = spawn('python3', ['main.py'], {
    cwd: workingDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...nodeProcess.env, PORT: backendConfig.port.toString() },
  });
  
  const serviceProcess: ServiceProcess = {
    name: 'backend',
    process,
    port: backendConfig.port,
    pid: process.pid,
  };
  
  runningProcesses.push(serviceProcess);
  
  // Wait for backend to be ready
  await waitForService(testConfig.urls.backend + '/api/health', testConfig.timeouts.serviceStart);
  
  console.log(`✅ Backend started on port ${backendConfig.port}`);
  return serviceProcess;
}

/**
 * Start a micro-web service
 */
export async function startMicroWeb(
  serviceName: keyof TestConfig['services'],
  mode: 'standalone' | 'mf' = 'standalone'
): Promise<ServiceProcess> {
  if (serviceName === 'backend') {
    return startBackend();
  }
  
  const serviceConfig = testConfig.services[serviceName];
  const projectRoot = nodeProcess.cwd();
  const workingDir = path.join(projectRoot, serviceConfig.path);
  
  console.log(`🚀 Starting ${serviceConfig.name} in ${mode} mode...`);
  
  // Determine command and port
  let command: string;
  let port: number;
  
  if (mode === 'standalone') {
    command = serviceConfig.startCommand;
    port = serviceConfig.port;
  } else {
    command = 'npm start'; // Module Federation mode
    port = serviceConfig.mfPort || serviceConfig.port;
  }
  
  // Check if already running
  const url = getServiceUrl(serviceName, mode);
  const isRunning = await isServiceRunning(url);
  if (isRunning) {
    console.log(`✅ ${serviceConfig.name} already running`);
    return { name: serviceName, process: null as any, port };
  }
  
  // Start the service
  const [cmd, ...args] = command.split(' ');
  const process = spawn(cmd, args, {
    cwd: workingDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...nodeProcess.env, PORT: port.toString() },
  });
  
  const serviceProcess: ServiceProcess = {
    name: serviceName,
    process,
    port,
    pid: process.pid,
  };
  
  runningProcesses.push(serviceProcess);
  
  // Wait for service to be ready
  await waitForService(url, testConfig.timeouts.serviceStart);
  
  console.log(`✅ ${serviceConfig.name} started on port ${port}`);
  return serviceProcess;
}

/**
 * Stop all running services
 */
export async function stopAllServices(): Promise<void> {
  console.log('🛑 Stopping all services...');
  
  // Kill processes by port (more reliable than process.kill)
  const ports = [3000, 3001, 3002, 3003, 3004, 3101, 3102, 3103, 3104, 8000];
  
  for (const port of ports) {
    try {
      await killProcessOnPort(port);
    } catch (error) {
      // Ignore errors - process might not be running
    }
  }
  
  // Clear the running processes array
  runningProcesses.length = 0;
  
  console.log('✅ All services stopped');
}

/**
 * Kill process running on a specific port
 */
async function killProcessOnPort(port: number): Promise<void> {
  return new Promise((resolve) => {
    const killCommand = `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`;
    const killProcess = spawn('bash', ['-c', killCommand]);
    
    killProcess.on('close', () => {
      resolve();
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      killProcess.kill();
      resolve();
    }, 5000);
  });
}

/**
 * Check if a service is running by making a health check request
 */
export async function isServiceRunning(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Wait for a service to be ready by polling its health endpoint
 */
export async function waitForService(url: string, timeout: number = 30000): Promise<void> {
  const startTime = Date.now();
  const pollInterval = 1000; // Check every second
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return; // Service is ready
      }
    } catch {
      // Service not ready yet, continue polling
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error(`Service at ${url} did not become ready within ${timeout}ms`);
}

/**
 * Wait for webpack compilation to complete
 */
export async function waitForWebpackCompilation(page: Page, timeout: number = 25000): Promise<void> {
  const startTime = Date.now();
  let compilationComplete = false;
  
  // Listen for console messages indicating compilation
  const consoleHandler = (msg: any) => {
    const text = msg.text();
    if (text.includes('Compiled successfully') || text.includes('webpack compiled')) {
      compilationComplete = true;
    }
  };
  
  page.on('console', consoleHandler);
  
  try {
    // Wait for compilation or timeout
    while (!compilationComplete && (Date.now() - startTime) < timeout) {
      await page.waitForTimeout(1000);
    }
    
    if (!compilationComplete) {
      console.warn(`⚠️ Webpack compilation not detected within ${timeout}ms`);
    } else {
      console.log('✅ Webpack compilation completed');
    }
  } finally {
    page.off('console', consoleHandler);
  }
}

/**
 * Capture console errors and categorize them
 */
export function captureConsoleErrors(page: Page): {
  errors: string[];
  warnings: string[];
  logs: string[];
  typescriptErrors: number;
  runtimeErrors: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const logs: string[] = [];
  let typescriptErrors = 0;
  let runtimeErrors = 0;
  
  const consoleHandler = (msg: any) => {
    const text = msg.text();
    const type = msg.type();
    
    // Skip ignored messages
    const shouldIgnore = testConfig.console.ignore.some(ignore => 
      text.toLowerCase().includes(ignore.toLowerCase())
    );
    if (shouldIgnore) return;
    
    // Categorize messages
    if (type === 'error') {
      errors.push(text);
      
      // Check if it's a TypeScript error
      if (text.includes('[tsl]') || text.includes('TS') || text.includes('TypeScript')) {
        typescriptErrors++;
      } else {
        // Check if it's an expected error (like CORS)
        const isExpectedError = testConfig.console.errors.some(expectedError =>
          text.includes(expectedError)
        );
        if (!isExpectedError) {
          runtimeErrors++;
        }
      }
    } else if (type === 'warning') {
      warnings.push(text);
    } else {
      logs.push(text);
    }
  };
  
  page.on('console', consoleHandler);
  
  return {
    errors,
    warnings,
    logs,
    typescriptErrors,
    runtimeErrors,
  };
}

/**
 * Verify that expected content is present on the page
 */
export async function verifyPageContent(
  page: Page,
  expectedContent: string[]
): Promise<{ verified: boolean; found: string[] }> {
  const found: string[] = [];
  
  for (const content of expectedContent) {
    try {
      // Check if content exists anywhere on the page (case-insensitive)
      const bodyText = await page.textContent('body');
      if (bodyText && bodyText.toLowerCase().includes(content.toLowerCase())) {
        found.push(content);
      }
    } catch {
      // Content not found, continue checking others
    }
  }
  
  const verified = found.length >= Math.min(3, expectedContent.length); // At least 3 or all if less than 3
  return { verified, found };
}

/**
 * Take a screenshot and save it to test results
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  testInfo?: any
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}_${timestamp}.png`;
  const screenshotDir = path.join(nodeProcess.cwd(), 'test-results', 'screenshots');
  
  // Ensure directory exists
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const screenshotPath = path.join(screenshotDir, filename);
  
  try {
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error(`❌ Failed to take screenshot: ${error}`);
    return '';
  }
}

/**
 * Generate a comprehensive test report
 */
export async function generateTestReport(
  results: TestResult[],
  outputPath?: string
): Promise<string> {
  const report: TestReport = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: nodeProcess.version,
      playwrightVersion: require('@playwright/test/package.json').version,
      platform: nodeProcess.platform,
    },
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      duration: results.reduce((sum, r) => sum + r.loadTime, 0),
    },
    results,
  };
  
  // Generate JSON report
  const jsonPath = outputPath || path.join(nodeProcess.cwd(), 'test-results', 'test-report.json');
  const reportDir = path.dirname(jsonPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  
  // Generate HTML report
  const htmlPath = jsonPath.replace('.json', '.html');
  const htmlContent = generateHtmlReport(report);
  fs.writeFileSync(htmlPath, htmlContent);
  
  console.log(`📊 Test report generated:`);
  console.log(`   JSON: ${jsonPath}`);
  console.log(`   HTML: ${htmlPath}`);
  
  return jsonPath;
}

/**
 * Generate HTML report content
 */
function generateHtmlReport(report: TestReport): string {
  const passRate = ((report.summary.passed / report.summary.total) * 100).toFixed(1);
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Micro-Frontend Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
        .success { color: #4caf50; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
        .result { margin: 20px 0; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
        .result.passed { border-left: 4px solid #4caf50; }
        .result.failed { border-left: 4px solid #f44336; }
        .screenshot { max-width: 300px; margin: 10px 0; }
        .console-errors { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Micro-Frontend Test Report</h1>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Platform:</strong> ${report.environment.platform} | <strong>Node:</strong> ${report.environment.nodeVersion} | <strong>Playwright:</strong> ${report.environment.playwrightVersion}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div style="font-size: 2em;">${report.summary.total}</div>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <div style="font-size: 2em; color: #4caf50;">${report.summary.passed}</div>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <div style="font-size: 2em; color: #f44336;">${report.summary.failed}</div>
        </div>
        <div class="metric">
            <h3>Pass Rate</h3>
            <div style="font-size: 2em;">${passRate}%</div>
        </div>
    </div>
    
    <h2>Test Results</h2>
    ${report.results.map(result => `
        <div class="result ${result.success ? 'passed' : 'failed'}">
            <h3>${result.success ? '✅' : '❌'} ${result.serviceName}</h3>
            <p><strong>URL:</strong> ${result.url}</p>
            <p><strong>Load Time:</strong> ${result.loadTime}ms</p>
            <p><strong>Content Verified:</strong> ${result.contentVerified ? '✅' : '❌'}</p>
            <p><strong>Expected Content Found:</strong> ${result.expectedContentFound.join(', ')}</p>
            
            ${result.typescriptErrors > 0 ? `<p class="error"><strong>TypeScript Errors:</strong> ${result.typescriptErrors}</p>` : ''}
            ${result.runtimeErrors > 0 ? `<p class="error"><strong>Runtime Errors:</strong> ${result.runtimeErrors}</p>` : ''}
            
            ${result.consoleErrors.length > 0 ? `
                <div class="console-errors">
                    <strong>Console Errors:</strong>
                    <ul>${result.consoleErrors.map(error => `<li>${error}</li>`).join('')}</ul>
                </div>
            ` : ''}
            
            ${result.screenshotPath ? `
                <p><strong>Screenshot:</strong></p>
                <img src="${result.screenshotPath}" alt="Screenshot" class="screenshot" />
            ` : ''}
            
            ${result.error ? `<p class="error"><strong>Error:</strong> ${result.error}</p>` : ''}
        </div>
    `).join('')}
</body>
</html>`;
}

/**
 * Setup auth bypass by setting fake tokens in localStorage
 */
export async function setupAuthBypass(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Set fake tokens in localStorage
    localStorage.setItem('access_token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5LCJyb2xlIjoiYWRtaW4ifQ.test');
    localStorage.setItem('refresh_token', 'refresh_token_test');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin'
    }));
  });
}

/**
 * Wait for page to be fully loaded and interactive
 */
export async function waitForPageReady(page: Page, timeout: number = 30000): Promise<void> {
  try {
    // Wait for network to be idle
    await page.waitForLoadState('networkidle', { timeout });
    
    // Wait for any React components to render
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.warn(`⚠️ Page ready timeout: ${error}`);
  }
}
