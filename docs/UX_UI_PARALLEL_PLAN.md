# AshaKids — Plan de producto y UX/UI por flujos

**Histórico desde 2026-10-10.** Su reparto paralelo y la instrucción de no iniciar UI
pertenecen al corte documental V28. La ejecución vigente es
[secuencial](VISUAL_IMPLEMENTATION_PLAN.md), con [estado único](VISUAL_IMPLEMENTATION_STATE.md).
Conservar B0–B5 como mapa de alcance y dependencias; no asignar trabajo paralelo.

Fecha: 2026-10-09, America/Lima. Estado: propuesta para validar; implementación no iniciada.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Base de lectura actual: `piero-dev`, V27, `f9df2bc30d56b643af6dd88ab90f6ffdfdbf0fa7`.
Corte documental V28: diseño maestro y primer juego especificados, pendientes de validación.
Lectura de código e inspiración Figma acotada; auditorías 16/17 como evidencia histórica.
No es una auditoría nueva ni implementación del rediseño.
Inventario complementario: [rutas, fuentes y responsables](UX_UI_ROUTE_MATRIX.md).

Referencias comunes: [PRODUCT.md](../PRODUCT.md) y [DESIGN.md](../DESIGN.md).
Figma inspira criterios propios; no copiar maquetas, métricas o contratos aparentes.
Primer juego obligatorio: pájaro de Voz Aventura, especificado en [Mundo ASHA](MUNDO_ASHA_PLAN.md).
No implementar todavía UI, juego o migraciones. Este paquete se entrega para validación.

## Resultado que buscamos

Una familia entiende qué atención tiene su hijo, qué debe hacer después, cuándo será su
próxima cita y dónde consultar lo trabajado. El terapeuta dispone de la misma información
autorizada para atender, registrar la sesión y comunicar recomendaciones. Administración
prepara cuentas, pacientes y asignaciones sin obligar a la familia a conocer la arquitectura.
La experiencia infantil es guiada, amable y simple; la gestión clínica permanece a cargo
de adultos. Un diseño común debe funcionar en escritorio y móvil.

No se repartirán pantallas al azar. Se repartirán flujos, archivos y componentes con un
responsable único. Los diseños y contratos compartidos se acuerdan antes del trabajo paralelo.
Esto reduce conflictos; no garantiza que Git nunca encuentre uno.

## 1. Qué existe y qué necesita trabajo adicional

| Flujo | Estado observado en V26 | Decisión para esta etapa |
| --- | --- | --- |
| Acceso por código y contraseña, sesión y permisos por rol | API propia y persistencia; hallazgos de accesibilidad en login | Conservar autenticación; corregir semántica y renovar presentación |
| ADMIN crea cuentas de familiares y terapeutas | API y pantallas conectadas; dos entradas de gestión de usuarios | Elegir una entrada principal, conservar compatibilidad de rutas |
| ADMIN registra paciente y asigna tratamiento/profesional | Conectado; asignación dentro de `PatientEditor.tsx` | Hacer visible la secuencia de preparación y sus estados incompletos |
| Familia: hijos, Centro Familiar, Mi Camino y seguimiento | Datos autorizados y resumen compartido | Una selección de hijo estable, próxima acción clara e historial sin cifras ficticias |
| Citas: reservar, confirmar, reprogramar y cancelar | API valida tratamiento activo, fechas y cruces; no contrato de disponibilidad publicado | Rediseñar formulario sobre estas reglas; no presentar horarios libres como verificados |
| Sesiones clínicas y reporte/PDF | Persistentes; edición de reporte existente falla en UI por tres metadatos de lectura | Corregir primero; mantener los cuatro campos editables y backend estricto |
| Conversaciones familia–terapeuta | API y centro compartido conectados | Rediseñar ambos extremos juntos; no dar al ADMIN acceso a chats privados |
| Mundo ASHA, juegos y recompensas | Interacciones de prototipo; catálogo propuesto; sin API de intentos/progreso educativo | Tramo de backend propio + un juego vertical completo antes de ampliar mundos |
| Videollamada, consentimiento, evaluación automática, recuperación de contraseña, campañas y varios indicadores | No constituyen servicios completos; revisar cada ruta y contrato | Retirar accesos de la navegación principal o presentar un estado honesto, sin botones de éxito ficticio |
| Pagos, cobros y facturación | Excluidos por el profesor; maqueta heredada | Sin desarrollo nuevo; sacar del recorrido principal y no condicionar atención |

