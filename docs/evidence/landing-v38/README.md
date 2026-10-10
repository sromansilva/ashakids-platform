# Evidencia V38 — landing UI/UX

Fecha:2026-10-10 America/Lima. Base:codex/2do-intento,
4fba7e9ff18e24248072118f553bbb96243367eb (V37). Cierre:V38_Rediseno_Landing_UI;
consultar Git para SHA final. Repositorio:https://github.com/sromansilva/ashakids-platform .
Entorno:Vite5175 y API8002 existentes, sesión sintética t90002. Solo presentación.
No migraciones, pruebas SQL/backend nuevas, Supabase ni integración dev/feat/piero-dev.
No auditoría académica nueva/PDF; evidencia del cambio visual.

## Comprobaciones ejecutadas

| Comando/caso | Resultado nuevo |
| --- | --- |
| npm run typecheck | correcto |
| npm run check:frontend |338 archivos, máximo498; correcto |
| npm test |25 rutas +281 componentes/18 archivos;16.24s, correcto |
| npm run build inicial/final |2.65s/2.55s;1897 módulos, correcto; DEP0205 heredado |
| impeccable detect --json sobre7 archivos UI | [] /exit0; una ejecución |
| python tools/knowledge/manage.py refresh y check |2213 nodos/108 comunidades; actual;12 archivos sin símbolos, aviso conocido |
| git diff --check | correcto antes de cierre |
| FAQ primera pregunta | ratón abre respuesta/aria-expanded=true; Enter cierra/false |
| Iniciar sesión del hero | conserva go(login); sesión activa redirige /terapeuta |
| Hero responsive |1280×900,751×844,390×844,334×844: titular/CTA/arte completos |

No se repitió login anónimo, menú móvil ni newsletter. Newsletter conserva botón sin envío.
Hover y prefers-reduced-motion comprobados en fuente, sin emulación del SO/prueba de puntero.
No atribuir aquí los207 tests backend del corte anterior ni cobertura de toda pantalla.

## Capturas y revisión acotada

`*-inicial.png` son la implementación V38 antes del único bloque de corrección, no el diseño
anterior V37. Incluyen hero1280/751/390 y seis secciones desktop/móvil:servicio, pasos,
equipo, historias, FAQ y newsletter. Revisión conjunta halló dos fixes: grid mínimo intrínseco
recortaba hero móvil y reduced-motion neutralizaba transición sin neutralizar desplazamiento.
Ambos corregidos en un solo bloque CSS. `desktop-final`, `movil-final`, `estrecha-final`,
`actual-final` confirman hero; `faq-abierta-final` muestra interacción.
Capturas son viewport/secciones: scroll está en DIV externo y fullPage no captura documento
entero. Dos finales conservaron scroll FAQ, se recapturaron correctamente arriba.

Revisor independiente (Impeccable): disposition ship limitado al cierre de esos dos fixes.
Persistence: PRODUCT/contrato, DESIGN/sidecar documentados. Fidelity:ancho resuelto334/390/751,
reduced-motion resuelto en CSS. Ceiling:dirección conservada. Material_fixes:ninguno de los dos.
Keep:«hola», paleta y jerarquía. Sin nueva ronda de pulido ni puntuación total del producto.

## Recursos y límites

Referencias JPG proporcionadas por el usuario: orientación visual, no nuevas funciones.
Arte «hola» nativo CSS y Lucide SVG; no raster nuevo. Isotipo PNG existente conservado
sin editar, procedencia heredada sin licencia externa inventada; detalles en DESIGN.md.
YAML/JSON de diseño validados; rampas tonales auxiliares no son colores de producción.
UseLanding/datos/acciones/API/BD intactos. Ficción de historias conserva rótulo.
Directorio demo, newsletter inactivo y textos heredados sobre paquetes/Zoom siguen deuda
funcional; esta fase no declara pagos, reuniones automáticas ni envío de correos reales.
