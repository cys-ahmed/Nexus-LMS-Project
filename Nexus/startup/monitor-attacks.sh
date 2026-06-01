#!/bin/bash


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

LOG_FILE="/var/log/webapp/app.log"
ALERT_LOG="/var/log/webapp/alerts.log"

touch "$ALERT_LOG" 2>/dev/null || ALERT_LOG="/tmp/alerts.log"

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              ATTACK MONITORING & DETECTION                    ║
║                   Real-time Log Analysis                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log_alert() {
    local severity="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$severity] $message" >> "$ALERT_LOG"
}

show_alert() {
    local color="$1"
    local severity="$2"
    local message="$3"
    echo -e "${color}[$(date '+%H:%M:%S')] [${severity}] ${message}${NC}"
    log_alert "$severity" "$message"
}

if [ ! -f "$LOG_FILE" ]; then
    echo -e "${YELLOW}Warning: Log file not found at $LOG_FILE${NC}"
    echo -e "${YELLOW}Trying Docker logs...${NC}"
    
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}Monitoring Docker container logs...${NC}\n"
        docker logs -f vulnerable_webapp 2>&1 | while read line; do
            if echo "$line" | grep -iE "(OR '1'='1|UNION SELECT|; DROP|' OR |-- |#)" > /dev/null; then
                show_alert "$RED" "CRITICAL" "SQL Injection attempt detected: $line"
            fi
            
            if echo "$line" | grep -iE "(<script|<img.*onerror|javascript:|onerror=|onload=)" > /dev/null; then
                show_alert "$RED" "HIGH" "XSS attempt detected: $line"
            fi
            
            if echo "$line" | grep -iE "(;.*cat |;.*ls |;.*whoami|;.*wget|;.*curl|&& |; )" > /dev/null; then
                show_alert "$RED" "CRITICAL" "Command injection detected: $line"
            fi
            
            if echo "$line" | grep -iE "(\.php|\.sh|\.py|\.exe|shell)" > /dev/null; then
                show_alert "$YELLOW" "MEDIUM" "Suspicious file upload: $line"
            fi
            
            echo "$line"
        done
        exit 0
    fi
    
    echo -e "${RED}Error: Cannot access logs${NC}"
    exit 1
fi

echo -e "${GREEN}Monitoring: $LOG_FILE${NC}"
echo -e "${GREEN}Alert Log: $ALERT_LOG${NC}\n"
echo -e "${BLUE}Detection Rules Active:${NC}"
echo -e "  • SQL Injection patterns"
echo -e "  • XSS attempts"
echo -e "  • Command injection"
echo -e "  • Suspicious file uploads"
echo -e "  • Failed login attempts"
echo -e "  • Path traversal"
echo -e "\n${YELLOW}Press Ctrl+C to stop monitoring${NC}\n"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

SQL_INJECTION_COUNT=0
XSS_COUNT=0
CMD_INJECTION_COUNT=0
FILE_UPLOAD_COUNT=0
FAILED_LOGIN_COUNT=0

tail -f "$LOG_FILE" | while read line; do
    
    if echo "$line" | grep -iE "(OR '1'='1|UNION SELECT|; DROP|' OR |-- |#|' AND |information_schema)" > /dev/null; then
        SQL_INJECTION_COUNT=$((SQL_INJECTION_COUNT + 1))
        show_alert "$RED" "CRITICAL" "SQL Injection attempt detected"
        echo -e "${RED}  └─ $line${NC}\n"
    fi
    
    if echo "$line" | grep -iE "(<script|<img.*onerror|javascript:|onerror=|onload=|<iframe|eval\()" > /dev/null; then
        XSS_COUNT=$((XSS_COUNT + 1))
        show_alert "$RED" "HIGH" "XSS attempt detected"
        echo -e "${RED}  └─ $line${NC}\n"
    fi
    
    if echo "$line" | grep -iE "(;.*cat |;.*ls |;.*whoami|;.*wget|;.*curl|&& |; |passwd|/bin/bash|/bin/sh)" > /dev/null; then
        CMD_INJECTION_COUNT=$((CMD_INJECTION_COUNT + 1))
        show_alert "$RED" "CRITICAL" "Command injection detected"
        echo -e "${RED}  └─ $line${NC}\n"
    fi
    
    if echo "$line" | grep -iE "(\.php|\.sh|\.py|\.exe|shell\.)" > /dev/null; then
        FILE_UPLOAD_COUNT=$((FILE_UPLOAD_COUNT + 1))
        show_alert "$YELLOW" "MEDIUM" "Suspicious file upload detected"
        echo -e "${YELLOW}  └─ $line${NC}\n"
    fi
    
    if echo "$line" | grep -iE "(Failed login|Invalid credentials)" > /dev/null; then
        FAILED_LOGIN_COUNT=$((FAILED_LOGIN_COUNT + 1))
        show_alert "$YELLOW" "LOW" "Failed login attempt"
        echo -e "${YELLOW}  └─ $line${NC}\n"
    fi
    
    if echo "$line" | grep -iE "(\.\.\/|\.\.\\|%2e%2e|etc/passwd|etc/shadow)" > /dev/null; then
        show_alert "$RED" "HIGH" "Path traversal attempt detected"
        echo -e "${RED}  └─ $line${NC}\n"
    fi
    
    if echo "$line" | grep -iE "Successful login" > /dev/null; then
        show_alert "$GREEN" "INFO" "Successful login"
        echo -e "${GREEN}  └─ $line${NC}\n"
    fi
    
    if echo "$line" | grep -iE "(SQL syntax|mysql error|database error)" > /dev/null; then
        show_alert "$YELLOW" "MEDIUM" "Database error (possible SQL injection)"
        echo -e "${YELLOW}  └─ $line${NC}\n"
    fi
    
    if ! echo "$line" | grep -iE "(OR '1'='1|<script|;.*cat|\.php|Failed login|Successful login)" > /dev/null; then
        echo -e "${NC}$line${NC}"
    fi
    
done

trap 'echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"; 
      echo -e "${YELLOW}Attack Statistics:${NC}";
      echo -e "  SQL Injection attempts: $SQL_INJECTION_COUNT";
      echo -e "  XSS attempts: $XSS_COUNT";
      echo -e "  Command injection attempts: $CMD_INJECTION_COUNT";
      echo -e "  Suspicious uploads: $FILE_UPLOAD_COUNT";
      echo -e "  Failed logins: $FAILED_LOGIN_COUNT";
      echo -e "\n${GREEN}Alerts saved to: $ALERT_LOG${NC}";
      exit 0' INT TERM
