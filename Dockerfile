# Production Dockerfile for Smile Works Dental Clinic static website
FROM nginx:alpine

# Remove default Nginx placeholder website
RUN rm -rf /usr/share/nginx/html/*

# Copy production Nginx server block configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy website HTML pages and root static assets
COPY index.html /usr/share/nginx/html/
COPY about.html /usr/share/nginx/html/
COPY treatments.html /usr/share/nginx/html/
COPY contact.html /usr/share/nginx/html/
COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/
COPY site.webmanifest /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/

# Copy stylesheets, client-side scripts, and static media directories
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/

# Expose HTTP port 80
EXPOSE 80

# Keep Nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]
