import { it, expect } from "vitest";
import { screen, waitFor, fireEvent, within } from "@testing-library/react";
import { renderRoute } from "./helpers";
const loaded = () => waitFor(() => expect(screen.queryByText("Cargando pantalla…")).not.toBeInTheDocument());
const healthy = () => expect(screen.queryByText("No pudimos cargar esta pantalla")).not.toBeInTheDocument();

it("The assistant opens and closes with its extracted avatar component", async () => {
  renderRoute("/padre", "PADRE"); await loaded();
  fireEvent.click(screen.getByRole("button", { name: "Abrir asistente ASHI" }));
  healthy();
  expect(screen.getAllByText(/ASHI/).length).toBeGreaterThan(0);
  const close = screen.getAllByRole("button", { name: /Cerrar asistente ASHI/ })[0];
  fireEvent.click(close); healthy();
  expect(screen.getByRole("button", { name: "Abrir asistente ASHI" })).toBeInTheDocument();
});
it("A therapist can open every section of a simulated patient record", async () => {
  renderRoute("/terapeuta/pacientes", "TERAPEUTA"); await loaded();
  fireEvent.click(screen.getAllByRole("button", { name: "Abrir expediente" })[0]);
  healthy();
  for (const name of ["Evolución", "Sesiones", "Objetivos", "Actividades", "Reportes", "Notas", "Resumen"]) {
    fireEvent.click(within(screen.getByRole("main")).getByRole("button", { name: new RegExp(`^${name}$`) })); healthy();
  }
});
it("Therapist profile input uses the shared string-value contract", async () => {
  renderRoute("/terapeuta/config", "TERAPEUTA"); await loaded();
  const input = screen.getAllByRole("textbox")[0];
  fireEvent.change(input, { target: { value: "Nombre actualizado" } });
  expect(input).toHaveValue("Nombre actualizado"); healthy();
});
it("Public navigation reaches specialists through the router", async () => {
  renderRoute("/", null); await loaded();
  fireEvent.click(screen.getAllByRole("button", { name: /^Especialistas$/ })[0]);
  await loaded(); healthy();
  expect(screen.getByRole("heading", { name: /Encuentra al especialista/ })).toBeInTheDocument();
});
