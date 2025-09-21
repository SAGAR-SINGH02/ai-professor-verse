@echo off
echo Starting AI Professor Verse Development Environment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --eval "db.runCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: MongoDB is not running or not accessible
    echo Please start MongoDB service or install MongoDB
    echo.
)

REM Start backend in new window
echo Starting Backend API Server...
start "AI Professor Verse - Backend" cmd /k "cd /d backend-api && npm install && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend Development Server...
start "AI Professor Verse - Frontend" cmd /k "cd /d frontend && npm install && npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo Press any key to close this window...
pause >nul
