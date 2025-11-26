# ============================================
# Simple Dockerfile - Build Locally, Docker for Serving Only
# User Management App
# ============================================

FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy pre-built assets (build locally before docker build)
COPY dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