`routeCapabilities.ts` es un inventario de avisos, no prueba suficiente de que cada función
de una pantalla guarde datos. Ejemplo: `/admin/reportes` figura como conectada pero muestra
reportes administrativos ilustrativos; el reporte clínico real está en Sesiones.
Los props de `useDemoWorkflow` tampoco prueban persistencia: manda la llamada al servicio/API.

## 2. Recorrido principal que todos deben respetar

```mermaid
flowchart LR
  A[ADMIN crea cuentas y paciente] --> B[ADMIN asigna tratamiento y terapeuta]
  B --> C[Familia consulta su hijo y tratamiento]
  C --> D[Familia reserva cita futura]
  D --> E[Profesional o ADMIN confirma]
  E --> F[Profesional registra e inicia sesión]
  F --> G[Profesional cierra sesión y guarda reporte]
  G --> R[Profesional recomienda juego en próximos pasos]
  R --> H[Familia consulta reporte y recomendación]
  B --> I[Familia y terapeuta intercambian mensajes]
  H --> J[Niño juega Voz Aventura acompañado]
  J --> K[FastAPI valida reglas y guarda intento en PostgreSQL]
  K --> L[Adulto y profesional autorizado consultan seguimiento educativo]
```

El tramo juego/seguimiento requiere desarrollo; no es funcionalidad ya publicada.
La recomendación textual usa `proximos_pasos` existente. La asociación formal reporte–juego
se propone en Mundo ASHA; no existe ese campo ni endpoint en el contrato actual.
La gestión de la sesión clínica no equivale a conectar una videollamada.

| Momento | Qué ve/hace el usuario | Fuente y regla |
| --- | --- | --- |
| Alta | ADMIN crea familiar y terapeuta, y registra al niño con su representante | `/admin/cuentas/*`, `/usuarios`, `/pacientes`; decidir entrada UI principal sin duplicar cuentas |
| Preparación | ADMIN asigna nombre del tratamiento y profesional activo | `POST /tratamientos`; crea la vinculación clínica que autoriza el acceso |
| Inicio familiar | Familia selecciona su hijo y ve tratamiento, profesional y siguiente paso | Pacientes y tratamientos autorizados; no usar identidades o valores de respaldo |
| Reserva | Familia elige tratamiento, fecha, inicio/fin, modalidad y lugar | `POST /citas`; futuro, fin posterior al inicio y tratamiento ACTIVO |
| Coordinación | Profesional/ADMIN confirma; reprogramación/cancelación según permisos y estado | Cita PENDIENTE/CONFIRMADA/CANCELADA; conservar regla de bloqueo cuando existe sesión |
| Atención | Profesional/ADMIN crea sesión desde cita confirmada e inicia cuando corresponde | Sesión PROGRAMADA → EN_CURSO → FINALIZADA; no convertir una cita confirmada en asistencia |
| Cierre | Profesional registra asistencia y contenido clínico | ASISTIO exige sesión iniciada; NO_ASISTIO exige cita ya terminada y sesión programada |
| Historial | Familia ve sesiones, observaciones y recomendaciones, y puede descargar PDF | Reporte visible por permisos; estado «Sin reporte todavía» si falta |
| Comunicación | Familia y terapeuta asignado leen y envían mensajes | `/conversaciones/contactos`, `/conversaciones`, mensajes persistidos; no prometer push, adjuntos o lectura confirmada sin contrato |
| Práctica | Niño realiza una actividad con acompañamiento; adulto consulta avance educativo | API futura de intentos y evaluación; separado del resultado clínico |

