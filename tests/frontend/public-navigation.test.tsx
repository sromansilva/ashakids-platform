import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderRoute } from "./helpers";

const loaded = () => waitFor(() => expect(screen.queryByText("Cargando pantalla…")).not.toBeInTheDocument());

const mockTherapists = [
  {
    id_terapeuta: 1,
    nombres: "Ana",
    apellidos: "Ruiz",
    especialidad: "Terapia del Lenguaje",
    anios_experiencia: 6,
    idiomas: "Español",
    descripcion_profesional: "Especialista en estimulación temprana.",
    foto_perfil_url: null,
  },
  {
    id_terapeuta: 2,
    nombres: "Carlos",
    apellidos: "Mendoza",
    especialidad: "Fonología",
    anios_experiencia: 4,
    idiomas: "Español, Inglés",
    descripcion_profesional: "Enfoque lúdico para trastornos del habla.",
    foto_perfil_url: null,
  },
  {
    id_terapeuta: 3,
    nombres: "Lucía",
    apellidos: "Vargas",
    especialidad: "Fluidez del Habla",
    anios_experiencia: 8,
    idiomas: "Español",
    descripcion_profesional: "Acompañamiento integral a familias.",
    foto_perfil_url: null,
  },
  {
    id_terapeuta: 4,
    nombres: "Pedro",
    apellidos: "Sánchez",
    especialidad: "Motricidad Orofacial",
    anios_experiencia: 5,
    idiomas: "Español",
    descripcion_profesional: "Trabajo clínico en articulación infantil.",
    foto_perfil_url: null,
  },
];

describe("Public navigation, Home updates, Help, Login, and Therapist Carousel", () => {
  it("Home displays updated texts, dynamic therapist carousel (3 per slide), and detail modal", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/terapeutas")) {
        return new Response(JSON.stringify(mockTherapists), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    });

    renderRoute("/", null);
    await loaded();

    // 4.3: Updated world indicator text
    expect(screen.getByText("3 niveles a más por mundo")).toBeInTheDocument();

    // 4.3: FAQ mentions 40 minutos
    fireEvent.click(screen.getByRole("button", { name: /¿Cuántas sesiones necesita mi hijo\?/i }));
    expect(screen.getByText(/40 minutos/i)).toBeInTheDocument();

    // 4.4: Carousel renders therapists from API and navigates 3-by-3
    const firstCard = await screen.findByRole("button", { name: /Ver información profesional de Ana Ruiz/i });
    expect(firstCard).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: "Ver siguientes terapeutas" });
    fireEvent.click(nextBtn);
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    const prevBtn = screen.getByRole("button", { name: "Ver terapeutas anteriores" });
    fireEvent.click(prevBtn);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    // Clicking a card opens the therapist modal with non-sensitive info
    fireEvent.click(firstCard);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Especialista en estimulación temprana.")).toBeInTheDocument();
    expect(screen.getByText(/sesiones personalizadas de 40 minutos/i)).toBeInTheDocument();

    // Footer has updated structure (no Historias, no Trabaja con nosotros)
    expect(screen.queryByText("Historias")).not.toBeInTheDocument();
    expect(screen.queryByText("Trabaja con nosotros")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recursos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sobre Nosotros" })).toBeInTheDocument();
  });

  it("Centro de Ayuda (/ayuda) excludes payment/pricing FAQs", async () => {
    renderRoute("/ayuda", null);
    await loaded();

    expect(screen.getByRole("heading", { name: /Centro de Ayuda/i })).toBeInTheDocument();
    expect(screen.queryByText(/método de pago/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pagos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sin cargo/i)).not.toBeInTheDocument();
  });

  it("Login (/login) logo button navigates back to Home", async () => {
    renderRoute("/login", null);
    await loaded();

    const logoBtn = screen.getByRole("button", { name: "Ir al inicio de ASHAKids" });
    expect(logoBtn).toBeInTheDocument();
    fireEvent.click(logoBtn);

    await waitFor(() => {
      expect(screen.getByText(/Cada palabra,/i)).toBeInTheDocument();
    });
  });

  it("Obsolete routes (/especialistas, /historias, /trabaja) render NotFoundPage", async () => {
    for (const path of ["/especialistas", "/historias", "/trabaja"]) {
      const { unmount } = renderRoute(path, null);
      await loaded();
      expect(screen.getByText(/404|no encontrada/i)).toBeInTheDocument();
      unmount();
    }
  });
});
