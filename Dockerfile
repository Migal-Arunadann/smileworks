# Production Dockerfile for Smile Works Dental Clinic static website
FROM nginx:alpine

# Remove default Nginx placeholder website and prepare /app webroot
RUN rm -rf /usr/share/nginx/html/* && mkdir -p /app

# Copy production Nginx server block configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy website HTML pages and root static assets to /app
COPY index.html /app/
COPY about.html /app/
COPY treatments.html /app/
COPY contact.html /app/
COPY robots.txt /app/
COPY sitemap.xml /app/
COPY site.webmanifest /app/
COPY favicon.ico /app/

# Copy stylesheets, client-side scripts, and static media directories
COPY css/ /app/css/
COPY js/ /app/js/
COPY assets/ /app/assets/

# Symlink /usr/share/nginx/html to /app for backward compatibility
RUN rm -rf /usr/share/nginx/html && ln -s /app /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Keep Nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]
