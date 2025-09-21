#!/bin/bash

# AI Professor Verse - Development Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up AI Professor Verse Backend Development Environment..."

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 20+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_error "Node.js version 20+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work properly."
        print_warning "Please install Docker for full functionality."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose is not installed. Infrastructure services won't start automatically."
    fi
    
    print_success "Requirements check completed!"
}

# Create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please update the .env file with your actual configuration values"
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Install dependencies for all services
install_dependencies() {
    print_status "Installing dependencies for all services..."
    
    # Install root dependencies
    npm install
    
    # Install dependencies for each service
    services=(
        "shared"
        "api-gateway"
        "auth-service"
        "user-service"
        "ai-service"
        "realtime-service"
        "code-execution-service"
        "analytics-service"
        "content-service"
        "notification-service"
        "config-service"
        "monitoring-service"
        "file-storage-service"
    )
    
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            print_status "Installing dependencies for $service..."
            cd "$service"
            npm install
            cd ..
            print_success "Dependencies installed for $service"
        else
            print_warning "Service directory $service not found, skipping..."
        fi
    done
    
    print_success "All dependencies installed!"
}

# Build shared package
build_shared() {
    print_status "Building shared package..."
    
    if [ -d "shared" ]; then
        cd shared
        npm run build
        cd ..
        print_success "Shared package built successfully!"
    else
        print_warning "Shared package directory not found"
    fi
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    if command -v docker-compose &> /dev/null; then
        # Start only the infrastructure services (not the application services)
        docker-compose up -d postgres mongodb redis neo4j kafka rabbitmq elasticsearch kibana prometheus grafana keycloak minio
        
        print_status "Waiting for services to be ready..."
        sleep 30
        
        # Check if services are healthy
        print_status "Checking service health..."
        
        # PostgreSQL
        if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
            print_success "PostgreSQL is ready"
        else
            print_warning "PostgreSQL might not be ready yet"
        fi
        
        # Redis
        if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            print_success "Redis is ready"
        else
            print_warning "Redis might not be ready yet"
        fi
        
        print_success "Infrastructure services started!"
        print_status "You can access the following services:"
        echo "  - PostgreSQL: localhost:5432"
        echo "  - MongoDB: localhost:27017"
        echo "  - Redis: localhost:6379"
        echo "  - Neo4j Browser: http://localhost:7474"
        echo "  - Kafka: localhost:9092"
        echo "  - RabbitMQ Management: http://localhost:15672 (admin/admin123)"
        echo "  - Elasticsearch: http://localhost:9200"
        echo "  - Kibana: http://localhost:5601"
        echo "  - Prometheus: http://localhost:9090"
        echo "  - Grafana: http://localhost:3001 (admin/admin123)"
        echo "  - Keycloak: http://localhost:8080 (admin/admin123)"
        echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
        
    else
        print_warning "Docker Compose not available. Please start infrastructure services manually."
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait a bit more for PostgreSQL to be fully ready
    sleep 10
    
    if [ -d "shared" ]; then
        cd shared
        if npm run migrate:up > /dev/null 2>&1; then
            print_success "Database migrations completed!"
        else
            print_warning "Database migrations failed or no migrations to run"
        fi
        cd ..
    fi
}

# Create initial data
create_initial_data() {
    print_status "Creating initial data..."
    
    # This would typically seed the database with initial data
    # For now, we'll just create a placeholder
    print_status "Initial data creation completed (placeholder)"
}

# Start development servers
start_dev_servers() {
    print_status "Development environment setup completed!"
    print_status "To start the development servers, run:"
    echo ""
    echo "  # Start all services:"
    echo "  npm run dev:all"
    echo ""
    echo "  # Or start individual services:"
    echo "  npm run dev:gateway    # API Gateway (port 3000)"
    echo "  npm run dev:auth       # Auth Service (port 3001)"
    echo "  npm run dev:ai         # AI Service (port 3002)"
    echo "  npm run dev:realtime   # Real-time Service (port 3003)"
    echo ""
    echo "  # View logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "  # Stop infrastructure:"
    echo "  docker-compose down"
    echo ""
}

# Main setup function
main() {
    echo "🎓 AI Professor Verse - Backend Development Setup"
    echo "=================================================="
    echo ""
    
    check_requirements
    setup_environment
    install_dependencies
    build_shared
    start_infrastructure
    run_migrations
    create_initial_data
    start_dev_servers
    
    print_success "🎉 Development environment setup completed successfully!"
    print_status "Happy coding! 🚀"
}

# Handle script interruption
trap 'print_error "Setup interrupted by user"; exit 1' INT

# Run main function
main "$@"