No ofrecer una acción «Solicitar tratamiento» como si generara una solicitud persistente:
ese contrato no existe. Usar un canal de ayuda existente o un texto claro hasta implementarlo.

## 3. División por bloques y propiedad de archivos

Los nombres A/B/C representan personas, no ramas nuevas. Cada integrante puede conservar
su rama actual. Asignar nombres reales en el tablero antes de empezar.

| Bloque | Flujo y objetivo | Propietario y límites de edición | Entrega verificable |
| --- | --- | --- | --- |
| B0 — Base común | Correcciones, sistema de diseño, navegación, acceso y web pública | Integrador único A; `theme/`, `app/`, `pages/auth/`, `pages/public/`, primitivas, DESIGN/PRODUCT y contratos compartidos | F16-01/02/03 corregidos/verificados; sistema y tres muestras aprobados antes de rediseñar; catálogo futuro |
| B1 — Administración prepara atención | Cuentas, usuarios, pacientes, tratamientos y panel ADMIN | A; `pages/admin/` excepto `AdminCitas.tsx` y `AdminSesiones.tsx`; `UserEditor.tsx` y `PatientEditor.tsx` incluidos | Nueva cuenta → niño → tratamiento → visible para la familia y profesional correctos |
| B2 — Experiencia familiar | Centro Familiar, Mi Camino, lectura de reportes/recomendación y seguimiento educativo, perfil/hijos y ayuda | B; `pages/padre/dashboard/`, `journey/`, `reports/`, `settings/`, `PadreAyuda.tsx`; `FamilyTrackingPanel.tsx`, hooks/servicio de seguimiento | Próximos pasos visibles; asociación formal tras contrato B3/B5; cambio de hijo, PDF y errores sin cruces |
| B3 — Atención y agenda | Profesionales asignados, agenda en tres roles, sesión, expediente, reporte y recomendación | A después de B1, o C; `pages/terapeuta/` excepto mensajes; `PadreAgenda*.tsx`, `usePadreAgenda.ts`, `PadrePsicologos.tsx` y su grupo; `AdminCitas.tsx`, `AdminSesiones.tsx`; componentes clínicos | Reporte existente editable y recomendación visible en B2; seguimiento de B5 autorizado y separado de valoración clínica |
| B4 — Comunicación | Mensajería entre familia y terapeuta | B después de B2, o D: `PadreMensajes.tsx`, `TerapeutaMensajes.tsx`, `MessagesCenter.tsx`, `MessageThread.tsx`; A integra servicio/tipos compartidos | Ambos roles leen el mismo hilo autorizado; borrador protegido ante errores; navegación móvil |
| B5 — Mundo ASHA | Voz Aventura obligatoria: pájaro/troncos, controles accesibles y progreso | UI B con dos personas, C con tres o D con cuatro; Mundo ASHA, `Sessions/MundoAshaHome.tsx`, `MundoAshaProgreso.tsx`, `learningWorlds.ts`; backend A o mantenedor único designado | MA-01..04 y B3→B2→B5 aceptados; resultados por niño tras recarga/otro dispositivo, duplicados/permisos; sin almacenar audio |

Las rutas `/session/*` de videollamada demostrativa corresponden a B3 para su revisión y
retiro del recorrido clínico principal. Las pantallas de evaluación simulada se revisan en B2,
pero no se conectan como diagnóstico. El ADMIN de campañas pertenece a B1 y no al chat B4.

### Archivos compartidos que no se editan simultáneamente

- Integrador B0: `AppRouter.tsx`, `lazyPages.ts`, `routeManifest.ts`, `routeCapabilities.ts`,
  `routeTitles.ts`, `Sidebar.tsx`, `PageFrame.tsx`, `DashLayout.tsx`, `types/navigation.ts`,
  autenticación, `api/client.ts`, `package.json` y lockfile, configuración de Vite y despliegue.
