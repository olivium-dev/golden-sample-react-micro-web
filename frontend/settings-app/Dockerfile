# Settings App Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy shared-ui-lib first
COPY ../shared-ui-lib ../shared-ui-lib

# Install shared-ui-lib dependencies
WORKDIR /app/../shared-ui-lib
RUN npm ci --only=production

# Back to settings app
WORKDIR /app

# Copy source code
COPY . .

# Build arguments
ARG REACT_APP_API_URL=http://localhost:30001

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]