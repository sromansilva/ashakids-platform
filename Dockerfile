FROM node:22-bookworm-slim AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

FROM python:3.13-slim-bookworm AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production WEB_CONCURRENCY=1 PORT=10000 \
    FRONTEND_DIST_PATH=/app/backend/frontend-dist
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && useradd --create-home --uid 10001 ashakids
COPY backend/app/ ./app/
COPY --from=frontend /build/frontend/dist/ ./frontend-dist/
USER ashakids
EXPOSE 10000
CMD ["python", "-m", "app.hosted_start"]
