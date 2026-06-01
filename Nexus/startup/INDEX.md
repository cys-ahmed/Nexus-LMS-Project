


1. **start.sh** ⭐
   - Clean start with data removal
   - Copies app to /var/www/Nexus
   - Configures Apache
   - Starts all services
   - Usage: `sudo ./startup/start.sh`

2. **stop.sh**
   - Gracefully stops all services
   - Preserves data
   - Usage: `sudo ./startup/stop.sh`

3. **deploy.sh** (Legacy)
   - Original deployment script
   - Similar to start.sh but without clean
   - Usage: `sudo ./startup/deploy.sh`

4. **cleanup.sh**
   - Removes all data and containers
   - Complete cleanup
   - Usage: `sudo ./startup/cleanup.sh`


5. **test-vulnerabilities.sh**
   - Automated vulnerability testing
   - 17 test cases
   - Usage: `./startup/test-vulnerabilities.sh [host] [port]`

6. **monitor-attacks.sh**
   - Real-time attack monitoring
   - Log analysis with detection
   - Usage: `./startup/monitor-attacks.sh`


7. **nexus-apache.conf**
   - Apache web server configuration
   - Copied to: `/etc/apache2/sites-available/nexus.conf`
   - Intentionally insecure for lab purposes


8. **install-dependencies.sh**
   - Installs all prerequisites
   - Python, Apache, Docker, Docker Compose
   - Usage: `sudo ./startup/install-dependencies.sh`


9. **README.md**
   - Comprehensive startup guide
   - Configuration details
   - Troubleshooting

10. **INDEX.md** (This file)
    - File listing and descriptions

---



```bash
sudo ./startup/install-dependencies.sh

sudo ./startup/start.sh
```


```bash
sudo ./startup/start.sh

sudo ./startup/stop.sh

./startup/test-vulnerabilities.sh

./startup/monitor-attacks.sh
```


```bash
sudo ./startup/cleanup.sh

sudo ./startup/install-dependencies.sh
```

---


| Script | Purpose | Data Removal | Time |
|--------|---------|--------------|------|
| start.sh | Clean start | ✅ Yes | ~5 min |
| stop.sh | Stop services | ❌ No | ~1 min |
| deploy.sh | Deploy (legacy) | ❌ No | ~15 min |
| cleanup.sh | Full cleanup | ✅ Yes | ~2 min |

---


For convenience, master scripts are available in the root:

- `./start.sh` → calls `./startup/start.sh`
- `./stop.sh` → calls `./startup/stop.sh`

---


```
start.sh                  ~200 lines
stop.sh                   ~80 lines
deploy.sh                 ~200 lines
cleanup.sh                ~100 lines
test-vulnerabilities.sh   ~200 lines
monitor-attacks.sh        ~200 lines
nexus-apache.conf         ~100 lines
install-dependencies.sh   ~100 lines
README.md                 ~400 lines
INDEX.md                  This file
```

---


1. **Always run as root/sudo** for start, stop, deploy, cleanup
2. **Test and monitor scripts** can run as regular user
3. **start.sh removes all data** - prompts for confirmation
4. **stop.sh preserves data** - safe to use
5. **All scripts are in startup/** directory

---



```bash
cd /path/to/Nexus
sudo ./startup/install-dependencies.sh
sudo ./startup/start.sh
```


```bash
sudo ./startup/start.sh

sudo ./startup/stop.sh
```


```bash
sudo ./startup/start.sh

./startup/test-vulnerabilities.sh localhost 5000

./startup/monitor-attacks.sh
```


```bash
sudo ./startup/cleanup.sh
sudo ./startup/start.sh
```

---


For issues with scripts:
1. Check script output for errors
2. Review logs: `/var/log/webapp/app.log`
3. Check Docker: `docker ps`
4. Check Apache: `systemctl status apache2`
5. See README.md for troubleshooting

---

**All scripts are located in the `startup/` directory**
