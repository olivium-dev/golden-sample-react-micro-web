#!/bin/bash

# Generate JWT Secrets Script
# This script generates secure random secrets for JWT authentication

set -e

echo "🔐 Generating JWT Secrets..."
echo

# Create secrets directory if it doesn't exist
mkdir -p secrets

# Generate JWT secret key
echo "Generating JWT secret key..."
openssl rand -hex 32 > secrets/jwt_secret_key.txt
echo "✅ JWT secret key generated"

# Generate JWT refresh secret key
echo "Generating JWT refresh secret key..."
openssl rand -hex 32 > secrets/jwt_refresh_secret_key.txt
echo "✅ JWT refresh secret key generated"

echo
echo "✨ Secrets generated successfully!"
echo
echo "📁 Secrets location:"
echo "  - secrets/jwt_secret_key.txt"
echo "  - secrets/jwt_refresh_secret_key.txt"
echo
echo "⚠️  IMPORTANT: Never commit these files to git!"
echo "   They should be listed in .gitignore"
echo





