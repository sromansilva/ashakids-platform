/**
 * Cliente HTTP centralizado para la API REST de ASHAKids (FastAPI).
 * Envía credenciales (cookies HttpOnly) automáticamente en cada solicitud.
 */

const API_BASE_URL =
  (import.meta.env.MODE === "test"
    ? "http://localhost:8000/api/v1"
    : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api/v1")).replace(/\/+$/, "");

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

export type QueryParams = Record<string, string | number | boolean | undefined | null>;
export type Page<T> = { items: T[]; total: number };
export type ApiOptions = RequestInit & { params?: QueryParams; paginated?: boolean; pdf?: boolean };
let identityVersion = 0;
export function invalidateIdentityRequests() { identityVersion++; }

async function request<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const version = identityVersion;
  const { params, paginated, pdf, ...init } = options;
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: pdf ? "application/pdf" : "application/json",
    ...options.headers,
  };

  const config: RequestInit = {
    ...init,
    headers,
    credentials: "include", // Permite transporte de cookies de sesión HttpOnly
  };

  try {
    const response = await fetch(`${url}${search.size ? `${url.includes("?") ? "&" : "?"}${search}` : ""}`, config);
    if (version !== identityVersion) throw new DOMException("Cuenta cambiada", "AbortError");

    if (pdf && response.ok) {
      if (response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/pdf') {
        throw new ApiError('El servidor no devolvió un PDF válido. Intenta descargarlo nuevamente.', 502);
      }
      const bytes = await response.arrayBuffer();
      const signature = String.fromCharCode(...new Uint8Array(bytes).slice(0, 5));
      if (version !== identityVersion || init.signal?.aborted) throw new DOMException("Cuenta cambiada o descarga cancelada", "AbortError");
      if (signature !== '%PDF-') throw new ApiError('El archivo recibido no es un PDF válido.', 502);
      return new Blob([bytes], { type: 'application/pdf' }) as T;
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();
    if (version !== identityVersion) throw new DOMException("Cuenta cambiada", "AbortError");

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

    return (paginated ? { items: data, total: Number(response.headers.get("X-Total-Count") ?? data.length) } : data) as T;
  } catch (err) {
    if (err instanceof ApiError || ((err instanceof Error || err instanceof DOMException) && err.name === "AbortError")) {
      throw err;
    }
    throw new ApiError("No hay conexión con el servidor. Comprueba tu conexión e inténtalo nuevamente.", 0);
  }
}

export const apiClient = {
  pdf: (endpoint: string, signal?: AbortSignal) =>
    request<Blob>(endpoint, { method: 'GET', signal, pdf: true }),
  get: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  page: <T>(endpoint: string, params?: QueryParams, signal?: AbortSignal) =>
    request<Page<T>>(endpoint, { method: "GET", params, signal, paginated: true }),
  patch: <T>(endpoint: string, body: unknown, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),

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
