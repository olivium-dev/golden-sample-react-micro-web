#!/usr/bin/env node

/**
 * Enhanced Test Results Parser
 * 
 * This script parses actual Playwright JSON results and generates detailed
 * pass/fail tables with real test data.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
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

class TestResultsParser {
  constructor() {
    this.results = [];
    this.summary = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      flakyTests: 0,
      projects: {}
    };
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  parsePlaywrightResults(resultsFile) {
    if (!fs.existsSync(resultsFile)) {
      this.log(`⚠️  Results file not found: ${resultsFile}`, 'yellow');
      return null;
    }

    try {
      const content = fs.readFileSync(resultsFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.log(`❌ Error parsing results file: ${error.message}`, 'red');
      return null;
    }
  }

  extractTestResults(playwrightData, projectName) {
    const projectResults = {
      name: projectName,
      tests: [],
      stats: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0
      }
    };

    if (!playwrightData || !playwrightData.suites) {
      return projectResults;
    }

    this.processSuites(playwrightData.suites, projectResults, projectName);
    return projectResults;
  }

  processSuites(suites, projectResults, projectName) {
    for (const suite of suites) {
      if (suite.specs) {
        for (const spec of suite.specs) {
          const testFile = path.basename(spec.file || 'unknown.spec.ts');
          
          for (const test of spec.tests || []) {
            const testResult = this.processTest(test, testFile, projectName);
            projectResults.tests.push(testResult);
            projectResults.stats.total++;
            
            switch (testResult.status) {
              case 'passed':
                projectResults.stats.passed++;
                this.summary.passedTests++;
                break;
              case 'failed':
                projectResults.stats.failed++;
                this.summary.failedTests++;
                break;
              case 'skipped':
                projectResults.stats.skipped++;
                this.summary.skippedTests++;
                break;
              case 'flaky':
                projectResults.stats.flaky++;
                this.summary.flakyTests++;
                break;
            }
            
            this.summary.totalTests++;
          }
        }
      }
      
      // Process nested suites
      if (suite.suites) {
        this.processSuites(suite.suites, projectResults, projectName);
      }
    }
  }

  processTest(test, testFile, projectName) {
    const results = test.results || [];
    const lastResult = results[results.length - 1] || {};
    
    // Determine overall status
    let status = 'skipped';
    if (results.length > 0) {
      const statuses = results.map(r => r.status);
      if (statuses.every(s => s === 'passed')) {
        status = 'passed';
      } else if (statuses.some(s => s === 'failed')) {
        status = statuses.length > 1 ? 'flaky' : 'failed';
      } else if (statuses.some(s => s === 'skipped')) {
        status = 'skipped';
      }
    }

    // Calculate duration
    const duration = results.reduce((total, result) => total + (result.duration || 0), 0);

    return {
      project: projectName,
      file: testFile,
      title: test.title || 'Unknown Test',
      status,
      duration,
      retries: results.length - 1,
      error: lastResult.error ? lastResult.error.message : null
    };
  }

  generateDetailedReport() {
    this.log('\n📊 DETAILED TEST RESULTS ANALYSIS', 'bright');
    this.log('═'.repeat(120), 'cyan');

    // Overall summary
    this.log('\n📈 OVERALL TEST SUMMARY', 'bright');
    this.log('─'.repeat(80), 'cyan');
    
    const totalTests = this.summary.totalTests;
    const passRate = totalTests > 0 ? ((this.summary.passedTests / totalTests) * 100).toFixed(1) : 0;
    
    this.log(`Total Tests: ${totalTests}`, 'white');
    this.log(`✅ Passed: ${this.summary.passedTests} (${passRate}%)`, 'green');
    this.log(`❌ Failed: ${this.summary.failedTests}`, 'red');
    this.log(`⏭️  Skipped: ${this.summary.skippedTests}`, 'yellow');
    this.log(`🔄 Flaky: ${this.summary.flakyTests}`, 'magenta');

    // Per-project breakdown
    this.log('\n📋 PER-PROJECT BREAKDOWN', 'bright');
    this.log('─'.repeat(100), 'cyan');
    
    const projectHeaders = ['Project', 'Total', 'Passed', 'Failed', 'Skipped', 'Flaky', 'Success Rate'];
    const projectRows = [];

    for (const [projectName, project] of Object.entries(this.summary.projects)) {
      const successRate = project.stats.total > 0 ? 
        ((project.stats.passed / project.stats.total) * 100).toFixed(1) + '%' : 'N/A';
      
      projectRows.push([
        projectName,
        project.stats.total.toString(),
        project.stats.passed.toString(),
        project.stats.failed.toString(),
        project.stats.skipped.toString(),
        project.stats.flaky.toString(),
        successRate
      ]);
    }

    this.printTable(projectHeaders, projectRows);

    // Individual test results
    this.log('\n🔍 INDIVIDUAL TEST RESULTS', 'bright');
    this.log('─'.repeat(120), 'cyan');

    const testHeaders = ['Project', 'Test File', 'Test Name', 'Status', 'Duration', 'Retries'];
    const testRows = [];

    for (const [projectName, project] of Object.entries(this.summary.projects)) {
      for (const test of project.tests) {
        const statusIcon = this.getStatusIcon(test.status);
        const testName = test.title.length > 40 ? test.title.substring(0, 37) + '...' : test.title;
        
        testRows.push([
          projectName,
          test.file,
          testName,
          `${statusIcon} ${test.status.toUpperCase()}`,
          `${test.duration}ms`,
          test.retries.toString()
        ]);
      }
    }

    this.printTable(testHeaders, testRows);

    // Failed tests details
    const failedTests = [];
    for (const [projectName, project] of Object.entries(this.summary.projects)) {
      failedTests.push(...project.tests.filter(t => t.status === 'failed' || t.status === 'flaky'));
    }

    if (failedTests.length > 0) {
      this.log('\n❌ FAILED TESTS DETAILS', 'bright');
      this.log('─'.repeat(100), 'red');

      for (const test of failedTests) {
        this.log(`\n🔸 ${test.project} > ${test.file} > ${test.title}`, 'red');
        this.log(`   Status: ${test.status}`, 'white');
        this.log(`   Duration: ${test.duration}ms`, 'white');
        if (test.error) {
          this.log(`   Error: ${test.error}`, 'yellow');
        }
      }
    }

    // Performance analysis
    this.log('\n⚡ PERFORMANCE ANALYSIS', 'bright');
    this.log('─'.repeat(80), 'cyan');

    const allTests = [];
    for (const project of Object.values(this.summary.projects)) {
      allTests.push(...project.tests);
    }

    if (allTests.length > 0) {
      const durations = allTests.map(t => t.duration).sort((a, b) => a - b);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const medianDuration = durations[Math.floor(durations.length / 2)];
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      this.log(`Average Duration: ${avgDuration.toFixed(0)}ms`, 'white');
      this.log(`Median Duration: ${medianDuration}ms`, 'white');
      this.log(`Fastest Test: ${minDuration}ms`, 'green');
      this.log(`Slowest Test: ${maxDuration}ms`, 'red');

      // Find slowest tests
      const slowTests = allTests
        .filter(t => t.duration > avgDuration * 2)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);

      if (slowTests.length > 0) {
        this.log('\n🐌 SLOWEST TESTS:', 'yellow');
        for (const test of slowTests) {
          this.log(`   ${test.duration}ms - ${test.project} > ${test.file} > ${test.title}`, 'white');
        }
      }
    }
  }

  getStatusIcon(status) {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      case 'flaky': return '🔄';
      default: return '❓';
    }
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

  async parseAllResults() {
    const resultsDir = 'test-results';
    const projects = ['standalone-real', 'standalone-mock', 'e2e-real'];

    // Check if results directory exists
    if (!fs.existsSync(resultsDir)) {
      this.log('❌ test-results directory not found. Run tests first.', 'red');
      return false;
    }

    // Parse results for each project
    for (const project of projects) {
      const resultsFile = path.join(resultsDir, `${project}-results.json`);
      const playwrightData = this.parsePlaywrightResults(resultsFile);
      
      if (playwrightData) {
        const projectResults = this.extractTestResults(playwrightData, project);
        this.summary.projects[project] = projectResults;
        this.log(`✅ Parsed results for ${project}: ${projectResults.stats.total} tests`, 'green');
      } else {
        // Create empty project if no results
        this.summary.projects[project] = {
          name: project,
          tests: [],
          stats: { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 }
        };
        this.log(`⚠️  No results found for ${project}`, 'yellow');
      }
    }

    return true;
  }

  async run() {
    this.log('🔍 PLAYWRIGHT TEST RESULTS ANALYZER', 'bright');
    this.log('═'.repeat(60), 'cyan');

    const success = await this.parseAllResults();
    if (!success) {
      process.exit(1);
    }

    this.generateDetailedReport();

    // Save detailed JSON report
    const reportPath = 'test-results/detailed-analysis.json';
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.summary,
      analysis: {
        totalDuration: Object.values(this.summary.projects)
          .flatMap(p => p.tests)
          .reduce((sum, t) => sum + t.duration, 0),
        averageTestDuration: this.summary.totalTests > 0 ? 
          Object.values(this.summary.projects)
            .flatMap(p => p.tests)
            .reduce((sum, t) => sum + t.duration, 0) / this.summary.totalTests : 0
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n📄 Detailed analysis saved to: ${reportPath}`, 'green');

    // Exit with appropriate code
    if (this.summary.failedTests > 0) {
      this.log('\n💥 Some tests failed. Check the details above.', 'red');
      process.exit(1);
    } else {
      this.log('\n🎉 All tests passed successfully!', 'green');
      process.exit(0);
    }
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new TestResultsParser();
  analyzer.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = TestResultsParser;
