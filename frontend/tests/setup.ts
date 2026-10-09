import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { queryClient } from "@/app/providers/queryClient";
import { cleanup } from "@testing-library/react";
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockImplementation(input => Promise.resolve(new Response(JSON.stringify(/\/conversaciones(?:\?|$)/.test(String(input)) ? { items: [], next_before_id: null } : []), {
    headers: { "Content-Type": "application/json", "X-Total-Count": "0" },
  }))));
});
afterEach(() => { cleanup(); queryClient.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
window.scrollTo = vi.fn();
HTMLElement.prototype.scrollIntoView = vi.fn();
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false, media: query, onchange: null,
  addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
}));
globalThis.ResizeObserver = class {
  observe() {} unobserve() {} disconnect() {}
};
HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
HTMLMediaElement.prototype.pause = vi.fn();
HTMLMediaElement.prototype.load = vi.fn();
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] } as unknown as SpeechSynthesis;
