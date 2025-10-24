# Multi-stage build for Container App
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy shared-ui-lib
COPY ../shared-ui-lib /app/shared-ui-lib
WORKDIR /app/shared-ui-lib
RUN npm ci --legacy-peer-deps

# Back to container app
WORKDIR /app/container
COPY . .

# Build the application
RUN npx webpack --config webpack.minimal.js --mode production

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/container/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

