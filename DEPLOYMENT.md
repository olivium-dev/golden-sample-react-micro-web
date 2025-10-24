# 🚀 Deployment Guide

This project includes GitHub Actions workflows for automatic deployment of all micro-frontends to Vercel.

## 📋 Setup Instructions

### 1. Create Vercel Projects

Create separate Vercel projects for each micro-frontend:

1. **Container App** - Main application shell
2. **User Management** - User management micro-frontend  
3. **Data Grid** - Data grid micro-frontend
4. **Analytics** - Analytics dashboard micro-frontend
5. **Settings** - Settings panel micro-frontend

### 2. Configure GitHub Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID_CONTAINER=container_project_id
VERCEL_PROJECT_ID_USER_MGMT=user_mgmt_project_id
VERCEL_PROJECT_ID_DATA_GRID=data_grid_project_id
VERCEL_PROJECT_ID_ANALYTICS=analytics_project_id
VERCEL_PROJECT_ID_SETTINGS=settings_project_id
```

### 3. Get Vercel Credentials

#### Vercel Token:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile → Settings → Tokens
3. Create a new token with appropriate scope

#### Organization ID:
1. Go to your Vercel team settings
2. Copy the Team ID (this is your ORG_ID)

#### Project IDs:
1. Go to each Vercel project
2. Settings → General → Project ID

### 4. Update Container App URLs

After deployment, update the iframe URLs in `frontend/container/src/App.tsx`:

```typescript
// Replace localhost URLs with your deployed URLs
const microFrontendUrls = {
  'user-management': 'https://your-user-mgmt.vercel.app',
  'data-grid': 'https://your-data-grid.vercel.app',
  'analytics': 'https://your-analytics.vercel.app',
  'settings': 'https://your-settings.vercel.app'
};
```

## 🔄 Deployment Workflows

### Individual App Deployment
- **Trigger**: Push to main branch with changes in specific app directory
- **Files**: `.github/workflows/deploy-[app-name].yml`
- **Action**: Builds and deploys only the changed micro-frontend

### Full Deployment
- **Trigger**: Push to main branch or manual trigger
- **File**: `.github/workflows/deploy-all.yml`
- **Action**: Builds, tests, and deploys all micro-frontends

## 🌐 Deployment URLs

After setup, your applications will be available at:

- **Container**: `https://your-container.vercel.app`
- **User Management**: `https://your-user-mgmt.vercel.app`
- **Data Grid**: `https://your-data-grid.vercel.app`
- **Analytics**: `https://your-analytics.vercel.app`
- **Settings**: `https://your-settings.vercel.app`

## 🔧 Alternative Deployment Platforms

### Netlify
Replace Vercel action with:
```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2.0
  with:
    publish-dir: './build'
    production-branch: main
    github-token: ${{ secrets.GITHUB_TOKEN }}
    deploy-message: "Deploy from GitHub Actions"
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### GitHub Pages
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./build
```

## 🚨 Important Notes

1. **CORS Configuration**: Ensure your deployed micro-frontends allow iframe embedding
2. **Environment Variables**: Update any hardcoded localhost URLs
3. **Build Optimization**: Consider enabling build caching for faster deployments
4. **Monitoring**: Set up monitoring for each deployed micro-frontend

## 📊 Deployment Status

Check deployment status in the GitHub Actions tab of your repository. Each micro-frontend deploys independently, ensuring faster deployments and better isolation.
