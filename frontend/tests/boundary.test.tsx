import { lazy } from "react";
import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageBoundary } from "@/app/PageBoundary";
it("An unresolved page chunk displays a loading indicator", () => {
  const Pending = lazy(() => new Promise<{ default: () => null }>(() => {}));
  render(<MemoryRouter><PageBoundary><Pending /></PageBoundary></MemoryRouter>);
  expect(screen.getByRole("status")).toHaveTextContent("Cargando pantalla");
});
it("A page render failure offers recovery instead of a blank screen", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const expectedError = (event: ErrorEvent) => {
    if (event.error?.message === "Test-only render failure") event.preventDefault();
  };
  window.addEventListener("error", expectedError);
  function Broken(): never { throw new Error("Test-only render failure"); }
  render(<MemoryRouter><PageBoundary><Broken /></PageBoundary></MemoryRouter>);
  expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar esta pantalla");
  expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  window.removeEventListener("error", expectedError);
});
