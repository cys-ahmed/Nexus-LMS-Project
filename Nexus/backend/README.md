# Backend

Server-side application code, container definitions, and database orchestration resources for the Nexus LMS platform.

---

## Overview

The backend is a Python/Flask REST API that serves as the sole server-side component of the Nexus LMS platform. It handles user authentication, user management, course CRUD operations, enrollment tracking, announcements, reviews, platform statistics, and static file serving for the frontend. The application connects to a MySQL database and is designed to run inside a Docker container, though it can also be executed directly via Python for local development.

**Important**: This backend contains intentional security vulnerabilities for training purposes. These include SQL injection via string concatenation, reflected XSS in the `/search` endpoint, plaintext password storage, and missing authorization checks on sensitive endpoints. Refer to `VULNERABILITY_SUMMARY.md` in the parent directory for full details.

---

## Directory Contents

### Subdirectories

- **database/** -- Database initialization scripts, Docker Compose orchestration file for the full service stack (MySQL, webapp, phpMyAdmin, Filebeat), and Filebeat log-shipping configuration.

### Files

- **app.py** -- The main Flask application (581 lines). Implements 27 REST API endpoints covering authentication, user management, course management, enrollment tracking, announcements, reviews, statistics, a vulnerable search page, and a health check. Also serves the frontend as static files.
- **Dockerfile** -- Container image definition based on `python:3.11-slim`. Installs system dependencies, copies application code, configures logging and upload directories, exposes port 5000, and defines a health check against the `/health` endpoint.
- **requirements.txt** -- Python dependency manifest listing: Flask 3.0.0, Flask-CORS 4.0.0, PyMySQL 1.1.0, cryptography 41.0.7, and Werkzeug 3.0.1.

---

## API Endpoints

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
| GET    | `/api/courses/search?q=`            | Search courses                      |
| GET    | `/api/enrollments`                  | List enrollments (filterable)       |
| POST   | `/api/enrollments`                  | Enroll a user in a course           |
| DELETE | `/api/enrollments/<id>`             | Remove an enrollment                |
| DELETE | `/api/enrollments/by-user-course`   | Remove enrollment by user and course|
| PUT    | `/api/enrollments/progress`         | Update enrollment progress          |
| GET    | `/api/announcements`                | List all announcements              |
| POST   | `/api/announcements`                | Create an announcement              |
| DELETE | `/api/announcements/<ann_id>`       | Delete an announcement              |
| DELETE | `/api/announcements/clear`          | Delete all announcements            |
| GET    | `/api/reviews`                      | List reviews (filterable)           |
| POST   | `/api/reviews`                      | Submit a course review              |
| GET    | `/api/stats`                        | Get platform-wide statistics        |
| GET    | `/search?q=`                        | Vulnerable search page (XSS demo)  |
| GET    | `/health`                           | Service health check                |

---

## Running Locally

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the application
python3 app.py
```

The server starts on `http://0.0.0.0:5000` by default.

---

## Environment Variables

| Variable      | Default   | Description                 |
|---------------|-----------|-----------------------------|
| `DB_HOST`     | `mysql`   | MySQL server hostname       |
| `DB_PORT`     | `3306`    | MySQL server port           |
| `DB_USER`     | `admin`   | MySQL authentication user   |
| `DB_PASSWORD` | `admin`   | MySQL authentication pass   |
| `DB_NAME`     | `mydb`    | Target database name        |
