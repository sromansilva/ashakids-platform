# Terapeuta V43 â€” comparaciÃ³n del sistema visual

Fecha: 2026-10-10, America/Lima. Repositorio:
[ashakids-platform](https://github.com/sromansilva/ashakids-platform).
Rama de trabajo: `codex/2do-intento`. Base publicada V42:
`cbf30c63bef8e94159f936ad384598237fbfb928`.
El SHA y la publicaciÃ³n efectiva del cierre V43 se consultan en Git y en el relevo.
Esta comprobaciÃ³n documenta una extensiÃ³n visual; no es una auditorÃ­a tÃ©cnica nueva.

## Autoridad y resultado

Se compararon [PRODUCT.md](../../PRODUCT.md), [DESIGN.md](../../DESIGN.md),
`.impeccable/design.json` y el contrato [THERAPIST.md](THERAPIST.md) con el cÃ³digo
implementado y muestras de sus capturas. El usuario prioriza escritorio y permite
diferir responsive; pidiÃ³ construcciÃ³n directa sobre el cÃ³digo existente.
La superficie opera sobre agenda, pacientes, sesiones y reportes autorizados.

Nunito, el isotipo y violeta/naranja/teal conservan su funciÃ³n de marca. La extensiÃ³n
aplica cristal y luz lavanda/teal estÃ¡tica al shell y a los resÃºmenes; el expediente,
editor, campos y paneles de lectura mantienen fondos opacos. No aÃ±ade una identidad,
otra fuente, imÃ¡genes raster ni un nuevo catÃ¡logo de componentes.

PRODUCT.md, DESIGN.md y el sidecar permanecen intactos. DESIGN.md documenta la
landing V38; THERAPIST.md es el contrato local de esta adopciÃ³n. La menciÃ³n anterior
de login/admin en PRODUCT.md se registra como contexto de otro corte, sin corregirla
como efecto secundario de esta comparaciÃ³n.

## ComparaciÃ³n con el sistema existente

| Rasgo existente | AplicaciÃ³n observada en terapeuta V43 |
| --- | --- |
| Nunito y tinta definida | DashLayout conserva `Nunito, system-ui, sans-serif`. La raÃ­z usa tinta `#1c1135`; contenido auxiliar seleccionado pasa a `#615274`. La agenda usa `#4B4264` para nombres/horas de citas sobre fondos de color. |
| JerarquÃ­a compacta | El H1 del panel de escritorio mide `1.9rem`, interlÃ­nea `1.25`; H1/H2 usan espaciado `-.025em` y balance de lÃ­neas. Conteos de `2rem`, toolbar de `.87rem` y rol de `.72rem`. No se adopta la escala de hero de la landing. |
| Violeta de marca | NavegaciÃ³n activa `#6d28d9` y blanco, hover/foco `#5b21b6`. Acciones del panel usan iconos Lucide y texto violeta sobre superficie clara. Los botones compartidos conservan sus variantes. |
| Naranja y teal | Se conserva la paleta existente; el teal ilumina el resumen del paciente y el fondo. La extensiÃ³n no exige presencia de los tres acentos en cada pantalla ni asigna nuevos significados clÃ­nicos. |
| Cristal y luz contenida | Fondos radiales lavanda y teal sobre `#fafaf9`. Sidebar y toolbar con `blur(18px)`; resumen de registros y workspace inicial admiten transparencia. Contenedores clÃ­nicos, campos y bandeja abierta son blancos opacos. |
| Volumen y formas suaves | NavegaciÃ³n/acciones de `12px`, campos de `10px`, tarjetas de `16px`, diÃ¡logos blancos de `20px`; sombras difusas. La agenda sustituye el borde lateral de `3px` por un contorno de `1px`, sin usar el color de la cita como tinta del texto pequeÃ±o. |
| Respuesta breve | Botones con transiciÃ³n de color/fondo/sombra de `.18s`. Foco de `3px` y separaciÃ³n de `3px`; controles comunes de al menos `44px`, navegaciÃ³n de `46px`. CSS elimina transiciones/animaciones con movimiento reducido. |

**Regla de lectura aplicada.** El cristal acompaÃ±a navegaciÃ³n y resÃºmenes;
los campos y el reporte mantienen una superficie opaca y tinta definida.
**Regla de contexto aplicada.** TÃ­tulo y rol preceden al contenido; resumen de
paciente, conteos autorizados y rÃ³tulos de demostraciÃ³n conservan sus lÃ­mites.
**Regla de movimiento aplicada.** La profundidad responde brevemente al control,
sin aÃ±adir luces ni entradas animadas. Estas reglas describen esta superficie;
no reemplazan los tokens ni las reglas de la landing.

## Fuentes y superficies comprobadas

| Fuente | Evidencia en cÃ³digo |
| --- | --- |
| `frontend/src/pages/terapeuta/therapist.css` | RaÃ­z `.asha-professional`, shell, foco, superficies, grid de resumen/workspace, configuraciÃ³n, reportes y alternativa sin backdrop-filter. La extensiÃ³n principal comienza en `768px`. |
| `frontend/src/app/layouts/DashLayout.tsx` | Importa la hoja y aÃ±ade raÃ­z, toolbar y contenedor profesional solo para `role === 'terapeuta'`. Conserva navegaciÃ³n, logout, drawer y asistentes existentes. |
| `frontend/src/components/common/NotificationCenter.tsx` | Clase de superficie profesional; conserva consultas, estados remotos, paginaciÃ³n, lectura y preferencias. Bandeja blanca; `aria-expanded`/`aria-controls` y Escape desde el panel con devoluciÃ³n de foco al botÃ³n. |
| `frontend/src/components/common/OperationalDashboard.tsx` | Iconos Lucide en las tres acciones profesionales; conserva consultas, actualizaciÃ³n, conteos y notas de alcance. Resumen horizontal y dos Ã¡reas de trabajo por CSS. |
| `frontend/src/pages/terapeuta/TerapeutaConfig.tsx` | Iconos Lucide para perfil/disponibilidad/notificaciones/seguridad. NavegaciÃ³n local vertical de `190px` y contenido con `min-width: 0`; conserva handlers y aviso sobre campos demostrativos. |
| `frontend/src/pages/terapeuta/TerapeutaPacientes/TerapeutaPacientes.tsx` | Clase del resumen del paciente con luz teal y fondo claro; conserva selecciÃ³n, pestaÃ±as, datos y acciones. |
| `frontend/src/pages/terapeuta/TerapeutaReportes.tsx` | Lista y editor en columnas `minmax(200px,.7fr)` / `minmax(0,1.3fr)`. Elimina el rÃ³tulo repetido y convierte Plantillas descargables en tÃ­tulo legible; conserva selecciÃ³n, preview y limitaciones de envÃ­o/firma. |
| `frontend/src/pages/terapeuta/reports/ReportWorkspace.tsx` | Clase de metadatos. CSS usa `repeat(auto-fit,minmax(min(100%,150px),1fr))`, `min-width: 0` y `overflow-wrap: anywhere` para evitar desbordamiento. Conserva permiso de ediciÃ³n, carga del reporte y campos clÃ­nicos. |
| `frontend/src/pages/terapeuta/TerapeutaAgenda.tsx` | Sustituye glifos decorativos por texto de modalidad y MapPin/Video de Lucide; ajusta tinta de horarios/citas y borde. Conserva semana/dÃ­a, detalle y acciones. |
| `frontend/src/pages/terapeuta/TerapeutaDatosActividad.tsx` | Retira el eyebrow de vista interna; conserva el tÃ­tulo y el aviso que distingue participaciÃ³n pseudonimizada de evaluaciÃ³n clÃ­nica. |

La extensiÃ³n alcanza los diez destinos de navegaciÃ³n: inicio, pacientes, agenda,
reportes, analÃ­ticas, mensajes, valoraciones, datos de actividad, configuraciÃ³n e
incidencias. La apariencia observada no acredita cada acciÃ³n disponible en ellos.
La presentaciÃ³n conserva consultas, rutas, guards, callbacks y operaciones existentes;
no modifica backend, esquema de BD, autenticaciÃ³n ni hosting.

## Evidencia y comprobaciones del corte

El implementador reportÃ³ QA local en Vite `localhost:5175`, API `localhost:8002`
y PostgreSQL `6544`, con datos sintÃ©ticos existentes. Se consultaron preferencias
y disponibilidad sin guardar. No se crearon cuentas, enviaron mensajes, reservaron
citas ni escribieron datos clÃ­nicos para este corte visual.

Capturas de viewport/secciÃ³n en `.impeccable/review/therapist/`; la copia versionada
del cierre corresponde a `docs/evidence/therapist-v43/`. El implementador registra
los diez destinos a `1280 Ã— 900` y muestras de inicio/reportes/configuraciÃ³n a
`920 Ã— 811`. Esta pasada documental inspeccionÃ³ directamente `home-desktop.png`,
`reports-user-920.png`, `config-user-920.png` y `patient-detail-desktop.png`.
El resto del inventario corresponde al implementador y al revisor independiente.

Se probaron cambio semana/dÃ­a y cierre de detalle de agenda con Escape, apertura
y cierre de vista previa de reporte, apertura de bandeja y Escape desde dentro del
panel. No se presenta la consulta por HTTP como una nueva prueba del backend o de
la base desplegada. La prioridad de escritorio deja responsive pendiente; no se
declara aceptaciÃ³n mÃ³vil, conformidad WCAG integral ni verificaciÃ³n de todas las anchuras.

| ComprobaciÃ³n reportada por el implementador | Resultado y lÃ­mite |
| --- | --- |
| Componentes y rutas | `281` pruebas de componentes en `18` archivos y `25` de rutas correctas; `15.92s`. No son nuevas pruebas backend ni ejecuciÃ³n de cada recorrido UI. |
| Typecheck y check de frontend | Correctos; `342` archivos, mÃ¡ximo `498` lÃ­neas. |
| Build | Inicial correcto: `1899` mÃ³dulos, `2.74s`; final posterior al arreglo de metadatos correcto, `1899` mÃ³dulos, `4.53s`. La compilaciÃ³n no acredita todas las pantallas. |
| Graphify | Refresh/check finales reportados con `2219` nodos y `106` comunidades; mapa vigente despuÃ©s de los Ãºltimos cambios de fuente. |
| Detector Impeccable | Una ejecuciÃ³n con dos advertencias de violeta de marca en NotificationCenter y el modal 2FA de Config. Identidad retenida por peticiÃ³n explÃ­cita; no se repite el detector ni se presentan las advertencias como corregidas. |

La revisiÃ³n inicial pidiÃ³ corregir el desbordamiento de los metadatos del reporte
a `920px`. El CSS ya contiene la distribuciÃ³n auto-fit, mÃ­nimos y ajuste de palabra
descritos arriba. La captura `reports-user-920.png` inspeccionada en esta pasada
muestra ahora los tres metadatos apilados y contenidos en el editor a `920 Ã— 811`;
su dimensiÃ³n fÃ­sica se verificÃ³ despuÃ©s de reemplazar una primera captura que
medÃ­a `1280 Ã— 900` pese a su nombre. La revisiÃ³n final emitiÃ³ `Resolved / Clear`
y `disposition: ship`: paciente, fecha y estado completos, separados y sin
desbordamiento a `920 Ã— 811` apilados y a `1280 Ã— 900` en tres columnas, sin
regresiÃ³n visible del arreglo. La aprobaciÃ³n se limita al defecto corregido en
escritorio y no certifica todos los recorridos ni otras anchuras.
Se conserva el aviso heredado de deprecaciÃ³n `DEP0205` de las pruebas.

## Recursos, deuda y lÃ­mites

Se reutilizan isotipo y SVG de Lucide React; no se aÃ±ade raster ni fuente.
No se atribuye autorÃ­a/licencia externa a recursos heredados sin evidencia.
Los formularios y flujos conservan advertencias sobre foto/2FA/solicitudes demo,
ausencia de firma digital/envÃ­o de reportes y registros de participaciÃ³n sin
equivalencia clÃ­nica. Pagos siguen excluidos del alcance.

No se canonizan como reglas del sistema los rÃ³tulos heredados en mayÃºsculas del
workspace ni los elementos demostrativos de modales secundarios. Responsive,
avisos del detector y desfase de alcance de PRODUCT/DESIGN quedan registrados,
sin reparaciÃ³n documental no solicitada. La extensiÃ³n no certifica conexiÃ³n de BD
en Render, adopciÃ³n de migraciones, despliegue, seguridad completa ni CRUD general.
Commit y publicaciÃ³n se registran por el responsable del cierre con su estado real.