- Integrador B0: `Btn`, `Inp`, `Crd`, `Bdg`, `Av`, `EmptyState`, `RemoteFeedback`,
  `MobileTopBar`, `OperationalDashboard`, `theme.css`, `tailwind.css`, `fonts.css`, `B.tsx`.
- B2: `FamilyTrackingPanel`, `useFamilyTracking`, `useFamilyPatients`,
  `useSelectedFamilyPatient`, `familyTracking.ts`. Sus consumidores piden cambios de interfaz a B2.
- B3: `BookingDialog`, `SessionActions`, `ClinicalReportEditor`, `ReportDownload`, `useAppointments`.
  `clinicalService.ts` y `types/clinical.ts` quedan bajo integrador A por ser contratos compartidos;
  B3 propone cambios y A integra. B1/B2 consumen interfaces congeladas.
- B4: centro/hilo de mensajes y consumidores; el diseño llega a ambos roles en un solo cambio.
  `messagingService.ts` y tipos de mensajes, como interfaces compartidas, los integra A
  después de la propuesta B4. No cambiar el contrato desde ambos extremos.
- Backend clínico/autenticación/BD: un mantenedor identificado. B5 puede añadir módulos
  educativos, pero routers/modelos compartidos, registro de API y migraciones se integran en serie.
- Integrador A: responsable único de contratos entre bloques, OpenAPI y tipos/servicios
  educativos futuros. Con dos/tres personas también mantiene backend; con equipo mayor
  revisa integración de un mantenedor designado. No hay propiedad dual ni cambios de payload
  por cuenta de B2/B3/B5. B2 mantiene selector de niño y consumidores solicitan cambios.
- Cada bloque conserva sus pruebas propias. Routing, documentación maestra y decisiones
  de arquitectura las integra B0 al cierre; no reformatear carpetas ajenas ni cambiar contratos por cuenta propia.

Antes de paralelizar, B0 corrige F16-01 junto al mantenedor B3: seleccionar exactamente
cuatro campos de reporte al inicializar y serializar, añadir regresión con metadatos reales
de lectura y conservar `extra=forbid`. Después se entrega la propiedad clínica a B3.

## 4. Sistema de diseño propuesto

Conservar inicialmente ASHA, Ashi, el violeta y Nunito como identidad reconocible.
La propuesta es un producto cálido y despejado: superficies claras, texto oscuro,
violeta para acciones y selección, turquesa/naranja como acentos moderados.
Confirmar dirección con una muestra representativa antes de aplicarla a todas las vistas.
No crear una estética distinta para cada integrante.

| Elemento | Regla común a validar en B0 |
| --- | --- |
| Tokens | Una fuente de verdad para colores semánticos, tipografía, espacio, radios, elevación y foco; compatibilidad temporal con `B.tsx`, sin colores sueltos nuevos |
| Jerarquía | Título claro, siguiente acción, información necesaria y detalle progresivo; una acción principal por sección |
| Tipografía | Texto de lectura 16 px como referencia; etiquetas legibles; contraste ≥4.5:1 para texto normal, ≥3:1 para texto grande |
| Componentes | Botón, campo/select, checkbox, tarjeta, etiqueta de estado, tabla/lista, pestañas, diálogo, notificación, estado vacío y carga/error/reintento |
| Formularios | Etiquetas visibles; ayuda donde hace falta; validación junto al campo; borrador intacto si falla guardar; éxito solo tras confirmación del servidor |
| Diálogos | Nombre accesible, foco contenido y restaurado al cerrar, Escape y teclado, scroll móvil y botones alcanzables |
| Navegación | Cinco destinos principales como objetivo; perfil/ayuda secundarios; ruta activa visible; alias existentes conservados |
| Móvil | Sin scroll horizontal general; listas adaptadas; acciones con objetivo táctil interno de 44×44 px; teclado virtual no tapa confirmación |
| Infancia | Ilustración y juego en el contexto infantil, instrucciones cortas, una tarea por paso, audio opcional y alternativa textual, pausa/reintento sin castigo |
| Adultos | Densidad moderada, fechas y estados claros, historial ordenado; evitar tarjetas decorativas repetidas y números sin utilidad |
| Movimiento | Breve y con propósito; respetar reducción de movimiento; no confeti, sonidos o animaciones continuas en la gestión clínica |

