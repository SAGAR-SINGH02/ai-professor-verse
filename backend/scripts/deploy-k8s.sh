#!/bin/bash

# AI Professor Verse - Kubernetes Deployment Script
# This script deploys the complete backend system to Kubernetes

set -e

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

# Configuration
NAMESPACE=${NAMESPACE:-"ai-professor-verse"}
ENVIRONMENT=${ENVIRONMENT:-"production"}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"your-registry.com"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

# Check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "kubectl is available and connected to cluster"
}

# Check if required tools are available
check_requirements() {
    print_status "Checking deployment requirements..."
    
    check_kubectl
    
    # Check if helm is available (optional)
    if command -v helm &> /dev/null; then
        print_success "Helm is available"
    else
        print_warning "Helm is not available. Some features may not work."
    fi
    
    # Check if docker is available for building images
    if command -v docker &> /dev/null; then
        print_success "Docker is available"
    else
        print_warning "Docker is not available. Images must be pre-built."
    fi
}

# Build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    if [ "$SKIP_BUILD" = "true" ]; then
        print_warning "Skipping image build (SKIP_BUILD=true)"
        return
    fi
    
    services=(
        "api-gateway"
        "auth-service"
        "user-service"
        "ai-service"
        "realtime-service"
        "code-execution-service"
        "analytics-service"
        "content-service"
        "notification-service"
    )
    
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            print_status "Building $service..."
            
            # Build the image
            docker build -t "${DOCKER_REGISTRY}/ai-professor/${service}:${IMAGE_TAG}" "$service/"
            
            # Push the image
            if [ "$SKIP_PUSH" != "true" ]; then
                docker push "${DOCKER_REGISTRY}/ai-professor/${service}:${IMAGE_TAG}"
                print_success "Built and pushed $service"
            else
                print_success "Built $service (push skipped)"
            fi
        else
            print_warning "Service directory $service not found, skipping..."
        fi
    done
}

# Create namespace
create_namespace() {
    print_status "Creating namespace: $NAMESPACE"
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_warning "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f k8s/namespace.yaml
        print_success "Created namespace: $NAMESPACE"
    fi
}

# Deploy secrets (with validation)
deploy_secrets() {
    print_status "Deploying secrets..."
    
    # Check if secrets file exists and has been customized
    if [ ! -f "k8s/secrets.yaml" ]; then
        print_error "Secrets file not found: k8s/secrets.yaml"
        exit 1
    fi
    
    # Warn about default secrets
    if grep -q "your-secure-" k8s/secrets.yaml; then
        print_error "Secrets file contains default values. Please update with actual secrets."
        print_error "Never deploy with default secrets in production!"
        
        if [ "$ENVIRONMENT" = "production" ]; then
            exit 1
        else
            print_warning "Continuing with default secrets (non-production environment)"
        fi
    fi
    
    kubectl apply -f k8s/secrets.yaml
    print_success "Secrets deployed"
}

# Deploy configuration
deploy_config() {
    print_status "Deploying configuration..."
    
    kubectl apply -f k8s/configmap.yaml
    print_success "Configuration deployed"
}

# Deploy infrastructure services
deploy_infrastructure() {
    print_status "Deploying infrastructure services..."
    
    # Deploy in order of dependencies
    infrastructure_services=(
        "postgres-deployment.yaml"
        "redis-deployment.yaml"
        "mongodb-deployment.yaml"
        "neo4j-deployment.yaml"
        "kafka-deployment.yaml"
        "rabbitmq-deployment.yaml"
    )
    
    for service_file in "${infrastructure_services[@]}"; do
        if [ -f "k8s/$service_file" ]; then
            print_status "Deploying $service_file..."
            kubectl apply -f "k8s/$service_file"
            print_success "Deployed $service_file"
        else
            print_warning "Infrastructure file not found: k8s/$service_file"
        fi
    done
    
    # Wait for infrastructure to be ready
    print_status "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Check if PostgreSQL is ready
    if kubectl get pods -n "$NAMESPACE" -l app=postgres | grep -q "Running"; then
        print_success "PostgreSQL is running"
    else
        print_warning "PostgreSQL may not be ready yet"
    fi
    
    # Check if Redis is ready
    if kubectl get pods -n "$NAMESPACE" -l app=redis | grep -q "Running"; then
        print_success "Redis is running"
    else
        print_warning "Redis may not be ready yet"
    fi
}

# Deploy application services
deploy_applications() {
    print_status "Deploying application services..."
    
    # Deploy in order of dependencies
    application_services=(
        "auth-service-deployment.yaml"
        "user-service-deployment.yaml"
        "ai-service-deployment.yaml"
        "realtime-service-deployment.yaml"
        "code-execution-service-deployment.yaml"
        "analytics-service-deployment.yaml"
        "content-service-deployment.yaml"
        "notification-service-deployment.yaml"
        "api-gateway-deployment.yaml"
    )
    
    for service_file in "${application_services[@]}"; do
        if [ -f "k8s/$service_file" ]; then
            print_status "Deploying $service_file..."
            kubectl apply -f "k8s/$service_file"
            print_success "Deployed $service_file"
            
            # Wait a bit between deployments to avoid overwhelming the cluster
            sleep 5
        else
            print_warning "Application file not found: k8s/$service_file"
        fi
    done
}

