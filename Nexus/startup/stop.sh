#!/bin/bash


set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              NEXUS - VULNERABLE WEB APP                       ║
║                    STOPPING SERVICES                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[✗]${NC} Please run as root (use sudo)"
    exit 1
fi

echo -e "${BLUE}[*]${NC} Stopping services..."

echo -e "${BLUE}[*]${NC} Stopping Apache..."
if systemctl is-active --quiet apache2; then
    systemctl stop apache2
    echo -e "${GREEN}[✓]${NC} Apache stopped"
else
    echo -e "${YELLOW}[!]${NC} Apache is not running"
fi

echo -e "${BLUE}[*]${NC} Stopping Docker containers..."
cd "$(dirname "$0")/.."

if [ -d "/var/www/Nexus/backend/database" ]; then
    cd /var/www/Nexus/backend/database
    docker-compose stop
    echo -e "${GREEN}[✓]${NC} Docker containers stopped"
    cd -
else
    echo -e "${YELLOW}[!]${NC} Docker compose directory not found"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  SERVICES STOPPED                             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Status:${NC}"
echo -e "  • Apache:  ${YELLOW}Stopped${NC}"
echo -e "  • Docker:  ${YELLOW}Stopped${NC}"
echo ""

echo -e "${BLUE}Data Preserved:${NC}"
echo -e "  • Database data:  ${GREEN}Preserved${NC}"
echo -e "  • Uploaded files: ${GREEN}Preserved${NC}"
echo -e "  • Log files:      ${GREEN}Preserved${NC}"
echo ""

echo -e "${BLUE}To restart:${NC}"
echo -e "  ${YELLOW}sudo ./startup/start.sh${NC}"
echo ""

echo -e "${BLUE}To clean start (remove all data):${NC}"
echo -e "  ${YELLOW}sudo ./startup/start.sh${NC} (will prompt for confirmation)"
echo ""

echo -e "${GREEN}[✓]${NC} Services stopped successfully"
