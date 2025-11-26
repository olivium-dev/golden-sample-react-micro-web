# ============================================
# Multi-stage Dockerfile - Build inside Docker
# Settings App
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Create directory structure that matches the import paths
# Imports use '../../shared-ui-lib/src' from '/app/src'
# So we need: /app/src -> ../../shared-ui-lib = /shared-ui-lib
WORKDIR /

# Copy shared-ui-lib and install its dependencies
COPY shared-ui-lib /shared-ui-lib
WORKDIR /shared-ui-lib
RUN npm install --legacy-peer-deps

# Now set up the app
WORKDIR /app

# Copy app package files
COPY settings-app/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy app source code
COPY settings-app/ ./

# Build the application
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY settings-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
