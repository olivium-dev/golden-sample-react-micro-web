.PHONY: help build up down restart logs clean test

# Default target
help:
	@echo "🐳 Micro-Frontend Platform - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs"
	@echo "  make build       - Build all images"
	@echo ""
	@echo "Production:"
	@echo "  make prod-up     - Start production stack"
	@echo "  make prod-down   - Stop production stack"
	@echo "  make prod-build  - Build production images"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       - Remove containers and volumes"
	@echo "  make prune       - Clean Docker system"
	@echo "  make ps          - Show running containers"
	@echo "  make stats       - Show container stats"
	@echo ""
	@echo "Individual Services:"
	@echo "  make backend     - Start only backend"
	@echo "  make container   - Start only container app"
	@echo "  make frontend    - Start all frontend apps"

# Development commands
up:
	@echo "🚀 Starting development services..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "📊 Access: http://localhost:3000"

down:
	@echo "🛑 Stopping services..."
	docker-compose down

restart:
	@echo "🔄 Restarting services..."
	docker-compose restart

logs:
	docker-compose logs -f

build:
	@echo "🏗️  Building development images..."
	docker-compose build

rebuild:
	@echo "🏗️  Rebuilding from scratch..."
	docker-compose build --no-cache

# Production commands
prod-up:
	@echo "🚀 Starting production services..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production services started!"
	@echo "📊 Access: http://localhost"

prod-down:
	@echo "🛑 Stopping production services..."
	docker-compose -f docker-compose.prod.yml down

prod-build:
	@echo "🏗️  Building production images..."
	docker-compose -f docker-compose.prod.yml build

# Individual services
backend:
	docker-compose up -d backend

container:
	docker-compose up -d container-app

frontend:
	docker-compose up -d user-management-app data-grid-app analytics-app settings-app

# Maintenance
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	@echo "✅ Cleanup complete!"

prune:
	@echo "🧹 Pruning Docker system..."
	docker system prune -a
	@echo "✅ Prune complete!"

deep-clean: down
	@echo "🧹 Deep cleaning..."
	docker-compose down -v --rmi all
	docker system prune -a -f
	@echo "✅ Deep clean complete!"

# Monitoring
ps:
	docker-compose ps

stats:
	docker stats

top:
	docker-compose top

# Testing
test:
	@echo "🧪 Running tests..."
	docker-compose exec container-app npm test

lint:
	@echo "🔍 Running linter..."
	docker-compose exec container-app npm run lint

# Shell access
shell-container:
	docker-compose exec container-app sh

shell-backend:
	docker-compose exec backend sh

shell-user:
	docker-compose exec user-management-app sh

# Health checks
health:
	@echo "🏥 Checking service health..."
	@curl -s http://localhost:8000/health && echo " Backend: ✅"
	@curl -s http://localhost:3000/health && echo " Container: ✅"
	@curl -s http://localhost:3001/health && echo " User Management: ✅"
	@curl -s http://localhost:3002/health && echo " Data Grid: ✅"
	@curl -s http://localhost:3003/health && echo " Analytics: ✅"
	@curl -s http://localhost:3004/health && echo " Settings: ✅"

# Quick commands
quick-start: build up logs

quick-stop: down clean

quick-restart: down up





