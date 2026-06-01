# Code Screenshots

Screenshots of annotated source code used for vulnerability analysis and security documentation.

---

## Overview

This directory contains visual records of the Nexus LMS source code, annotated and highlighted to identify vulnerable code patterns. These screenshots are used in security audit reports, presentations, and academic documentation to illustrate where and how specific vulnerabilities exist in the codebase.

---

## Directory Contents

### Subdirectories

- **code/** -- Contains detailed, annotated code screenshots focusing on specific vulnerability categories including authentication bypass, SQL injection, XSS (reflected and stored), OS command injection, file upload flaws, and client-side trust issues.

---

## Files in code/code/

| File                              | Description                                                                                        |
|-----------------------------------|----------------------------------------------------------------------------------------------------|
| `auth-js.png`                     | Annotated screenshot of `auth.js` highlighting the client-side authentication trust vulnerability where user identity is derived entirely from `localStorage`. |
| `sqli.jpeg`                       | Annotated screenshot of SQL injection vulnerable code in `app.py`, showing raw string concatenation in SQL queries. |
| `xss-reflected.png`               | Annotated screenshot highlighting the reflected XSS vulnerability in the `/search` endpoint where user input is rendered raw in HTML output. |
| `xss-reflected2.png`              | Additional annotated view of reflected XSS code patterns.                                          |
| `xss-reflected-contact-front.png` | Annotated screenshot of the contact form frontend code showing unsafe `.innerHTML` injection of server responses. |
| `xss-stored.png`                  | Annotated screenshot highlighting stored XSS vulnerability where unsanitized data is inserted via `.innerHTML` in frontend modules. |
| `xss-stored2.png`                 | Additional annotated view of stored XSS code patterns.                                             |
| `os-command-inj.png`              | Annotated screenshot highlighting OS command injection vulnerability patterns in the backend code.  |
| `password-front.png`              | Annotated screenshot showing plaintext password handling in the frontend login flow.                |
| `username-front.png`              | Annotated screenshot showing username input handling and potential injection points in the frontend. |
| `uploaded-file.png`               | Annotated screenshot of backend file upload handling code showing insufficient validation.          |
| `uploaded-file2.png`              | Additional annotated view of file upload vulnerability code.                                       |
| `uploaded-file-front.png`         | Annotated screenshot of the frontend file upload interface and its interaction with the backend.    |
| `file-uploaded-admin-front.png`   | Annotated screenshot showing how uploaded files are displayed in the admin interface without sanitization. |
