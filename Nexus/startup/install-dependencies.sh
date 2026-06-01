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
║              NEXUS - DEPENDENCY INSTALLATION                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[✗]${NC} Please run as root (use sudo)"
    exit 1
fi

echo -e "${BLUE}[*]${NC} Installing dependencies..."

echo -e "${BLUE}[*]${NC} Updating package list..."
apt-get update -qq
echo -e "${GREEN}[✓]${NC} Package list updated"

echo -e "${BLUE}[*]${NC} Installing Python..."
apt-get install -y python3 python3-pip python3-dev -qq
echo -e "${GREEN}[✓]${NC} Python installed"

echo -e "${BLUE}[*]${NC} Installing Apache..."
apt-get install -y apache2 libapache2-mod-wsgi-py3 -qq
echo -e "${GREEN}[✓]${NC} Apache installed"

if ! command -v docker &> /dev/null; then
    echo -e "${BLUE}[*]${NC} Installing Docker..."
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sh /tmp/get-docker.sh
    systemctl start docker
    systemctl enable docker
    rm /tmp/get-docker.sh
    echo -e "${GREEN}[✓]${NC} Docker installed"
else
    echo -e "${GREEN}[✓]${NC} Docker already installed"
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${BLUE}[*]${NC} Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}[✓]${NC} Docker Compose installed"
else
    echo -e "${GREEN}[✓]${NC} Docker Compose already installed"
fi

echo -e "${BLUE}[*]${NC} Installing additional tools..."
apt-get install -y curl wget git vim net-tools tree -qq
echo -e "${GREEN}[✓]${NC} Additional tools installed"

echo -e "${BLUE}[*]${NC} Installing Python packages..."
cd "$(dirname "$0")/.."
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt --break-system-packages --quiet 2>/dev/null || \
    pip3 install -r requirements.txt --quiet
    echo -e "${GREEN}[✓]${NC} Python packages installed"
else
    echo -e "${YELLOW}[!]${NC} requirements.txt not found"
fi

echo -e "${BLUE}[*]${NC} Enabling Apache modules..."
a2enmod wsgi proxy proxy_http headers rewrite 2>/dev/null || true
echo -e "${GREEN}[✓]${NC} Apache modules enabled"

echo -e "${BLUE}[*]${NC} Creating directories..."
mkdir -p /var/log/webapp
mkdir -p /tmp/uploads
mkdir -p /var/www/Nexus
chmod 777 /var/log/webapp
chmod 777 /tmp/uploads
echo -e "${GREEN}[✓]${NC} Directories created"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              DEPENDENCIES INSTALLED SUCCESSFULLY              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Installed:${NC}"
echo -e "  ✓ Python $(python3 --version | awk '{print $2}')"
echo -e "  ✓ Apache $(apache2 -v | head -1 | awk '{print $3}')"
echo -e "  ✓ Docker $(docker --version | awk '{print $3}' | tr -d ',')"
echo -e "  ✓ Docker Compose $(docker-compose --version | awk '{print $3}' | tr -d ',')"
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Run: ${YELLOW}sudo ./startup/start.sh${NC}"
echo -e "  2. Access: ${YELLOW}http://YOUR_IP/${NC}"
echo ""

echo -e "${GREEN}[✓]${NC} Installation complete!"
