# Code (Nested)

Detailed, annotated source code screenshots focusing on specific vulnerability categories identified in the Nexus LMS codebase.

---

## Overview

This subdirectory contains the primary collection of annotated code screenshots used for vulnerability documentation. Each image highlights a specific vulnerable code pattern with visual annotations, making them suitable for inclusion in security audit reports, academic papers, and training presentations.

---

## Files

| File                              | Vulnerability Category        | Description                                                                          |
|-----------------------------------|-------------------------------|--------------------------------------------------------------------------------------|
| `auth-js.png`                     | Client-Side Trust             | Shows `auth.js` relying entirely on `localStorage` for identity verification.        |
| `sqli.jpeg`                       | SQL Injection                 | Shows raw string concatenation in SQL queries within `app.py`.                       |
| `xss-reflected.png`               | Reflected XSS                 | Shows the `/search` endpoint rendering user input directly in HTML.                  |
| `xss-reflected2.png`              | Reflected XSS                 | Additional view of reflected XSS code patterns.                                      |
| `xss-reflected-contact-front.png` | Reflected XSS (Contact Form)  | Shows the contact form injecting server responses via `.innerHTML`.                  |
| `xss-stored.png`                  | Stored XSS                    | Shows unsanitized API data rendered via `.innerHTML` in frontend modules.             |
| `xss-stored2.png`                 | Stored XSS                    | Additional view of stored XSS patterns.                                              |
| `os-command-inj.png`              | OS Command Injection          | Shows command injection vulnerability patterns in backend code.                      |
| `password-front.png`              | Plaintext Credentials         | Shows password handling without hashing in the frontend login flow.                  |
| `username-front.png`              | Input Handling                 | Shows username input handling and potential injection points.                         |
| `uploaded-file.png`               | Unrestricted File Upload      | Shows backend file upload handling with insufficient validation.                     |
| `uploaded-file2.png`              | Unrestricted File Upload      | Additional view of file upload vulnerability code.                                   |
| `uploaded-file-front.png`         | Unrestricted File Upload      | Shows the frontend file upload interface and backend interaction.                    |
| `file-uploaded-admin-front.png`   | Unrestricted File Upload      | Shows how uploaded files are displayed in the admin interface unsanitized.            |
