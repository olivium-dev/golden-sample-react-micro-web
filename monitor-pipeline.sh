#!/bin/bash

# Monitor GitHub Actions Pipeline
# Usage: ./monitor-pipeline.sh

REPO="olivium-dev/golden-sample-react-micro-web"
BRANCH="cicd"

echo "🔍 Monitoring GitHub Actions Pipeline for $REPO (branch: $BRANCH)"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it with: brew install gh"
    echo "Then authenticate with: gh auth login"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Monitor loop
while true; do
    clear
    echo "🔍 GitHub Actions Pipeline Monitor"
    echo "Repository: $REPO"
    echo "Branch: $BRANCH"
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=================================================="
    echo ""
    
    # Get latest workflow runs
    echo "📊 Latest Workflow Runs:"
    gh run list --repo $REPO --branch $BRANCH --limit 5 --json databaseId,displayTitle,status,conclusion,createdAt,updatedAt,workflowName | \
        jq -r '.[] | "ID: \(.databaseId) | \(.workflowName) | Status: \(.status) | Conclusion: \(.conclusion // "N/A") | Created: \(.createdAt)"'
    
    echo ""
    echo "=================================================="
    echo ""
    
    # Get the latest run details
    LATEST_RUN=$(gh run list --repo $REPO --branch $BRANCH --limit 1 --json databaseId,status,conclusion,displayTitle,workflowName --jq '.[0]')
    
    if [ -n "$LATEST_RUN" ]; then
        RUN_ID=$(echo $LATEST_RUN | jq -r '.databaseId')
        STATUS=$(echo $LATEST_RUN | jq -r '.status')
        CONCLUSION=$(echo $LATEST_RUN | jq -r '.conclusion // "N/A"')
        TITLE=$(echo $LATEST_RUN | jq -r '.displayTitle')
        WORKFLOW=$(echo $LATEST_RUN | jq -r '.workflowName')
        
        echo "🎯 Latest Run Details:"
        echo "   Run ID: $RUN_ID"
        echo "   Workflow: $WORKFLOW"
        echo "   Title: $TITLE"
        echo "   Status: $STATUS"
        echo "   Conclusion: $CONCLUSION"
        echo ""
        
        if [ "$STATUS" = "completed" ]; then
            if [ "$CONCLUSION" = "success" ]; then
                echo "✅ Pipeline SUCCEEDED!"
                echo ""
                echo "🎉 Deployment completed successfully!"
                exit 0
            elif [ "$CONCLUSION" = "failure" ]; then
                echo "❌ Pipeline FAILED!"
                echo ""
                echo "📋 Fetching failure logs..."
                echo ""
                gh run view $RUN_ID --repo $REPO --log-failed
                echo ""
                echo "💡 Check the logs above for errors"
                exit 1
            else
                echo "⚠️  Pipeline completed with conclusion: $CONCLUSION"
            fi
        elif [ "$STATUS" = "in_progress" ]; then
            echo "⏳ Pipeline is running..."
            echo ""
            echo "📋 Current Jobs:"
            gh run view $RUN_ID --repo $REPO --json jobs --jq '.jobs[] | "   - \(.name): \(.status) (\(.conclusion // "running"))"'
        else
            echo "📌 Pipeline status: $STATUS"
        fi
    else
        echo "⚠️  No workflow runs found for branch $BRANCH"
        echo ""
        echo "💡 Please trigger the workflow manually:"
        echo "   1. Go to: https://github.com/$REPO/actions"
        echo "   2. Click 'Deploy Micro-Frontend Sample to VPS'"
        echo "   3. Click 'Run workflow'"
        echo "   4. Select branch: $BRANCH"
        echo "   5. Fill in parameters and run"
    fi
    
    echo ""
    echo "=================================================="
    echo "⏰ Next check in 60 seconds... (Ctrl+C to stop)"
    echo ""
    
    sleep 60
done
