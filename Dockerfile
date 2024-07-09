FROM nginxinc/nginx-unprivileged:1.20-alpine

USER nginx
WORKDIR /app

COPY build/ ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080