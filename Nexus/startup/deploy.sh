#!/bin/bash


set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        RED/BLUE LAB - VULNERABLE WEB APP DEPLOYMENT          ║
║                      VM1 - Target Machine                     ║
║                                                               ║
║  ⚠️  WARNING: Contains Intentional Security Vulnerabilities  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_status "Starting deployment process..."

print_status "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    print_success "Docker installed"
else
    print_success "Docker is installed"
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    print_status "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
else
    print_success "Docker Compose is installed"
fi

print_status "Creating directories..."
mkdir -p /var/log/webapp
mkdir -p /tmp/uploads
chmod 777 /var/log/webapp
chmod 777 /tmp/uploads
print_success "Directories created"

print_status "Configuring environment..."
cd "$(dirname "$0")/.."
if [ ! -f backend/database/.env ]; then
    if [ -f backend/database/.env.example ]; then
        cp backend/database/.env.example backend/database/.env
        print_success "Environment file created"
    else
        print_warning "Environment example file not found"
    fi
else
    print_warning "Environment file already exists"
fi

print_status "Building Docker images..."
cd backend/database
docker-compose build

print_status "Starting containers..."
docker-compose up -d

cd ../..
print_success "Containers started"

print_status "Waiting for services to initialize..."
sleep 10

print_status "Checking MySQL connection..."
for i in {1..30}; do
    if docker exec mysql_db mysqladmin ping -h localhost -u admin -padmin &> /dev/null; then
        print_success "MySQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "MySQL failed to start"
        exit 1
    fi
    sleep 2
done

print_status "Checking web application..."
for i in {1..30}; do
    if curl -s http://localhost:5000/health &> /dev/null; then
        print_success "Web application is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Web application failed to start"
        exit 1
    fi
    sleep 2
done

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  DEPLOYMENT SUCCESSFUL                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

VM_IP=$(hostname -I | awk '{print $1}')

echo -e "${BLUE}Service URLs:${NC}"
echo -e "  • Vulnerable Web App: ${GREEN}http://${VM_IP}:5000${NC}"
echo -e "  • phpMyAdmin:         ${GREEN}http://${VM_IP}:8080${NC}"
echo ""

echo -e "${BLUE}Database Credentials:${NC}"
echo -e "  • Username: ${YELLOW}admin${NC}"
echo -e "  • Password: ${YELLOW}admin${NC}"
echo -e "  • Database: ${YELLOW}mydb${NC}"
echo ""

echo -e "${BLUE}Default Application Users:${NC}"
echo -e "  • Admin:  ${YELLOW}admin / admin123${NC}"
echo -e "  • User:   ${YELLOW}user / password${NC}"
echo ""

echo -e "${BLUE}Vulnerabilities Implemented:${NC}"
echo -e "  ${RED}✓${NC} SQL Injection (Login, User Listing)"
echo -e "  ${RED}✓${NC} Cross-Site Scripting (XSS) - Reflected & Stored"
echo -e "  ${RED}✓${NC} OS Command Injection (Ping, System Commands)"
echo -e "  ${RED}✓${NC} Unrestricted File Upload"
echo ""

echo -e "${BLUE}Log Locations:${NC}"
echo -e "  • Application Logs: ${YELLOW}/var/log/webapp/app.log${NC}"
echo -e "  • Docker Logs:      ${YELLOW}docker-compose logs -f${NC}"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • View logs:        ${YELLOW}docker-compose logs -f webapp${NC}"
echo -e "  • Stop services:    ${YELLOW}docker-compose down${NC}"
echo -e "  • Restart services: ${YELLOW}docker-compose restart${NC}"
echo -e "  • View containers:  ${YELLOW}docker ps${NC}"
echo ""

echo -e "${RED}⚠️  SECURITY WARNING:${NC}"
echo -e "This application contains intentional vulnerabilities for educational purposes."
echo -e "DO NOT expose this to the internet or use in production environments."
echo ""

print_success "Deployment complete! Lab environment is ready for Red/Blue team exercises."