B0 dispone de `PRODUCT.md` y `DESIGN.md` propuestos en V28; publicación documental
no significa diseño aprobado. Después de validarlos prepara catálogo ejecutable fuera
de navegación de producción y tres muestras representativas.
La edad, capacidades de lectura y actividades infantiles se validan con equipo/profesional;
no elegir una experiencia idéntica para todos los niños por conveniencia técnica.

Propuesta de navegación:
- Familia: Centro Familiar, Mi Camino, Agenda, Mensajes y Mundo ASHA; reportes dentro
  de Mi Camino y con enlace directo desde sesión; perfil y ayuda secundarios.
- Terapeuta: Panel, Agenda, Pacientes, Reportes y Mensajes; configuración secundaria.
- ADMIN: Panel, Cuentas, Pacientes, Citas y Sesiones; reportes clínicos desde sesión;
  conservar solo analíticas realmente calculadas y esconder maquetas del menú principal.

## 5. Limpieza de textos, maquetas y datos de auditoría

No realizar búsqueda/reemplazo ciega de «pendiente»: una cita pendiente es un estado útil.

| Texto/contenido actual | Tratamiento propuesto |
| --- | --- |
| «FastAPI + PostgreSQL», Argon2id, detalles de servidor/JWT y arquitectura | Retirar de pantallas de producto y conservar en documentación técnica; no cambiar autenticación para ajustar un rótulo |
| «America/Lima (UTC−05:00). El servidor valida los cruces…» | «Horarios de Perú»; conservar conversión y validación en backend. Ante cruce: «Este horario ya está ocupado. Elige otro.» |
| «Administración debe asignar un tratamiento antes de reservar.» | «Tu hijo aún no tiene un tratamiento activo. Contacta con el equipo para coordinar su atención.»; bloqueo correcto y ayuda real, sin botón de solicitud ficticia |
| «Falta validar», «prototipo», versiones demo y avisos repetidos de preparación | Mover pendientes al tablero/documentación; conectar el flujo o retirar su acceso principal. Si la demo se conserva, identificarla una vez de forma discreta y honesta |
| Consentimiento, resultado orientativo y permisos necesarios | Mantener información útil con lenguaje simple; no hacer pasar una evaluación simulada por diagnóstico ni eliminar consentimiento necesario |
| Métricas, testimonios, pacientes, puntuaciones e historial ilustrativos | Sustituir por datos autorizados o estados vacíos; no quitar «demo» dejando datos falsos como reales |
| Registros AUDITORIA en Supabase | Conservar identificadores y evidencia; no borrar físicamente ni renombrar pacientes para aparentar que son reales. Usar una BD de pruebas separada y acordar exclusión de métricas/listados productivos en backend |
| Variables `ASHAKIDS_AUDIT_*` | Fuera del `.env` mínimo de ejecución del equipo/hosting. Mantener credenciales de pruebas en configuración local separada cuando se necesiten, nunca en frontend ni Git |

No esconder problemas operativos reales: conservar errores de red, sesión expirada, reserva
ocupada y ausencia de tratamiento, pero expresar qué pasó y qué puede hacer la persona.
Que ADMIN gestione cuentas no le concede acceso a conversaciones privadas.

## 6. Datos representativos y prueba de interacción entre roles

Separar dos usos. QA usa familias sintéticas nuevas en BD de desarrollo, con identificadores
inequívocos y sin copiar expedientes reales. Un piloto con personas reales usa sus cuentas
y datos introducidos por el equipo responsable; las operaciones clínicas las realiza quien
corresponde. Este plan no ejecuta escrituras ni autoriza borrar o alterar datos preexistentes.

