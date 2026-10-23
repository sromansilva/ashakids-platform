# Verificación de implementación visual V52

Fecha:2026-10-10, America/Lima. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama:`codex/landing-publica`; padre local5dacd55, remoto incorporado a6eda9f.
SHA del cierre: consultar commit `V52_Rediseno_Ashi_Landing` (sin autorreferencia de SHA).
Trabajo local, no auditoría técnica nueva ni publicación.

## Resultado y comparación

[Referencia](reference.png) comparada visualmente con [1536×1024](desktop-1536.png),
[1440×1000](desktop-1440.png) y [1280×900](desktop-1280.png).
También [página completa](desktop-complete.png) y [panel Demo](ashi-demo.png).
Se corrigieron márgenes de tarjetas, tamaño/posición de Ashi, título, botones,
ilustraciones y wordmark. Se aproxima la composición/jerarquía/materiales de referencia;
los PNG son recreaciones y no equivalencia exacta píxel a píxel. Se mantiene Demo visible
en burbuja/panel aunque la maqueta no lo rotula. Responsive diferido por usuario.

## Comprobaciones ejecutadas

- `npm run typecheck`: PASS.
- `npm run check:frontend`: PASS345fuentes, máximo498líneas; imports/límites/HTTP.
- `npm run build`: PASS1905módulos, salida Vite local.
- `npm test`: PASS25rutas y281componentes en18archivos.
- `node docs/evidence/landing-v52/verify-browser.cjs`: PASS; Chrome instalado headless,
  API/v1 interceptada401. [Resultados](browser-results.json). No fixtures ni datos reales.
  Verifica3anchos desktop, assets cargados, overflow horizontal y controles>=44px;
  cincoFAQ, cinco rutas de hero/tarjetas, único enlace WhatsApp con URL heredada;
  apertura Demo, Escape y devolución del foco, anclaFAQ y movimiento reducido.
  Cero errores JS. Las rutas se verifican por destino, no por backend funcional.
- Graphify: check/query antes; refresh code-only/no-label y check al cierre. Mapa local,
  advertencia12archivos sin símbolos. No se versiona el grafo.
- Revisión diff/check y búsqueda de patrones de secretos en texto del conjunto staged.

Las otras secciones/componentes de landing no cambian textos/datos en este corte;
FAQ conserva sus cinco respuestas. Navegación previa conserva destinos: Especialistas
en tarjeta/equipo/pie, Sobre Nosotros en hero/pie, MundoASHA en navegación/hero/tarjeta/pie,
Recursos en pie. Rótulos del hero/nav/audiencia ahora siguen la referencia autorizada.
V51 contiene pruebas históricas más amplias; no se declaran como nuevas enV52.

## Límites y entrega local

No se verificó nueva fidelidad móvil, paneles privados, backend, entrega WhatsApp, IA,
voz, correo ni efectos clínicos. Demostración existente sin integración nueva.
PNG aproximadamente7.1MB, pendiente optimización para distribución. No se alteraron
rutas, hooks de negocio, API/BD ni secretos. `.gitignore` previo del usuario excluido.
`origin/dev` documental actualizado se incorporó en la rama de trabajo, sin push/merge
hacia dev. Preview Vite activo: http://127.0.0.1:5176/ (solo interfaz local).
