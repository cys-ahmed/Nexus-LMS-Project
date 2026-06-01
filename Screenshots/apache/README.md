# Apache Screenshots

Screenshots documenting Apache HTTP Server configuration and verification for the Nexus LMS deployment.

---

## Overview

This directory contains visual evidence of the Apache web server setup process, including virtual host configuration, document root assignment, and site activation. These screenshots serve as proof of proper server configuration and are used in deployment documentation and lab reports.

---

## Files

| File                              | Description                                                                                     |
|-----------------------------------|-------------------------------------------------------------------------------------------------|
| `document_root.png`               | Screenshot showing the configured Apache document root directory pointing to the Nexus application files. |
| `sites_available_defalut.png`     | Screenshot of the default Apache virtual host configuration file in `/etc/apache2/sites-available/`. |
| `sites_available_default_ssh.png` | Screenshot of the default virtual host configuration accessed via SSH session.                   |
| `sites_available_nexus.png`       | Screenshot of the Nexus-specific virtual host configuration file (`nexus.conf`) in `sites-available/`. |
| `sites_enable.png`                | Screenshot verifying the Nexus site symlink in `/etc/apache2/sites-enabled/`, confirming the virtual host is active. |
