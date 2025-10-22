#!/bin/bash

# Lingoshid Platform - Production Deployment Script
# This script deploys the platform to production with SSL and subdomains

set -e

echo "=========================================="
echo "  Lingoshid Production Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Determine Docker Compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo ""
print_info "Using: $DOCKER_COMPOSE"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found!"
    echo ""
    read -p "Do you want to create .env from template? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env
        print_success "Created .env file from template"
        echo ""
        print_warning "IMPORTANT: Please edit .env and update these values:"
        echo "  - DB_PASSWORD"
        echo "  - JWT_SECRET (minimum 32 characters)"
        echo "  - MYSQL_ROOT_PASSWORD"
        echo "  - CORS_ORIGINS"
        echo ""
        read -p "Press Enter after updating .env file..."
    else
        print_error "Cannot proceed without .env file"
        exit 1
    fi
fi

# Validate critical environment variables
print_info "Validating environment variables..."

source .env

if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "CHANGE_THIS_STRONG_PASSWORD_123" ]; then
    print_error "DB_PASSWORD not set or using default value!"
    echo "Please update DB_PASSWORD in .env file"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "CHANGE_THIS_TO_A_VERY_STRONG_SECRET_KEY_FOR_PRODUCTION" ]; then
    print_error "JWT_SECRET not set or using default value!"
    echo "Please update JWT_SECRET in .env file"
    exit 1
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
    print_warning "JWT_SECRET should be at least 32 characters long"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_success "Environment variables validated"

# Ask for deployment mode
echo ""
echo "Deployment Options:"
echo "1. Fresh deployment (build and start)"
echo "2. Update deployment (rebuild and restart)"
echo "3. Stop all services"
echo "4. View logs"
echo "5. Backup database"
echo ""
read -p "Select option (1-5): " -n 1 -r
echo ""

case $REPLY in
    1)
        # Fresh deployment
        print_info "Starting fresh deployment..."

        # Stop any existing containers
        $DOCKER_COMPOSE down 2>/dev/null || true

        # Build and start
        print_info "Building Docker images..."
        $DOCKER_COMPOSE build --no-cache

        print_info "Starting services..."
        $DOCKER_COMPOSE up -d

        # Wait for services to be ready
        print_info "Waiting for services to be ready..."
        sleep 15

        # Check if database needs seeding
        print_info "Checking database..."
        DB_TABLES=$($DOCKER_COMPOSE exec -T database mysql -u root -p$DB_PASSWORD -e "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '$DB_NAME';" 2>/dev/null | tail -n 1 || echo "0")

        if [ "$DB_TABLES" = "0" ] || [ -z "$DB_TABLES" ]; then
            print_info "Seeding database..."
            $DOCKER_COMPOSE exec backend npm run seed:prod || $DOCKER_COMPOSE exec backend npm run seed
            print_success "Database seeded"
        else
            print_success "Database already has data"
            print_info "To re-seed manually, run: docker compose exec backend npm run seed:prod"
        fi

        print_success "Fresh deployment completed!"
        ;;

    2)
        # Update deployment
        print_info "Updating deployment..."

        # Pull latest code (if in git repo)
        if [ -d .git ]; then
            print_info "Pulling latest changes..."
            git pull origin main || git pull origin master
        fi

        # Rebuild and restart
        print_info "Rebuilding and restarting services..."
        $DOCKER_COMPOSE up -d --build

        print_success "Update completed!"
        ;;

    3)
        # Stop services
        print_info "Stopping all services..."
        $DOCKER_COMPOSE down
        print_success "Services stopped"
        exit 0
        ;;

    4)
        # View logs
        print_info "Showing logs (Ctrl+C to exit)..."
        $DOCKER_COMPOSE logs -f
        exit 0
        ;;

    5)
        # Backup database
        print_info "Creating database backup..."
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        $DOCKER_COMPOSE exec -T database mysqldump -u root -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE
        print_success "Database backup created: $BACKUP_FILE"
        exit 0
        ;;

    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

# Show service status
echo ""
print_info "Service Status:"
$DOCKER_COMPOSE ps

# Show logs (last 20 lines)
echo ""
print_info "Recent logs:"
$DOCKER_COMPOSE logs --tail=20

echo ""
echo "=========================================="
echo "  🎉 Deployment Complete!"
echo "=========================================="
echo ""
print_success "Services are running"
echo ""
echo "Access your platform:"
echo "  Admin Panel:  https://admin.lingoshid.com"
echo "  API Server:   https://server.lingoshid.com/api"
echo "  Main Site:    https://lingoshid.com"
echo ""
echo "Useful commands:"
echo "  View logs:     $DOCKER_COMPOSE logs -f"
echo "  Restart:       $DOCKER_COMPOSE restart"
echo "  Stop:          $DOCKER_COMPOSE down"
echo "  Status:        $DOCKER_COMPOSE ps"
echo ""
print_info "For SSL setup, see SETUP_GUIDE.md"
echo ""
