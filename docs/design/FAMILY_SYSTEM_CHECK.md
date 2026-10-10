# Padre / tutor V42 — comparación del sistema visual

Fecha: 2026-10-10, America/Lima. Repositorio:
[ashakids-platform](https://github.com/sromansilva/ashakids-platform).
Rama de trabajo: `codex/2do-intento`. Base publicada V41:
`5ca2713ea14ddbd6a2eb44af49490657605d0d4b`.
El SHA y la publicación del cierre V42 se consultan en Git y en el relevo del equipo.
Esta comprobación documenta una extensión visual; no es una auditoría técnica nueva.

## Autoridad y resultado

Se compararon [PRODUCT.md](../../PRODUCT.md), [DESIGN.md](../../DESIGN.md),
`.impeccable/design.json` y el contrato [FAMILY.md](FAMILY.md) con las fuentes de V42.
El usuario prioriza la web de escritorio y pidió construir directamente sobre el código.
La extensión conserva Nunito, violeta/naranja/teal, el isotipo y Ashi; adapta cristal,
luz estática y volumen suave al seguimiento por niño y a la consulta de agenda.

`PRODUCT.md`, `DESIGN.md` y el sidecar permanecen intactos. El sistema global conserva
su descripción de landing V38; este documento registra la adopción local en padre/tutor
sin convertir la composición de esta pantalla en una norma global. La referencia vigente
para esta superficie es FAMILY.md. La mención de login/admin en PRODUCT.md corresponde
a su corte anterior y no se modifica para completar esta comprobación.

## Comparación con el sistema existente

| Rasgo existente | Aplicación observada en padre/tutor V42 |
| --- | --- |
| Nunito y tinta oscura | El shell conserva `Nunito, system-ui, sans-serif`. Tinta principal `#1c1135`, secundaria `#615274`; las clases auxiliares grises/lavanda seleccionadas reciben esa tinta secundaria. |
| Titulares compactos | H1 de escritorio de `1.9rem`, interlínea `1.25`; H1/H2 con espaciado `-.025em` y balance de líneas. Resumen del niño de `1.55rem`; títulos de mundos de `1.35rem`. No se traslada la escala de hero de landing. |
| Violeta de marca | Navegación activa y primera acción del resumen en `#6d28d9`, hover oscuro y foco en `#5b21b6`. Los botones compartidos conservan sus variantes. |
| Naranja y teal | Luz cálida del resumen y tarjetas de mundos alternadas con luces teal/naranja. Acentos decorativos e iconos, sin nuevas interpretaciones clínicas. |
| Cristal y luz | Fondos radiales lavanda/naranja sobre `#fafaf9`; sidebar y toolbar con `blur(18px)`. Resúmenes, plan y tarjetas de consulta admiten transparencia contenida. Campos, diálogos y superficies de reportes son blancos opacos. |
| Volumen suave | Tarjetas de `16px`, resumen de `18px`, controles de `10–12px`. Sombras difusas con reflejo interior; los mundos pasan de `0 9px 28px #4524780a` a `0 14px 34px #45247815` al apuntar. |
| Respuesta breve | Botones y mundos usan transiciones de `.18s`. No se añaden entradas decorativas ni iluminación en bucle. La alternativa de movimiento reducido se mantiene por CSS. |

**Regla de lectura aplicada.** El cristal acompaña el contexto familiar y las tarjetas
de exploración; los campos y el contenido de reportes mantienen una superficie opaca.
**Regla de contexto aplicado.** La identidad del niño precede al resumen, los conteos,
los planes y los mundos; sus rótulos distinguen registros y demostración.
Estas reglas describen este corte y no añaden prohibiciones al sistema de landing.

## Fuentes y superficies comprobadas

| Fuente | Evidencia de implementación |
| --- | --- |
| `frontend/src/pages/padre/family.css` | Estilos de escritorio bajo `min-width: 768px`; raíz `.asha-family`, shell, foco, campos, resumen, conteos, recorrido, reportes, mundos y directorio. |
| `frontend/src/app/layouts/DashLayout.tsx` | Raíz, toolbar y contenido familiares condicionados a `role === 'padre'`; contexto superior con nombre y «Familia / Tutor». Se conservan drawer, Escape, navegación, logout y asistente. |
| `frontend/src/components/common/FamilyTrackingPanel.tsx` | Clases de presentación, selector del niño, resumen con Ashi, plan, conteos y recorrido. Reporte con campos rotulados y estados remotos; historial con `aria-expanded`/`aria-controls` y reinicio de detalle al cambiar niño/pestaña. |
| `frontend/src/pages/padre/Sessions/MundoAshaHome.tsx` | Lista en dos columnas de mundos asignados, iconos Lucide e identidad del niño. Conserva nota de demostración y separación del progreso por cuenta/niño. |
| `frontend/src/pages/padre/Padre/PadreAgendaMiAgenda.tsx` | Calendario, estados, detalle expandible y línea de tiempo existentes; estado vacío con CalendarDays de Lucide. Callbacks de reserva/cancelación conservados. |
| `frontend/src/pages/padre/Padre/PadrePsicologos.tsx` | Directorio en dos columnas, especialidad/descripción y acción de horarios; conserva consulta paginada, estado vacío y BookingDialog. |

La presentación se extiende a los nueve destinos de navegación: centro familiar,
camino, agenda/sesiones, terapeutas, mensajes, reportes, mundos, configuración e
incidencias. Las capturas de esos destinos acreditan su apariencia observada,
no la ejecución de cada acción disponible. El cambio conserva hooks, consultas,
callbacks, rutas, guards, autenticación y contratos API. No modifica backend ni BD.

## Escritorio, foco y alternativas

El contenido principal admite `1220px`; mundos, `1160px`. El contenedor reserva
espacio derecho mediante `padding: 12px 88px 36px 12px` y padding interior de `24px`.
Mundos y profesionales usan dos columnas con separación de `22px`. El plan vigente
coloca el texto a la izquierda y su acción en una columna propia. Los conteos forman
una superficie continua con separadores; el recorrido conserva hitos legibles.

Campos de formulario tienen fondo blanco y altura mínima de `44px`; selección lateral
de navegación, `46px`. Foco de botones, enlaces y campos: contorno violeta oscuro de
`3px`, separado `3px`. Estas medidas no certifican que todos los controles de agenda
o todos los módulos tengan áreas de `44px`. Al abrir un diálogo, los flotantes de ayuda
se ocultan con el selector de estado; el diálogo conserva fondo blanco.

El fallback sin `backdrop-filter` lleva sidebar y toolbar a blanco. Con movimiento
reducido se eliminan animaciones/transiciones dentro de la raíz familiar y la
transformación de presión de botones. Se comprobaron ambas reglas en fuente;
no se emularon preferencias del sistema ni ausencia de blur en esta documentación.

Responsive queda diferido por petición explícita del usuario. Las reglas nuevas
se aplican desde `768px`; se preserva la base móvil existente. No se declara una
revisión móvil, conformidad WCAG integral ni aceptación de todas las anchuras.

## Evidencia y comprobaciones del corte

El implementador registró QA en el entorno local separado: Vite `localhost:5175`,
API `localhost:8002`, PostgreSQL local en `6544`, con datos sintéticos existentes.
No se crearon usuarios, enviaron mensajes, reservaron citas ni guardaron cambios
clínicos para esta comprobación visual. La lectura por HTTP no equivale a una nueva
verificación del backend o de la base desplegada.

Las capturas de viewport/sección están en `.impeccable/review/family/`, con copia
versionada en [evidencia V42](../evidence/family-v42/README.md).
Se documentan nueve destinos a `1280px` y centro familiar/mundos a `920px`;
el contenido principal tiene scroll dentro de un DIV. Se registraron selección
Ana/Luis, aislamiento visible de sus datos, estados sin registros y acordeón de
sesión/reporte. Esta pasada documental inspeccionó directamente las capturas
`home-desktop.png` y `reports-desktop.png`; el resto corresponde al inventario
del implementador y a la revisión independiente.

| Comprobación reportada por el implementador | Resultado y límite |
| --- | --- |
| Vitest y rutas | `281` pruebas de componentes en `18` archivos y `25` de rutas correctas; `16.33s`. No se presentan como nuevas pruebas backend ni como repetición de cada recorrido UI. |
| Typecheck y check de frontend | Correctos; check de `341` archivos, máximo `498` líneas. |
| Build | Inicial correcto: `1898` módulos, `2.71s`; final tras ajuste de reportes correcto, `1898` módulos, `4.13s`. La compilación no acredita todas las pantallas. |
| Graphify | Refresh final reportado con `2218` nodos y `110` comunidades; check documental final confirmó mapa actualizado. Un check intermedio posterior al ajuste CSS lo detectó obsoleto y se resolvió con el refresco final. |
| Detector Impeccable | Una ejecución con dos advertencias de violeta de marca. Se conserva la identidad por petición explícita; no se repite el detector ni se presenta como un fallo corregido. |

La revisión independiente inicial pidió hacer opacos los reportes. El CSS incorpora
blanco sólido en el contenedor del último reporte, las tarjetas descendientes de
las secciones de reportes guardados/historial y los contenedores de acordeones de
reportes. Se corrigió la dirección de los selectores de historial para que el fondo
alcanzara las tarjetas reales. El implementador comprobó fondo computado blanco
y recapturó reportes y `journey-reports-desktop.png`. La revisión final emitió
`disposition: ship`, con el hallazgo de opacidad resuelto y sin regresión del arreglo.
Ese veredicto se limita a la corrección revisada y no certifica todos los recorridos.

Se conserva el aviso de deprecación `DEP0205` de la ejecución de pruebas.

## Recursos, deuda y límites

Se reutilizan isotipo/Ashi y SVG de Lucide React, biblioteca existente; no se añade
raster, otra fuente ni recursos generados. No se atribuye autoría o licencia externa
de los recursos heredados sin evidencia. No se alteran PRODUCT.md ni los tokens
normativos/sidecar de la landing para legitimar diferencias de esta extensión.

Los juegos conservan el rótulo de demostración: progreso en la pestaña, por cuenta
y niño; sin persistencia de servidor ni entre dispositivos, sin medir mejoría clínica
ni condicionar reservas. Conteos, «Sin medición», pendientes y estados demo conservan
sus límites. Pagos permanecen excluidos.

La deuda responsive y las advertencias de violeta quedan registradas, no canonizadas
como nuevas reglas. Este corte no comprueba despliegue, conexión de BD en Render,
migraciones, seguridad completa, CRUD de todos los módulos ni todas las rutas clínicas.
El commit y la publicación se registran por el responsable del cierre con su estado real.
