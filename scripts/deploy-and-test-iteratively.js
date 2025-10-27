#!/usr/bin/env node

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const CONFIG = {
  maxAttempts: 10,
  checkIntervalMs: 2 * 60 * 1000, // 2 minutes
  testServerIP: '192.168.2.73',
  traefikPort: '8090',
  mainDomain: 'dev-creamat.fds-1.com',
  subdomain: 'golden-sample.dev-creamat.fds-1.com'
};

class DeploymentTester {
  constructor() {
    this.attempt = 0;
    this.results = {
      login: false,
      mfeLoaded: false,
      sslMainDomain: false,
      sslSubdomain: false,
      apiRouting: false,
      errors: []
    };
  }

  async triggerDeployment() {
    console.log('\n🚀 Triggering GitHub Actions deployment...');
    
    try {
      const { stdout } = await exec(
        `gh workflow run "deploy-with-cloudflare-tunnel.yml" \\
          --field registry="ghcr.io" \\
          --field project_name="micro-frontend-sample" \\
          --field environment="production" \\
          --field server="vps-73.fds-1.com" \\
          --field ssh_user="ec2-user"`
      );
      
      console.log('✅ Deployment workflow triggered');
      
      // Get the run ID of the latest workflow
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s for workflow to start
      
      const { stdout: runsOutput } = await exec(
        `gh run list --workflow="deploy-with-cloudflare-tunnel.yml" --limit 1 --json databaseId`
      );
      
      const runs = JSON.parse(runsOutput);
      if (runs.length === 0) {
        throw new Error('No workflow runs found');
      }
      
      const runId = runs[0].databaseId;
      console.log(`📊 Workflow Run ID: ${runId}`);
      
      return runId;
    } catch (error) {
      console.error('❌ Failed to trigger deployment:', error.message);
      throw error;
    }
  }

  async waitForPipelineCompletion(runId) {
    console.log('\n⏳ Waiting for pipeline to complete...');
    console.log(`   (Checking every 2 minutes)`);
    
    let attempts = 0;
    const maxWaitAttempts = 30; // Max 60 minutes
    
    while (attempts < maxWaitAttempts) {
      try {
        const { stdout } = await exec(
          `gh run view ${runId} --json status,conclusion`
        );
        
        const run = JSON.parse(stdout);
        
        console.log(`   Status: ${run.status} | Conclusion: ${run.conclusion || 'N/A'}`);
        
        if (run.status === 'completed') {
          if (run.conclusion === 'success') {
            console.log('✅ Pipeline completed successfully!');
            return true;
          } else {
            console.log(`❌ Pipeline failed with conclusion: ${run.conclusion}`);
            return false;
          }
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, CONFIG.checkIntervalMs));
        attempts++;
        
      } catch (error) {
        console.error('⚠️ Error checking pipeline status:', error.message);
        await new Promise(resolve => setTimeout(resolve, CONFIG.checkIntervalMs));
        attempts++;
      }
    }
    
