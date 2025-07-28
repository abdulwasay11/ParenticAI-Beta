#!/bin/bash

# ParenticAI Development Start Script
# Starts services in development mode

echo "🔧 Starting ParenticAI in Development Mode..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DEV]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Start only necessary services for development
print_status "Starting backend services..."
docker-compose up -d postgres chroma keycloak ollama

print_status "Waiting for services to be ready..."
sleep 30

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

print_success "Development environment ready!"
echo
echo "🚀 To start development servers:"
echo
echo "Backend (in terminal 1):"
echo "  cd backend"
echo "  uvicorn main:app --reload --host 0.0.0.0 --port 8001"
echo
echo "Frontend (in terminal 2):"
echo "  cd frontend"
echo "  npm start"
echo
echo "Services running:"
echo "  PostgreSQL: localhost:5432"
echo "  ChromaDB: localhost:8000"
echo "  Keycloak: localhost:8080"
echo "  Ollama: localhost:11434" 