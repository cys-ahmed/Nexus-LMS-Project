# Startup

Deployment, provisioning, monitoring, testing, and maintenance scripts for operating the Nexus LMS lab environment.

---

## Overview

This directory contains all operational scripts and configuration files required to install system dependencies, deploy the Nexus LMS platform, manage its lifecycle, test intentional vulnerabilities, and monitor for attacks in real time. Scripts are written in Bash and are designed for Linux-based systems (Ubuntu/Debian preferred). Most deployment scripts require root/sudo privileges.

---

## Files

### Deployment and Lifecycle

| Script                     | Lines | Sudo | Description                                                                                              |
|----------------------------|-------|------|----------------------------------------------------------------------------------------------------------|
| `start.sh`                 | ~200  | Yes  | Primary deployment script. Performs a clean start by removing stale data, copying application files to `/var/www/Nexus`, configuring Apache, starting Docker services, and verifying health checks. Prompts for confirmation before data removal. |
| `stop.sh`                  | ~80   | Yes  | Graceful shutdown script. Stops all running services (Docker containers, Apache) while preserving existing data and database volumes. |
| `deploy.sh`                | ~200  | Yes  | Legacy deployment script. Similar to `start.sh` but does not perform a clean data removal step. Retained for backward compatibility. |
| `cleanup.sh`               | ~100  | Yes  | Full teardown script. Removes all containers, volumes, data, and configuration artifacts to return the environment to a pristine state. |

### Installation

| Script                     | Lines | Sudo | Description                                                                                              |
|----------------------------|-------|------|----------------------------------------------------------------------------------------------------------|
| `install-dependencies.sh`  | ~100  | Yes  | System dependency installation script. Installs Python 3, Apache HTTP Server, Docker, Docker Compose, and all other prerequisites on a fresh system. |
| `install-python-deps.sh`   | --    | No   | Python-specific dependency installation. Creates or activates a virtual environment and installs the packages listed in `backend/requirements.txt`. |

### Security Testing and Monitoring

| Script                     | Lines | Sudo | Description                                                                                              |
|----------------------------|-------|------|----------------------------------------------------------------------------------------------------------|
| `test-vulnerabilities.sh`  | ~200  | No   | Automated vulnerability testing script with 17 predefined test cases. Executes exploit payloads (SQL injection, XSS, authorization bypass) against a running instance and reports results. Usage: `./test-vulnerabilities.sh [host] [port]` |
| `monitor-attacks.sh`       | ~200  | No   | Real-time attack monitoring script. Tails application and web server logs, applies pattern-matching detection heuristics, and highlights suspicious activity (SQL injection attempts, XSS payloads, brute force indicators) as it occurs. |

### Configuration

| File                  | Description                                                                                                            |
|-----------------------|------------------------------------------------------------------------------------------------------------------------|
| `nexus-apache.conf`   | Apache virtual host configuration file (~100 lines). Defines the web server configuration for hosting the Nexus frontend. Intentionally configured with insecure settings for lab demonstration. Deployed to `/etc/apache2/sites-available/nexus.conf` by the startup scripts. |

### Documentation

| File         | Description                                                                                      |
|--------------|--------------------------------------------------------------------------------------------------|
| `INDEX.md`   | Structured index of all scripts in this directory with descriptions, usage commands, estimated run times, and operational notes. |
| `README.md`  | This file. Comprehensive documentation for the startup directory.                                |

---

## Quick Reference

```bash
# First-time setup
sudo ./install-dependencies.sh

# Deploy and start all services
sudo ./start.sh

# Stop services (preserves data)
sudo ./stop.sh

# Run vulnerability tests
./test-vulnerabilities.sh localhost 5000

# Monitor for attacks in real time
./monitor-attacks.sh

# Full cleanup (removes all data)
sudo ./cleanup.sh
```

---

## Script Comparison

| Script       | Purpose          | Removes Data | Estimated Time | Requires Sudo |
|--------------|------------------|--------------|----------------|---------------|
| `start.sh`   | Clean start      | Yes          | ~5 min         | Yes           |
| `stop.sh`    | Stop services    | No           | ~1 min         | Yes           |
| `deploy.sh`  | Deploy (legacy)  | No           | ~15 min        | Yes           |
| `cleanup.sh` | Full cleanup     | Yes          | ~2 min         | Yes           |

---

## Notes

- Convenience wrapper scripts (`start.sh` and `stop.sh`) are also available in the parent `Nexus/` directory for quick access.
- Deployment and lifecycle scripts must be run with root/sudo privileges.
- Testing and monitoring scripts can be run as a regular user.
- `start.sh` removes all existing data before deploying; it will prompt for confirmation.
- Application logs are written to `/var/log/webapp/app.log` and can be inspected for troubleshooting.
