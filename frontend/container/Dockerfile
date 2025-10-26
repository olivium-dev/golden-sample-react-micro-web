# Container App Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /build

# Copy root package files (if they exist)
COPY package*.json ./

# Copy shared-ui-lib with package files
COPY frontend/shared-ui-lib/package*.json ./frontend/shared-ui-lib/
COPY frontend/shared-ui-lib ./frontend/shared-ui-lib

# Copy container app with package files
COPY frontend/container/package*.json ./frontend/container/
COPY frontend/container ./frontend/container

# Install dependencies (use npm install instead of npm install --production=false for better compatibility)
RUN cd frontend/shared-ui-lib && \
    echo "Installing shared-ui-lib dependencies..." && \
    npm --version && \
    ls -la && \
    npm install --production=false

RUN cd frontend/container && \
    echo "Installing container app dependencies..." && \
    npm --version && \
    ls -la && \
    npm install --production=false

# Build arguments
ARG REACT_APP_API_URL=http://localhost:30001

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production

# Build the application
RUN cd frontend/container && npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /build/frontend/container/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/container/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]