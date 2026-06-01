#!/bin/bash


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[*]${NC} Installing Python dependencies..."

if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[✗]${NC} Please run as root (use sudo)"
    exit 1
fi

cd "$(dirname "$0")/.."

if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}[✗]${NC} requirements.txt not found"
    exit 1
fi

echo -e "${BLUE}[*]${NC} Attempting system-wide installation..."
if pip3 install -r requirements.txt --break-system-packages --quiet 2>/dev/null; then
    echo -e "${GREEN}[✓]${NC} Python dependencies installed (system-wide)"
    exit 0
fi

echo -e "${BLUE}[*]${NC} Attempting standard installation..."
if pip3 install -r requirements.txt --quiet 2>/dev/null; then
    echo -e "${GREEN}[✓]${NC} Python dependencies installed"
    exit 0
fi

echo -e "${YELLOW}[!]${NC} System-wide installation blocked, creating virtual environment..."

if ! dpkg -l | grep -q python3-venv; then
    echo -e "${BLUE}[*]${NC} Installing python3-venv..."
    apt-get install -y python3-venv python3-full -qq
fi

VENV_PATH="/var/www/Nexus/venv"
if [ ! -d "$VENV_PATH" ]; then
    echo -e "${BLUE}[*]${NC} Creating virtual environment at $VENV_PATH..."
    python3 -m venv "$VENV_PATH"
fi

echo -e "${BLUE}[*]${NC} Installing dependencies in virtual environment..."
"$VENV_PATH/bin/pip" install -r requirements.txt --quiet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[✓]${NC} Python dependencies installed in virtual environment"
    echo -e "${YELLOW}[!]${NC} Virtual environment created at: $VENV_PATH"
    echo -e "${YELLOW}[!]${NC} To use: source $VENV_PATH/bin/activate"
    
    if [ -f "/var/www/Nexus/backend/wsgi.py" ]; then
        echo -e "${BLUE}[*]${NC} Updating WSGI configuration for virtual environment..."
        sed -i "1i import sys\nsys.path.insert(0, '/var/www/Nexus/venv/lib/python3.12/site-packages')" /var/www/Nexus/backend/wsgi.py
    fi
    
    exit 0
else
    echo -e "${RED}[✗]${NC} Failed to install Python dependencies"
    exit 1
fi
