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
RUN npm run build

# Stage 3: Production Runtime
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=8000
WORKDIR /app

# Install only production backend dependencies
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy compiled backend output
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY backend/certs ./backend/certs

# Copy frontend static build for static serving or reverse proxying
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

# Create unprivileged runtime user
RUN useradd --create-home --uid 10001 ashakids && \
    chown -R ashakids:ashakids /app
USER ashakids

EXPOSE 8000
WORKDIR /app/backend
CMD ["node", "dist/index.js"]
