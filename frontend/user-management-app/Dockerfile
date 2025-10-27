# User Management App Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /build

# Copy root package files
COPY package*.json ./

# Copy shared-ui-lib
COPY frontend/shared-ui-lib ./frontend/shared-ui-lib

# Copy user management app
COPY frontend/user-management-app ./frontend/user-management-app

# Copy shared-ui-lib package files first
COPY frontend/shared-ui-lib/package*.json ./frontend/shared-ui-lib/

# Install dependencies with error handling
RUN cd frontend/shared-ui-lib && \
    echo "Installing shared-ui-lib dependencies..." && \
    npm --version && \
    ls -la && \
    npm install --production=false

RUN cd frontend/user-management-app && \
    echo "Installing user-management-app dependencies..." && \
    npm --version && \
    ls -la && \
    npm install --production=false

# No build arguments - using runtime dynamic API URL detection
ENV NODE_ENV=production

# Debug: Show build mode
RUN echo "🔍 Building with RUNTIME dynamic API URL detection (no build-time URLs)"

# Build the application
RUN cd frontend/user-management-app && npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /build/frontend/user-management-app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/user-management-app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]