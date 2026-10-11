---
name: "ASHAKids · landing pública V51"
description: "Adopción local del kit v1: Nunito, violeta, blanco cálido y cristal suave."
colors:
  primary: "#7C3AED"
  primary-dark: "#5B21B6"
  teal: "#0F766E"
  orange: "#F97316"
  lavender: "#EDE9FE"
  background: "#FAFAF9"
  surface: "#FFFFFF"
  ink: "#1C1135"
  muted: "#615274"
  border: "#DDD6EF"
typography:
  font: "Nunito, system-ui, sans-serif"
  hero: "48–64px/1.08, 900; móvil 36px"
  heading: "32–40px/1.15, 900"
  card: "20px/1.3, 800"
  body: "16px/1.6"
  label: "14px/1.4, 700"
rounded:
  control: "14px"
  card: "24px"
spacing:
  container: "1200px; márgenes 24px, móvil 16px"
  cards: "24px; móvil 16px"
  section: "64px; móvil 48px"
---

# ASHAKids: diseño implementado en la landing

Base del corte: `origin/dev`, `5dd572cb37a679d5e8674a0cf1910426d925a1f9` (V50).
Implementación local en `codex/landing-publica`, pendiente de aprobación/publicación.
Repositorio: https://github.com/sromansilva/ashakids-platform .

El contrato visual es [ASHAKIDS_DESIGN_SYSTEM.md](docs/design/ashakids-ui-kit-v1/ASHAKIDS_DESIGN_SYSTEM.md)
y su [lámina aprobada](docs/design/ashakids-ui-kit-v1/ASHAKIDS_UI_KIT.png).
La imagen de landing adjunta orienta composición y materiales; sus textos, acciones y
personajes no reemplazan el contenido vigente del repositorio.

`landing-kit.css` contiene los tokens y estilos de controles/tarjetas de esa guía,
encapsulados en `.asha-landing.asha-ui`. `landing.css` define la composición responsive
y consume esos tokens. Se importan únicamente desde la landing; ninguna regla se activa
fuera de esa raíz, incluso después de navegar por la aplicación.

La marca conserva el archivo oficial de `Isotipo`, junto al rótulo existente AshaKids,
presentado en violeta y naranja. No se reemplaza el logo oficial por el rótulo raster de
la referencia. Nunito conserva su carga existente desde Google Fonts.

La primera vista presenta el propósito existente, título, introducción y acción de acceso;
a la derecha permanece la composición decorativa de letras h/o/l/a en un espacio lavanda.
Los beneficios existentes conservan su texto. Las tres tarjetas de pasos siguen al hero;
servicios, equipo, ejemplos ficticios, FAQ, newsletter y pie conservan toda su información.

Botones principales violeta con relieve inferior de 4px; secundarios blancos con borde
violeta. Tamaños mínimos 44/48/56px. Cristal con blanco al 84%, borde discreto y radio24px;
FAQ y campo de correo mantienen fondo blanco. Los controles deshabilitados son legibles
y conservan `disabled`. Los estados de hover/press proceden del kit, el foco tiene contorno
oscuro visible y `prefers-reduced-motion` elimina transiciones/animaciones de esta raíz.
Las tarjetas informativas no adquieren clics ni estados que sugieran nuevas acciones.

En escritorio el hero y servicios usan dos columnas; pasos, equipo y ejemplos usan tres.
En móvil se apilan con márgenes16px. La navegación de la landing usa el menú existente
por debajo de1024px, mientras otras superficies públicas conservan su breakpoint anterior.
`PublicNav` sólo añade variantes visuales cuando `cur === 'landing'`. `Btn`, `Crd`,
`MobileTopBar`, `PublicFooter`, rutas y hooks de negocio no se modificaron.

## Fidelidad pendiente y límites

No hay un recurso aprobado e integrable del robot Ashi. `Ashi.tsx` es un oso SVG y
el UI kit es una lámina raster sin assets transparentes. No se extrae ni genera una
mascota nueva; el espacio del hero lleva `data-ashi-asset="pending"`. Los bloques
decorativos existentes no se presentan como un sustituto de Ashi. Las ilustraciones
de familia/terapeuta/libros de la referencia también quedan pendientes de recursos.

El dock existente ASHI/WhatsApp se monta en `DashLayout`, no en la landing; se conserva
sin duplicarlo. Ningún dibujo implementa IA, voz, WhatsApp o correo. La newsletter sigue
sin envío, los ejemplos siguen rotulados como ficticios, y las respuestas heredadas sobre
paquetes/facturación se conservan por alcance visual; no prueban una función de pagos.

La dirección V38 se conserva como referencia histórica en [LANDING.md](docs/design/LANDING.md).
Este corte no certifica otras pantallas ni funcionamiento de backend o servicios externos.
Ver capturas, comprobaciones y comparación visual en
[verification.md](docs/evidence/landing-v51/verification.md).
