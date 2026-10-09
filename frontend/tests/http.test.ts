import { it, expect, vi, afterEach } from "vitest";
import { apiClient, ApiError } from "@/api/client";
afterEach(() => vi.unstubAllGlobals());
it("API requests carry session cookies", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } }));
  vi.stubGlobal("fetch", fetcher);
  expect(await apiClient.get("/health")).toEqual({ ok: true });
  expect(fetcher.mock.calls[0][1]).toMatchObject({ credentials: "include", method: "GET" });
});
it("Validation arrays become a readable error message", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: [{ msg: "Campo requerido" }] }), { status: 422, headers: { "Content-Type": "application/json" } })));
  await expect(apiClient.post("/auth/login", {})).rejects.toMatchObject({ message: "Campo requerido", status: 422 });
});
it("Network errors are normalized", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  await expect(apiClient.get("/auth/me")).rejects.toBeInstanceOf(ApiError);
});
it("401 expires a session, but rejected login does not emit expiration", async () => {
  const listener = vi.fn(); window.addEventListener("ashakids:session-expired", listener);
  vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(new Response("Unauthorized", { status: 401 }))));
  await expect(apiClient.post("/auth/login", {})).rejects.toMatchObject({ status: 401 });
  expect(listener).not.toHaveBeenCalled();
  await expect(apiClient.get("/padres/me")).rejects.toMatchObject({ status: 401 });
  expect(listener).toHaveBeenCalledOnce();
  window.removeEventListener("ashakids:session-expired", listener);
});