Preparar estos estados, no una única familia perfecta:
1. Familia nueva sin niño: registro guiado o indicación del proceso de alta existente.
2. Niño registrado sin tratamiento: siguiente paso claro y reserva bloqueada correctamente.
3. Niño con tratamiento activo/profesional y sin citas: reserva disponible.
4. Niño con próxima cita pendiente, confirmada y cancelada: etiquetas coherentes.
5. Niño con sesión finalizada y reporte completo: historial y PDF verdaderos.
6. Niño con sesión finalizada sin reporte: ausencia explícita y acción profesional correcta.
7. Familia con dos hijos y profesionales diferentes: selección consistente, sin cruces.
8. Terapeuta sin asignados y otro con varios: vacíos, búsqueda y contexto de atención.
9. Conversación sin mensajes y conversación larga: carga paginada, borrador y envío.
10. Cuenta/sesión sin permiso o expirada: retorno seguro al acceso, sin información ajena.
11. Juego con cero intentos, intento completo, reintento y reanudación: después de conectar B5.

Para obtener historial nuevo, realizar citas/sesiones reales de prueba en la secuencia
permitida y con sus fechas verdaderas. El contrato exige citas futuras: no insertar citas
pasadas mediante SQL ni fabricar «historial clínico previo». El historial de un usuario real
procede de sus registros existentes autorizados, sin copiarlos a fixtures/documentos.
El origen sintético de QA se conserva aunque la presentación ya no tenga banners técnicos.

## 7. Extensión educativa: alcance separado y concreto

Seguir [MUNDO_ASHA_PLAN.md](MUNDO_ASHA_PLAN.md), que conserva catálogo y decisiones pendientes.
Primera entrega obligatoria: Voz Aventura con pájaro/troncos, máximo propuesto 45 s,
sonido para subir/silencio para bajar, toque/teclado y resultados por niño. No esperar a
elegir otro juego ni a completar cuatro mundos. Revisar reglas/comodidad con profesional;
no afirmar pronunciación correcta por volumen o supervivencia.

1. Acordar actividad, público, instrucciones, ayudas y criterio observable de finalización.
2. Inventariar tablas existentes de actividades/intentos/logros y reutilizar lo adecuado;
   acordar contrato antes de añadir esquema. Sin duplicar tablas ni SQL al arrancar.
3. Definir API propuesta (no publicada): iniciar intento, guardar respuestas/finalizar y
   consultar progreso por niño; autorización por familia/profesional y versión del contenido.
4. Servidor reproduce controles con seed/config propios, valida reglas, idempotencia
   y permisos; nunca confiar en
   `passed`, puntos o `verifiedBy` enviados por React. Escrituras transaccionales.
5. UI completa: explicación → actividad → resultado confirmado → próximo nivel/reintento.
6. Probar recarga, cambio de dispositivo/usuario, envíos duplicados, error de red y niño ajeno.
7. Mostrar niveles completados/intentos como avance educativo; no traducirlos a porcentaje
   de mejoría clínica. La pronunciación requiere criterio profesional, no volumen de micrófono.

Cualquier migración se ensaya en BD descartable, se revisa con el responsable del backend
y tiene procedimiento de recuperación antes de aplicar a la base compartida. El catálogo
restante espera a que este recorrido funcione; los informes conservan evidencia por corte.

## 8. Orden y trabajo paralelo

| Etapa | Trabajo simultáneo permitido | Condición para continuar |
| --- | --- | --- |
| E0 — Contrato del equipo | Integrador inventaría; A/B revisan sus flujos y datos de QA | Personas asignadas, propiedad de archivos, rutas y alcance confirmado |
| E1 — Base y correcciones | Integrador/B3 arreglan reporte y login; otros preparan bocetos de sus bloques | Regresión de reporte correcta; sistema común y muestras familia/reserva/profesional aprobados e integrados |
| E2 — Primera ronda | Con dos personas: A en B1 y B en B2. Con más: C en B3 y D en B4, todos sobre la base E1 | Altas/asignaciones, lectura familiar y contratos compatibles |
| E3 — Segunda ronda | Con dos: A en B3 y B en B4. Con más: B1/B2 revisan integración y C/D preparan B5 tras contrato educativo | Circuito administrativo–familia–terapeuta funciona de extremo a extremo |
| E4 — Progreso educativo | Backend B5 + UI B5 con contrato acordado; resto verifica/reduce deuda de copy | Juego, pausa/reanudación en ciclo activo e historial confirmado recuperable, sin resultados inventados |
| E5 — Cierre y publicación | Merges en serie, regresión conjunta, revisión desktop/móvil y despliegue controlado | Aceptación real en `dev`; SHA desplegado registrado; pendientes explícitos |

