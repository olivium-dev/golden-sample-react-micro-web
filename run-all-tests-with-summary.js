#!/usr/bin/env node

/**
 * Comprehensive Playwright Test Runner with Summary Report
 * 
 * This script runs all Playwright tests across all projects and generates
 * a detailed summary table showing results for each test.
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Test configuration
const testProjects = [
  {
    name: 'standalone-real',
    description: 'Individual micro-webs with real backend',
    command: 'playwright test --project=standalone-real --reporter=json',
    uiTest: true
  },
  {
    name: 'standalone-mock',
    description: 'Individual micro-webs with MSW mocks',
    command: 'playwright test --project=standalone-mock --reporter=json',
    uiTest: true
  },
  {
    name: 'e2e-real',
    description: 'Complete Module Federation E2E',
    command: 'playwright test --project=e2e-real --reporter=json',
    uiTest: true
  }
];

// Test file metadata
const testFileMetadata = {
  'analytics.spec.ts': {
    complexity: '⭐⭐⭐',
    description: 'Analytics Dashboard standalone tests',
    features: ['Chart visualization', 'MSW mocks', 'Config system'],
    category: 'Standalone'
  },
  'settings.spec.ts': {
    complexity: '⭐⭐⭐',
    description: 'Settings Panel standalone tests',
    features: ['Form interactions', 'Theme switching', 'Save/Reset'],
    category: 'Standalone'
  },
  'user-management.spec.ts': {
    complexity: '⭐⭐⭐⭐',
    description: 'User Management standalone tests',
    features: ['Data grid', 'CRUD operations', 'Search'],
    category: 'Standalone'
  },
  'data-grid.spec.ts': {
    complexity: '⭐⭐⭐⭐',
    description: 'Data Grid standalone tests',
    features: ['Grid interactions', 'Pagination', 'Clean architecture'],
    category: 'Standalone'
  },
  'container.spec.ts': {
    complexity: '⭐⭐⭐⭐⭐',
    description: 'Module Federation E2E tests',
    features: ['Remote modules', 'Shared dependencies', 'Error handling'],
    category: 'E2E'
  },
  'navigation.spec.ts': {
    complexity: '⭐⭐⭐⭐⭐⭐',
    description: 'Cross-module navigation tests',
    features: ['Navigation flow', 'Browser nav', 'Deep linking'],
    category: 'E2E'
  }
};

class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.summary = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
      projects: {}
    };
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0
        });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async checkPrerequisites() {
    this.log('\n🔍 Checking prerequisites...', 'cyan');

    // Check if Playwright is installed
    try {
      const result = await this.runCommand('npx playwright --version');
      if (result.success) {
        this.log(`✅ Playwright installed: ${result.stdout.trim()}`, 'green');
      } else {
        throw new Error('Playwright not found');
      }
    } catch (error) {
      this.log('❌ Playwright not installed. Run: npm install @playwright/test', 'red');
      return false;
    }

    // Check if browsers are installed
    try {
      const result = await this.runCommand('npx playwright install --dry-run');
      this.log('✅ Playwright browsers ready', 'green');
    } catch (error) {
      this.log('⚠️  Browsers might need installation. Run: npx playwright install', 'yellow');
    }

    // Check test files exist
    const testDir = path.join(process.cwd(), 'tests');
    if (!fs.existsSync(testDir)) {
      this.log('❌ Tests directory not found', 'red');
      return false;
    }

    this.log('✅ Prerequisites check completed', 'green');
    return true;
  }

  async runSingleProject(project) {
    this.log(`\n🧪 Running ${project.name}: ${project.description}`, 'blue');
    
    const startTime = Date.now();
    
    try {
      // Create output file for this project
      const outputFile = `test-results/${project.name}-results.json`;
      const command = `${project.command} --output-file=${outputFile}`;
      
      const result = await this.runCommand(command);
      const duration = Date.now() - startTime;
      
      // Parse results if JSON output exists
      let testResults = null;
      try {
        if (fs.existsSync(outputFile)) {
          const jsonContent = fs.readFileSync(outputFile, 'utf8');
          testResults = JSON.parse(jsonContent);
        }
      } catch (parseError) {
        this.log(`⚠️  Could not parse JSON results for ${project.name}`, 'yellow');
      }

      // Process results
      const projectSummary = {
        name: project.name,
        description: project.description,
        success: result.success,
        duration,
        tests: [],
        stats: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0
        }
      };

      if (testResults && testResults.suites) {
        this.processTestSuites(testResults.suites, projectSummary, project.name);
      }

      this.summary.projects[project.name] = projectSummary;
      
      if (result.success) {
        this.log(`✅ ${project.name} completed successfully (${duration}ms)`, 'green');
      } else {
        this.log(`❌ ${project.name} failed (${duration}ms)`, 'red');
      }

      return projectSummary;

    } catch (error) {
      this.log(`❌ Error running ${project.name}: ${error.message}`, 'red');
      return {
        name: project.name,
        description: project.description,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        tests: [],
        stats: { total: 0, passed: 0, failed: 0, skipped: 0 }
      };
    }
  }

  processTestSuites(suites, projectSummary, projectName) {
    for (const suite of suites) {
      if (suite.specs) {
        for (const spec of suite.specs) {
          const testFile = path.basename(spec.file || '');
          const metadata = testFileMetadata[testFile] || {};
          
          for (const test of spec.tests || []) {
            const testResult = {
              project: projectName,
              file: testFile,
              title: test.title,
              complexity: metadata.complexity || '⭐',
              description: metadata.description || 'Test',
              category: metadata.category || 'Unknown',
              features: metadata.features || [],
              status: this.getTestStatus(test.results),
              duration: this.getTestDuration(test.results),
              uiTest: true
            };

            projectSummary.tests.push(testResult);
            projectSummary.stats.total++;
            
            switch (testResult.status) {
              case 'passed':
                projectSummary.stats.passed++;
                this.summary.passedTests++;
                break;
              case 'failed':
                projectSummary.stats.failed++;
                this.summary.failedTests++;
                break;
              case 'skipped':
                projectSummary.stats.skipped++;
                this.summary.skippedTests++;
                break;
            }
            
            this.summary.totalTests++;
          }
        }
      }
      
      // Process nested suites
      if (suite.suites) {
        this.processTestSuites(suite.suites, projectSummary, projectName);
      }
    }
  }

  getTestStatus(results) {
    if (!results || results.length === 0) return 'skipped';
    
    const lastResult = results[results.length - 1];
    return lastResult.status || 'unknown';
  }

  getTestDuration(results) {
    if (!results || results.length === 0) return 0;
    
    return results.reduce((total, result) => total + (result.duration || 0), 0);
  }

  generateSummaryTable() {
    this.log('\n📊 TEST EXECUTION SUMMARY', 'bright');
    this.log('═'.repeat(120), 'cyan');

    // Overall summary
    const totalDuration = Date.now() - this.startTime;
    this.summary.totalDuration = totalDuration;

    this.log(`\n📈 OVERALL RESULTS`, 'bright');
    this.log(`Total Tests: ${this.summary.totalTests}`, 'white');
    this.log(`✅ Passed: ${this.summary.passedTests}`, 'green');
    this.log(`❌ Failed: ${this.summary.failedTests}`, 'red');
    this.log(`⏭️  Skipped: ${this.summary.skippedTests}`, 'yellow');
    this.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`, 'cyan');

    // Project summary
    this.log(`\n📋 PROJECT SUMMARY`, 'bright');
    this.log('─'.repeat(120), 'cyan');
    
    const projectHeaders = ['Project', 'Description', 'Status', 'Tests', 'Passed', 'Failed', 'Duration'];
    const projectRows = [];

    for (const [name, project] of Object.entries(this.summary.projects)) {
      projectRows.push([
        name,
        project.description.substring(0, 30) + (project.description.length > 30 ? '...' : ''),
        project.success ? '✅ PASS' : '❌ FAIL',
        project.stats.total.toString(),
        project.stats.passed.toString(),
        project.stats.failed.toString(),
        `${(project.duration / 1000).toFixed(2)}s`
      ]);
    }

    this.printTable(projectHeaders, projectRows);

    // Detailed test results
    this.log(`\n🔍 DETAILED TEST RESULTS`, 'bright');
    this.log('─'.repeat(150), 'cyan');

    const testHeaders = ['Project', 'Test File', 'Test Name', 'Complexity', 'Status', 'Duration', 'Category'];
    const testRows = [];

    for (const [projectName, project] of Object.entries(this.summary.projects)) {
      for (const test of project.tests) {
        const statusIcon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
        testRows.push([
          projectName,
          test.file,
          test.title.substring(0, 40) + (test.title.length > 40 ? '...' : ''),
          test.complexity,
          `${statusIcon} ${test.status.toUpperCase()}`,
          `${test.duration}ms`,
          test.category
        ]);
      }
    }

    this.printTable(testHeaders, testRows);

    // Individual test results summary
    this.log(`\n📊 INDIVIDUAL TEST RESULTS SUMMARY`, 'bright');
    this.log('─'.repeat(120), 'cyan');

    const summaryHeaders = ['Metric', 'Count', 'Percentage'];
    const summaryRows = [
      ['Total Tests', this.summary.totalTests.toString(), '100%'],
      ['✅ Passed Tests', this.summary.passedTests.toString(), `${((this.summary.passedTests / this.summary.totalTests) * 100).toFixed(1)}%`],
      ['❌ Failed Tests', this.summary.failedTests.toString(), `${((this.summary.failedTests / this.summary.totalTests) * 100).toFixed(1)}%`],
      ['⏭️ Skipped Tests', this.summary.skippedTests.toString(), `${((this.summary.skippedTests / this.summary.totalTests) * 100).toFixed(1)}%`]
    ];

    this.printTable(summaryHeaders, summaryRows);

    // Per-project breakdown
    this.log(`\n📋 PER-PROJECT TEST BREAKDOWN`, 'bright');
    this.log('─'.repeat(100), 'cyan');

    const projectBreakdownHeaders = ['Project', 'Total', 'Passed', 'Failed', 'Skipped', 'Success Rate'];
    const projectBreakdownRows = [];

    for (const [projectName, project] of Object.entries(this.summary.projects)) {
      const successRate = project.stats.total > 0 ? 
        ((project.stats.passed / project.stats.total) * 100).toFixed(1) + '%' : 'N/A';
      
      projectBreakdownRows.push([
        projectName,
        project.stats.total.toString(),
        project.stats.passed.toString(),
        project.stats.failed.toString(),
        project.stats.skipped.toString(),
        successRate
      ]);
    }

    this.printTable(projectBreakdownHeaders, projectBreakdownRows);

    // Test file complexity summary
    this.log(`\n🎯 TEST COMPLEXITY BREAKDOWN`, 'bright');
    this.log('─'.repeat(100), 'cyan');

    const complexityHeaders = ['Test File', 'Complexity', 'Description', 'Key Features', 'UI Test'];
    const complexityRows = [];

    for (const [fileName, metadata] of Object.entries(testFileMetadata)) {
      complexityRows.push([
        fileName,
        metadata.complexity,
        metadata.description,
        metadata.features.join(', ').substring(0, 30) + '...',
        '✅ Yes'
      ]);
    }

    this.printTable(complexityHeaders, complexityRows);
  }

  printTable(headers, rows) {
    // Calculate column widths
    const colWidths = headers.map((header, i) => {
      const maxRowWidth = Math.max(...rows.map(row => (row[i] || '').length));
      return Math.max(header.length, maxRowWidth, 8);
    });

    // Print header
    const headerRow = headers.map((header, i) => header.padEnd(colWidths[i])).join(' │ ');
    this.log(`│ ${headerRow} │`, 'bright');
    
    // Print separator
    const separator = colWidths.map(width => '─'.repeat(width)).join('─┼─');
    this.log(`├─${separator}─┤`, 'cyan');

    // Print rows
    for (const row of rows) {
      const formattedRow = row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' │ ');
      this.log(`│ ${formattedRow} │`, 'white');
    }

    // Print bottom border
    const bottomBorder = colWidths.map(width => '─'.repeat(width)).join('─┴─');
    this.log(`└─${bottomBorder}─┘`, 'cyan');
  }

  async generateJSONReport() {
    const reportPath = 'test-results/comprehensive-test-summary.json';
    
    // Ensure test-results directory exists
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd()
      },
      summary: this.summary,
      testFileMetadata,
      projects: testProjects
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n📄 Detailed JSON report saved to: ${reportPath}`, 'green');
  }

  async run() {
    this.log('🚀 COMPREHENSIVE PLAYWRIGHT TEST RUNNER', 'bright');
    this.log('═'.repeat(60), 'cyan');

    // Check prerequisites
    const prereqsOk = await this.checkPrerequisites();
    if (!prereqsOk) {
      process.exit(1);
    }

    // Ensure test-results directory exists
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }

    // Run all test projects
    for (const project of testProjects) {
      await this.runSingleProject(project);
    }

    // Generate summary
    this.generateSummaryTable();
    
    // Generate JSON report
    await this.generateJSONReport();

    // Final status
    const overallSuccess = this.summary.failedTests === 0;
    
    this.log('\n🏁 TEST EXECUTION COMPLETED', 'bright');
    if (overallSuccess) {
      this.log('🎉 All tests passed successfully!', 'green');
      process.exit(0);
    } else {
      this.log(`💥 ${this.summary.failedTests} test(s) failed`, 'red');
      process.exit(1);
    }
  }
}

// Run the test suite
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
