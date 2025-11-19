@echo off
echo 🚀 Building CVFilterAI for production...

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist dist rmdir /s /q dist

REM Install dependencies  
echo 📦 Installing dependencies...
npm ci

REM Build frontend and backend
echo 🎨 Building application...
npm run build

REM Check build output
echo ✅ Build complete!
echo 📁 Build output:
dir dist

echo 🎉 CVFilterAI is ready for deployment!
echo 🌐 Run 'npm start' to launch in production mode