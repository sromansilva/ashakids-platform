import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { renderRoute } from './helpers';
import type { Patient } from '@/modules/clinica/domain/clinical';
import type { GameProgress } from '@/modules/mundo_asha/infrastructure/learningGames';
import { FAMILY_SUBNAV_ITEMS } from '@/modules/padre/presentation/dashboard/FamilySubNav';

const child: Patient = {
  id_paciente: 21,
  id_tutor: 1,
  nombres_paciente: 'Leo',
  apellidos_paciente: 'Ejemplo',
  fecha_nacimiento: '2020-01-01',
  sexo: 'Masculino',
  activo: true,
  fecha_registro: '2026-01-01',
};
const sibling: Patient = { ...child, id_paciente: 22, nombres_paciente: 'Luna' };

const progress: GameProgress = {
  id_paciente: 21,
  version: 'basica-1',
  experiencia: 0,
  nivel: 1,
  intentos_totales: 0,
  experiencia_siguiente_nivel: 200,
  medallas: [],
  mundos: [
    {
      id: 'LENGUAJE',
      version: 'basica-1',
      name: 'La Isla de las Palabras',
      description: 'Palabras e historias',
      asignado: true,
      completados: [],
      intentos: 0,
      medalla: false,
      levels: [],
    },
  ],
};

function api() {
  vi.mocked(fetch).mockImplementation(async (input) => {
    const path = new URL(String(input), 'http://localhost').pathname.replace(/^\/api\/v1/, '');
    let data: unknown = [];
    if (path === '/pacientes') data = [child, sibling];
    else if (path.endsWith('/juegos')) data = progress;
    else if (path === '/citas') data = [];
    else if (path === '/sesiones') data = [];
    else if (path === '/tratamientos') data = [];
    else if (path === '/usuarios') data = [];
    else if (path.includes('/profesionales')) data = [];
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': Array.isArray(data) ? String(data.length) : '1',
      },
    });
  });
}

beforeEach(() => {
  sessionStorage.clear();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
});

