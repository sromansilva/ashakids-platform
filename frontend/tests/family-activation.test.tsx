import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/auth/AuthContext";
import { RouteAccess } from "@/app/RouteAccess";
import { AccountActivation } from "@/auth/AccountActivation";
import { authService } from "@/services/authService";
import { adminService } from "@/services/adminService";
import { ApiError } from "@/api/client";
import { FamilyChildrenFields } from "@/pages/admin/FamilyChildrenFields";
import type { User } from "@/types/auth";
import { useState } from "react";
import type { RegistroHijo } from "@/types/auth";

const user: User = { id_usuario: 10, email: "family@example.com", nombres: "Familia", apellidos: "Prueba", codigo_usuario: "P00010", rol: "PADRE", roles: ["PADRE"], activo: true, password_change_required: true };
function withSession(element: React.ReactNode, path = "/padre") {
  const refreshUser = vi.fn().mockResolvedValue(undefined);
  render(<MemoryRouter initialEntries={[path]}><AuthContext.Provider value={{ user, role: user.rol, isAuthenticated: true, isLoading: false, login: vi.fn(), logout: vi.fn(), refreshUser }}>{element}</AuthContext.Provider></MemoryRouter>);
  return refreshUser;
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each(["/padre", "/padre/reportes", "/session/active", "/admin", "/"])("bloquea acceso directo %s antes de activar", path => {
  withSession(<RouteAccess><p>Contenido privado</p></RouteAccess>, path);
  expect(screen.getByRole("heading", { name: "Crea tu contraseña personal" })).toBeInTheDocument();
  expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
});

it("conserva las entradas ante rechazo y comprueba la confirmación antes de enviar", async () => {
  const activate = vi.spyOn(authService, "activate").mockRejectedValue(new ApiError("Contraseña inicial incorrecta", 403));
  withSession(<AccountActivation />);
  fireEvent.change(screen.getByLabelText("Contraseña inicial"), { target: { value: "12345678" } });
  fireEvent.change(screen.getByLabelText("Contraseña nueva"), { target: { value: "Nueva-Clave-Sintetica" } });
  fireEvent.change(screen.getByLabelText("Repite la contraseña nueva"), { target: { value: "Otra-Clave-Sintetica" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar contraseña y continuar" }));
  expect(screen.getByRole("alert")).toHaveTextContent("no coinciden");
  expect(activate).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Repite la contraseña nueva"), { target: { value: "Nueva-Clave-Sintetica" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar contraseña y continuar" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Contraseña inicial incorrecta"));
  expect(screen.getByLabelText("Contraseña inicial")).toHaveValue("12345678");
});

it("actualiza la identidad del servidor después de cambiar la contraseña", async () => {
  vi.spyOn(authService, "activate").mockResolvedValue({ user: { ...user, password_change_required: false }, message: "Activada" });
  const refresh = withSession(<AccountActivation />);
  for (const name of ["Contraseña inicial", "Contraseña nueva", "Repite la contraseña nueva"]) {
    fireEvent.change(screen.getByLabelText(name), { target: { value: name === "Contraseña inicial" ? "12345678" : "Nueva-Clave-Sintetica" } });
  }
  fireEvent.click(screen.getByRole("button", { name: "Guardar contraseña y continuar" }));
  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(screen.getByLabelText("Contraseña inicial")).toHaveValue("");
});

it("envía padre e hijos juntos y usa el DNI solo como entrada de activación", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Registrada" }), { status: 201, headers: { "content-type": "application/json" } }));
  vi.stubGlobal("fetch", fetch);
  await adminService.registrarFamilia({ nombres: "Familia", apellidos: "Prueba", email: "family@example.com", password: "12345678", hijos: [{ nombres_paciente: "Ana", apellidos_paciente: "Prueba", fecha_nacimiento: "2020-01-01", sexo: "Femenino" }] });
  const [url, options] = fetch.mock.calls[0]!;
  expect(url).toContain("/admin/familias");
  const payload = JSON.parse(options.body);
  expect(payload.dni).toBe("12345678");
  expect(payload.hijos).toHaveLength(1);
  expect(payload.password).toBeUndefined();
});

it("permite añadir un segundo hijo sin contador independiente", () => {
  const change = vi.fn();
  render(<FamilyChildrenFields children={[{ nombres_paciente: "Ana", apellidos_paciente: "Prueba", fecha_nacimiento: "2020-01-01", sexo: "Femenino" }]} onChange={change} disabled={false} />);
  fireEvent.click(screen.getByRole("button", { name: "Añadir otro hijo" }));
  expect(change.mock.calls[0]![0]).toHaveLength(2);
  expect(screen.getByLabelText("Nombres del niño *")).toHaveValue("Ana");
});

it("conserva la fecha introducida al añadir otro hijo", () => {
  function Fields() {
    const [children, setChildren] = useState<RegistroHijo[]>([{ nombres_paciente: "Ana", apellidos_paciente: "Prueba", fecha_nacimiento: "", sexo: "Femenino" }]);
    return <FamilyChildrenFields children={children} onChange={setChildren} disabled={false} />;
  }
  render(<Fields />);
  fireEvent.input(screen.getByLabelText("Fecha de nacimiento *"), { target: { value: "2020-05-06" } });
  fireEvent.click(screen.getByRole("button", { name: "Añadir otro hijo" }));
  expect(screen.getAllByLabelText("Fecha de nacimiento *")[0]).toHaveValue("2020-05-06");
});
