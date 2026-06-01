# Assets

Static media and image assets used by the Nexus LMS frontend interface.

---

## Overview

This directory contains all visual media referenced by the web application, including branding assets, default user imagery, and course catalog thumbnails. These files are served as static resources by the Flask backend and referenced directly in HTML templates and JavaScript modules.

---

## Directory Contents

### Subdirectories

- **courses_img/** -- Course thumbnail images displayed in the course catalog, course detail pages, and enrollment views. Each image file corresponds to a specific course entry in the database.

### Files

- **Application_Logo.png** -- The official Nexus LMS brand logo. Displayed in the site header, navigation bar, and login page.
- **ProfilePic.png** -- Default user profile avatar image. Used as a placeholder across the platform when no custom profile image has been uploaded.

---

## Usage

Assets are referenced using relative paths from the application root. For example, course images are stored in the database as paths like `assets/courses_img/react_js.png` and resolved by the frontend at render time.
