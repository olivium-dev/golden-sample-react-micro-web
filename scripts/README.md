# Deployment and Testing Scripts

## Overview

This directory contains automated scripts for deploying and testing the micro-frontend application.

## Scripts

### `deploy-and-test-iteratively.js`

Automated deployment and testing script that:

1. Triggers GitHub Actions deployment workflow
2. Monitors pipeline status (checks every 2 minutes)
3. Runs comprehensive Playwright tests after deployment completes
4. Validates:
   - Login functionality
   - MFE loading (at least one micro-frontend)
   - SSL certificates for both domains
   - API routing through Traefik (no direct backend port access)
5. Reports detailed results with specific error messages

## Usage

### Run Iterative Deployment and Testing

```bash
npm run deploy:iterate
```

This will:
- Trigger a new deployment
- Wait for it to complete
- Run all tests
- Report results

If tests fail, fix the issues in your code, commit, push, and run again.

### Manual Execution

```bash
node scripts/deploy-and-test-iteratively.js
```

## Test Criteria

### Success Criteria

The script considers deployment successful when ALL of the following pass:

- ✅ Login works without errors
- ✅ At least one MFE loads successfully
- ✅ SSL valid for `dev-creamat.fds-1.com`
- ✅ SSL valid for `golden-sample.dev-creamat.fds-1.com`
- ✅ No network requests to port 30001 (all routed through Traefik port 8090)
- ✅ No ERR_CONNECTION_REFUSED errors
- ✅ No "Failed to fetch" errors in console

### Iteration Workflow

1. Run `npm run deploy:iterate`
2. Script triggers deployment and monitors progress
3. After deployment, script runs tests
4. If tests pass:
   - Success report is generated
   - Script exits with code 0
5. If tests fail:
   - Detailed error report is generated
   - Fix the identified issues
   - Commit and push your changes
   - Run `npm run deploy:iterate` again
6. Repeat steps 1-5 until all tests pass

## Configuration

The script configuration can be found in `scripts/deploy-and-test-iteratively.js`:

```javascript
const CONFIG = {
  maxAttempts: 10,                    // Maximum iterations
  checkIntervalMs: 2 * 60 * 1000,     // Check pipeline every 2 minutes
  testServerIP: '192.168.2.73',       // Test server IP
  traefikPort: '8090',                // Traefik routing port
  mainDomain: 'dev-creamat.fds-1.com',
  subdomain: 'golden-sample.dev-creamat.fds-1.com'
};
```

## Output

The script generates:

- **Console output**: Real-time progress and detailed test results
- **Screenshots**: Saved as `test-iteration-{N}.png` for each iteration
- **Exit codes**:
  - `0`: All tests passed
  - `1`: Tests failed or error occurred

## Requirements

- Node.js (v18+)
- Playwright installed (`npm install`)
- GitHub CLI (`gh`) installed and authenticated
- Access to GitHub repository with workflow permissions

## Troubleshooting

### Pipeline takes too long

The script waits up to 60 minutes for pipeline completion. If your deployment takes longer, increase `maxWaitAttempts` in the configuration.

### SSL tests fail

If SSL tests fail but certificates exist on the server:
1. Run the SSL certificate check workflow manually: `.github/workflows/ssl-certificate-check.yml`
2. Verify certificates are properly installed
3. Check nginx configuration is correctly proxying to the subdomain

### API routing tests fail

If you see requests to port 30001:
1. Verify the latest code changes were deployed
2. Check that containers are using the new images
3. Review the deployment workflow logs

### Cannot trigger deployment

Ensure:
1. GitHub CLI is authenticated: `gh auth status`
2. You have permissions to trigger workflows
3. The workflow file exists and is valid

## Related Workflows

- **SSL Certificate Check**: `.github/workflows/ssl-certificate-check.yml`
- **Main Deployment**: `.github/workflows/deploy-with-cloudflare-tunnel.yml`

## Notes

- The script is designed for manual iteration, not fully automated continuous deployment
- Each iteration requires successful pipeline completion before testing
- Maximum 10 iterations to prevent infinite loops
- All operations are logged to console for debugging

