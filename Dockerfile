FROM cgr.dev/chainguard/nginx:latest

USER nginx
WORKDIR /app

COPY build/ ./
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
