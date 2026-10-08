/**
 * Cliente HTTP centralizado para la API REST de ASHAKids (FastAPI).
 * Envía credenciales (cookies HttpOnly) automáticamente en cada solicitud.
 */

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:8000/api/v1" : "/api/v1")).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Permite transporte de cookies de sesión HttpOnly
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const detail =
        (isJson && data && (data.detail || data.message)) ||
        `Error HTTP ${response.status}: ${response.statusText}`;
      const message = typeof detail === "string" ? detail : Array.isArray(detail)
        ? detail.map(item => typeof item?.msg === "string" ? item.msg : "Solicitud inválida").join(". ")
        : "No se pudo completar la solicitud.";
      if (response.status === 401 && endpoint !== "/auth/login") {
        window.dispatchEvent(new Event("ashakids:session-expired"));
      }
      throw new ApiError(message, response.status, data);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err instanceof Error
        ? err.message
        : "Error de red o conexión no disponible.",
      0
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  del: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
