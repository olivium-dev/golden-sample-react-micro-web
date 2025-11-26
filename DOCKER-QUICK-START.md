# Docker Quick Start Guide

## 🚀 One Command to Rule Them All

```bash
./scripts/docker-rebuild-all.sh
```

This script:
1. ✅ Stops all containers
2. ✅ Cleans up old images
3. ✅ Rebuilds all images in parallel
4. ✅ Starts services
5. ✅ Tests all endpoints
6. ✅ Shows status

---

## 📋 Available Scripts

### Complete Rebuild (Use This Most Often)

```bash
./scripts/docker-rebuild-all.sh
```

**What it does:**
- Stops everything
- Removes old images
- Rebuilds all images (parallel)
- Starts services
- Tests endpoints

**When to use:**
- Code changes
- Dependency updates
- After git pull
- When things break

### First Time Setup

```bash
# Build images once
docker compose -f docker-compose.simple.yml build --parallel

# Start services
docker compose -f docker-compose.run.yml up -d
```

### Reset Docker (If Out of Space)

```bash
./scripts/reset-docker.sh
```

**What it does:**
- Stops Docker Desktop
- Removes virtual disk data
- Restarts Docker
- Cleans everything

---

## 🎯 Daily Commands

### Start Services

```bash
docker compose -f docker-compose.run.yml up -d
```

### Stop Services

```bash
docker compose -f docker-compose.run.yml down
```

### View Logs

```bash
# All services
docker compose -f docker-compose.run.yml logs -f

# Specific service
docker compose -f docker-compose.run.yml logs -f container-app
```

### Restart Services

```bash
# All services
docker compose -f docker-compose.run.yml restart

# Specific service
docker compose -f docker-compose.run.yml restart container-app
```

### Check Status

```bash
docker ps
```

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| **Main Application** | http://localhost |
| **Traefik Dashboard** | http://localhost:8080 |
| **User Management** | http://localhost/remoteEntry-user.js |
| **Data Grid** | http://localhost/remoteEntry-data-grid.js |
| **Analytics** | http://localhost/remoteEntry-analytics.js |
| **Settings** | http://localhost/remoteEntry-settings.js |
| **Orders** | http://localhost/remoteEntry-orders.js |

---

## 🔧 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose -f docker-compose.run.yml logs

# Rebuild everything
./scripts/docker-rebuild-all.sh
```

### Out of Space Error

```bash
# Option 1: Clean up
docker system prune -af
docker builder prune -af

# Option 2: Reset Docker
./scripts/reset-docker.sh

# Option 3: Increase Docker disk space
# See INCREASE-DOCKER-SPACE.md
```

### Port Already in Use

```bash
# Check what's using port 80
lsof -i :80

# Check what's using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Image Not Found

```bash
# Rebuild missing image
docker compose -f docker-compose.simple.yml build service-name

# Or rebuild all
./scripts/docker-rebuild-all.sh
```

---

## 📊 Check Docker Usage

```bash
# Disk usage
docker system df

# Detailed breakdown
docker system df -v

# List images
docker images | grep creamati-cms

# List containers
docker ps -a
```

---

## 🧹 Cleanup Commands

### Remove All Containers

```bash
docker compose -f docker-compose.run.yml down
```

### Remove Old Images

```bash
docker images | grep creamati-cms | awk '{print $3}' | xargs docker rmi -f
```

### Clean Everything

```bash
docker system prune -af
docker builder prune -af
```

### Nuclear Option (Reset Everything)

```bash
./scripts/reset-docker.sh
```

---

## 📝 Workflow Examples

### After Git Pull

```bash
# Rebuild and restart
./scripts/docker-rebuild-all.sh
```

### After Changing Code

```bash
# Rebuild specific service
docker compose -f docker-compose.simple.yml build container-app

# Restart it
docker compose -f docker-compose.run.yml restart container-app
```

### Starting Fresh

```bash
# Stop everything
docker compose -f docker-compose.run.yml down

# Clean up
docker system prune -af

# Rebuild all
./scripts/docker-rebuild-all.sh
```

### Daily Development

```bash
# Morning: Start services
docker compose -f docker-compose.run.yml up -d

# During day: View logs
docker compose -f docker-compose.run.yml logs -f

# Evening: Stop services
docker compose -f docker-compose.run.yml down
```

---

## 🎯 Best Practices

### DO

✅ Use `./scripts/docker-rebuild-all.sh` when code changes
✅ Use `docker-compose.run.yml` for daily start/stop
✅ Clean up regularly with `docker system prune -af`
✅ Check logs when things break
✅ Test endpoints after rebuilding

### DON'T

❌ Don't use `docker compose up` without `-d` (runs in foreground)
❌ Don't forget to stop services when done
❌ Don't rebuild if just restarting
❌ Don't use `docker-compose.simple.yml` for daily usage
❌ Don't ignore "out of space" errors

---

## 🚨 Emergency Commands

### Everything is Broken

```bash
# Nuclear reset
./scripts/reset-docker.sh

# Then rebuild
./scripts/docker-rebuild-all.sh
```

### Docker Won't Start

```bash
# Restart Docker Desktop
osascript -e 'quit app "Docker"'
sleep 3
open -a Docker
```

### Can't Connect to Services

```bash
# Check if running
docker ps

# Check logs
docker compose -f docker-compose.run.yml logs

# Restart
docker compose -f docker-compose.run.yml restart
```

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `docker-compose.run.yml` | Run services (use daily) |
| `docker-compose.simple.yml` | Build images (use once) |
| `scripts/docker-rebuild-all.sh` | Complete rebuild |
| `scripts/reset-docker.sh` | Reset Docker data |
| `DOCKER-PROPER-WORKFLOW.md` | Detailed guide |
| `INCREASE-DOCKER-SPACE.md` | Fix space issues |

---

## ⚡ Quick Reference

```bash
# Rebuild everything
./scripts/docker-rebuild-all.sh

# Start services
docker compose -f docker-compose.run.yml up -d

# Stop services
docker compose -f docker-compose.run.yml down

# View logs
docker compose -f docker-compose.run.yml logs -f

# Check status
docker ps

# Clean up
docker system prune -af

# Reset Docker
./scripts/reset-docker.sh
```

---

## 🎉 Summary

**Most common command:**
```bash
./scripts/docker-rebuild-all.sh
```

This handles everything automatically!

**Access your app:**
- http://localhost (Main app)
- http://localhost:8080 (Traefik dashboard)

**Need help?** Check the logs:
```bash
docker compose -f docker-compose.run.yml logs -f
```

That's it! 🚀

