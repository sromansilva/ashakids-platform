# V84 — tarjetas interactivas y contenido de landing

Fecha: 2026-10-11, America/Lima. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama feat/piero-dev; base verificada V83/adf45198a1636f1f8a8d67ab6519266e1bae757c.
Ajuste UX/UI; no auditoría académica nueva.

## Cambios

Cristal v1.1 en cinco mundos, párrafo indicado eliminado, CTA de temática individual.
Pregunta de paquetes sustituida por acompañamiento del lenguaje.
Tres tarjetas de audiencia voltean con click/Enter/Espacio, sin navegación/flechas.
Frente imagen y título; reverso informativo sobre el acompañamiento del terapeuta.

## Evidencia nueva

- npm run typecheck: PASS.
- npm run check:frontend: PASS, 370 archivos, máximo495 líneas.
- npm run build: PASS, 1925 módulos.
- npx vitest run tests/interactions.test.tsx: cuatro pruebas PASS.
- impeccable detect --json de las superficies: [].
- IAB1480×811: cinco tarjetas con rgba(255,255,255,0.84), blur14px; párrafo ausente.
- Cinco CTA abren el dialog de acceso y Ahora no lo cierra; no login enviado.
- Tres tarjetas voltean y vuelven, Enter/Espacio/click; aria-expanded y aria-hidden
  alternan; hash/ruta conservados, sin flechas. FAQ nueva expande su respuesta.
- Móvil375×812: tarjetas337.6px de ancho/280px de alto, reverso legible, sin overflow.
- Sin overflow horizontal desktop/móvil. Reduced-motion declarado en CSS, no emulado.
- git diff --check y Graphify refresh/check; AST local sin LLM, 15 fuentes sin símbolos.

Capturas: worlds-desktop.jpg, faq-desktop.jpg, audience-front-desktop.jpg,
audience-back-desktop.jpg y audience-mobile.jpg. Sin datos personales ni secretos.

## Límites

Advertencias preexistentes: Node DEP0205 y React fetchPriority en PublicIllustration.
No suite completa, backend, BD, migraciones, autenticación real, reservas, correo o Zoom.
No nueva arquitectura; .env intacto. Vista local: http://localhost:5174/ con proxy API8000.
Cierre/publicación normal V84 autorizados a dev y feat/piero-dev; comprobar refs reales.
No certificar CI/deploy por push. Siguiente: revisión humana de este ajuste visual.
