# Splunk Universal Forwarder Screenshots

Screenshots documenting the Splunk Universal Forwarder installation and configuration on the Nexus LMS application host.

---

## Overview

This directory contains visual records of the Splunk Universal Forwarder deployment process on the Nexus LMS target machine. The forwarder is responsible for collecting application logs from the web server and shipping them to the central Splunk Enterprise instance for indexing, analysis, and alerting.

---

## Files

| File                           | Description                                                                                      |
|--------------------------------|--------------------------------------------------------------------------------------------------|
| `splunkforwarder_install.png`  | Splunk Universal Forwarder package installation on the application host.                         |
| `setup.png`                    | Forwarder initial setup and configuration, including the target Splunk indexer address and port.  |
| `inputs.png`                   | Data inputs configuration showing the log file paths being monitored (e.g., `/var/log/webapp/`). |
| `add_moniter.png`              | Adding a new monitor input to the forwarder to capture additional log sources from the Nexus application. |
