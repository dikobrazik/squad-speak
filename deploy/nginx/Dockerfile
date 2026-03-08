FROM owasp/modsecurity-crs:4.24.1-nginx-alpine-202603150103

USER root

COPY crs-setup.conf /etc/modsecurity.d/owasp-crs/crs-setup.conf
COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template
