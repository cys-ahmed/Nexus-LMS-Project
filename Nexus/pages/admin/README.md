# Admin Pages

Administrative interface pages for the Nexus LMS platform, accessible to users with the Admin role.

---

## Overview

This directory contains HTML page templates that compose the administrator-facing interface of the Nexus LMS platform. These pages provide controls for managing users, courses, enrollments, announcements, and platform-wide settings. Each page loads the global stylesheet (`css/styles.css`), the admin-specific stylesheet (`css/admin.css`), shared utilities (`js/auth.js`, `js/utils.js`), and its corresponding JavaScript module.

---

## Files

### admin.html

The primary admin panel page. Provides the main administrative layout with:

- Sidebar navigation for switching between management views
- User management tables with add, search, and delete operations
- Role assignment controls
- Quick action buttons for common administrative tasks

**JavaScript module**: `js/admin.js`

### dashboard.html

The admin dashboard landing page. Displays aggregate platform metrics including:

- Total student count
- Active and total course counts
- Total enrollment figures
- Revenue data
- Announcement count

**JavaScript module**: `js/admin-dashboard.js`

### courses.html

The admin course catalog management page. Provides:

- A tabular listing of all courses with status indicators (published, draft, archived)
- Course creation form with fields for title, category, instructor, price, level, and image
- Search and filtering controls
- Edit and delete actions per course entry

**JavaScript module**: `js/admin-courses.js`

### course-info.html

The admin course detail page for a specific course. Displays:

- Full course metadata (title, instructor, category, price, level, description)
- Inline editing controls for all course fields
- Enrolled student listing with progress information
- Course-level administrative actions (publish, archive, delete)

**JavaScript module**: `js/admin-course-info.js`
