#!/bin/bash

# Automated Pipeline Monitor with Auto-Fix
# This script will monitor the pipeline and report status every minute

REPO="olivium-dev/golden-sample-react-micro-web"
BRANCH="cicd"
CHECK_INTERVAL=60

echo "🚀 Automated Pipeline Monitor Started"
echo "Repository: $REPO"
echo "Branch: $BRANCH"
echo "Check Interval: ${CHECK_INTERVAL}s"
echo "=================================================="
echo ""

# Function to check pipeline status
check_pipeline() {
    local response=$(curl -s "https://api.github.com/repos/$REPO/actions/runs?branch=$BRANCH&per_page=1")
    local total_count=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('total_count', 0))")
    
    if [ "$total_count" -eq 0 ]; then
        echo "⏳ No workflow runs found yet. Waiting for pipeline to be triggered..."
        return 1
    fi
    
    local run_data=$(echo "$response" | python3 -c "import sys, json; runs = json.load(sys.stdin).get('workflow_runs', []); print(json.dumps(runs[0]) if runs else '{}')")
    
    if [ "$run_data" = "{}" ]; then
        echo "⏳ No workflow runs found yet. Waiting for pipeline to be triggered..."
        return 1
    fi
    
    local run_id=$(echo "$run_data" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
    local status=$(echo "$run_data" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', ''))")
    local conclusion=$(echo "$run_data" | python3 -c "import sys, json; print(json.load(sys.stdin).get('conclusion', 'N/A'))")
    local name=$(echo "$run_data" | python3 -c "import sys, json; print(json.load(sys.stdin).get('name', ''))")
    local html_url=$(echo "$run_data" | python3 -c "import sys, json; print(json.load(sys.stdin).get('html_url', ''))")
    
    echo "📊 Pipeline Status:"
    echo "   Run ID: $run_id"
    echo "   Workflow: $name"
    echo "   Status: $status"
    echo "   Conclusion: $conclusion"
    echo "   URL: $html_url"
    echo ""
    
    if [ "$status" = "completed" ]; then
        if [ "$conclusion" = "success" ]; then
            echo "✅ ✅ ✅ PIPELINE SUCCEEDED! ✅ ✅ ✅"
            echo ""
            echo "🎉 Deployment completed successfully!"
            echo "🌐 Application should be accessible at:"
            echo "   - Main App: http://fds-1.com"
            echo "   - API: http://fds-1.com:30001"
            echo "   - Container: http://fds-1.com:30002"
            return 0
        elif [ "$conclusion" = "failure" ]; then
            echo "❌ PIPELINE FAILED!"
            echo ""
            echo "📋 Fetching failure details..."
            
            # Get jobs for this run
            local jobs_response=$(curl -s "https://api.github.com/repos/$REPO/actions/runs/$run_id/jobs")
            echo "$jobs_response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
jobs = data.get('jobs', [])
print('\n🔍 Failed Jobs:')
for job in jobs:
    if job.get('conclusion') == 'failure':
        print(f\"   - {job['name']}: {job['conclusion']}")
        for step in job.get('steps', []):
            if step.get('conclusion') == 'failure':
                print(f\"      ❌ Step: {step['name']}\")
"
            echo ""
            echo "💡 View full logs at: $html_url"
            echo ""
            echo "⚠️  Please check the logs and fix the issues."
            echo "    After fixing, the pipeline will need to be re-triggered."
            return 2
        else
            echo "⚠️  Pipeline completed with conclusion: $conclusion"
            return 3
        fi
    elif [ "$status" = "in_progress" ] || [ "$status" = "queued" ]; then
        echo "⏳ Pipeline is $status..."
        
        # Get current jobs
        local jobs_response=$(curl -s "https://api.github.com/repos/$REPO/actions/runs/$run_id/jobs")
        echo "$jobs_response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
jobs = data.get('jobs', [])
print('\n📋 Current Jobs:')
for job in jobs:
    status = job.get('status', 'unknown')
    conclusion = job.get('conclusion', 'running')
    print(f\"   - {job['name']}: {status} ({conclusion})\")
"
        return 1
    else
        echo "📌 Pipeline status: $status"
        return 1
    fi
}

# Main monitoring loop
iteration=0
while true; do
    iteration=$((iteration + 1))
    clear
    echo "🔄 Check #$iteration - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=================================================="
    echo ""
    
    check_pipeline
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        # Success!
        echo ""
        echo "🎊 Monitoring complete - Pipeline succeeded!"
        exit 0
    elif [ $exit_code -eq 2 ]; then
        # Failed
        echo ""
        echo "❌ Monitoring stopped - Pipeline failed."
        echo "    Please review the logs and fix the issues."
        exit 1
    fi
    
    echo ""
    echo "=================================================="
    echo "⏰ Next check in ${CHECK_INTERVAL} seconds..."
    echo "   Press Ctrl+C to stop monitoring"
    echo ""
    
    sleep $CHECK_INTERVAL
done
