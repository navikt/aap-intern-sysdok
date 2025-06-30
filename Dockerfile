FROM nginxinc/nginx-unprivileged:1.29-alpine

USER nginx
WORKDIR /app

COPY build/ ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