describe('Fase 3: Navbar contextual persistente para el entorno familiar', () => {
  it('1. /padre?section=family muestra los siete botones en el orden especificado y Para mi familia es el primero', async () => {
    api();
    renderRoute('/padre?section=family', 'PADRE');

    const subNav = await screen.findByRole('navigation', { name: 'Herramientas para mi familia' });
    expect(subNav).toBeInTheDocument();

    const expectedOrder = [
      'Para mi familia',
      'Agenda y sesiones',
      'Mensajes',
      'Terapeutas',
      'Reportes',
      'Gestionar familia',
      'Incidencias',
    ];

    const buttons = within(subNav).getAllByRole('button');
    expect(buttons).toHaveLength(7);

    const buttonLabels = buttons.map((btn) => btn.textContent?.trim());
    expect(buttonLabels).toEqual(expectedOrder);
    expect(buttons[0]).toHaveTextContent('Para mi familia');
  });

  it('2. En /padre?section=family, exclusivamente el botón "Para mi familia" está activo', async () => {
    api();
    renderRoute('/padre?section=family', 'PADRE');

    const subNav = await screen.findByRole('navigation', { name: 'Herramientas para mi familia' });
    const familyBtn = within(subNav).getByRole('button', { name: 'Para mi familia' });

    expect(familyBtn).toHaveAttribute('aria-current', 'page');
    expect(familyBtn.className).toContain('family-sub-nav-btn--active');

    // Verificar que los otros 6 botones no tienen aria-current="page"
    for (const label of ['Agenda y sesiones', 'Mensajes', 'Terapeutas', 'Reportes', 'Gestionar familia', 'Incidencias']) {
      const btn = within(subNav).getByRole('button', { name: label });
      expect(btn).not.toHaveAttribute('aria-current', 'page');
      expect(btn.className).not.toContain('family-sub-nav-btn--active');
    }
  });

  it('3. La barra contextual permanece visible en las seis subsecciones y activa exclusivamente su botón', async () => {
    const submodules: { path: string; activeLabel: string }[] = [
      { path: '/padre/agenda', activeLabel: 'Agenda y sesiones' },
      { path: '/padre/mensajes', activeLabel: 'Mensajes' },
      { path: '/padre/psicologos', activeLabel: 'Terapeutas' },
      { path: '/padre/reportes', activeLabel: 'Reportes' },
      { path: '/padre/config', activeLabel: 'Gestionar familia' },
      { path: '/padre/incidencias', activeLabel: 'Incidencias' },
    ];

    for (const mod of submodules) {
      api();
      const view = renderRoute(mod.path, 'PADRE');

      const subNav = await screen.findByRole('navigation', { name: 'Herramientas para mi familia' });
      expect(subNav).toBeInTheDocument();

      const activeBtn = within(subNav).getByRole('button', { name: mod.activeLabel });
      expect(activeBtn).toHaveAttribute('aria-current', 'page');
      expect(activeBtn.className).toContain('family-sub-nav-btn--active');

      // "Para mi familia" NO debe estar activo en los submódulos
      const familyBtn = within(subNav).getByRole('button', { name: 'Para mi familia' });
      expect(familyBtn).not.toHaveAttribute('aria-current', 'page');
      expect(familyBtn.className).not.toContain('family-sub-nav-btn--active');

      view.unmount();
    }
  });

  it('4. La barra contextual NO aparece en /padre/welcome, ni en /padre?section=world, ni en /padre?section=journey', async () => {
    api();
    const welcome = renderRoute('/padre/welcome', 'PADRE');
    expect(screen.queryByRole('navigation', { name: 'Herramientas para mi familia' })).not.toBeInTheDocument();
    welcome.unmount();

    const world = renderRoute('/padre?section=world', 'PADRE');
    await screen.findByRole('heading', { name: 'Mi mundo' });
    expect(screen.queryByRole('navigation', { name: 'Herramientas para mi familia' })).not.toBeInTheDocument();
    world.unmount();

    const journey = renderRoute('/padre?section=journey', 'PADRE');
    await screen.findByRole('heading', { name: 'Mi camino ASHA' });
    expect(screen.queryByRole('navigation', { name: 'Herramientas para mi familia' })).not.toBeInTheDocument();
    journey.unmount();
  });

  it('5. El navbar global no contiene el botón Inicio y conserva exactamente tres opciones', async () => {
    api();
    renderRoute('/padre?section=family', 'PADRE');

    const globalNav = await screen.findByRole('navigation', { name: 'Navegación del Centro Familiar' });
    expect(globalNav).toBeInTheDocument();

    expect(within(globalNav).queryByRole('button', { name: /Inicio/i })).not.toBeInTheDocument();
    expect(within(globalNav).getByRole('button', { name: 'Ir a Mi Mundo' })).toBeInTheDocument();
    expect(within(globalNav).getByRole('button', { name: 'Ir a Mi Camino ASHA' })).toBeInTheDocument();
    expect(within(globalNav).getByRole('button', { name: 'Ir a Para mi familia' })).toBeInTheDocument();

    const globalButtons = within(globalNav).getAllByRole('button');
    expect(globalButtons).toHaveLength(3);
  });

  it('6. No se muestran botones de Inicio, Mi mundo o Mi camino ASHA dentro de la barra secundaria contextual', async () => {
    api();
    renderRoute('/padre?section=family', 'PADRE');

    const subNav = await screen.findByRole('navigation', { name: 'Herramientas para mi familia' });
    expect(within(subNav).queryByRole('button', { name: /Inicio/i })).not.toBeInTheDocument();
    expect(within(subNav).queryByRole('button', { name: /Mi Mundo/i })).not.toBeInTheDocument();
    expect(within(subNav).queryByRole('button', { name: /Mi Camino/i })).not.toBeInTheDocument();
  });

  it('7. No existen navbars duplicados en una misma pantalla', async () => {
    api();
    renderRoute('/padre?section=family', 'PADRE');

    const globalNavs = screen.getAllByRole('navigation', { name: 'Navegación del Centro Familiar' });
    expect(globalNavs).toHaveLength(1);

    const subNavs = screen.getAllByRole('navigation', { name: 'Herramientas para mi familia' });
    expect(subNavs).toHaveLength(1);
  });

  it('8. Permite navegar entre subsecciones familiares desde la barra contextual sin perderla', async () => {
    api();
    renderRoute('/padre?section=family', 'PADRE');

    let subNav = await screen.findByRole('navigation', { name: 'Herramientas para mi familia' });
    fireEvent.click(within(subNav).getByRole('button', { name: 'Agenda y sesiones' }));

    // Ahora estamos en agenda
    subNav = await screen.findByRole('navigation', { name: 'Herramientas para mi familia' });
    expect(subNav).toBeInTheDocument();
    expect(within(subNav).getByRole('button', { name: 'Agenda y sesiones' })).toHaveAttribute('aria-current', 'page');

    // Navegar a reportes directamente sin volver a pulsar "Para mi familia"
    fireEvent.click(within(subNav).getByRole('button', { name: 'Reportes' }));
    subNav = await screen.findByRole('navigation', { name: 'Herramientas para mi familia' });
    expect(subNav).toBeInTheDocument();
    expect(within(subNav).getByRole('button', { name: 'Reportes' })).toHaveAttribute('aria-current', 'page');

    // Regresar a "Para mi familia"
    fireEvent.click(within(subNav).getByRole('button', { name: 'Para mi familia' }));
    subNav = await screen.findByRole('navigation', { name: 'Herramientas para mi familia' });
    expect(within(subNav).getByRole('button', { name: 'Para mi familia' })).toHaveAttribute('aria-current', 'page');
  });

  it('9. /padre/ayuda continúa siendo accesible mediante su enlace vigente en soporte', async () => {
    api();
    renderRoute('/padre?section=family', 'PADRE');

    const supportNav = await screen.findByRole('navigation', { name: 'Más opciones de familia' });
    expect(supportNav).toBeInTheDocument();

    const helpBtn = within(supportNav).getByRole('button', { name: 'Ayuda' });
    expect(helpBtn).toBeInTheDocument();
  });
});

