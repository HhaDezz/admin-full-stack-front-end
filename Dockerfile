# ── Build ─────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=http://localhost:8089
ARG VITE_APP_NAME=Anjana
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_APP_NAME=$VITE_APP_NAME VITE_DEMO_MODE=false
RUN npm run build

# ── Serve ─────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
