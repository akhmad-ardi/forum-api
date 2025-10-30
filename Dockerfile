# STAGE 1: BUILD
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# STAGE 2: RUNTIME
FROM node:20-slim AS runtime

# Install nginx dan netcat (untuk tunggu Node siap)
RUN apt-get update && apt-get install -y nginx netcat-traditional && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app ./
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Jalankan Node & tunggu siap sebelum start nginx
CMD ["sh", "-c", "node src/app.js & while ! nc -z 127.0.0.1 5000; do sleep 1; done; nginx -g 'daemon off;'"]
