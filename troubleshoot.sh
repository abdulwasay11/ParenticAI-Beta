#!/bin/bash

# ParenticAI Troubleshooting Script
# Helps diagnose and fix common issues

echo "🔍 ParenticAI Troubleshooting Tool"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Docker status
check_docker() {
    print_status "Checking Docker..."
    if ! docker --version > /dev/null 2>&1; then
        print_error "Docker is not installed or not running"
        return 1
    fi
    print_success "Docker is available"
}

# Check container status
check_containers() {
    print_status "Checking container status..."
    
    containers=("parentic_postgres" "parentic_chroma" "parentic_ollama" "parentic_keycloak" "parentic_backend" "parentic_frontend")
    
    for container in "${containers[@]}"; do
        if docker ps | grep -q "$container"; then
            print_success "$container is running"
        else
            print_error "$container is not running"
            echo "   To check logs: docker logs $container"
            echo "   To restart: docker restart $container"
        fi
    done
}

# Check port availability
check_ports() {
    print_status "Checking port availability..."
    
    ports=("3000:Frontend" "8001:Backend" "5433:PostgreSQL" "8000:ChromaDB" "8080:Keycloak" "11434:Ollama")
    
    for port_info in "${ports[@]}"; do
        port=${port_info%:*}
        service=${port_info#*:}
        
        if lsof -i :$port > /dev/null 2>&1; then
            print_success "$service (port $port) is active"
        else
            print_warning "$service (port $port) is not responding"
        fi
    done
}

# Check service health
check_service_health() {
    print_status "Checking service health..."
    
    # Check PostgreSQL
    if docker exec parentic_postgres pg_isready -U parentic_user > /dev/null 2>&1; then
        print_success "PostgreSQL is ready"
    else
        print_error "PostgreSQL is not ready"
    fi
    
    # Check Keycloak
    if curl -f -s http://localhost:8080 > /dev/null 2>&1; then
        print_success "Keycloak is responding"
    else
        print_warning "Keycloak is not responding (may still be starting)"
        echo "   Check status: docker logs parentic_keycloak"
    fi
    
    # Check ChromaDB
    if curl -f -s http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
        print_success "ChromaDB is responding"
    else
        print_warning "ChromaDB is not responding"
    fi
    
    # Check Ollama
    if curl -f -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_success "Ollama is responding"
    else
        print_warning "Ollama is not responding"
    fi
}

# Check Ollama models
check_ollama_models() {
    print_status "Checking Ollama models..."
    
    if docker exec parentic_ollama ollama list 2>/dev/null | grep -q "llama3.2"; then
        print_success "Llama 3.2 model is available"
    else
        print_warning "Llama 3.2 model not found"
        echo "   To install: docker exec -it parentic_ollama ollama pull llama3.2"
    fi
}

# Show logs for a specific service
show_logs() {
    if [ -z "$1" ]; then
        echo "Usage: $0 logs <service>"
        echo "Services: postgres, keycloak, ollama, chroma, backend, frontend"
        return 1
    fi
    
    container_name="parentic_$1"
    print_status "Showing logs for $container_name..."
    docker logs --tail=50 "$container_name"
}

# Restart a specific service
restart_service() {
    if [ -z "$1" ]; then
        echo "Usage: $0 restart <service>"
        echo "Services: postgres, keycloak, ollama, chroma, backend, frontend"
        return 1
    fi
    
    container_name="parentic_$1"
    print_status "Restarting $container_name..."
    docker restart "$container_name"
    print_success "$container_name restarted"
}

# Reset everything
reset_all() {
    print_status "Resetting all services..."
    docker-compose down -v
    print_status "Starting services again..."
    docker-compose up -d
    print_success "Services restarted"
}

# Install Ollama model
install_model() {
    print_status "Installing Llama 3.2 model..."
    docker exec -it parentic_ollama ollama pull llama3.2
}

# Show system resources
check_resources() {
    print_status "Checking system resources..."
    
    # Memory
    if command -v free > /dev/null; then
        total_mem=$(free -g | awk '/^Mem:/{print $2}')
        used_mem=$(free -g | awk '/^Mem:/{print $3}')
        echo "Memory: ${used_mem}GB used / ${total_mem}GB total"
        
        if [ "$total_mem" -lt 8 ]; then
            print_warning "Less than 8GB RAM - AI model may run slowly"
        fi
    fi
    
    # Disk space
    available_space=$(df . | awk 'NR==2{print int($4/1024/1024)}')
    echo "Available disk space: ${available_space}GB"
    
    if [ "$available_space" -lt 10 ]; then
        print_warning "Less than 10GB disk space available"
    fi
    
    # Docker stats
    print_status "Docker container resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Main menu
show_menu() {
    echo
    echo "Available commands:"
    echo "  check     - Run all health checks"
    echo "  logs      - Show logs for a service"
    echo "  restart   - Restart a service"
    echo "  reset     - Reset all services"
    echo "  model     - Install Llama 3.2 model"
    echo "  resources - Check system resources"
    echo "  help      - Show this menu"
    echo
}

# Main execution
case "$1" in
    "logs")
        show_logs "$2"
        ;;
    "restart")
        restart_service "$2"
        ;;
    "reset")
        reset_all
        ;;
    "model")
        install_model
        ;;
    "resources")
        check_resources
        ;;
    "help")
        show_menu
        ;;
    "check"|"")
        check_docker
        check_containers
        check_ports
        check_service_health
        check_ollama_models
        echo
        echo "For more options, run: $0 help"
        ;;
    *)
        echo "Unknown command: $1"
        show_menu
        ;;
esac 