# 🐳 Docker Setup - Quick Reference

**One-command startup for the entire micro-frontend platform**

---

## ⚡ Ultra Quick Start

```bash
# Start everything
make up

# Or without make
docker-compose up -d
```

**Then open:** http://localhost:3000

---

## 📋 What You Get

✅ **6 containerized services** running in isolated environments  
✅ **Hot reload** enabled for all frontend apps  
✅ **Automatic networking** between services  
✅ **Volume mounting** for live code updates  
✅ **Health checks** for all services  
✅ **Zero configuration** required

---

## 🎯 One-Line Commands

| Task | Command |
|------|---------|
| **Start all services** | `make up` or `docker-compose up -d` |
| **Stop all services** | `make down` or `docker-compose down` |
| **View logs** | `make logs` or `docker-compose logs -f` |
| **Restart everything** | `make restart` |
| **Clean up** | `make clean` |
| **Production mode** | `make prod-up` |

---

## 🚀 First Time Setup

```bash
# 1. Clone the repo
git checkout containarize

# 2. Start services (this will build images automatically)
docker-compose up -d

# 3. Wait for compilation (~2-3 minutes)
docker-compose logs -f | grep "compiled successfully"

# 4. Access the platform
open http://localhost:3000
```

---

## 📊 Service Ports

| Service | URL | Port |
|---------|-----|------|
| Container (Main) | http://localhost:3000 | 3000 |
| User Management | http://localhost:3001 | 3001 |
| Data Grid | http://localhost:3002 | 3002 |
| Analytics | http://localhost:3003 | 3003 |
| Settings | http://localhost:3004 | 3004 |
| Backend API | http://localhost:8000 | 8000 |

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Morning: Start services
make up

# Work on your code (changes auto-reload)
vim frontend/container/src/App.minimal.tsx

# View logs if needed
make logs

# Evening: Stop services
make down
```

### Debugging

```bash
# Access container shell
make shell-container

# View specific service logs
docker-compose logs -f user-management-app

# Check resource usage
make stats

# Health check all services
make health
```

---

## 🏗️ Production

```bash
# Build and start production
make prod-up

# Access at http://localhost (port 80)

# Stop production
make prod-down
```

---

## 🧹 Cleanup

```bash
# Remove containers and volumes
make clean

# Deep clean (removes images too)
make deep-clean

# Prune Docker system
make prune
```

---

## 🆘 Troubleshooting

### Services won't start?

```bash
# Check if ports are in use
lsof -i :3000

# Clean and restart
make clean
make up
```

### Out of memory?

```bash
# Check Docker Desktop settings
# Increase RAM limit to 8GB+
```

### Changes not reflecting?

```bash
# Force rebuild
docker-compose up --build --force-recreate
```

---

## 📦 What's Included

### Docker Files Created

```
.dockerignore                           # Ignore patterns
docker-compose.yml                      # Development config
docker-compose.prod.yml                 # Production config
Makefile                                # Quick commands

frontend/
├── container/
│   ├── Dockerfile                      # Production build
│   ├── Dockerfile.dev                  # Development
│   └── nginx.conf                      # Nginx config
├── user-management-app/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
├── data-grid-app/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
├── analytics-app/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
└── settings-app/
    ├── Dockerfile
    ├── Dockerfile.dev
    └── nginx.conf

backend/mock-data-service/
└── Dockerfile                          # FastAPI backend
```

---

## ✨ Features

### Development Mode
- 🔥 Hot reload for all apps
- 📦 Volume mounting for instant updates
- 🔍 Source maps for debugging
- 📝 Live logs

### Production Mode
- ⚡ Nginx for static files
- 🗜️ Gzip compression
- 💾 Multi-stage builds (smaller images)
- 🏥 Health checks
- 🔄 Auto-restart on failure

---

## 🎓 Learn More

- [Full Docker Guide](./DOCKER_GUIDE.md) - Comprehensive documentation
- [Quick Start](./QUICK_START.md) - Getting started without Docker
- [Lessons Learned](./LESSONS_LEARNED.md) - Debugging insights

---

## 🌟 Key Advantages

✅ **Consistency:** Same environment everywhere  
✅ **Isolation:** No conflicts with local installs  
✅ **Simplicity:** One command to run everything  
✅ **Portability:** Works on Mac, Windows, Linux  
✅ **Production-ready:** Easy deployment path  

---

**Made with ❤️ using Docker + React + FastAPI**

