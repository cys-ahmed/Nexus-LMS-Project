# JavaScript

Client-side JavaScript modules implementing all interactive behavior, API communication, and DOM manipulation for the Nexus LMS platform.

---

## Overview

This directory contains modular JavaScript files that power the frontend logic of the Nexus LMS application. Each module is scoped to a specific page or functional area, following a one-module-per-page pattern for admin and student views. A shared utilities module provides common helper functions used across all contexts.

**Security Note**: Several modules use `.innerHTML` to render API response data without sanitization, creating stored XSS attack surfaces when combined with backend write vulnerabilities. This is intentional for lab training purposes. Refer to `VULNERABILITY_SUMMARY.md` for details.

---

## Files

### Admin Modules

| File                   | Purpose                                                                                          |
|------------------------|--------------------------------------------------------------------------------------------------|
| `admin.js`             | Core admin panel logic. Handles user CRUD operations (listing, adding, searching, deleting), admin navigation, and UI state management. |
| `admin-dashboard.js`   | Admin dashboard page logic. Fetches and renders platform-wide statistics (student count, active courses, total enrollments, revenue). |
| `admin-courses.js`     | Admin course catalog management. Implements course listing, creation forms, search/filtering, status toggling, and batch operations. |
| `admin-course-info.js` | Admin course detail view. Manages individual course editing, metadata display, enrolled student listings, and course-level actions. |

### Student Modules

| File                   | Purpose                                                                                          |
|------------------------|--------------------------------------------------------------------------------------------------|
| `user.js`              | Core student panel logic. Manages student sidebar navigation, panel layout state, and shared student-facing UI behavior. |
| `dashboard.js`         | Student dashboard logic. Displays enrolled course progress, recent announcements, and personalized learning statistics. |
| `courses.js`           | Student course catalog logic. Fetches available courses from the API, renders course cards, and handles enrollment actions. |
| `user-course-info.js`  | Student course detail view. Displays course information, progress tracking, reviews section, and unenrollment actions. |
| `certificates.js`      | Student certificates page. Generates and displays completion certificates based on enrollment progress data. |
| `profile.js`           | Student profile management. Handles profile data display, username/email update forms, and password change requests. |

### Shared Modules

| File       | Purpose                                                                                                        |
|------------|----------------------------------------------------------------------------------------------------------------|
| `auth.js`  | Authentication utility module. Manages login state verification, role-based redirect logic, and local storage session checks. |
| `utils.js` | Shared utility functions. Includes API base URL configuration, local storage helpers, role-checking functions, and common DOM manipulation routines. |

---

## Architecture

```
auth.js / utils.js        (Shared utilities, loaded on every page)
       |
       |-- admin.js                (Admin panel core)
       |     |-- admin-dashboard.js
       |     |-- admin-courses.js
       |     |-- admin-course-info.js
       |
       |-- user.js                 (Student panel core)
             |-- dashboard.js
             |-- courses.js
             |-- user-course-info.js
             |-- certificates.js
             |-- profile.js
```

---

## Notes

- All modules communicate with the backend via `fetch()` calls to the REST API endpoints defined in `backend/app.py`.
- Authentication state is stored in the browser's `localStorage` under the key `nx_user`. This is a known vulnerability (client-side trust) documented in the vulnerability summary.
- The API base URL is configured in `utils.js` and defaults to relative paths, enabling cross-machine testing when the backend binds to `0.0.0.0`.
