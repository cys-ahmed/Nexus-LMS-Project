# Mitigation Screenshots

Screenshots documenting vulnerability remediation steps, security hardening measures, and patched configurations for the Nexus LMS platform.

---

## Overview

This directory contains visual evidence of the mitigation and remediation work performed after the initial vulnerability assessment. Each screenshot demonstrates a specific security fix, hardening measure, or configuration change applied to address the identified vulnerabilities. These before/after records serve as proof of remediation for security audit reports and academic deliverables.

---

## Files

| File                  | Vulnerability Addressed     | Description                                                                             |
|-----------------------|-----------------------------|-----------------------------------------------------------------------------------------|
| `sqli.png`            | SQL Injection               | Screenshot showing the implementation of parameterized queries or input sanitization to prevent SQL injection attacks. |
| `reflected_xss_1.png` | Reflected XSS               | Screenshot showing output encoding or input validation applied to the `/search` endpoint to prevent reflected XSS. |
| `reflected_xss_2.png` | Reflected XSS               | Additional mitigation evidence for reflected XSS, showing sanitized HTML output.        |
| `stored_xss_1.png`    | Stored XSS                  | Screenshot showing `.innerHTML` replaced with safe DOM methods or content sanitization to prevent stored XSS. |
| `stored_xss_2.png`    | Stored XSS                  | Additional mitigation evidence for stored XSS in frontend modules.                      |
| `ssh_1.png`           | SSH Hardening               | Screenshot showing SSH configuration hardening (e.g., disabling root login, key-based authentication enforcement). |
| `ssh_2.png`           | SSH Hardening               | Additional SSH hardening configuration changes or verification steps.                   |
| `ssh_3.png`           | SSH Hardening               | Further SSH security measures or post-hardening verification output.                    |
| `upload_file_1.png`   | Unrestricted File Upload    | Screenshot showing file type validation, size limits, or upload directory restrictions to prevent malicious file uploads. |
| `upload_file_2.png`   | Unrestricted File Upload    | Additional file upload mitigation evidence or server-side validation implementation.    |
