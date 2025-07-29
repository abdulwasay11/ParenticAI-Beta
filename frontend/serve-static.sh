#!/bin/bash

echo "Serving ParenticAI Frontend Static Files..."

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "Build directory not found. Building first..."
    ./build.sh
fi

# Check if npx is available
if command -v npx &> /dev/null; then
    echo "Serving static files on http://localhost:3000"
    npx serve -s build -l 3000
else
    echo "npx not found. Installing serve globally..."
    npm install -g serve
    echo "Serving static files on http://localhost:3000"
    serve -s build -l 3000
fi 