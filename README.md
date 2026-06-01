# Nexus-LMS-Project

Nexus LMS is a purposefully vulnerable, full-stack learning management system designed for cybersecurity training, penetration testing exercises, and SIEM integration demonstrations.

---

## Overview

Nexus LMS provides a realistic web-based learning management platform that contains intentional security vulnerabilities across its entire stack. The project is built to serve as a controlled lab environment where security professionals, students, and instructors can practice offensive techniques (SQL injection, cross-site scripting, broken access control) and defensive workflows (log analysis, SIEM dashboarding, attack monitoring, and mitigation).

The system follows a traditional client-server architecture:

- **Frontend**: A multi-page static site built with vanilla HTML, CSS, and modular JavaScript, organized by user role (student and administrator).
- **Backend**: A Python/Flask REST API that serves the frontend, handles authentication, and exposes deliberately insecure endpoints for training purposes.
- **Database**: A MySQL instance initialized via SQL scripts and orchestrated through Docker Compose, pre-seeded with sample users, courses, enrollments, announcements, and reviews.
- **Observability**: Filebeat and Splunk integration artifacts enable log shipping, centralized monitoring, and SIEM dashboard construction.
- **DevOps**: Dockerized deployment with automated shell scripts for provisioning, testing, monitoring, and teardown.

A comprehensive vulnerability summary (`VULNERABILITY_SUMMARY.md`) documents every intentional flaw, its location in the codebase, and step-by-step reproduction instructions.

---

## Directory Structure

```
Nexus-LMS-Project/
|-- LICENSE
|-- README.md
|-- Nexus/
|   |-- index.html
|   |-- start.sh
|   |-- stop.sh
|   |-- VULNERABILITY_SUMMARY.md
|   |-- assets/
|   |   |-- Application_Logo.png
|   |   |-- ProfilePic.png
|   |   |-- courses_img/
|   |-- backend/
|   |   |-- app.py
|   |   |-- Dockerfile
|   |   |-- requirements.txt
|   |   |-- database/
|   |       |-- docker-compose.yml
|   |       |-- filebeat.yml
|   |       |-- init.sql
|   |-- css/
|   |   |-- admin.css
|   |   |-- styles.css
|   |   |-- user.css
|   |-- js/
|   |   |-- admin.js
|   |   |-- admin-course-info.js
|   |   |-- admin-courses.js
|   |   |-- admin-dashboard.js
|   |   |-- auth.js
|   |   |-- certificates.js
|   |   |-- courses.js
|   |   |-- dashboard.js
|   |   |-- profile.js
|   |   |-- user.js
|   |   |-- user-course-info.js
|   |   |-- utils.js
|   |-- pages/
|   |   |-- login.html
|   |   |-- admin/
|   |   |   |-- admin.html
|   |   |   |-- course-info.html
|   |   |   |-- courses.html
|   |   |   |-- dashboard.html
|   |   |-- user/
|   |       |-- certificates.html
|   |       |-- course-info.html
|   |       |-- courses.html
|   |       |-- dashboard.html
|   |       |-- profile.html
|   |       |-- user.html
|   |-- startup/
|       |-- INDEX.md
|       |-- README.md
|       |-- cleanup.sh
|       |-- deploy.sh
|       |-- install-dependencies.sh
|       |-- install-python-deps.sh
|       |-- monitor-attacks.sh
|       |-- nexus-apache.conf
|       |-- start.sh
|       |-- stop.sh
|       |-- test-vulnerabilities.sh
|-- Screenshots/
    |-- SIEM.png
    |-- attacker.png
    |-- target.png
    |-- apache/
    |-- code/
    |   |-- code/
    |-- detection/
    |-- exploits/
    |-- git/
    |-- mitigation/
    |-- SIEM/
    |   |-- splunk/
    |   |-- splunk_forwarder/
    |-- website/
        |-- Login.png
        |-- admin/
        |-- user/
```

### Root Directory

- **LICENSE** -- MIT License file governing the terms of use, distribution, and modification for the project.
- **README.md** -- This file. Provides a comprehensive overview, setup instructions, and directory documentation for the entire project.

---

### Nexus/

The primary application directory containing the complete web application source code, server-side logic, deployment scripts, and configuration files.

