# ADMIN V41 — comprobación del sistema visual

Fecha: 2026-10-10, America/Lima. Repositorio: [ashakids-platform](https://github.com/sromansilva/ashakids-platform).
Rama revisada: `codex/2do-intento`. Base V40: `7c8f1ee2d62f22f1c4da6c14de4e344de0491c37`.
Este documento describe la extensión visual V41 sobre esa base; el SHA de cierre se consulta en Git.
Es una comprobación del diseño implementado, no una nueva auditoría académica o del backend.

## Autoridad y resultado

La implementación sigue el producto de [PRODUCT.md](../../PRODUCT.md) y el contrato de
[ADMIN.md](ADMIN.md): modo Operate, navegación estable y registros como protagonistas.
Se compararon [DESIGN.md](../../DESIGN.md), el sidecar `.impeccable/design.json`, el CSS
`frontend/src/pages/admin/admin.css`, los componentes afectados y su diff.
`DESIGN.md` y el sidecar conservan su alcance de landing V38 y no se reescriben con tokens ADMIN.
Este documento registra la adaptación ordinaria del mundo visual ya existente.

La extensión conserva Nunito, el isotipo y los acentos violeta, naranja y teal. Adapta el
cristal y la luz a tareas de gestión: encabezado compacto, resumen legible, filtros reconocibles,
filas continuas y acciones próximas a cada registro. La documentación no añade afirmaciones
clínicas, métricas ni capacidades del producto.

## Comparación con el diseño heredado

| Rasgo existente | Aplicación observada en ADMIN V41 |
| --- | --- |
| Nunito y titulares redondeados | La misma familia heredada del shell. Encabezados principales de panel/cuentas de `1.8rem`, reducidos a `1.5rem` en móvil; títulos operativos de `1.15rem`. La jerarquía sirve a consulta y acción. |
| Violeta de marca | Selección de navegación `#6d28d9`, acciones y foco oscuro `#5b21b6`, tinta principal `#1c1135`. La tinta auxiliar se unifica en `#615274` en los selectores de ADMIN. |
| Naranja y teal | Se conservan como acentos de identidad y de iconos en los resúmenes de cuentas; los números mantienen tinta oscura. No se asignan significados clínicos nuevos. |
| Cristal translúcido | Sidebar, toolbar, resúmenes y paneles claros con transparencias contenidas. Las filas y campos ofrecen superficies tranquilas; los diálogos mantienen fondo blanco opaco. |
| Luz difuminada | Gradientes radiales lavanda y teal sobre `#fafaf9`, estáticos y localizados. La composición conserva espacio para leer registros. |
| Volumen y esquinas suaves | Sombras suaves e iluminación interior, radios de panel de `16px`, controles de `10–12px` y diálogos de `20px` (`18px` en móvil). |
| Microinteracciones suaves | Duración de botón de `.18s`, cambios breves de fondo y sombra; sin entradas decorativas ni bucles de iluminación nuevos. |

La escala amplia y el arte de la landing no se trasladan al área operativa. Se conserva
su lenguaje de materiales con una densidad apropiada para consultar cuentas, agenda y catálogos.

## Alcance y aislamiento

`DashLayout` incorpora `.asha-admin` únicamente para el rol ADMIN, además de toolbar,
contenedor de contenido y franja móvil de ayuda. `Sidebar` recibe su clase ADMIN y
`aria-current="page"` en la selección. Los estilos específicos se apoyan en esa raíz
o en clases de presentación usadas por markup ADMIN.

El shell compartido conserva navegación, drawer, cierre por Escape y logout existentes.
`OperationalDashboard` recibe clases y agrupaciones de presentación; los nuevos iconos
de acciones se muestran en modo ADMIN. Los selectores de esta extensión no adoptan el
material visual para familia o terapeuta.

| Superficie | Cambio visual registrado | Comportamiento conservado |
| --- | --- | --- |
| Shell | Sidebar translúcido, selección violeta, contexto superior y franja de ayuda móvil | Menús, rutas, navegación y guard de rol |
| Panel operativo | Cuatro accesos con Lucide, resumen continuo, sesión en curso y próximas citas organizadas en áreas | Queries, conteos, estados de carga/error y callbacks de actualización/navegación |
| Cuentas | Resumen con Lucide, filtros/búsqueda, lista continua, acciones de `44×44px`, dato principal como botón accesible | Categorías, filtros, callbacks de detalle/edición y campos de los formularios |
| Catálogo de contenido | Iconos Lucide, filas adaptables, nombres accesibles de editar/eliminar y áreas de acción mayores | Entradas y filtro local de demostración; no se implementa persistencia |
| Configuración | Iconos Lucide y cuadrícula de dos columnas, apilada en móvil | Secciones y controles demostrativos existentes |
| Machine Learning | Iconos Lucide en avisos, acciones y gobernanza visibles; jerarquía sin rótulo ADMIN repetido | Datos, modal, estados y avisos de simulación/no diagnóstico existentes |
| Terapeutas, operación y auditoría | Materiales del shell y superficies consistentes | Contenido y rótulos demostrativos existentes |

Se conservan API, BD, queries, callbacks, rutas, permisos y autenticación. No se modifica
el contrato React → HTTP/JSON → FastAPI → PostgreSQL ni se introduce Supabase Auth.
La revisión del diff sustenta este alcance de presentación; las capturas no certifican
por sí solas funcionamiento de cada acción.

## Adaptación, foco y alternativas

En escritorio la navegación conserva su ancho de `240px`; el contenido admite hasta
`1200px`. A `1150px` el panel reduce acciones y resumen a dos columnas, apila el área
operativa y coloca los filtros de cuentas en vertical. Bajo `767px` se conserva la
topbar/drawer, se oculta la toolbar de escritorio y se reorganizan las filas de cuentas
y contenido para mantener legibles nombre, estado y acciones.

La franja móvil «Ayuda y asistente» reserva `76px` más `safe-area-inset-bottom` tanto
en su altura como en el espacio inferior de `main`. WhatsApp y ASHI se colocan en esa
franja para evitar que tapen acciones como «Ver». Al abrir un diálogo o el menú móvil,
la franja y los flotantes se ocultan mediante los selectores de estado existentes.

Campos y diálogos mantienen superficies opacas de lectura. Inputs/selects tienen altura
mínima de `44px`; las acciones de cuentas y contenido reciben áreas de `44×44px`.
Esto no implica que todos los controles de todos los módulos tengan ese tamaño:
los botones de próximas citas conservan una altura mínima de `40px`.

El foco visible usa contorno de `3px solid #5b21b6` con separación de `3px` en botones,
enlaces y campos. `prefers-reduced-motion: reduce` desactiva animaciones/transiciones
y la transformación de presión de botones dentro de `.asha-admin`. El fallback de
`backdrop-filter` cambia a blanco sidebar, toolbar y resumen operativo. Estas reglas
se comprobaron en fuente; no se emularon las preferencias del sistema ni la ausencia
de blur, y no se declara conformidad WCAG integral.

## Evidencia y comprobaciones del corte

Entorno de QA registrado: Vite `localhost:5175`, API `localhost:8002` y PostgreSQL local
separado en puerto `6544`. Se utilizó una cuenta ADMIN sintética ya existente. Los nombres
y correos capturados son sintéticos; no se crearon, editaron, suspendieron o eliminaron
cuentas ni se escribieron registros clínicos para esta comprobación.

Las capturas están en [evidencia V41](../evidence/admin-v41/README.md) y
`.impeccable/review/admin/`. Son viewports y secciones: el scroll principal vive en un DIV.

| Tamaño | Evidencia visual disponible |
| --- | --- |
| `1280×900` | Ocho destinos de navegación: panel, cuentas, terapeutas, operación, contenido, ML, auditoría y configuración; formulario de cuentas arriba/abajo y estado vacío |
| `390×844` | Panel, cuentas, formulario arriba/abajo, menú y contenido; los PNG disponibles tienen `390×843` |
| `920×811` | Panel y cuentas al ancho real de la app |

Se registraron búsqueda por código, búsqueda sin coincidencias, cambio de categoría de
cuentas, apertura/desplazamiento/cancelación del formulario y cierre por Escape, navegación
del menú móvil y filtro de Canciones. No se enviaron formularios ni se accionó edición/eliminación
del catálogo. Esta documentación inspeccionó directamente las capturas de panel de escritorio,
cuentas móvil, formulario móvil y ML de escritorio; el inventario completo corresponde a la
verificación del implementador y a la revisión independiente del corte.

| Comprobación reportada para V41 | Resultado y límite |
| --- | --- |
| Vitest y rutas | `281` pruebas de componentes en `18` archivos y `25` pruebas de rutas correctas; `22.71s`. Se ejecutaron antes del último bloque cosmético; no se presentan como repetidas después. |
| Typecheck y build final | Tipos correctos; build correcto, `1897` módulos, `3.45s`. No acredita todos los recorridos de la app. |
| Check de frontend | `340` archivos; máximo `498` líneas, importaciones y límites de roles/HTTP correctos. |
| Graphify | Refresh/check: `2216` nodos y `108` comunidades, AST local sin LLM; aviso conocido de `12` archivos sin símbolos. Consulta de relaciones limitada a `1500` tokens y confirmación en fuente/diff. |
| Detector Impeccable | Una ejecución: aviso `gray-on-color` en la antigua línea `104` de `AdminCuentasTable.tsx`. Se cambió la acción de gris a `text-violet-700`, hover `text-violet-800`; no hubo segunda ejecución del detector. |

Advertencias conservadas: deprecación `DEP0205` y aviso de npm sobre el argumento
`--run` innecesario para el script; no afectaron a los resultados correctos registrados.

La revisión independiente inicial pidió dos correcciones: WhatsApp cubría «Ver» en móvil
y había iconos emoji visibles en ML. Ambas se corrigieron en un bloque y se recapturaron
las superficies afectadas. La confirmación independiente emitió `disposition: ship` y
marcó ambos hallazgos como resueltos. Esa aprobación se limita a las dos correcciones
revisadas y no acredita todos los recorridos ni la publicación del corte.

## Recursos y límites heredados

`Isotipo` usa `frontend/src/assets/ashakids-logo-final-transparent-1.png`, recurso PNG
heredado del repositorio. El proveedor disponible es el propio repositorio; autoría y
licencia externas no constan en la evidencia consultada. El archivo no se modifica ni
se presenta como una creación de este corte.

La extensión usa geometría y gradientes CSS e iconos SVG de Lucide React, dependencia
ya existente. No añade raster, servicios de imágenes externos ni generación con ImageGen.
Nunito conserva su importación existente; no se incorpora una fuente nueva.

Los módulos demostrativos conservan avisos, versiones demo, cifras ilustrativas y límites
de orientación no diagnóstica. Su deuda de persistencia, integraciones y operaciones reales
continúa siendo heredada: ninguna se da por resuelta por la apariencia nueva. Pagos permanecen
fuera del alcance.

Las capturas y las pruebas existentes no certifican cada ruta clínica, cada CRUD, errores
del servidor, backend, seguridad completa ni accesibilidad integral. El commit/publicación
corresponde al responsable del corte y debe registrarse con su estado real, sin convertir
pendientes en funciones implementadas.
