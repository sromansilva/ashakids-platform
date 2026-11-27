import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderRoute } from "./helpers";

const loaded = () => waitFor(() => expect(screen.queryByText("Cargando pantalla…")).not.toBeInTheDocument());

describe("Padre & Admin updates (navbar pill, deactivation request, admin bajas, account copy)", () => {
  it("shows updated account info copy on /padre/config?tab=cuenta", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/padres/me")) {
        return new Response(
          JSON.stringify({
            user: {
              id_usuario: 3,
              codigo_usuario: "p00001",
              email: "padre@ashakids.test",
              nombres: "María",
              apellidos: "Gómez",
              activo: true,
              roles: ["PADRE"],
            },
            perfil_padre: { id_tutor: 1, telefono: null, direccion: null, parentesco: "Madre" },
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ items: [], total: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    });

    renderRoute("/padre/config?tab=cuenta", "PADRE");
    await loaded();

    expect(
      screen.getByText(
        "Para cambiar tus datos de cuenta, contacta a administración desde el apartado de incidencias -> Problemas de permisos -> Acceso a mi cuenta."
      )
    ).toBeInTheDocument();
  });

  it("replaces Eliminar cuenta with Solicitar desactivación de la cuenta and validates password + 2FA", async () => {
    let submittedBody: Record<string, unknown> | null = null;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes("/auth/2fa/status")) {
        return new Response(JSON.stringify({ totp_activado: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/padres/solicitud-baja") && init?.method === "POST") {
        submittedBody = JSON.parse(String(init.body));
        return new Response(
          JSON.stringify({
            message: "Tu solicitud de desactivación fue enviada a administración para su revisión.",
            solicitud: { id_solicitud: 10, estado: "PENDIENTE", fecha_solicitud: "2026-11-27T12:00:00Z" },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ items: [], total: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    });

    renderRoute("/padre/config?tab=seguridad", "PADRE");
    await loaded();

    expect(screen.queryByText("Eliminar cuenta")).not.toBeInTheDocument();
    const triggerBtn = screen.getByRole("button", { name: /Solicitar desactivación de la cuenta/i });
    fireEvent.click(triggerBtn);

    expect(await screen.findByText(/¿Confirmas enviar la solicitud de desactivación\?/i)).toBeInTheDocument();

    const pwInput = await screen.findByPlaceholderText("Ingresa tu contraseña actual");
    const totpInput = await screen.findByPlaceholderText("000000");

    fireEvent.change(pwInput, { target: { value: "MiClaveSegura123" } });
    fireEvent.change(totpInput, { target: { value: "123456" } });

    const submitBtn = screen.getByRole("button", { name: "Enviar solicitud" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submittedBody).toEqual({
        password: "MiClaveSegura123",
        totp_code: "123456",
      });
    });
  });

  it("displays Solicitudes de baja button in /admin/cuentas and opens deactivation requests list", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/admin/solicitudes-baja")) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id_solicitud: 7,
                id_usuario: 3,
                padre_nombre: "María Gómez",
                codigo_usuario: "p00001",
                email: "maria@ashakids.test",
                cuenta_activa: true,
                estado: "PENDIENTE",
                fecha_solicitud: "2026-11-25T15:30:00Z",
              },
            ],
            total: 1,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
      if (url.includes("/admin/cuentas")) {
        return new Response(JSON.stringify({ items: [], total: 0 }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ items: [], total: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    });

    renderRoute("/admin/cuentas", "ADMIN");
    await loaded();

    const bajasBtn = await screen.findByRole("button", { name: /Solicitudes de baja/i });
    fireEvent.click(bajasBtn);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText("María Gómez")).toBeInTheDocument();
    expect(screen.getByText("Padre solicitante")).toBeInTheDocument();
    expect(screen.getByText("Fecha de solicitud")).toBeInTheDocument();
  });
});
