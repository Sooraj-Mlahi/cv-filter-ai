@echo off
echo 🚀 Deploying CVFilterAI to production...

REM Copy production environment
echo 📝 Setting up production environment...
copy .env.production .env

REM Ensure build is up to date
echo 🔨 Building application...
npm run build

REM Start the production server
echo 🌟 Starting production server...
npm start