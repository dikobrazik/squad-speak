FROM owasp/modsecurity-crs:4.8.0-nginx-202411071011

USER root

COPY crs-setup.conf /etc/modsecurity.d/owasp-crs/crs-setup.conf
COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template
