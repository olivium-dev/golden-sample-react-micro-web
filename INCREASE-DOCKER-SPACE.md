# 🚀 Quick Guide: Increase Docker Desktop Disk Space

## ⚠️ Current Issue

Your Docker builds are failing with:
```
Error: no space left on device
```

**You have 59GB free on your Mac, but Docker Desktop has a limited allocation.**

---

## ✅ Solution: Increase Docker Desktop Disk Space

### Step-by-Step Instructions

#### 1. Open Docker Desktop

Click the Docker icon in your menu bar (top right) → Click "Dashboard"

Or open Docker Desktop from Applications

#### 2. Go to Settings

Click the **⚙️ gear icon** (Settings) in the top right corner

#### 3. Navigate to Resources

In the left sidebar, click:
- **Resources**
- Then click **Advanced** (or **Disk**)

#### 4. Increase Virtual Disk Limit

You'll see a slider for "Virtual disk limit" or "Disk image size"

**Current value**: Likely 32GB or less
**Recommended value**: **64GB** (or higher if you have space)

**Move the slider to 64GB**

#### 5. Apply Changes

1. Click **"Apply & Restart"** button at the bottom
2. Docker Desktop will restart (takes 1-2 minutes)
3. Wait for Docker to fully start

#### 6. Verify

Open Terminal and run:

```bash
docker system df
```

You should see more space available.

---

## 📊 Recommended Settings

### For Your Project

| Setting | Recommended Value | Why |
|---------|------------------|-----|
| **Disk Space** | 64GB | Enough for builds + images |
| **Memory** | 4GB | Good for 7 services |
| **CPUs** | 4 | Fast builds |
| **Swap** | 1GB | Buffer for memory |

---

## 🎯 After Increasing Space

### Run These Commands

```bash
# Go to project directory
cd /Users/oudaykhaled/Desktop/cremat-cms/creamati-cms

# Clean up old Docker data
docker system prune -a -f

# Build and dockerize (Simple approach)
./scripts/build-and-dockerize.sh

# Start services with Traefik
docker-compose -f docker-compose.simple.yml up -d

# Access application
open http://localhost

# View Traefik dashboard
open http://localhost:8080
```

---

## 🔍 Verification Commands

### Check Docker Space

```bash
# View Docker disk usage
docker system df

# View detailed breakdown
docker system df -v
```

### Check Services

```bash
# List running containers
docker ps

# Check logs
docker-compose -f docker-compose.simple.yml logs -f

# Check Traefik routing
open http://localhost:8080
```

---

## ❓ Troubleshooting

### "I can't find the Virtual disk limit setting"

Different Docker Desktop versions have different layouts:

- **Newer versions**: Settings → Resources → Advanced → Virtual disk limit
- **Older versions**: Settings → Resources → Disk → Disk image size
- **Some versions**: Settings → Resources → Advanced → Disk image location

Look for a slider or input field with "disk" or "storage" in the name.

### "The slider won't go past 32GB"

You might need to:
1. Free up space on your Mac
2. Check if Docker Desktop is using a custom disk image location
3. Update Docker Desktop to the latest version

### "Docker won't restart after changing settings"

1. Force quit Docker Desktop
2. Reopen Docker Desktop
3. Wait for it to fully start (whale icon should be steady)
4. Try the settings change again

### "Still getting 'no space left on device'"

```bash
# Clean everything
docker system prune -a -f --volumes

# Check space again
docker system df

# Verify Docker settings were applied
# (Open Docker Desktop → Settings → Resources → Advanced)
```

---

## 📱 Visual Reference

### Where to Find Settings

```
Docker Desktop Window
├── Top Bar
│   └── ⚙️ Settings (gear icon) ← CLICK HERE
│
└── Settings Window
    ├── Left Sidebar
    │   ├── General
    │   ├── Resources ← CLICK HERE
    │   │   ├── Advanced ← CLICK HERE
    │   │   │   └── Virtual disk limit ← ADJUST THIS
    │   │   └── Disk
    │   ├── Docker Engine
    │   └── ...
    └── Bottom
        └── [Apply & Restart] ← CLICK WHEN DONE
```

---

## 🎉 Expected Results

### Before

```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          0         0         70.4GB    70.4GB (100%)
Containers      0         0         0B        0B
Local Volumes   0         0         0B        0B
Build Cache     0         0         0B        0B

Error: no space left on device
```

### After

```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          7         7         350MB     0B (0%)
Containers      7         7         50MB      0B (0%)
Local Volumes   0         0         0B        0B
Build Cache     15        0         2.5GB     2.5GB (100%)

✅ All services running successfully!
```

---

## 📞 Need More Help?

### Check These Files

- **`DOCKER-OPTIMIZATION-SUMMARY.md`** - Complete overview
- **`DOCKER-TRAEFIK-GUIDE.md`** - Detailed Traefik guide
- **`DOCKER-DISK-SPACE-GUIDE.md`** - Extended disk space guide

### Quick Commands Reference

```bash
# Check Docker space
docker system df

# Clean Docker
docker system prune -a -f

# Build and run
./scripts/build-and-dockerize.sh
docker-compose -f docker-compose.simple.yml up -d

# Access app
open http://localhost

# View Traefik
open http://localhost:8080
```

---

## ⏱️ Time Required

- **Increase disk space**: 2-3 minutes
- **Docker restart**: 1-2 minutes
- **Build all apps**: 5-10 minutes
- **Start services**: 1 minute

**Total**: ~10-15 minutes

---

## ✅ Success Checklist

- [ ] Opened Docker Desktop Settings
- [ ] Found Resources → Advanced
- [ ] Increased Virtual disk limit to 64GB
- [ ] Clicked Apply & Restart
- [ ] Docker restarted successfully
- [ ] Ran `docker system df` to verify
- [ ] Ran `./scripts/build-and-dockerize.sh`
- [ ] Ran `docker-compose -f docker-compose.simple.yml up -d`
- [ ] Accessed http://localhost successfully
- [ ] Checked Traefik dashboard at http://localhost:8080
- [ ] All 7 services running

---

**Once you've increased the disk space, you're ready to build and run! 🚀**

```bash
./scripts/build-and-dockerize.sh
docker-compose -f docker-compose.simple.yml up -d
open http://localhost
```

