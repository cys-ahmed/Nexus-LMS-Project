#!/bin/bash


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    CLEANUP SCRIPT                             ║
║              Remove Lab Environment                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[✗]${NC} Please run as root (use sudo)"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will remove all lab components!${NC}"
echo -e "${YELLOW}This includes:${NC}"
echo -e "  • Docker containers"
echo -e "  • Docker volumes (database data)"
echo -e "  • Uploaded files"
echo -e "  • Log files"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${BLUE}[*]${NC} Cleanup cancelled"
    exit 0
fi

echo ""
echo -e "${BLUE}[*]${NC} Starting cleanup process..."

if [ -d "/var/www/Nexus/backend/database" ]; then
    echo -e "${BLUE}[*]${NC} Stopping Docker containers..."
    cd /var/www/Nexus/backend/database
    docker-compose down -v
    cd -
    echo -e "${GREEN}[✓]${NC} Docker containers stopped and removed"
else
    echo -e "${YELLOW}[!]${NC} Docker compose directory not found, skipping..."
fi

if [ -d "/tmp/uploads" ]; then
    echo -e "${BLUE}[*]${NC} Removing uploaded files..."
    rm -rf /tmp/uploads/*
    echo -e "${GREEN}[✓]${NC} Uploaded files removed"
fi

if [ -d "/var/log/webapp" ]; then
    echo -e "${BLUE}[*]${NC} Removing log files..."
    rm -rf /var/log/webapp/*
    echo -e "${GREEN}[✓]${NC} Log files removed"
fi

read -p "Do you want to remove Docker images as well? (yes/no): " remove_images

if [ "$remove_images" = "yes" ]; then
    echo -e "${BLUE}[*]${NC} Removing Docker images..."
    
    docker rmi vulnerable_webapp 2>/dev/null || true
    docker rmi vulnerable-webapp 2>/dev/null || true
    
    docker image prune -f
    
    echo -e "${GREEN}[✓]${NC} Docker images removed"
fi

echo -e "${BLUE}[*]${NC} Cleaning up Docker networks..."
docker network prune -f
echo -e "${GREEN}[✓]${NC} Docker networks cleaned"

if [ -f "/tmp/test_upload.txt" ] || [ -f "/tmp/shell.php" ] || [ -f "/tmp/malicious.py" ]; then
    echo -e "${BLUE}[*]${NC} Removing test files..."
    rm -f /tmp/test_upload.txt /tmp/shell.php /tmp/malicious.py
    echo -e "${GREEN}[✓]${NC} Test files removed"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  CLEANUP COMPLETE                             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Summary:${NC}"
echo -e "  • Docker containers: ${GREEN}Removed${NC}"
echo -e "  • Docker volumes: ${GREEN}Removed${NC}"
echo -e "  • Uploaded files: ${GREEN}Removed${NC}"
echo -e "  • Log files: ${GREEN}Removed${NC}"

if [ "$remove_images" = "yes" ]; then
    echo -e "  • Docker images: ${GREEN}Removed${NC}"
fi

echo ""
echo -e "${BLUE}To redeploy the lab:${NC}"
echo -e "  ${YELLOW}sudo ./deploy.sh${NC}"
echo ""

echo -e "${GREEN}[✓]${NC} Cleanup completed successfully!"
