# Pages

HTML page templates for the Nexus LMS application, organized by user role.

---

## Overview

This directory contains all HTML page files that define the structural markup for each view in the Nexus LMS platform. Pages are organized into role-based subdirectories (admin and student), with the shared login page at the root level. Each page links to the appropriate CSS stylesheets and JavaScript modules for its functional context.

---

## Directory Contents

### Subdirectories

- **admin/** -- Administrative interface pages accessible to users with the Admin role. Contains the admin panel, dashboard, course catalog management, and course detail views.
- **user/** -- Student-facing interface pages accessible to users with the Student role. Contains the student panel, dashboard, course catalog, course detail, certificates, and profile views.

### Files

- **login.html** -- The authentication page presented to all unauthenticated users. Contains the login form with username/email and password input fields. On successful authentication, redirects users to their role-appropriate dashboard (admin or student).

---

## Page Routing

| URL Path                          | File                      | Role     |
|-----------------------------------|---------------------------|----------|
| `/pages/login.html`               | `login.html`              | Public   |
| `/pages/admin/dashboard.html`     | `admin/dashboard.html`    | Admin    |
| `/pages/admin/admin.html`         | `admin/admin.html`        | Admin    |
| `/pages/admin/courses.html`       | `admin/courses.html`      | Admin    |
| `/pages/admin/course-info.html`   | `admin/course-info.html`  | Admin    |
| `/pages/user/dashboard.html`      | `user/dashboard.html`     | Student  |
| `/pages/user/user.html`           | `user/user.html`          | Student  |
| `/pages/user/courses.html`        | `user/courses.html`       | Student  |
| `/pages/user/course-info.html`    | `user/course-info.html`   | Student  |
| `/pages/user/certificates.html`   | `user/certificates.html`  | Student  |
| `/pages/user/profile.html`        | `user/profile.html`       | Student  |
