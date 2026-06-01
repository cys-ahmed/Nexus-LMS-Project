# Database

Database orchestration, schema initialization, and log-shipping configuration for the Nexus LMS service stack.

---

## Overview

This directory contains all resources required to provision and configure the data layer and supporting services for the Nexus LMS platform. The Docker Compose file defines a complete multi-service environment, the SQL script initializes the database schema and seeds it with sample data, and the Filebeat configuration enables centralized log collection for SIEM integration.

---

## Files

### docker-compose.yml

Multi-service Docker Compose orchestration file that provisions the complete lab environment. Defines the following services:

| Service       | Image                                    | Port  | Description                                      |
|---------------|------------------------------------------|-------|--------------------------------------------------|
| `mysql`       | `mysql:9.7`                              | 3306  | Primary relational database with health checks and persistent storage. Initialized from `init.sql`. |
| `webapp`      | Built from `../Dockerfile`               | 5000  | The Flask backend application container.         |
| `phpmyadmin`  | `phpmyadmin:5.2`                         | 8080  | Web-based database administration interface.     |
| `filebeat`    | `docker.elastic.co/beats/filebeat:8.11.0`| --    | Log shipping agent forwarding webapp logs to a SIEM platform. |

All services are connected via a shared `lab_network` bridge network. Persistent volumes are defined for MySQL data (`mysql_data`), webapp logs (`webapp_logs`), and file uploads (`uploads`).

### init.sql

SQL initialization script executed automatically when the MySQL container starts for the first time via the Docker entrypoint mechanism. Performs the following operations:

- Creates the `mydb` database.
- Defines five tables: `users`, `courses`, `enrollments`, `announcements`, and `reviews` with full schema including primary keys, foreign keys, unique constraints, and enum types.
- Seeds the database with three default users (admin, student, user), six sample courses, five enrollment records, and three system announcements.

### filebeat.yml

Filebeat configuration file that defines log input paths and output destinations. Used by the Filebeat container to ship application logs from the webapp log volume to a centralized SIEM or log aggregation platform (e.g., Splunk, Elasticsearch).

---

## Quick Reference

```bash
# Start the full service stack
docker compose up -d --build

# Verify all services are healthy
docker ps

# View MySQL logs
docker logs mysql_db

# Access phpMyAdmin
# Navigate to http://localhost:8080

# Stop all services (preserve data)
docker compose down

# Stop all services and remove volumes
docker compose down -v
```

---

## Database Schema

```
users
  - user_id (PK, AUTO_INCREMENT)
  - username (UNIQUE)
  - email (UNIQUE)
  - password
  - role (ENUM: Admin, Student)
  - created_at

courses
  - course_id (PK, AUTO_INCREMENT)
  - title, category, instructor
  - price, level, status
  - emoji, image, description
  - created_at

enrollments
  - id (PK, AUTO_INCREMENT)
  - user_id (FK -> users)
  - course_id (FK -> courses)
  - progress, enrolled_at, last_accessed

announcements
  - id (PK, AUTO_INCREMENT)
  - title, body
  - severity (ENUM: info, warning, critical)
  - author, created_at

reviews
  - id (PK, AUTO_INCREMENT)
  - user_id (FK -> users)
  - course_id (FK -> courses)
  - rating, body, created_at
```
