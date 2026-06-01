# User Pages

Student-facing interface pages for the Nexus LMS platform, accessible to users with the Student role.

---

## Overview

This directory contains HTML page templates that compose the student-facing interface of the Nexus LMS platform. These pages provide the student experience for browsing courses, tracking enrollment progress, managing profiles, and viewing certificates. Each page loads the global stylesheet (`css/styles.css`), the student-specific stylesheet (`css/user.css`), shared utilities (`js/auth.js`, `js/utils.js`), and its corresponding JavaScript module.

---

## Files

### user.html

The primary student panel page. Provides the main student layout with:

- Sidebar navigation for switching between student views
- Content area that hosts the active view
- Shared navigation state management

**JavaScript module**: `js/user.js`

### dashboard.html

The student dashboard landing page. Displays personalized content including:

- Enrolled course progress cards with completion percentages
- Recent platform announcements
- At-a-glance learning statistics

**JavaScript module**: `js/dashboard.js`

### courses.html

The student course catalog page. Presents:

- Available courses as browsable cards with thumbnails, descriptions, and pricing
- Enrollment action buttons for unenrolled courses
- Category and level information per course

**JavaScript module**: `js/courses.js`

### course-info.html

The student course detail page for a specific course. Displays:

- Full course description, instructor information, and metadata
- Enrollment status and progress tracking bar
- Course reviews section with the ability to submit new reviews
- Unenrollment action

**JavaScript module**: `js/user-course-info.js`

### certificates.html

The student certificates page. Provides:

- A listing of earned completion certificates for courses with 100% progress
- Certificate generation and display for completed courses

**JavaScript module**: `js/certificates.js`

### profile.html

The student profile management page. Allows:

- Viewing current username, email, role, and account creation date
- Updating username and email via an edit form
- Changing the account password with current password verification

**JavaScript module**: `js/profile.js`
