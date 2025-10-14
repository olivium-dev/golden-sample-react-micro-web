# Run Scripts Documentation

This document describes the convenience scripts available for managing the micro-frontend platform.

## Available Scripts

### `./run.sh` - Start All Services

Stops any currently running services and starts all backend and frontend services in the background.

**Usage:**
```bash
./run.sh
```

**What it does:**
1. Kills all processes on ports 3000-3004 (frontend) and 8000 (backend)
2. Kills any remaining webpack-dev-server and FastAPI processes
3. Installs missing Python dependencies (email-validator)
4. Starts the FastAPI backend service on port 8000
5. Starts all 5 frontend micro-services on ports 3000-3004
6. All services run in the background with output redirected to log files

**Output:**
- Services start in background and the script completes immediately
- All services take 15-30 seconds to fully start up
- Logs are written to individual log files for each service

**Service URLs:**
- Backend (FastAPI): http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Container App: http://localhost:3000
- User Management: http://localhost:3001
- Data Grid: http://localhost:3002
- Analytics: http://localhost:3003
- Settings: http://localhost:3004

---

### `./stop.sh` - Stop All Services

Stops all running backend and frontend services.

**Usage:**
```bash
./stop.sh
```

**What it does:**
1. Kills all processes on ports 3000-3004 (frontend) and 8000 (backend)
2. Kills any remaining webpack-dev-server processes
3. Kills any remaining FastAPI/Python processes

---

## Log Files

All services write their output to log files in their respective directories:

```
backend/mock-data-service/backend.log     - Backend API logs
frontend/container/container.log          - Container app logs
frontend/user-management-app/user-management.log - User Management logs
frontend/data-grid-app/data-grid.log      - Data Grid logs
frontend/analytics-app/analytics.log      - Analytics logs
frontend/settings-app/settings.log        - Settings logs
```

### Viewing Logs

To view logs in real-time:

```bash
# Backend logs
tail -f backend/mock-data-service/backend.log

# Container app logs
tail -f frontend/container/container.log

# All frontend logs at once
tail -f frontend/*//*.log

# Check for errors in all logs
grep -i error backend/mock-data-service/backend.log frontend/*//*.log
```

---

## Checking Service Status

### Check if services are running:

```bash
# Check backend health
curl http://localhost:8000/health

# Check all frontend services
for port in 3000 3001 3002 3003 3004; do
  echo -n "Port $port: "
  curl -s -I http://localhost:$port | head -1
done
```

### Check which processes are using the ports:

```bash
# Check all service ports
lsof -i :3000,3001,3002,3003,3004,8000
```

---

## Troubleshooting

### Services not starting

1. **Check logs for errors:**
   ```bash
   tail -100 backend/mock-data-service/backend.log
   tail -100 frontend/container/container.log
   ```

2. **Verify ports are available:**
   ```bash
   lsof -i :8000  # Backend
   lsof -i :3000  # Container
   ```

3. **Manually stop services and try again:**
   ```bash
   ./stop.sh
   sleep 3
   ./run.sh
   ```

### Port already in use

If you see "EADDRINUSE" errors, run the stop script first:
```bash
./stop.sh
sleep 2
./run.sh
```

### Backend fails to start

Check if Python dependencies are installed:
```bash
cd backend/mock-data-service
pip3 install -r requirements.txt
```

### Frontend fails to build

Check if npm dependencies are installed for each app:
```bash
cd frontend/container && npm install
cd ../user-management-app && npm install
cd ../data-grid-app && npm install
cd ../analytics-app && npm install
cd ../settings-app && npm install
```

### Module Federation errors

Look for "Unable to compile federated types" warnings in the logs. These are typically non-fatal and the apps should still work. The issue is with TypeScript compilation in Module Federation, but the runtime JavaScript still works.

---

## Development Workflow

### Typical workflow:

1. **Start all services:**
   ```bash
   ./run.sh
   ```

2. **Wait 15-30 seconds for services to start**

3. **Open browser to test:**
   - Main app: http://localhost:3000
   - API docs: http://localhost:8000/docs

4. **Monitor logs if needed:**
   ```bash
   tail -f frontend/container/container.log
   ```

5. **Stop services when done:**
   ```bash
   ./stop.sh
   ```

### Working on a specific micro-frontend:

If you're developing a specific micro-frontend and want to see its logs in real-time:

```bash
# Stop all services first
./stop.sh

# Start all services except the one you're working on
# (manually start the others in background)

# Start your service in foreground to see live output
cd frontend/user-management-app
npm start
```

---

## Script Internals

### How services are backgrounded

The scripts use `nohup` and subshells `(cd ... && command &)` to ensure:
- Services continue running after the script exits
- Each service runs in its own process group
- Output is redirected to log files
- The script returns control immediately

### Process management

Services are identified and stopped by:
1. **Port numbers**: Using `lsof -ti:PORT` to find processes
2. **Process names**: Using `pkill -f` to match process command lines

This ensures clean shutdown even if processes are orphaned.

---

## Quick Reference

```bash
# Start everything
./run.sh

# Stop everything  
./stop.sh

# Check status
curl http://localhost:8000/health
curl http://localhost:3000

# View logs
tail -f backend/mock-data-service/backend.log
tail -f frontend/container/container.log

# Find errors
grep -i error backend/mock-data-service/backend.log frontend/*//*.log
```

---

## Notes

- The scripts are designed to be idempotent - you can run `./run.sh` multiple times safely
- All services run in the background, so closing the terminal won't stop them
- Use `./stop.sh` to cleanly shut down all services
- Log files accumulate over time - consider clearing them periodically

