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
║                    CLEAN START                                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[✗]${NC} Please run as root (use sudo)"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will DELETE all existing data!${NC}"
echo -e "${YELLOW}This includes:${NC}"
echo -e "  • Docker containers and volumes"
echo -e "  • Database data"
echo -e "  • Uploaded files"
echo -e "  • Log files"
echo -e "  • Session data"
echo ""
read -p "Continue with clean start? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${BLUE}[*]${NC} Start cancelled"
    exit 0
fi

echo ""
echo -e "${BLUE}[*]${NC} Starting clean deployment..."

echo -e "${BLUE}[*]${NC} Stopping existing containers..."
cd "$(dirname "$0")/.."

if [ -d "/var/www/Nexus/backend/database" ]; then
    cd /var/www/Nexus/backend/database
    docker-compose down -v 2>/dev/null || true
    cd -
fi

docker ps -a | grep -E "vulnerable_webapp|mysql_db|phpmyadmin|log_forwarder" | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

echo -e "${GREEN}[✓]${NC} Existing containers stopped"

echo -e "${BLUE}[*]${NC} Removing Docker volumes..."
docker volume ls | grep -E "mysql_data|webapp_logs|uploads" | awk '{print $2}' | xargs -r docker volume rm 2>/dev/null || true
echo -e "${GREEN}[✓]${NC} Docker volumes removed"

echo -e "${BLUE}[*]${NC} Cleaning file system..."

if [ -d "/tmp/uploads" ]; then
    rm -rf /tmp/uploads/*
    echo -e "${GREEN}[✓]${NC} Uploaded files removed"
fi

if [ -d "/var/log/webapp" ]; then
    rm -rf /var/log/webapp/*
    echo -e "${GREEN}[✓]${NC} Log files removed"
fi

if [ -d "/var/log/apache2" ]; then
    rm -f /var/log/apache2/nexus-*.log 2>/dev/null || true
fi

rm -rf /tmp/flask_session* 2>/dev/null || true
rm -rf /var/www/Nexus/sessions/* 2>/dev/null || true

echo -e "${GREEN}[✓]${NC} File system cleaned"

echo -e "${BLUE}[*]${NC} Creating directories..."
mkdir -p /var/log/webapp
mkdir -p /tmp/uploads
mkdir -p /var/www/Nexus/sessions
chmod 777 /var/log/webapp
chmod 777 /tmp/uploads
chmod 777 /var/www/Nexus/sessions
echo -e "${GREEN}[✓]${NC} Directories created"

echo -e "${BLUE}[*]${NC} Copying application to /var/www/Nexus..."

mkdir -p /var/www/Nexus

cp -r assets /var/www/Nexus/ 2>/dev/null || true
cp -r css /var/www/Nexus/ 2>/dev/null || true
cp -r js /var/www/Nexus/ 2>/dev/null || true
cp -r pages /var/www/Nexus/ 2>/dev/null || true
cp -r backend /var/www/Nexus/ 2>/dev/null || true
cp index.html /var/www/Nexus/ 2>/dev/null || true
cp requirements.txt /var/www/Nexus/ 2>/dev/null || true

chown -R www-data:www-data /var/www/Nexus
chmod -R 755 /var/www/Nexus
chmod -R 777 /var/www/Nexus/sessions

echo -e "${GREEN}[✓]${NC} Application copied to /var/www/Nexus"

echo -e "${BLUE}[*]${NC} Installing Python dependencies..."
if command -v pip3 &> /dev/null; then
    if pip3 install -r /var/www/Nexus/backend/requirements.txt --break-system-packages --quiet 2>/dev/null; then
        echo -e "${GREEN}[✓]${NC} Python dependencies installed (system-wide)"
    elif pip3 install -r /var/www/Nexus/backend/requirements.txt --quiet 2>/dev/null; then
        echo -e "${GREEN}[✓]${NC} Python dependencies installed"
    else
        echo -e "${YELLOW}[!]${NC} Python dependencies not installed on host (this is normal)"
        echo -e "${YELLOW}[!]${NC} Docker containers have their own Python environment"
    fi
else
    echo -e "${YELLOW}[!]${NC} pip3 not found on host (this is normal)"
    echo -e "${YELLOW}[!]${NC} Docker containers have their own Python environment"
fi

echo -e "${BLUE}[*]${NC} Configuring Apache..."

if ! command -v apache2 &> /dev/null; then
    echo -e "${YELLOW}[!]${NC} Apache not installed, installing..."
    apt-get update -qq
    apt-get install -y apache2 libapache2-mod-wsgi-py3 -qq
fi

a2enmod wsgi 2>/dev/null || true
a2enmod proxy 2>/dev/null || true
a2enmod proxy_http 2>/dev/null || true
a2enmod headers 2>/dev/null || true
a2enmod rewrite 2>/dev/null || true

if [ -f "startup/nexus-apache.conf" ]; then
    cp startup/nexus-apache.conf /etc/apache2/sites-available/nexus.conf
    a2ensite nexus 2>/dev/null || true
    echo -e "${GREEN}[✓]${NC} Apache configured"
else
    echo -e "${YELLOW}[!]${NC} Apache config not found, will create default"
fi

echo -e "${BLUE}[*]${NC} Starting Docker containers..."
cd /var/www/Nexus/backend/database

docker-compose up -d --build

echo -e "${GREEN}[✓]${NC} Docker containers started"

echo -e "${BLUE}[*]${NC} Waiting for services to initialize..."
sleep 15

for i in {1..30}; do
    if docker exec mysql_db mysqladmin ping -h localhost -u admin -padmin &> /dev/null; then
        echo -e "${GREEN}[✓]${NC} MySQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}[✗]${NC} MySQL failed to start"
        exit 1
    fi
    sleep 2
done

for i in {1..30}; do
    if curl -s http://localhost:5000/health &> /dev/null; then
        echo -e "${GREEN}[✓]${NC} Web application is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}[✗]${NC} Web application failed to start"
        exit 1
    fi
    sleep 2
done

cd ../..

echo -e "${BLUE}[*]${NC} Restarting Apache..."
systemctl restart apache2
echo -e "${GREEN}[✓]${NC} Apache restarted"

VM_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  DEPLOYMENT SUCCESSFUL                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Service URLs:${NC}"
echo -e "  • Vulnerable Web App (Docker): ${GREEN}http://${VM_IP}:5000${NC}"
echo -e "  • Vulnerable Web App (Apache): ${GREEN}http://${VM_IP}/nexus${NC}"
echo -e "  • phpMyAdmin:                  ${GREEN}http://${VM_IP}:8080${NC}"
echo ""

echo -e "${BLUE}Application Location:${NC}"
echo -e "  • /var/www/Nexus"
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

echo -e "${BLUE}Log Locations:${NC}"
echo -e "  • Application: ${YELLOW}/var/log/webapp/app.log${NC}"
echo -e "  • Apache:      ${YELLOW}/var/log/apache2/nexus-*.log${NC}"
echo -e "  • Docker:      ${YELLOW}docker-compose logs -f${NC}"
echo ""

echo -e "${BLUE}Management Commands:${NC}"
echo -e "  • Stop:    ${YELLOW}sudo ./startup/stop.sh${NC}"
echo -e "  • Restart: ${YELLOW}sudo ./startup/start.sh${NC}"
echo -e "  • Logs:    ${YELLOW}tail -f /var/log/webapp/app.log${NC}"
echo ""

echo -e "${GREEN}[✓]${NC} Clean start complete! All previous data removed."