    console.log('❌ Pipeline timeout - took longer than expected');
    return false;
  }

  async testSSL(domain) {
    console.log(`   Testing SSL for ${domain}...`);
    
    try {
      const { stdout, stderr } = await exec(
        `curl -I https://${domain}/ --connect-timeout 10 --max-time 20`,
        { encoding: 'utf8' }
      );
      
      if (stdout.includes('HTTP') && (stdout.includes('200') || stdout.includes('301') || stdout.includes('302'))) {
        console.log(`   ✅ SSL valid for ${domain}`);
        return true;
      } else {
        console.log(`   ❌ SSL test failed for ${domain}`);
        return false;
      }
    } catch (error) {
      console.log(`   ❌ SSL connection failed for ${domain}: ${error.message}`);
      return false;
    }
  }

  async runPlaywrightTests() {
    console.log('\n🧪 Running Playwright tests...');
    
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--ignore-certificate-errors', '--disable-web-security']
    });
    
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    
    const networkErrors = [];
    const consoleErrors = [];
    
    // Monitor network errors
    page.on('requestfailed', request => {
      if (request.url().includes('/api/')) {
        networkErrors.push({
          url: request.url(),
          failure: request.failure()?.errorText || 'Unknown error'
        });
      }
    });
    
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('ERR_CONNECTION_REFUSED') || 
            text.includes('Failed to fetch') ||
            text.includes('Login failed')) {
          consoleErrors.push(text);
        }
      }
    });
    
    try {
      // Test 1: Page loads
      console.log('   📍 Test 1: Page loading...');
      await page.goto(`http://${CONFIG.testServerIP}:${CONFIG.traefikPort}/`, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      await page.waitForTimeout(3000);
      console.log('   ✅ Page loaded');
      
      // Test 2: Login functionality
      console.log('   📍 Test 2: Testing login...');
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      const passwordInput = page.locator('input[name="password"], input[type="password"]');
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      
      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill('admin@example.com');
        await passwordInput.fill('admin123');
        await loginButton.click();
        
        await page.waitForTimeout(5000);
        
        const userMgmtVisible = await page.locator('text=User Management').isVisible().catch(() => false);
        this.results.login = userMgmtVisible;
        
        if (userMgmtVisible) {
          console.log('   ✅ Login successful');
          
          // Test 3: MFE Loading
          console.log('   📍 Test 3: Testing MFE loading...');
          await page.locator('text=User Management').click();
          await page.waitForTimeout(3000);
          
          const mfeContent = await page.locator('text=User Management App').isVisible().catch(() => false);
          this.results.mfeLoaded = mfeContent;
          
          if (mfeContent) {
            console.log('   ✅ MFE loaded successfully');
          } else {
            console.log('   ❌ MFE content not visible');
            this.results.errors.push('MFE content did not load');
          }
        } else {
          console.log('   ❌ Login failed');
          this.results.errors.push('Login did not work');
        }
      } else {
        console.log('   ⚠️ Login form not found');
        this.results.errors.push('Login form not visible');
      }
      
      // Test 4: API Routing
      console.log('   📍 Test 4: Checking API routing...');
      const port30001Errors = networkErrors.filter(err => err.url.includes(':30001'));
      
      if (port30001Errors.length === 0) {
        console.log('   ✅ No requests to port 30001 (API routing through Traefik)');
        this.results.apiRouting = true;
      } else {
        console.log(`   ❌ Found ${port30001Errors.length} requests to port 30001`);
        this.results.errors.push(`API requests bypassing Traefik: ${port30001Errors.length} requests to port 30001`);
        this.results.apiRouting = false;
      }
      
      // Take screenshot
      await page.screenshot({ path: `test-iteration-${this.attempt}.png`, fullPage: true });
      console.log(`   📸 Screenshot saved: test-iteration-${this.attempt}.png`);
      
    } catch (error) {
      console.error('   ❌ Playwright test error:', error.message);
      this.results.errors.push(`Playwright error: ${error.message}`);
    } finally {
      await browser.close();
    }
    
    // Report network errors
    if (networkErrors.length > 0) {
      console.log(`\n   ⚠️ Network Errors: ${networkErrors.length}`);
      networkErrors.slice(0, 5).forEach(err => {
        console.log(`      - ${err.url} - ${err.failure}`);
      });
      this.results.errors.push(`${networkErrors.length} network errors detected`);
    }
    
    // Report console errors
    if (consoleErrors.length > 0) {
      console.log(`\n   ⚠️ Console Errors: ${consoleErrors.length}`);
      consoleErrors.slice(0, 5).forEach(err => {
        console.log(`      - ${err.substring(0, 100)}`);
      });
      this.results.errors.push(`${consoleErrors.length} console errors detected`);
    }
  }

  async runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 RUNNING COMPREHENSIVE TESTS');
    console.log('='.repeat(60));
    
    // Test 1: SSL Certificates
    console.log('\n📋 Test 1: SSL Certificate Validation');
    this.results.sslMainDomain = await this.testSSL(CONFIG.mainDomain);
    this.results.sslSubdomain = await this.testSSL(CONFIG.subdomain);
    
    // Test 2-4: Playwright Tests
    console.log('\n📋 Test 2-4: Application Functionality');
    await this.runPlaywrightTests();
    
    return this.results;
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n✓ Login Works:              ${this.results.login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✓ MFE Loaded:               ${this.results.mfeLoaded ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✓ SSL Main Domain:          ${this.results.sslMainDomain ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✓ SSL Subdomain:            ${this.results.sslSubdomain ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`✓ API Routing (Traefik):    ${this.results.apiRouting ? '✅ PASS' : '❌ FAIL'}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ISSUES DETECTED:');
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    const allPassed = this.results.login && 
                      this.results.mfeLoaded && 
                      this.results.sslMainDomain && 
                      this.results.sslSubdomain && 
                      this.results.apiRouting;
    
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('🎉 SUCCESS! ALL TESTS PASSED!');
      console.log('='.repeat(60));
      console.log('\n✅ The micro-frontend application is fully functional!');
      console.log('✅ SSL certificates are valid for both domains');
      console.log('✅ API routing through Traefik is working correctly');
      console.log('✅ Module Federation is working as expected');
    } else {
      console.log('⚠️ TESTS FAILED - ACTION REQUIRED');
      console.log('='.repeat(60));
      console.log('\n📝 Next Steps:');
      console.log('   1. Review the issues listed above');
      console.log('   2. Fix the identified problems in your code');
      console.log('   3. Commit and push your changes');
      console.log('   4. Run this script again: npm run deploy:iterate');
    }
    
    return allPassed;
  }

  async iterate() {
    this.attempt++;
    
    console.log('\n' + '🎯'.repeat(30));
    console.log(`ITERATION ${this.attempt}/${CONFIG.maxAttempts}`);
    console.log('🎯'.repeat(30));
    
    // Step 1: Trigger deployment
    const runId = await this.triggerDeployment();
    
    // Step 2: Wait for completion
    const success = await this.waitForPipelineCompletion(runId);
    
    if (!success) {
      console.log('\n❌ Pipeline failed. Please check the GitHub Actions logs.');
      console.log('   URL: https://github.com/olivium-dev/golden-sample-react-micro-web/actions');
      return false;
    }
    
    // Step 3: Run tests
    await this.runTests();
    
    // Step 4: Print results
    return this.printResults();
  }
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  ITERATIVE DEPLOYMENT AND TESTING SCRIPT                  ║');
  console.log('║  Micro-Frontend Golden Sample                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const tester = new DeploymentTester();
  
  try {
    const success = await tester.iterate();
    
    if (success) {
      console.log('\n✨ All tests passed! Deployment successful! ✨\n');
      process.exit(0);
    } else {
      console.log('\n⚠️ Tests failed. Fix the issues and run again. ⚠️\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Script execution error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { DeploymentTester };

