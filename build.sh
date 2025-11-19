#!/bin/bash

echo "🚀 Building CVFilterAI for production..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build frontend
echo "🎨 Building frontend..."
npm run build

# Check build output
echo "✅ Build complete!"
echo "📁 Build output:"
ls -la dist/

echo "🎉 CVFilterAI is ready for deployment!"
echo "🌐 Run 'npm start' to launch in production mode"