Web pública/acceso en B0 puede pulirse entre rondas por el integrador, después de congelar
las primitivas. Si solo hay dos personas, no abrir seis ramas de diseño simultáneas.
No se exige rehacer un módulo terminado para esperar a los juegos: entregar avances
coherentes y revisables; no presentar una extensión diferida como completa.

### Rondas concretas y dependencias

| Equipo | Ronda 0/1 | Ronda 2 | Ronda 3 | Cierre |
| --- | --- | --- | --- | --- |
| Dos personas | A B0/correcciones/contratos; B revisa B2/contenido sin editar comunes | A B1; B B2 | A B3; B B4; A especifica backend B5 con B | A backend B5; B UI B5; revisión cruzada |
| Tres personas | A B0/contratos; B prepara B2; C revisa B3 | A B1; B B2; C B3 | B B4; C UI B5; A backend B5 tras MA-02 | A integra; B/C aceptan ambos roles/segundo dispositivo |
| Cuatro o más | A B0/contratos; B/C/D preparan B2/B3/B4 | A B1; B B2; C B3; D B4 | Mantenedor único backend B5; D UI B5; B/C enlace recomendación/seguimiento | A integra; resto verifica sin competir por archivos |

A/B/C/D son plazas, nombres reales pendientes; no se crearon ramas ni se despacharon
personas/agentes en este corte. A es integrador y mantenedor backend con dos/tres personas;
con equipo mayor identificar mantenedor backend y carpetas antes de empezar, sin ampliar
propiedad de contratos. Commits en ramas personales; revisión e integración a dev en serie.

**Puerta B3→B2→B5:** B3 entrega reporte guardado/recomendación textual y B2 confirma
lectura autorizada. Para asociación formal, A congela contrato/modelo/permisos MA-02;
B3 crea/revoca recomendación, B2 lee, B5 consume y guarda progreso. Backend compatible
se integra antes de consumidores; no mostrar asignación formal antes de recibirla por API.
MA-03/04 permiten UI/backend paralelos después del contrato y cierran una entrega vertical.

## 9. Git, integración y despliegue

1. Antes de cada bloque, comprobar rama y cambios locales; `git fetch origin`, integrar
   `origin/dev` en la rama propia sin descartar trabajo. No trabajar directamente en `dev`.
2. Cada responsable registra cambios funcionales y visuales coherentes en su rama.
   Se permite commit intermedio: esperar al último día para guardar trabajo no mejora el diseño.
3. La propuesta/PR declara bloque, archivos, contratos consumidos, capturas reales y casos
   verificados. Pedir al integrador cambios de rutas/primitivas en vez de editarlas todos.
4. Antes de integrar, actualizar contra `dev`, resolver conflictos preservando ambos cambios
   y repetir comprobaciones pertinentes. No usar force-push ni merges simultáneos.
5. Un integrador revisa y mezcla un PR a la vez; el siguiente vuelve a sincronizar su rama.
   Los merges conservan historial y SHA publicados. Continuar la secuencia `VNN_Accion_Modulos`
   consultando `git log`, con descripción concreta; no asignar V28 a dos personas de antemano.
6. Commit en la rama propia → integración/push a `dev` → sincronización de ramas personales.
   «Commit a dev» significa este cierre revisado, no saltarse la rama y la revisión.