- **index.html** -- The main entry point and landing page for the Nexus LMS web application. Serves as the root document from which all navigation originates.
- **start.sh** -- Convenience wrapper script at the application root that delegates to `startup/start.sh` for quick service initialization.
- **stop.sh** -- Convenience wrapper script that delegates to `startup/stop.sh` for graceful service shutdown.
- **VULNERABILITY_SUMMARY.md** -- A detailed security audit document that catalogs every intentional vulnerability in the codebase. Each entry specifies the affected file, line numbers, vulnerability type, and step-by-step reproduction instructions covering SQL injection, reflected XSS, stored XSS, broken authentication, missing authorization, and client-side trust exploitation.

#### Nexus/assets/

Static media assets used by the frontend interface.

- **Application_Logo.png** -- The official Nexus LMS brand logo displayed in the site header and navigation bar.
- **ProfilePic.png** -- Default user profile image used as a placeholder avatar across the platform.
- **courses_img/** -- Contains course thumbnail images (e.g., `react_js.png`, `python.png`, `ethical_hacking.png`, `docker.png`, `Deep_Learning.png`, `ui_ux.png`, and others). Each image corresponds to a course entry in the database and is referenced by the course catalog pages.

#### Nexus/backend/

Server-side application code, container definitions, and database resources.

- **app.py** -- The main Flask application that implements the entire REST API. Defines endpoints for authentication (`/api/login`), user management (CRUD), course management (CRUD), enrollment tracking, announcements, reviews, statistics, a deliberately vulnerable search page (`/search`), and a health check endpoint (`/health`). Contains intentional SQL injection, reflected XSS, plaintext password storage, and missing authorization vulnerabilities for lab use.
- **Dockerfile** -- Container image definition based on `python:3.11-slim`. Installs system dependencies, copies application code, configures logging and upload directories, exposes port 5000, and defines a health check against the `/health` endpoint.
- **requirements.txt** -- Python package manifest specifying runtime dependencies: Flask 3.0.0, Flask-CORS 4.0.0, PyMySQL 1.1.0, cryptography 41.0.7, and Werkzeug 3.0.1.

#### Nexus/backend/database/

Database orchestration, initialization, and log-shipping configuration.

- **docker-compose.yml** -- Multi-service Docker Compose file that provisions the complete lab environment. Defines four services: `mysql` (MySQL 9.7 database with health checks and persistent volumes), `webapp` (the Flask backend built from the parent Dockerfile), `phpmyadmin` (web-based database administration interface on port 8080), and `filebeat` (Elastic Filebeat 8.11.0 for shipping webapp logs). All services are connected via a shared `lab_network` bridge network.
- **filebeat.yml** -- Filebeat configuration file that defines log input paths and output destinations for centralized log collection. Used to forward application logs to a SIEM or log aggregation platform.
- **init.sql** -- SQL initialization script executed automatically when the MySQL container starts for the first time. Creates the `mydb` database and defines five tables (`users`, `courses`, `enrollments`, `announcements`, `reviews`) with full schema definitions including foreign keys and constraints. Seeds the database with three default users (admin, student, user), six sample courses, five enrollment records, and three system announcements.

#### Nexus/css/

Cascading Style Sheets that define the visual presentation of the application, separated by functional scope.

- **styles.css** -- The primary global stylesheet applied across all pages. Defines the base layout, typography, color scheme, navigation bar styles, responsive breakpoints, and shared UI component styles.
- **admin.css** -- Supplementary styles specific to the administrator interface. Covers dashboard cards, data tables, user management panels, course management forms, and administrative action buttons.
- **user.css** -- Supplementary styles specific to the student-facing interface. Covers the student dashboard, course catalog cards, enrollment views, profile page, and certificate display layouts.

#### Nexus/js/

Client-side JavaScript modules that implement all interactive behavior, data fetching, and DOM manipulation for the application.

- **admin.js** -- Core administrative interface logic. Handles the admin panel navigation, user CRUD operations (listing, adding, searching, deleting users), and admin-specific UI state management.
- **admin-course-info.js** -- Logic for the admin course detail view. Manages individual course editing, metadata display, enrolled student listings, and course-level administrative actions.
- **admin-courses.js** -- Logic for the admin course catalog management page. Implements course listing, creation forms, search/filtering, status toggling, and batch operations.
- **admin-dashboard.js** -- Logic for the admin dashboard landing page. Fetches and renders platform-wide statistics (student count, active courses, total enrollments, revenue).
- **auth.js** -- Authentication utility module. Manages login state verification, role-based redirect logic, and local storage session checks.
- **certificates.js** -- Logic for the student certificates page. Generates and displays completion certificates based on enrollment progress data.
- **courses.js** -- Logic for the student-facing course catalog. Fetches available courses from the API, renders course cards, and handles enrollment actions.
- **dashboard.js** -- Logic for the student dashboard. Displays enrolled course progress, recent announcements, and personalized learning statistics.
- **profile.js** -- Logic for the student profile page. Handles profile data display, username/email update forms, and password change requests.
- **user.js** -- Core student interface logic. Manages the student panel navigation, sidebar state, and shared student-facing UI behavior.
- **user-course-info.js** -- Logic for the student course detail view. Displays course information, progress tracking, reviews, and unenrollment actions.
- **utils.js** -- Shared utility functions used across all modules. Includes API base URL configuration, local storage helpers, role-checking functions, and common DOM manipulation routines.

#### Nexus/pages/

HTML page templates organized by user role, providing the structural markup for each view in the application.

- **login.html** -- The authentication page presented to all unauthenticated users. Contains the login form with username/email and password fields.

#### Nexus/pages/admin/

Administrative interface pages accessible to users with the Admin role.

- **admin.html** -- The primary admin panel page. Provides the main administrative layout with sidebar navigation, user management tables, and action controls.
- **course-info.html** -- The admin course detail page. Displays full course metadata, enrolled student lists, and editing controls for a specific course.
- **courses.html** -- The admin course catalog management page. Lists all courses with status indicators and provides forms for creating and managing course entries.
- **dashboard.html** -- The admin dashboard page. Displays aggregate platform metrics including student counts, course statistics, enrollment figures, and revenue data.

#### Nexus/pages/user/

Student-facing interface pages accessible to users with the Student role.

- **certificates.html** -- The student certificates page. Displays earned completion certificates and provides certificate generation for completed courses.
- **course-info.html** -- The student course detail page. Shows course description, instructor information, progress tracking, and a reviews section.
- **courses.html** -- The student course catalog page. Presents available courses as browsable cards with enrollment actions.
- **dashboard.html** -- The student dashboard page. Shows enrolled course progress, active announcements, and at-a-glance learning statistics.
- **profile.html** -- The student profile management page. Allows users to view and update their username, email, and password.
- **user.html** -- The primary student panel page. Provides the main student layout with sidebar navigation and content area.

#### Nexus/startup/

Deployment, provisioning, monitoring, and maintenance scripts used to operate the Nexus LMS lab environment.

- **INDEX.md** -- A structured index of all scripts in this directory with descriptions, usage commands, estimated run times, and operational notes.
- **README.md** -- Comprehensive startup and deployment guide with configuration details and troubleshooting procedures.
- **start.sh** -- The primary deployment script (~200 lines). Performs a clean start by removing stale data, copying application files to `/var/www/Nexus`, configuring Apache, starting Docker services, and verifying health checks. Requires root/sudo.
- **stop.sh** -- Graceful shutdown script (~80 lines). Stops all running services while preserving existing data. Requires root/sudo.
- **deploy.sh** -- Legacy deployment script (~200 lines). Similar to `start.sh` but does not perform a clean data removal step. Retained for backward compatibility.
- **cleanup.sh** -- Full teardown script (~100 lines). Removes all containers, volumes, data, and configuration to return the environment to a pristine state. Requires root/sudo.
- **install-dependencies.sh** -- System dependency installation script (~100 lines). Installs Python, Apache, Docker, Docker Compose, and all other prerequisites on a fresh system. Requires root/sudo.
- **install-python-deps.sh** -- Python-specific dependency installation script. Creates or activates a virtual environment and installs the packages listed in `requirements.txt`.
- **monitor-attacks.sh** -- Real-time attack monitoring script (~200 lines). Tails application and web server logs, applies detection heuristics, and highlights suspicious activity patterns (SQL injection attempts, XSS payloads, brute force indicators).
- **test-vulnerabilities.sh** -- Automated vulnerability testing script (~200 lines, 17 test cases). Executes predefined exploit payloads against the running application to verify that all intentional vulnerabilities are functional and reproducible.
- **nexus-apache.conf** -- Apache virtual host configuration file (~100 lines). Defines the web server configuration for hosting the Nexus frontend. Intentionally configured with insecure settings for lab demonstration purposes. Deployed to `/etc/apache2/sites-available/nexus.conf`.

---

### Screenshots/

Documentation and evidence directory containing visual records organized by topic area. Used for reports, presentations, and proof-of-concept documentation.

- **SIEM.png** -- High-level SIEM architecture or dashboard overview screenshot.
- **attacker.png** -- Screenshot of the attacker machine environment used during penetration testing exercises.
- **target.png** -- Screenshot of the target machine environment running the Nexus LMS application.

#### Screenshots/apache/

Screenshots documenting Apache web server configuration and verification.

- Contains visual records of the Apache document root configuration, `sites-available` default and Nexus virtual host files, SSH-based configuration, and `sites-enabled` symlink verification.

#### Screenshots/code/

Screenshots of annotated source code used for vulnerability analysis and documentation.

- **code/** -- Nested subdirectory containing additional code annotation screenshots and highlighted code segments.

#### Screenshots/detection/

Screenshots demonstrating security detection events, tool outputs, and alert triggers.

- Contains evidence from detection tools including Nessus vulnerability scan results (multiple views), Nmap network scan output, SQLMap automated exploitation results (multiple stages), reflected XSS execution, stored XSS execution, SQL injection confirmation, file upload exploitation, reverse shell establishment (multiple stages), web shell deployment, and `robots.txt`/`sitemap.xml` discovery.

#### Screenshots/exploits/

Visual records of exploit execution and proof-of-concept results from penetration testing.

- Contains screenshots of Nessus findings, file upload attacks, Nmap scans, reflected and stored XSS payloads firing, SQL injection results, SQLMap database extraction stages, reverse shell sessions, robots.txt disclosure, sitemap disclosure, and web shell access.

#### Screenshots/git/

Screenshots capturing Git version control workflows and repository state.

- Contains screenshots of the Git repository overview, commit history, and repository directory structure across multiple views.

#### Screenshots/mitigation/

Screenshots documenting vulnerability remediation steps and security hardening measures.

- Contains evidence of mitigations applied including SQL injection fixes, reflected and stored XSS sanitization, SSH hardening configurations, and file upload restriction implementations.

#### Screenshots/SIEM/

SIEM-related screenshots and configuration evidence, organized by platform.

- **splunk/** -- Screenshots of Splunk Enterprise dashboards, search queries, log correlation views, and alert configurations used for monitoring Nexus LMS activity.
- **splunk_forwarder/** -- Screenshots and configuration evidence for Splunk Universal Forwarder setup, demonstrating log shipping from the Nexus application server to the Splunk indexer.

#### Screenshots/website/

Screenshots of the Nexus LMS web application user interface.

- **Login.png** -- Screenshot of the application login page.
- **admin/** -- Screenshots of the administrative interface including the dashboard, user management panel, course management views, and admin-specific features.
- **user/** -- Screenshots of the student-facing interface including the student dashboard, course catalog, course detail views, profile page, and certificate display.

---

## Key Features

- **Intentionally Vulnerable Platform**: Contains documented, reproducible security flaws across OWASP Top 10 categories including SQL injection, cross-site scripting (reflected and stored), broken authentication, broken access control, and security misconfiguration.
- **Full-Stack Architecture**: Complete separation of frontend (HTML/CSS/JS), backend (Python/Flask REST API), and database (MySQL) layers, mirroring real-world application structures.
- **Role-Based Interface**: Distinct admin and student interfaces with separate page sets, stylesheets, and JavaScript modules, demonstrating privilege escalation attack surfaces.
- **Containerized Deployment**: Docker and Docker Compose definitions for one-command lab provisioning with MySQL, the Flask application, phpMyAdmin, and Filebeat services.
- **SIEM Integration**: Pre-configured Filebeat log shipping and Splunk integration examples for building detection rules, dashboards, and alerting pipelines.
- **Automated Vulnerability Testing**: A 17-case test suite (`test-vulnerabilities.sh`) that validates all intentional vulnerabilities against a running instance.
- **Real-Time Attack Monitoring**: A log analysis script (`monitor-attacks.sh`) that detects SQL injection attempts, XSS payloads, and brute force patterns in real time.
- **Comprehensive Documentation**: Detailed vulnerability summary with file-level references, reproduction steps, and a full screenshot evidence library organized by category.
- **Pre-Seeded Data**: Database initialization script populates the platform with sample users, courses, enrollments, and announcements for immediate hands-on use.
- **Cross-Machine Testing**: Backend binds to `0.0.0.0`, enabling multi-machine attack/defense scenarios across a local network.

---

## Tech Stack

### Backend

| Technology       | Version | Purpose                                        |
|------------------|---------|------------------------------------------------|
| Python           | 3.11    | Primary backend runtime                        |
| Flask            | 3.0.0   | Lightweight WSGI web framework for the REST API|
| Flask-CORS       | 4.0.0   | Cross-Origin Resource Sharing middleware        |
| PyMySQL          | 1.1.0   | Pure-Python MySQL client library               |
| Werkzeug         | 3.0.1   | WSGI utility library (Flask dependency)        |

### Frontend

| Technology  | Purpose                                          |
|-------------|--------------------------------------------------|
| HTML5       | Page structure and semantic markup               |
| CSS3        | Styling with role-separated stylesheets          |
| JavaScript  | Client-side logic via modular ES5/ES6 scripts    |

### Database

| Technology  | Version | Purpose                                      |
|-------------|---------|----------------------------------------------|
| MySQL       | 9.7     | Primary relational database                  |
| phpMyAdmin  | 5.2     | Web-based database administration interface  |

### DevOps and Infrastructure

| Technology       | Version  | Purpose                                      |
|------------------|----------|----------------------------------------------|
| Docker           | --       | Application containerization                 |
| Docker Compose   | --       | Multi-service orchestration                  |
| Apache HTTP      | --       | Production-grade web server (reverse proxy)  |
| Bash             | --       | Deployment and automation scripts            |

### Observability and Security

| Technology  | Version | Purpose                                         |
|-------------|---------|------------------------------------------------|
| Filebeat    | 8.11.0  | Log shipping agent for centralized collection  |
| Splunk      | --      | SIEM platform for log analysis and dashboarding|
| Nessus      | --      | Vulnerability scanning (used in testing)       |
| Nmap        | --      | Network discovery and port scanning            |
| SQLMap      | --      | Automated SQL injection testing                |

---

## Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed and running.
- **Python 3.11+** installed (required only for non-containerized development).
- **Git** installed for cloning the repository.
- **Apache HTTP Server** installed (required only for production-style deployment via startup scripts).
- A Linux-based operating system is recommended for full script compatibility (Ubuntu/Debian preferred).

### Installation

1. Clone the repository:

```bash
git clone https://github.com/cys-ahmed/Nexus-LMS-Project
cd Nexus-LMS-Project
```

2. Navigate to the application directory:

```bash
cd Nexus
```

### Option A: Docker Deployment (Recommended)

Launch the entire stack (MySQL, Flask backend, phpMyAdmin, Filebeat) with a single command:

```bash
docker compose -f backend/database/docker-compose.yml up -d --build
```

Wait for all services to pass their health checks. Verify with:

```bash
docker ps
```

The application will be available at `http://localhost:5000`. phpMyAdmin will be available at `http://localhost:8080`.

### Option B: Automated Script Deployment

Use the provided startup scripts for a full Apache-backed deployment:

```bash
# Install all system dependencies (first-time setup)
sudo ./startup/install-dependencies.sh

# Deploy and start all services
sudo ./startup/start.sh
```

### Option C: Manual Local Development

```bash
# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Start a standalone MySQL container
docker compose -f backend/database/docker-compose.yml up -d mysql

# Run the Flask backend
python3 backend/app.py
```

The application will be available at `http://localhost:5000`.

---

## Environment Variables

The backend application reads the following environment variables (with defaults):

| Variable      | Default        | Description                      |
|---------------|----------------|----------------------------------|
| `DB_HOST`     | `mysql`        | MySQL server hostname            |
| `DB_PORT`     | `3306`         | MySQL server port                |
| `DB_USER`     | `admin`        | MySQL authentication username    |
| `DB_PASSWORD` | `admin`        | MySQL authentication password    |
| `DB_NAME`     | `mydb`         | Target database name             |

These values are pre-configured in `docker-compose.yml` for containerized deployments.

---

## Default Credentials

| Role    | Username  | Email              | Password  |
|---------|-----------|--------------------|-----------|
| Admin   | admin     | admin@nexus.io     | admin     |
| Student | student   | student@nexus.io   | student   |
| Student | user      | user@nexus.io      | user      |

**Note**: These credentials are intentionally weak for lab and training purposes.

---

## Usage

### Accessing the Application

- **Landing Page**: Navigate to `http://localhost:5000/` to reach the main site entry point.
- **Login**: Navigate to `http://localhost:5000/pages/login.html` to authenticate.
- **Admin Panel**: After logging in as an admin, access pages under `/pages/admin/` for user management, course management, and platform statistics.
- **Student Panel**: After logging in as a student, access pages under `/pages/user/` for the course catalog, enrolled course progress, certificates, and profile management.
- **phpMyAdmin**: Navigate to `http://localhost:8080` for direct database inspection and manipulation.

### Testing Vulnerabilities

Run the automated vulnerability test suite against a running instance:

```bash
./startup/test-vulnerabilities.sh localhost 5000
```

This executes 17 predefined test cases covering SQL injection, XSS, broken access control, and other vulnerability categories.

### Monitoring for Attacks

Launch the real-time attack monitoring script to observe log activity:

```bash
./startup/monitor-attacks.sh
```

This script tails application logs, applies pattern-matching rules, and highlights detected attack signatures as they occur.

### Stopping Services

```bash
# Graceful shutdown (preserves data)
sudo ./startup/stop.sh

# Or stop Docker services directly
docker compose -f backend/database/docker-compose.yml down

# Full cleanup (removes all data, containers, and volumes)
sudo ./startup/cleanup.sh
```

---

## API Reference

The Flask backend exposes the following REST API endpoints:

| Method | Endpoint                            | Description                         |
|--------|-------------------------------------|-------------------------------------|
| POST   | `/api/login`                        | Authenticate a user                 |
| GET    | `/api/users`                        | List all users                      |
| POST   | `/api/users`                        | Create a new user                   |
| DELETE | `/api/users/<user_id>`              | Delete a user by ID                 |
| GET    | `/api/users/search?q=`              | Search users by username            |
| POST   | `/api/change-password`              | Change a user password              |
| POST   | `/api/profile/update`               | Update user profile                 |
| GET    | `/api/courses`                      | List all courses                    |
| GET    | `/api/courses/<course_id>`          | Get a course by ID                  |
| POST   | `/api/courses`                      | Create a new course                 |
| PUT    | `/api/courses/<course_id>`          | Update a course                     |
| DELETE | `/api/courses/<course_id>`          | Delete a course                     |
| GET    | `/api/courses/search?q=`            | Search courses by title or category |
| GET    | `/api/enrollments`                  | List enrollments (filterable)       |
| POST   | `/api/enrollments`                  | Enroll a user in a course           |
| DELETE | `/api/enrollments/<enrollment_id>`  | Remove an enrollment by ID          |
| DELETE | `/api/enrollments/by-user-course`   | Remove enrollment by user and course|
| PUT    | `/api/enrollments/progress`         | Update enrollment progress          |
| GET    | `/api/announcements`                | List all announcements              |
| POST   | `/api/announcements`                | Create an announcement              |
| DELETE | `/api/announcements/<ann_id>`       | Delete an announcement              |
| DELETE | `/api/announcements/clear`          | Delete all announcements            |
| GET    | `/api/reviews`                      | List reviews (filterable by course) |
| POST   | `/api/reviews`                      | Submit a course review              |
| GET    | `/api/stats`                        | Get platform-wide statistics        |
| GET    | `/search?q=`                        | Vulnerable search page (XSS demo)  |
| GET    | `/health`                           | Service health check                |

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full terms and conditions.

---

## Disclaimer

This application is **intentionally insecure** and is designed exclusively for educational, training, and authorized security testing purposes. Do not deploy this application on any production or publicly accessible network. The authors assume no liability for misuse of the vulnerabilities or tools contained within this project.
