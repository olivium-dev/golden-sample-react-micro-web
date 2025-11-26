# Docker Desktop Disk Space Configuration Guide

## Current Status

- **System Disk Space**: 53GB available (23% used)
- **Docker Root Dir**: `/Volumes/Extreme Pro/docker-data` (External drive)
- **Issue**: Docker ran out of space during build (`ENOSPC: no space left on device`)

## Solution: Increase Docker Desktop Disk Space

### Method 1: Using Docker Desktop GUI (Recommended)

#### Step 1: Open Docker Desktop Settings
1. Click the **Docker icon** in the menu bar (top right)
2. Select **Settings** (or **Preferences**)

#### Step 2: Navigate to Resources
1. Click on **Resources** in the left sidebar
2. Click on **Advanced** (or **Disk image size**)

#### Step 3: Increase Disk Space
1. Find the **Disk image size** slider or input field
2. Current limit is likely **64GB** or less
3. **Recommended**: Increase to **120GB** or **150GB**
4. You have 53GB available, so you can safely allocate more

#### Step 4: Apply Changes
1. Click **Apply & Restart**
2. Docker Desktop will restart (takes 1-2 minutes)
3. Wait for Docker to fully restart before building again

---

### Method 2: Using Docker Desktop Settings File (Advanced)

If GUI doesn't work, you can edit the settings file directly:

#### Step 1: Quit Docker Desktop
```bash
osascript -e 'quit app "Docker"'
```

#### Step 2: Edit Settings File
```bash
# Open Docker Desktop settings
open ~/Library/Group\ Containers/group.com.docker/settings.json
```

#### Step 3: Find and Modify
Look for these settings and increase the values:

```json
{
  "diskSizeMiB": 122880,  // 120GB (increase from default 64GB)
  "memoryMiB": 8192,      // 8GB RAM (optional)
  "cpus": 4               // 4 CPUs (optional)
}
```

**Note**: `diskSizeMiB` is in Mebibytes (MiB)
- 64GB = 65536 MiB
- 120GB = 122880 MiB
- 150GB = 153600 MiB
- 200GB = 204800 MiB

#### Step 4: Restart Docker
```bash
open -a Docker
```

Wait for Docker to fully start (green icon in menu bar).

---

### Method 3: Move Docker Data to Different Location (If External Drive is Full)

If your external drive `/Volumes/Extreme Pro` is full, move Docker to main disk:

#### Step 1: Quit Docker
```bash
osascript -e 'quit app "Docker"'
```

#### Step 2: Move Docker Data
```bash
# Backup current location
sudo mv "/Volumes/Extreme Pro/docker-data" ~/docker-data-backup

# Docker will recreate data directory on main disk on next start
```

#### Step 3: Reset Docker Desktop
1. Open Docker Desktop
2. Go to **Troubleshoot** (bug icon)
3. Click **Clean / Purge data**
4. Click **Reset to factory defaults**

This will reset Docker to use the default location on your main disk.

---

## Verification Steps

After increasing disk space, verify the changes:

### Check Docker Info
```bash
docker info | grep -i "data space\|storage driver"
```

### Check Available Space
```bash
docker system df
```

### Test Build
```bash
cd /Users/oudaykhaled/Desktop/cremat-cms/creamati-cms
docker-compose -f docker-compose.bff.traefik.yml build
```

---

## Recommended Settings

Based on your system (53GB available):

| Setting | Recommended Value | Reason |
|---------|------------------|---------|
| **Disk Size** | 100-120GB | Enough for builds + images |
| **Memory (RAM)** | 6-8GB | Good for multiple containers |
| **CPUs** | 4-6 cores | Faster builds |
| **Swap** | 2GB | Helps with memory spikes |

---

## Quick Fix Commands

### Clean Up Docker (Before Increasing Space)
```bash
# Remove all unused data
docker system prune -a -f --volumes

# Remove specific items
docker image prune -a -f      # Remove unused images
docker container prune -f     # Remove stopped containers
docker volume prune -f        # Remove unused volumes
docker network prune -f       # Remove unused networks
```

### Check What's Using Space
```bash
# Detailed breakdown
docker system df -v

# Images taking most space
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | sort -k 3 -h

# Large volumes
docker volume ls -q | xargs docker volume inspect | grep -A 5 "Mountpoint"
```

---

## Current Docker Usage

After cleanup, you have:
```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          0         0         0B        0B
Containers      0         0         0B        0B
Local Volumes   0         0         0B        0B
Build Cache     0         0         0B        0B
```

This is clean! Now you just need to increase the disk limit.

---

## Troubleshooting

### Issue: "No space left on device" during build
**Solution**: 
1. Increase disk size in Docker Desktop settings
2. Clean up unused images: `docker system prune -a -f`
3. Check external drive space if using one

### Issue: Can't find disk size setting
**Solution**: 
- Ensure you're using Docker Desktop (not Docker Engine)
- Update Docker Desktop to latest version
- Look under: Settings → Resources → Advanced

### Issue: Changes not taking effect
**Solution**:
1. Completely quit Docker: `osascript -e 'quit app "Docker"'`
2. Wait 10 seconds
3. Restart: `open -a Docker`
4. Wait for green icon in menu bar

### Issue: External drive is full
**Solution**:
1. Move Docker data to main disk (see Method 3)
2. Or clean up external drive to free space
3. Or get larger external drive

---

## After Increasing Space

Once you've increased Docker's disk space:

### 1. Verify Docker is Running
```bash
docker info > /dev/null 2>&1 && echo "✅ Docker is running" || echo "❌ Docker is not running"
```

### 2. Build with Docker Compose
```bash
cd /Users/oudaykhaled/Desktop/cremat-cms/creamati-cms

# Build all services
docker-compose -f docker-compose.bff.traefik.yml build

# Start services
docker-compose -f docker-compose.bff.traefik.yml up -d
```

### 3. Access Services
- **All apps via Traefik**: http://localhost
- **Traefik Dashboard**: http://localhost:8080

---

## Alternative: Continue Using run.sh

If Docker space is still an issue, you can continue using the local development script:

```bash
# Start all services locally (no Docker)
./run.sh

# Access services on individual ports
# Container: http://localhost:3000
# User Management: http://localhost:3001
# Data Grid: http://localhost:3002
# Analytics: http://localhost:3003
# Settings: http://localhost:3004
# Orders: http://localhost:3005
# Catalog: http://localhost:3006
```

This works perfectly for development and doesn't require Docker.

---

## Summary

**Immediate Action Required:**
1. Open Docker Desktop
2. Go to Settings → Resources → Advanced
3. Increase "Disk image size" to **120GB**
4. Click "Apply & Restart"
5. Wait for Docker to restart
6. Run: `docker-compose -f docker-compose.bff.traefik.yml build`

**Current Status:**
- ✅ All services running via `./run.sh`
- ✅ System has 53GB available space
- ⚠️ Docker needs disk limit increased
- ✅ Docker cleaned up (273MB freed)

You're ready to increase Docker's disk allocation! 🚀

