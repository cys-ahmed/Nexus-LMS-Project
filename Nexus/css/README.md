# CSS

Cascading Style Sheets defining the visual presentation of the Nexus LMS web application, separated by functional scope.

---

## Overview

This directory contains all stylesheets used by the Nexus LMS frontend. Styles are organized into three files that separate concerns by scope: a global base stylesheet, an administrator-specific stylesheet, and a student-specific stylesheet. This separation enables clean role-based theming without style conflicts across interface contexts.

---

## Files

### styles.css

The primary global stylesheet applied across all pages of the application. Defines:

- Base layout structure, typography, and color scheme
- Navigation bar and header component styles
- Responsive breakpoints and media queries
- Shared UI component styles (buttons, forms, cards, modals)
- Landing page and login page presentation
- Footer and utility class definitions

### admin.css

Supplementary styles specific to the administrator interface. Extends the global stylesheet with:

- Admin dashboard cards and metric display panels
- Data tables for user and course management
- User management action buttons and confirmation dialogs
- Course management forms, status indicators, and editing controls
- Announcement management panel styles
- Admin sidebar navigation and active state indicators

### user.css

Supplementary styles specific to the student-facing interface. Extends the global stylesheet with:

- Student dashboard layout and enrolled course progress cards
- Course catalog grid and course card presentation
- Course detail page layout and review section styles
- Profile page form styling and password change dialogs
- Certificate display and generation view styles
- Student sidebar navigation and active state indicators

---

## Usage

Stylesheets are linked in HTML pages based on the page's role context:

- All pages include `css/styles.css` as the base stylesheet.
- Admin pages additionally include `css/admin.css`.
- Student pages additionally include `css/user.css`.
