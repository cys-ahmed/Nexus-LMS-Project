# Nexus

Root web application directory containing the complete Nexus LMS source code, server-side logic, deployment automation, and security documentation.

---

## Overview

This directory serves as the primary application root for the Nexus Learning Management System. It contains the frontend entry point, backend API server, static assets, role-based page templates, client-side logic modules, and all deployment and operational scripts required to provision, run, test, and monitor the platform.

The application is designed as an intentionally vulnerable web platform for cybersecurity training and penetration testing exercises. All source code, configuration, and deployment artifacts are organized into purpose-specific subdirectories documented below.

---

## Directory Contents

### Subdirectories

- **assets/** -- Static media assets including the application logo, default profile image, and course thumbnail images used throughout the frontend interface.
- **backend/** -- Server-side application code, Docker container definitions, Python dependency manifest, and database orchestration resources (Docker Compose, SQL initialization, Filebeat configuration).
- **css/** -- Cascading Style Sheets separated by functional scope: global styles (`styles.css`), administrator interface styles (`admin.css`), and student interface styles (`user.css`).
- **js/** -- Client-side JavaScript modules implementing all interactive behavior, API communication, authentication checks, and DOM manipulation for both admin and student interfaces.
- **pages/** -- HTML page templates organized by user role. Contains the shared login page and two subdirectories for admin-specific and student-specific views.
- **startup/** -- Deployment, provisioning, monitoring, testing, and maintenance shell scripts along with Apache configuration and operational documentation.

### Files

- **index.html** -- The main entry point and landing page for the Nexus LMS web application. Serves as the root document from which all navigation originates.
- **start.sh** -- Convenience wrapper script that delegates to `startup/start.sh` for quick service initialization from the application root.
- **stop.sh** -- Convenience wrapper script that delegates to `startup/stop.sh` for graceful service shutdown from the application root.
- **VULNERABILITY_SUMMARY.md** -- A detailed security audit document cataloging every intentional vulnerability in the codebase. Each entry specifies the affected file, line numbers, vulnerability type (SQL injection, XSS, broken authentication, missing authorization, client-side trust), and step-by-step reproduction instructions.
- **.gitignore** -- Git ignore rules for excluding build artifacts and environment-specific files from version control.

---

## Architecture

```
Nexus/
|-- index.html              (Frontend entry point)
|-- start.sh / stop.sh      (Service convenience wrappers)
|-- VULNERABILITY_SUMMARY.md
|-- assets/                  (Static media)
|-- backend/                 (Flask API + Docker + Database)
|-- css/                     (Stylesheets)
|-- js/                      (Client-side logic)
|-- pages/                   (HTML templates by role)
|-- startup/                 (Deployment and operations)
```

---

## Quick Reference

| Action                  | Command                                          |
|-------------------------|--------------------------------------------------|
| Start all services      | `sudo ./start.sh`                                |
| Stop all services       | `sudo ./stop.sh`                                 |
| Docker deployment       | `docker compose -f backend/database/docker-compose.yml up -d --build` |
| Run backend manually    | `python3 backend/app.py`                         |
| Open in browser         | `http://localhost:5000`                           |
