# Stage 1: Build Frontend
FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

# Stage 2: Build Backend
FROM node:22-bookworm-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

# Stage 3: Production Runtime
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=8000 \
    FRONTEND_DIST_DIR=/app/frontend-dist
WORKDIR /app

# Reuse the backend build stage after it prunes development-only packages.
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=backend-builder /app/backend/package-lock.json ./backend/package-lock.json
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy compiled backend output
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY backend/certs ./backend/certs

# Serve the frontend build from Express on the same origin as the API
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

# Create unprivileged runtime user
RUN useradd --create-home --uid 10001 ashakids && \
    chown -R ashakids:ashakids /app
USER ashakids

EXPOSE 8000
WORKDIR /app/backend
CMD ["node", "dist/index.js"]

