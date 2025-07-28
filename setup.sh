#!/bin/bash

# ParenticAI Setup Script
# This script sets up the complete ParenticAI application

set -e

echo "🚀 Starting ParenticAI Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed."
}

# Check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check available memory
    total_mem=$(free -g | awk '/^Mem:/{print $2}')
    if [ "$total_mem" -lt 8 ]; then
        print_warning "Less than 8GB RAM detected. The AI model may run slowly."
    fi
    
    # Check available disk space
    available_space=$(df . | awk 'NR==2{print $4}')
    if [ "$available_space" -lt 10485760 ]; then  # 10GB in KB
        print_warning "Less than 10GB disk space available. Consider freeing up space."
    fi
    
    print_success "System requirements check completed."
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOL
DATABASE_URL=postgresql://parentic_user:parentic_password@postgres:5432/parentic_ai
CHROMA_URL=http://chroma:8000
OLLAMA_URL=http://ollama:11434
KEYCLOAK_URL=http://keycloak:8080
JWT_SECRET=parentic-super-secret-jwt-key-$(date +%s)
KEYCLOAK_CLIENT_SECRET=parentic-client-secret
EOL
        print_success "Created backend/.env"
    else
        print_status "backend/.env already exists, skipping..."
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:8001
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=parentic-ai
REACT_APP_KEYCLOAK_CLIENT_ID=parentic-client
EOL
        print_success "Created frontend/.env"
    else
        print_status "frontend/.env already exists, skipping..."
    fi
}

# Stop any existing containers
cleanup_existing() {
    print_status "Cleaning up existing containers..."
    docker-compose down -v 2>/dev/null || true
    print_success "Cleanup completed."
}

# Start all services
start_services() {
    print_status "Starting all services with Docker Compose..."
    docker-compose up -d
    print_success "All services started."
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    sleep 30
    
    # Wait for Keycloak
    print_status "Waiting for Keycloak (this may take 2-3 minutes)..."
    max_attempts=60
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        # Try both the new path and old path for Keycloak
        if curl -f -s http://localhost:8080 > /dev/null 2>&1 || curl -f -s http://localhost:8080/auth > /dev/null 2>&1; then
            break
        fi
        sleep 5
        attempt=$((attempt + 1))
        echo -n "."
    done
    echo
    
    if [ $attempt -eq $max_attempts ]; then
        print_warning "Keycloak took longer than expected to start, but continuing..."
        print_status "You can check if Keycloak is running with: docker logs parentic_keycloak"
    fi
    
    print_success "Services are ready."
}

# Pull Ollama model
setup_ollama() {
    print_status "Setting up Ollama and pulling Llama 3.2 model..."
    print_warning "This may take several minutes depending on your internet connection..."
    
    # Wait for Ollama to be ready
    max_attempts=20
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if docker exec parentic_ollama ollama list > /dev/null 2>&1; then
            break
        fi
        sleep 10
        attempt=$((attempt + 1))
        echo -n "."
    done
    echo
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Ollama failed to start within expected time."
        exit 1
    fi
    
    # Pull the model
    if docker exec parentic_ollama ollama pull llama3.2; then
        print_success "Llama 3.2 model downloaded successfully."
    else
        print_error "Failed to download Llama 3.2 model."
        print_warning "You can manually pull it later with: docker exec -it parentic_ollama ollama pull llama3.2"
    fi
}

# Configure Keycloak (basic setup instructions)
setup_keycloak() {
    print_status "Keycloak setup instructions:"
    echo
    echo "📋 Manual Keycloak Configuration Required:"
    echo "1. Open http://localhost:8080 in your browser"
    echo "2. Login with username: admin, password: admin123"
    echo "3. Create a new realm named: parentic-ai"
    echo "4. Create a client with ID: parentic-client"
    echo "5. Configure the client:"
    echo "   - Access Type: public"
    echo "   - Valid Redirect URIs: http://localhost:3000/*"
    echo "   - Web Origins: http://localhost:3000"
    echo
    print_warning "The application will not work until Keycloak is properly configured."
    echo
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    services=("frontend:3000" "backend:8001" "postgres:5432" "keycloak:8080" "chroma:8000" "ollama:11434")
    
    for service in "${services[@]}"; do
        name=${service%:*}
        port=${service#*:}
        
        if nc -z localhost $port 2>/dev/null; then
            print_success "$name is running on port $port"
        else
            print_error "$name is not responding on port $port"
        fi
    done
}

# Display final information
show_completion() {
    echo
    echo "🎉 ParenticAI Setup Complete!"
    echo
    echo "📱 Access Points:"
    echo "   Frontend:     http://localhost:3000"
    echo "   Backend API:  http://localhost:8001"
    echo "   API Docs:     http://localhost:8001/docs"
    echo "   Keycloak:     http://localhost:8080 (admin/admin123)"
    echo
    echo "🔧 Next Steps:"
    echo "   1. Configure Keycloak as described above"
    echo "   2. Visit http://localhost:3000 to start using ParenticAI"
    echo "   3. Create your parent profile and add children"
    echo "   4. Start chatting with the AI assistant!"
    echo
    echo "📖 Documentation:"
    echo "   - Full README: ./README.md"
    echo "   - API Documentation: http://localhost:8001/docs"
    echo
    echo "🚨 Troubleshooting:"
    echo "   - View logs: docker-compose logs"
    echo "   - Restart services: docker-compose restart"
    echo "   - Stop all: docker-compose down"
    echo
    print_success "Happy parenting with ParenticAI! 👶💝"
}

# Main execution
main() {
    echo "======================================"
    echo "   ParenticAI Setup Script v1.0"
    echo "======================================"
    echo
    
    check_docker
    check_requirements
    create_env_files
    cleanup_existing
    start_services
    wait_for_services
    setup_ollama
    setup_keycloak
    check_health
    show_completion
}

# Run main function
main "$@" 