# Deploy monitoring stack
deploy_monitoring() {
    print_status "Deploying monitoring stack..."
    
    monitoring_services=(
        "prometheus-deployment.yaml"
        "grafana-deployment.yaml"
        "elasticsearch-deployment.yaml"
        "kibana-deployment.yaml"
    )
    
    for service_file in "${monitoring_services[@]}"; do
        if [ -f "k8s/$service_file" ]; then
            print_status "Deploying $service_file..."
            kubectl apply -f "k8s/$service_file"
            print_success "Deployed $service_file"
        else
            print_warning "Monitoring file not found: k8s/$service_file"
        fi
    done
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for PostgreSQL to be fully ready
    print_status "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s
    
    # Create a migration job
    cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-$(date +%s)
  namespace: $NAMESPACE
spec:
  template:
    spec:
      containers:
      - name: migration
        image: ${DOCKER_REGISTRY}/ai-professor/shared:${IMAGE_TAG}
        command: ["npm", "run", "migrate:up"]
        envFrom:
        - configMapRef:
            name: ai-professor-config
        - secretRef:
            name: ai-professor-secrets
      restartPolicy: Never
  backoffLimit: 3
EOF
    
    print_success "Database migration job created"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if all pods are running
    print_status "Checking pod status..."
    kubectl get pods -n "$NAMESPACE"
    
    # Check if services are accessible
    print_status "Checking service status..."
    kubectl get services -n "$NAMESPACE"
    
    # Check if ingresses are configured
    print_status "Checking ingress status..."
    kubectl get ingress -n "$NAMESPACE"
    
    # Wait for all deployments to be ready
    print_status "Waiting for all deployments to be ready..."
    kubectl wait --for=condition=available deployment --all -n "$NAMESPACE" --timeout=600s
    
    print_success "All deployments are ready!"
}

# Get access information
get_access_info() {
    print_status "Getting access information..."
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 Access Information:"
    echo "====================="
    
    # Get ingress information
    if kubectl get ingress -n "$NAMESPACE" &> /dev/null; then
        echo ""
        echo "🌐 External URLs:"
        kubectl get ingress -n "$NAMESPACE" -o custom-columns=NAME:.metadata.name,HOSTS:.spec.rules[*].host,PORTS:.spec.tls[*].secretName --no-headers | while read name hosts tls; do
            if [ "$tls" != "<none>" ]; then
                echo "  - https://$hosts ($name)"
            else
                echo "  - http://$hosts ($name)"
            fi
        done
    fi
    
    echo ""
    echo "🔧 Internal Services:"
    kubectl get services -n "$NAMESPACE" --no-headers | while read name type cluster_ip external_ip ports age; do
        echo "  - $name: $cluster_ip:$(echo $ports | cut -d'/' -f1)"
    done
    
    echo ""
    echo "📈 Monitoring:"
    echo "  - Prometheus: Check your ingress configuration"
    echo "  - Grafana: Check your ingress configuration"
    echo "  - Kibana: Check your ingress configuration"
    
    echo ""
    echo "🔍 Useful Commands:"
    echo "  - View pods: kubectl get pods -n $NAMESPACE"
    echo "  - View logs: kubectl logs -f deployment/<service-name> -n $NAMESPACE"
    echo "  - Scale service: kubectl scale deployment <service-name> --replicas=<count> -n $NAMESPACE"
    echo "  - Delete deployment: kubectl delete -f k8s/ --recursive"
    
    echo ""
    print_success "Deployment information displayed above"
}

# Cleanup function
cleanup() {
    if [ "$1" = "all" ]; then
        print_status "Cleaning up all resources..."
        kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
        print_success "All resources cleaned up"
    else
        print_status "Cleaning up application resources..."
        kubectl delete -f k8s/ --recursive --ignore-not-found=true
        print_success "Application resources cleaned up"
    fi
}

# Main deployment function
main() {
    echo "🚀 AI Professor Verse - Kubernetes Deployment"
    echo "=============================================="
    echo "Environment: $ENVIRONMENT"
    echo "Namespace: $NAMESPACE"
    echo "Registry: $DOCKER_REGISTRY"
    echo "Image Tag: $IMAGE_TAG"
    echo ""
    
    case "${1:-deploy}" in
        "deploy")
            check_requirements
            build_and_push_images
            create_namespace
            deploy_secrets
            deploy_config
            deploy_infrastructure
            deploy_applications
            deploy_monitoring
            run_migrations
            verify_deployment
            get_access_info
            ;;
        "cleanup")
            cleanup "${2:-app}"
            ;;
        "verify")
            verify_deployment
            ;;
        "info")
            get_access_info
            ;;
        *)
            echo "Usage: $0 [deploy|cleanup|verify|info]"
            echo ""
            echo "Commands:"
            echo "  deploy  - Deploy the complete system (default)"
            echo "  cleanup - Clean up resources (cleanup all for complete removal)"
            echo "  verify  - Verify deployment status"
            echo "  info    - Show access information"
            echo ""
            echo "Environment Variables:"
            echo "  NAMESPACE      - Kubernetes namespace (default: ai-professor-verse)"
            echo "  ENVIRONMENT    - Deployment environment (default: production)"
            echo "  DOCKER_REGISTRY - Docker registry URL (default: your-registry.com)"
            echo "  IMAGE_TAG      - Docker image tag (default: latest)"
            echo "  SKIP_BUILD     - Skip building images (default: false)"
            echo "  SKIP_PUSH      - Skip pushing images (default: false)"
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'print_error "Deployment interrupted by user"; exit 1' INT

# Run main function
main "$@"
