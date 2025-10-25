#!/usr/bin/env node

/**
 * Test Suite Validation Script
 * 
 * Validates that the Playwright test suite is properly configured and functional
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 VALIDATING PLAYWRIGHT TEST SUITE');
console.log('=' .repeat(80));

// Check if Playwright is installed
function checkPlaywrightInstallation() {
  console.log('\n1. Checking Playwright installation...');
  
  try {
    const playwrightPath = path.join(__dirname, 'node_modules', '@playwright', 'test');
    if (fs.existsSync(playwrightPath)) {
      console.log('✅ Playwright is installed');
      return true;
    } else {
      console.log('❌ Playwright is not installed');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking Playwright installation:', error.message);
    return false;
  }
}

// Check test files exist
function checkTestFiles() {
  console.log('\n2. Checking test files...');
  
  const requiredFiles = [
    'playwright.config.ts',
    'tests/config/test-config.ts',
    'tests/utils/test-helpers.ts',
    'tests/utils/global-setup.ts',
    'tests/utils/global-teardown.ts',
    'tests/standalone/user-management.spec.ts',
    'tests/standalone/data-grid.spec.ts',
    'tests/standalone/analytics.spec.ts',
    'tests/standalone/settings.spec.ts',
    'tests/e2e/container.spec.ts',
    'tests/e2e/navigation.spec.ts',
    'tests/README.md'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

// List available tests
function listTests() {
  return new Promise((resolve) => {
    console.log('\n3. Listing available tests...');
    
    const listProcess = spawn('npx', ['playwright', 'test', '--list'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    listProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    listProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    listProcess.on('close', (code) => {
      if (code === 0) {
        const lines = output.split('\n').filter(line => line.trim());
        const testLines = lines.filter(line => line.includes('›'));
        
        console.log(`✅ Found ${testLines.length} tests`);
        
        // Count by project
        const projects = {};
        testLines.forEach(line => {
          const match = line.match(/\[([^\]]+)\]/);
          if (match) {
            const project = match[1];
            projects[project] = (projects[project] || 0) + 1;
          }
        });
        
        console.log('\nTests by project:');
        Object.entries(projects).forEach(([project, count]) => {
          console.log(`   ${project}: ${count} tests`);
        });
        
        resolve(true);
      } else {
        console.log('❌ Failed to list tests');
        console.log('Error:', errorOutput);
        resolve(false);
      }
    });
  });
}

// Run a quick smoke test
function runSmokeTest() {
  return new Promise((resolve) => {
    console.log('\n4. Running smoke test (dry run)...');
    
    const testProcess = spawn('npx', ['playwright', 'test', '--list', '--reporter=list'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    testProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Smoke test passed - all tests can be parsed');
        resolve(true);
      } else {
        console.log('❌ Smoke test failed');
        console.log('Error:', errorOutput);
        resolve(false);
      }
    });
  });
}

// Check package.json scripts
function checkPackageScripts() {
  console.log('\n5. Checking package.json scripts...');
  
  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredScripts = [
      'test:playwright',
      'test:standalone',
      'test:standalone:mock',
      'test:e2e',
      'test:report'
    ];
    
    let allScriptsExist = true;
    
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
      } else {
        console.log(`❌ ${script} - MISSING`);
        allScriptsExist = false;
      }
    }
    
    return allScriptsExist;
  } catch (error) {
    console.log('❌ Error checking package.json:', error.message);
    return false;
  }
}

// Main validation function
async function validateTestSuite() {
  console.log('Starting validation...\n');
  
  const checks = [
    { name: 'Playwright Installation', fn: checkPlaywrightInstallation },
    { name: 'Test Files', fn: checkTestFiles },
    { name: 'Package Scripts', fn: checkPackageScripts },
    { name: 'Test Listing', fn: listTests },
    { name: 'Smoke Test', fn: runSmokeTest }
  ];
  
  const results = [];
  
  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push({ name: check.name, success: result });
    } catch (error) {
      console.log(`❌ ${check.name} failed with error:`, error.message);
      results.push({ name: check.name, success: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(80));
  console.log('📊 VALIDATION SUMMARY');
  console.log('=' .repeat(80));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n📈 Results: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('\n🎉 SUCCESS: Test suite is properly configured and ready to use!');
    console.log('\nNext steps:');
    console.log('   npm run test:playwright     # Run all tests');
    console.log('   npm run test:standalone     # Run standalone tests');
    console.log('   npm run test:e2e           # Run E2E tests');
    console.log('   npm run test:report        # View test report');
    return true;
  } else {
    console.log('\n⚠️  ISSUES FOUND: Please fix the failed checks above');
    console.log('\nFor help, see: tests/README.md');
    return false;
  }
}

// Run validation
if (require.main === module) {
  validateTestSuite().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed with error:', error);
    process.exit(1);
  });
}

module.exports = { validateTestSuite };
