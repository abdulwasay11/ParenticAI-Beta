#!/bin/bash

echo "Building ParenticAI Frontend..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building static files..."
npm run build

echo "Build complete! Static files are in the 'build' directory."
echo "You can now serve these files with any static web server." 