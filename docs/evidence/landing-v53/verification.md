# Continuidad visual de landing V53

Fecha:2026-10-10, America/Lima. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama `codex/landing-publica`, base d8eb10e82e73f1e5be9dc4e7788f6531f5ca55e4/V52.
Remoto origin/dev a6eda9f, sin avance nuevo durante este corte. Commit de cierre
`V53_Continuidad_Visual_Landing`, SHA consultable en Git. Sólo local, sin publicación.

## Diseño aplicado

El hero aprobado permanece. Su tipografía, cristal, radios, colores, ilustraciones y
relieve se extienden a pasos, terapias, perfiles, ejemplos, FAQ, newsletter y pie.
Imágenes V52 reutilizadas, decorativas y con carga diferida. No nuevas fotos de perfiles
ni casos clínicos. Margen derecho libre para evitar que el dock cubra tarjetas inferiores.
Antes: [captura V52](../landing-v52/desktop-complete.png) (evidencia histórica).
Después: [página completa](desktop-complete.png), [1536px](desktop-1536.png),
[1440px](desktop-1440.png), [1280px](desktop-1280.png).
Detalle: [pasos](steps.png), [terapias](services.png), [equipo](team.png),
[ejemplos](stories.png), [FAQ](faq.png), [newsletter](newsletter.png).

## Comprobaciones nuevas

- `npm run typecheck`: PASS.
- `npm run check:frontend`: PASS,346archivos, máximo498líneas.
- `npm run build`: PASS,1906módulos.
- `npm run test:routing`:25PASS; Node avisa Type Stripping experimental.
- `node docs/evidence/landing-v53/verify-browser.cjs`: PASS en Chrome headless instalado.
  [Línea base V52 capturada antes de editar](baseline.json) y [resultados](browser-results.json).
  Mismo conjunto de palabras visibles, mismos nombres/estados de botones y enlaces
  exactos. No se inventan cifras, testimonios ni promesas. Todas las imágenes cargan
  en3anchos desktop, sin overflow horizontal ni controles visibles<44px.
  Cinco FAQ con respuestas anteriores, cinco destinos principales, único enlace WSP
  con URL heredada, Demo/Escape y foco devuelto, anclaFAQ y movimiento reducido.
  Newsletter editada y pulsada sin peticiones: se conserva su comportamiento sin envío.
  API/v1 interceptada401, cero errores JS, sin sesiones/usuarios/BD de prueba.
- Graphify check/query antes; refresh local code-only/no-label después,2292nodos,
 95comunidades,12archivos sin símbolos; check vigente. Grafo no versionado.
- Revisión diff, selectores encapsulados y patrones de secretos antes del commit.

Este corte es verificación de implementación, no auditoría técnica nueva. Las281pruebas
de componentes V52 no se repitieron; no se declaran como comprobaciones nuevas.
Responsive, backend, paneles privados, entrega WhatsApp/correo, voz e IA reales no
verificados aquí. No se modifican contratos, datos, hooks, Btn/Crd ni rutas.
`.gitignore` del usuario se conserva fuera del commit. Preview local: http://127.0.0.1:5176/ .
