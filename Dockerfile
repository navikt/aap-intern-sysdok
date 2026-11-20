FROM cgr.dev/chainguard/nginx:latest

USER nginx
WORKDIR /app

COPY build/ ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