7. Un responsable de Render publica el SHA aprobado desde `dev`. La configuración registrada
   tiene Auto Deploy Off: usar despliegue manual tras aceptación, no prometer actualización
   por cada commit. Si alguien cambió la opción en el panel, verificarla antes de publicar.
8. Comprobar login, rutas SPA, reservas, reportes/PDF y mensajes en HTTPS; anotar SHA/URL
   y estado. Una reversión de imagen no revierte una migración: recuperación de BD aparte.

Los primeros cierres documentales no necesitan despliegue. No renombrar versiones históricas
ni mezclar el número de commit VNN con la versión de la API.

## 10. Criterio de terminado para cada bloque

- Flujo principal y estados vacío/carga/error/sin permiso comprobados con la API correcta;
  ningún botón afirma guardar si solo modifica estado local. Recargar conserva lo persistente.
- UI utiliza componentes/tokens comunes, copia útil, una próxima acción clara y selección
  del niño consistente. Sin etiquetas de arquitectura ni cifras clínicas/educativas ficticias.
- Escritorio y móvil reales revisados; teclado, foco, nombres accesibles, contraste y diálogos
  comprobados. Una compilación exitosa no equivale a aceptación visual de todas las pantallas.
- Reporte existente puede editarse después de una recarga; un 422/409/503 conserva borrador
  cuando corresponde. No enviar metadatos de lectura ni relajar el backend.
- Permisos comprobados entre dos familias/terapeutas y ADMIN; no exponer chats privados.
- `npm run typecheck`, `npm run check:frontend`, `npm test` y `npm run build`; pruebas
  pertinentes del backend si se modifica. Integración destructiva solo en PostgreSQL descartable;
  nunca ejecutar pytest general de escritura contra Supabase compartido.
- Evidencia sanitizada: casos/resultado/entorno/SHA, capturas antes/después y limitaciones.
  Una auditoría nueva usa su fuente, Word solicitado y PDF según `docs/audits/README.md`.
- Diff revisado, secretos fuera de Git, commit descriptivo, publicación real y sincronización
  comprobada; registrar fallo de CI/permisos si ocurre y no declarar un push que no pasó.

Para la aceptación global, dos integrantes diferentes recorren ambos extremos de alta,
reserva, mensaje y reporte. Usar como metas de UX: identificar próxima cita y profesional
sin ayuda; reservar sin consultar documentación técnica; encontrar el último reporte desde
Mi Camino; distinguir claramente estado clínico y progreso educativo. Registrar los problemas
observados; no asignar una nota de usabilidad sin una evaluación efectiva.

## 11. Documentación que acompaña al desarrollo

- Este plan y la matriz: mapa inicial por fuentes y responsabilidades; revisar tras mover rutas.
- `PRODUCT.md`/`DESIGN.md`: propuesta V28 para validar; sistema común aprobado después en E1.
- Brief por bloque: tarea principal, estados, contratos, archivos, componentes reutilizados,
  casos de aceptación y decisiones pendientes. Cada dueño mantiene solo su brief.
- `docs/IMPLEMENTATION_PROGRESS.md`: relevo con rama/SHA, comandos/resultados, fallos y siguiente acción.
- `docs/PROJECT_CONTEXT.md`: entrada vigente del equipo. `architecture.md` y ADR solo cuando
  cambie una decisión técnica, por ejemplo persistencia educativa; no inventar decisiones pasadas.

## Siguiente acción concreta

Validar DESIGN/PRODUCT, reparto y mínimo Voz Aventura (reglas/contratos propuestos).
Primera tarea de código posterior: `ClinicalReportEditor.tsx` y `clinicalService.ts` seleccionan
solo cuatro campos; regresión con `ReporteSalida` completo, sin relajar `extra=forbid`.
Corregir F16-02/03 en acceso/primitivas y verificar teclado/contraste. Después preparar
muestras Centro Familiar/reserva/expediente para validar, integrar B0 y abrir rondas.
MA-02 requiere revisión antes de migrar.
La petición de planificación no declara ejecutada la limpieza de UI/variables/BD ni el rediseño.
