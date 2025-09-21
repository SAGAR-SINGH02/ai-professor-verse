#!/bin/bash

echo "Starting AI Professor Verse Development Environment..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! mongosh --eval "db.runCommand('ping')" &> /dev/null; then
    echo "Warning: MongoDB is not running or not accessible"
    echo "Please start MongoDB service or install MongoDB"
    echo
fi

# Function to start services
start_backend() {
    echo "Starting Backend API Server..."
    cd backend-api
    npm install
    npm run dev &
    BACKEND_PID=$!
    cd ..
}

start_frontend() {
    echo "Starting Frontend Development Server..."
    cd frontend
    npm install
    npm run dev &
    FRONTEND_PID=$!
    cd ..
}

# Start backend
start_backend

# Wait a moment for backend to start
sleep 3

# Start frontend
start_frontend

echo
echo "Development servers are starting..."
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:8080"
echo
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo
    echo "Stopping services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "Services stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user input
wait
