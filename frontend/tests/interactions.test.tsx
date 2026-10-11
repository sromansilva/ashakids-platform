import { it, expect, vi } from "vitest";
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
it("A therapist can open every section of an assigned patient record", async () => {
  vi.mocked(fetch).mockImplementation(async input => new Response(JSON.stringify(String(input).includes('/pacientes?') ? [{ id_paciente: 12, nombres_paciente: 'AUDITORIA', apellidos_paciente: 'Paciente', fecha_nacimiento: '2020-01-01', activo: true }] : []), { headers: { 'Content-Type': 'application/json' } }));
  renderRoute("/terapeuta/pacientes", "TERAPEUTA"); await loaded();
  fireEvent.click(await screen.findByRole("button", { name: "Abrir expediente" }));
  healthy();
  for (const name of ["Sesiones", "Reportes", "Resumen"]) {
    fireEvent.click(within(screen.getByRole("main")).getByRole("button", { name: new RegExp(`^${name}$`) })); healthy();
  }
  for (const name of ['Evolución','Objetivos','Actividades','Notas']) expect(within(screen.getByRole('main')).queryByRole('button', {name})).not.toBeInTheDocument();
});
it("Therapist profile fields remain read only until editing is supported", async () => {
  renderRoute("/terapeuta/config", "TERAPEUTA"); await loaded();
  const input = await screen.findByLabelText('Nombre completo');
  expect(input).toHaveAttribute('readonly'); healthy();
});
it("Public specialist links stay in the landing section", async () => {
  renderRoute("/", null); await loaded();
  for (const link of screen.getAllByRole("link", { name: /^Especialistas$|^Explorar terapeutas$/ })) {
    expect(link).toHaveAttribute("href", "#landing-specialists");
  }
  expect(screen.getByRole("heading", { name: /Terapeutas certificados/ })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /^Ver todos/ })).not.toBeInTheDocument();
  healthy();
});
