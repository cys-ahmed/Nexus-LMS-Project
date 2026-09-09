# 1. Base Image: Unprivileged Nginx Alpine
FROM nginxinc/nginx-unprivileged:alpine

# 2. Switch to root TEMPORARILY to perform file operations
USER root

# 3. Set the working directory
WORKDIR /usr/share/nginx/html

# 4. Now we have permission to remove the default root-owned files
RUN rm -rf ./*

# 5. Copy your project files and explicitly hand ownership to the nginx user
COPY --chown=nginx:nginx . /usr/share/nginx/html/

# 6. CRITICAL: Switch back to the unprivileged user for runtime security
USER nginx

# 7. Expose the port
EXPOSE 8080

# 8. Start the web server
CMD ["nginx", "-g", "daemon off;"]