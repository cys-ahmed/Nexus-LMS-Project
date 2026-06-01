# Course Images

Thumbnail images for courses displayed in the Nexus LMS course catalog, detail pages, and enrollment views.

---

## Overview

This directory contains all course-specific imagery used by the frontend interface. Each image file corresponds to a course record in the database, where the `image` column stores the relative path (e.g., `assets/courses_img/react_js.png`). Images are rendered as thumbnails on course cards and as hero images on individual course detail pages.

---

## Files

| File                  | Associated Course / Subject         |
|-----------------------|-------------------------------------|
| `react_js.png`        | React -- The Complete Guide         |
| `python.png`          | Python for Data Science             |
| `ethical_hacking.png` | Ethical Hacking A-Z                 |
| `ui_ux.png`           | UI/UX Design with Figma             |
| `docker.png`          | Docker and Kubernetes Complete      |
| `Deep_Learning.png`   | Deep Learning Specialization        |
| `machine_learning.png`| Machine Learning                    |
| `node_js.png`         | Node.js                             |
| `js.png`              | JavaScript                          |
| `css.png`             | CSS                                 |
| `flutter.png`         | Flutter                             |
| `security_plus.png`   | CompTIA Security+                   |

---

## Notes

- Image dimensions and formats are not standardized; the frontend CSS handles responsive scaling.
- To add a new course image, place the file in this directory and reference its relative path in the course record's `image` field via the admin panel or directly in `init.sql`.
