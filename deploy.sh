#!/bin/bash

echo "🚀 Deploying CVFilterAI to production..."

# Copy production environment
echo "📝 Setting up production environment..."
cp .env.production .env

# Ensure build is up to date
echo "🔨 Building application..."
npm run build

# Start the production server
echo "🌟 Starting production server..."
npm start