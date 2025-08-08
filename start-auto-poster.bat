@echo off
echo 🤖 Chamkili Auto Blog Poster Setup
echo ====================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    copy package-auto-poster.json package.json
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Starting Chamkili Auto Blog Poster...
echo 📅 This will generate and post a new blog every 10 minutes
echo 🛑 Press Ctrl+C to stop the service
echo.

REM Start the auto-poster
node auto-poster.js

pause
