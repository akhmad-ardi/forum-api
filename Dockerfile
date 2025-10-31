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

CMD ["sh", "-c", "\
node src/app.js & \
echo '🚀 Starting Node.js...' && \
while ! nc -z 127.0.0.1 5000; do \
  echo '⏳ Waiting Node.js...'; \
  sleep 1; \
done; \
echo '✅ Node.js is ready. Starting NGINX...' && \
nginx -g 'daemon off;'"]
