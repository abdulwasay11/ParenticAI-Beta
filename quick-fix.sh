#!/bin/bash

# Quick Fix for ParenticAI Setup Issues
# Addresses common startup problems

echo "🔧 ParenticAI Quick Fix"
echo "======================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[NOTE]${NC} $1"
}

# Check if containers are running
print_status "Checking container status..."
docker-compose ps

echo
print_status "Checking Keycloak specifically..."
if docker logs parentic_keycloak 2>&1 | grep -q "Started"; then
    print_success "Keycloak has started successfully!"
    print_status "You can access Keycloak at: http://localhost:8080"
    print_status "Login: admin / admin123"
elif docker logs parentic_keycloak 2>&1 | grep -q "ERROR"; then
    print_warning "Keycloak encountered errors. Restarting..."
    docker restart parentic_keycloak
    sleep 30
else
    print_warning "Keycloak is still starting up. This is normal and can take 2-3 minutes."
fi

echo
print_status "Installing Llama 3.2 model (this may take several minutes)..."
if docker exec parentic_ollama ollama list 2>/dev/null | grep -q "llama3.2"; then
    print_success "Llama 3.2 model is already installed!"
else
    print_status "Pulling Llama 3.2 model..."
    docker exec parentic_ollama ollama pull llama3.2
    if [ $? -eq 0 ]; then
        print_success "Llama 3.2 model installed successfully!"
    else
        print_warning "Model installation failed. You can try again later with:"
        echo "  docker exec -it parentic_ollama ollama pull llama3.2"
    fi
fi

echo
print_status "Current service status:"
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8001"
echo "Keycloak:  http://localhost:8080"
echo "API Docs:  http://localhost:8001/docs"

echo
print_warning "Next steps:"
echo "1. Wait 1-2 more minutes for all services to fully start"
echo "2. Go to http://localhost:8080 and login (admin/admin123)"
echo "3. Create realm 'parentic-ai' and client 'parentic-client'"
echo "4. Visit http://localhost:3000 to use ParenticAI"

echo
print_status "For detailed troubleshooting, run: ./troubleshoot.sh" 