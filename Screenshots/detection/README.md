# Detection Screenshots

Screenshots demonstrating security detection events, automated scanning tool outputs, and alert triggers from vulnerability testing against the Nexus LMS platform.

---

## Overview

This directory contains visual evidence captured during the detection and scanning phase of the security assessment. Screenshots document outputs from industry-standard tools (Nessus, Nmap, SQLMap) as well as manual exploitation results, providing proof of successful vulnerability discovery and exploitation for reporting purposes.

---

## Files

### Vulnerability Scanning

| File           | Tool   | Description                                                                                  |
|----------------|--------|----------------------------------------------------------------------------------------------|
| `Nessus_1.png` | Nessus | Nessus vulnerability scan results -- overview or summary dashboard.                          |
| `Nessus_2.png` | Nessus | Nessus scan results -- detailed vulnerability findings view.                                 |
| `Nessus_3.png` | Nessus | Nessus scan results -- additional findings or remediation recommendations.                   |
| `nmap.png`     | Nmap   | Nmap network discovery and port scan output showing open services on the target host.        |

### SQL Injection

| File           | Tool    | Description                                                                                 |
|----------------|---------|---------------------------------------------------------------------------------------------|
| `sqli.png`     | Manual  | Manual SQL injection execution and authentication bypass confirmation.                      |
| `sqlmap_1.png` | SQLMap  | SQLMap automated exploitation -- initial injection point detection and database enumeration. |
| `sqlmap_2.png` | SQLMap  | SQLMap exploitation -- table and column extraction from the target database.                 |
| `sqlmap_3.png` | SQLMap  | SQLMap exploitation -- data dump or further enumeration results.                             |
| `sqlmap_4.png` | SQLMap  | SQLMap exploitation -- additional extraction or advanced technique results.                  |

### Cross-Site Scripting (XSS)

| File                 | Type      | Description                                                                          |
|----------------------|-----------|--------------------------------------------------------------------------------------|
| `reflected_xss_1.png`| Reflected | Reflected XSS payload execution via the vulnerable `/search` endpoint.               |
| `reflected_xss_2.png`| Reflected | Additional reflected XSS execution evidence or alternative payload.                  |
| `stored_xss_1.png`   | Stored    | Stored XSS payload injection via announcements or course content.                    |
| `stored_xss_2.png`   | Stored    | Stored XSS payload firing in the context of another user's browser session.          |
| `xss_test.png`       | General   | XSS testing setup or payload crafting screenshot.                                    |

### File Upload and Web Shell

| File              | Description                                                                                  |
|-------------------|----------------------------------------------------------------------------------------------|
| `file_upload.png` | Malicious file upload exploitation -- successful upload of a restricted file type.            |
| `web_shell.png`   | Web shell deployment and command execution on the target server.                              |

### Reverse Shell

| File             | Description                                                                                   |
|------------------|-----------------------------------------------------------------------------------------------|
| `rev_shell_1.png`| Reverse shell establishment -- attacker listener setup and initial connection.                |
| `rev_shell_2.png`| Reverse shell session -- command execution on the compromised target.                         |
| `rev_shell_3.png`| Reverse shell session -- additional post-exploitation activity or privilege escalation.        |

### Reconnaissance

| File           | Description                                                                                    |
|----------------|------------------------------------------------------------------------------------------------|
| `robots.png`   | Discovery of the `robots.txt` file revealing hidden or sensitive paths.                        |
| `sitemap.png`  | Discovery of the `sitemap.xml` file revealing the application's URL structure.                 |
| `shell.png`    | Shell session or terminal output from reconnaissance or exploitation activity.                 |
