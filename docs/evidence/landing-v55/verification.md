# V55 — ilustraciones y continuidad pública, verificación de implementación

Fecha: 2026-10-10, America/Lima. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama local: `codex/landing-publica`. Padre visual `0d1e285` (V53); incorpora
`origin/dev` `ca9e1b3` (V54) mediante merge local. SHA final consultable en Git.
Sin push ni integración hacia dev; dev local `396efdaf06a3db0cee6847e82fca69bcdb84dd55`
se conserva. `.gitignore` del usuario queda fuera del commit.

## Cambio visual y recursos

14 ilustraciones transparentes generadas con ImageGen: tres pasos, terapia, equipo,
familia jugando, Ashi para FAQ, newsletter, archipiélago y cinco mundos diferentes.
No se reutilizan imágenes entre las secciones inferiores. Hero/audiencia/dock aprobados
se mantienen. Son recreaciones generadas, no exportaciones originales de la referencia.
Assets `*-v54.png` identifican el lote iniciado antes de conocer el V54 remoto; el commit
se numera V55 para continuar la secuencia. [Prompts exactos y procedencia](imagegen-manifest.json)
y [hashes/pesos](asset-checks.json); originales en `.codex/generated_images`, copias integrables
en `frontend/public/illustrations`. [Revisión visual del lote](asset-review.png).

Mundo ASHA público adopta Nunito, paleta violeta/aqua/naranja, tarjetas de cristal,
relieve de botones y hero ilustrado; conserva catálogo, estados y destinos de acceso.
FAQ usa otra pose del mismo Ashi y acordeón con jerarquía clara. Estilos encapsulados
bajo `.asha-landing`/`.asha-mundo`; PublicNav sólo adopta la variante con opt-in.
Btn/Crd, mundos privados, paneles y lógica de catálogo no se modifican por este rediseño.

## Comprobaciones ejecutadas

- `npm run typecheck`: PASS.
- `npm run check:frontend`: PASS,346 archivos, máximo500líneas en AdminCuentas remoto.
- `npm run build`: PASS,1906módulos.
- `npm test`: PASS,25pruebas de rutas;280pruebas de componentes en18archivos.
  Node advierte uso experimental de Type Stripping; no fallos.
- `node docs/evidence/landing-v55/verify-landing.cjs`: PASS. Chrome escritorio1536/1440/1280;
  contenido visible, nombres/estados de botones y destinos de enlaces comparados contra
  baseline del merge vigente antes de las nuevas imágenes. Todas las imágenes cargan,
  sin overflow ni botones visibles<44px, margen para dock.8imágenes inferiores únicas.
  Cinco preguntas/respuestas preservadas, cinco destinos comprobados, ancla FAQ,
  WhatsApp único con URL existente, Ashi Demo/Escape/retorno de foco, reduced-motion;
  cero errores JS. Newsletter heredada de dev: consentimiento, payload, éxito, error,
  recuperación y aria-invalid mediante API simulada; ninguna entrega de correo real.
- `node docs/evidence/landing-v55/verify-mundo.cjs`: PASS. Mismos tres anchos; cinco tarjetas,
  textos/controles/enlaces originales, cuatro accesos login, carga/error/reintento,
  reduced-motion y cero errores JS. Fixture extraída del catálogo estático del backend;
  API interceptada, sin BD. [Resultados](mundo-results.json).
- GET real público `/api/v1/juegos/catalogo` por preview: HTTP200; cinco tarjetas y cero
  errores JS en Chrome, sin login ni escrituras. [Resultado](live-preview.json).
- `.venv-graphify/Scripts/python.exe tools/knowledge/manage.py refresh`: PASS,2343nodos,
  117comunidades; AST local/code-only/no-label. Advertencia12fuentes sin símbolos.
  `check`: mapa vigente. `git diff --check` y `git diff --cached --check`: PASS
  al corregir una línea vacía final heredada en architecture.md. Revisión de53archivos
  de texto staged sin patrones de claves privadas, tokens GitHub/OpenAI o JWT.
- Intento de prueba unitaria backend heredada (`test_email_newsletter_unit.py`) con
  `backend/.venv/Scripts/python.exe -m pytest`: no ejecutada, `No module named pytest`.
  No se instaló ni afirmó cobertura backend, ni se aplicó migración009.

[Resultados de landing](browser-results.json), [landing completa](desktop-complete.png),
[Mundo completo](mundo-complete.png), [FAQ](faq.png), [newsletter](newsletter.png).
Capturas inspeccionadas directamente: escala, color, jerarquía, consistencia de tarjetas,
relieve, nuevas escenas y pose de Ashi. Se corrigió contraste de consentimiento/feedback
para el fondo claro después de resolver el merge del formulario.

## Alcance, incidencias y continuidad

Esta entrega verifica una implementación visual; no es una auditoría académica nueva.
Responsive está diferido por prioridad explícita. Paneles privados no tienen nueva
verificación visual; la suite no certifica todas las pantallas ni servicios externos.
Ashi sigue identificado como demostración; la onda es decorativa y WhatsApp sólo enlace.
PNG conservan alpha y calidad de generación; optimización de peso/fidelidad móvil queda
para un corte posterior antes de publicación. No hay recursos visuales faltantes para
este alcance de escritorio. No se inventaron datos clínicos ni testimonios.

Fetch detectó avances remotos de boletín/Gmail y administración. Se resolvieron tres
conflictos conservando su funcionamiento y el diseño aprobado. Estas funciones son
heredadas de dev, no una ampliación funcional del rediseño. La primera comparación del
newsletter en el arnés antiguo falló al contar peticiones lazy de imágenes como envíos;
se corrigió el arnés para verificar el formulario vigente con respuestas simuladas.
Preview local permanece en http://127.0.0.1:5176/ y /mundo-asha.
Siguiente: revisión humana del diseño local; no publicar hasta aprobación explícita.
