# Settings App Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /build

# Copy root package files
COPY package*.json ./

# Copy shared-ui-lib
COPY frontend/shared-ui-lib ./frontend/shared-ui-lib

# Copy settings app
COPY frontend/settings-app ./frontend/settings-app

# Install all dependencies
RUN cd frontend/shared-ui-lib && npm ci
RUN cd frontend/settings-app && npm ci

# Build arguments
ARG REACT_APP_API_URL=http://localhost:30001

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production

# Build the application
RUN cd frontend/settings-app && npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /build/frontend/settings-app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/settings-app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]