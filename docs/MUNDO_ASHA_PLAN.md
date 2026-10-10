# Mundo ASHA - Etapa propia de juegos por habilidades y niveles

Petición del usuario: 2026-10-09. Es una etapa extensa, independiente de las fases del núcleo.
No renumerar las fases existentes ni dar por terminados los juegos por mostrar el catálogo.
Este documento es la entrada progresiva del módulo; el contexto maestro enlaza aquí.

## Prioridad vigente — primer juego obligatorio, corte documental V28

Base de lectura: V27 `f9df2bc30d56b643af6dd88ab90f6ffdfdbf0fa7`, `piero-dev`.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Esta especificación está propuesta para validación; no implementa juego, API ni migraciones.
Mundo ASHA forma parte del alcance obligatorio. Su primera entrega es **Voz Aventura**:
un pájaro sube al hablar y baja al guardar silencio, atravesando huecos entre troncos
cuya altura cambia. No esperar a completar los cuatro mundos/24 niveles del borrador.
La detección de sonido controla el vuelo; no demuestra pronunciación correcta ni mejoría clínica.

### Base reutilizable contrastada en código

| Fuente | Conservar/adaptar | Trabajo pendiente |
| --- | --- | --- |
| `frontend/src/pages/padre/MundoAsha/useVozAventuraGame.ts` | Canvas, estados, analizador Web Audio, suavizado, calibración y entradas alternativas | Récord inicial 28, intento inicial 2; lógica por frame y alturas poco variables; colisión tolerante con `safe`; timers y permisos tardíos deben cancelarse; detener stream al cambiar modo/pausar/salir |
| `VozAventuraGameVozAventura.tsx` en el mismo directorio | Instrucciones, permiso, calibración/ruido y modo alternativo | Quitar «Mateo», métricas prefijadas; accesibilidad de controles; resultado del servidor |
| `voiceConfig.ts` | Centralización de geometría/física | Versión determinista por dificultad; convertir frame a tiempo; revisar geometría de huecos |
| `useSelectedFamilyPatient.ts` | ID de hijo validado contra lista autorizada | Llevar ID al inicio/lectura del juego; invalidar datos al cambiar identidad; sessionStorage solo preferencia de selección |
| `learningWorlds.ts` | Catálogo borrador y cálculo puro de entradas verificadas | No conectarlo como si fuera API ni llamar «verificación clínica» al replay del vuelo |

El dibujo actual es una mariposa y los obstáculos son tubos verdes. El pájaro y los troncos
son adaptaciones futuras. La lectura de código no verifica hardware, permisos o jugabilidad.
`requestAnimationFrame` no asegura física igual en 30/60/120 Hz; el servidor necesitará
las mismas reglas temporales que el cliente. Revisar tests de simulación antes de reutilizarla.

### Reglas propuestas del mínimo (versión `voz-aventura-1`, por validar)

- Una partida dura como máximo **45 segundos activos**; cuenta atrás de 3 segundos fuera
  del tiempo. La preparación no consume intento. Práctica de controles sin puntuación antes de empezar.
- Primera dificultad «Inicial», sin aceleración progresiva. Perfil opcional «Estándar» después
  de aceptar Inicial; no bloqueo clínico ni obligación de terminar otra habilidad.
- Simulación a paso fijo de 1/60 s, independiente del frame de dibujo. Configuración
  versionada con gravedad, impulso, velocidad máxima, hitbox, límites y semilla de obstáculos;
  sus valores físicos finales se acuerdan tras una prueba de comodidad, antes de congelar versión.
- Geometría propuesta: zona jugable entre techo y suelo; hueco Inicial 46% de esa altura,
  Estándar 40%; troncos de ancho 9% del lienzo. Centros dentro de la zona con margen 12%
  arriba/abajo, variación máxima entre centros consecutivos 15% de altura jugable.
  Semilla emitida por servidor determina alturas; evitar obstáculos idénticos por una fórmula mal acotada.
- Inicial: avance horizontal 18% del ancho por segundo, par nuevo cada 3 s; Estándar:
  22% por segundo, cada 2.5 s. Móvil escala dibujo y coordenadas lógicas; no cambia dificultad.
- Pájaro con hitbox circular; colisión círculo–rectángulo contra cada tronco termina el intento
  al primer contacto. Techo/suelo limitan el movimiento sin causar daño, explicado antes de jugar.
  Quitar la invulnerabilidad accidental al haber entrado una vez en el hueco.
- Obstáculo superado: el borde posterior del par pasa completamente detrás de la hitbox
  sin colisión; se cuenta una sola vez por ID de obstáculo. Tiempo y cantidad se derivan del replay.
- Finalización: 45 s sin colisión → recorrido completado; colisión → recorrido terminado;
  salida → abandonado; vencimiento → expirado. Ninguno implica éxito de pronunciación.
  Reintentar crea nuevo intento; no borrar el anterior ni inventar número de intentos.
- Mostrar duración activa, dificultad, modo, obstáculos superados y estado de guardado.
  Mejor marca solo de intentos confirmados del mismo niño/versión/dificultad/modo; sin historial
  mostrar «Todavía no hay partidas guardadas». No mezclar toque y micrófono en rankings.

### Preparación, controles y estados

Adulto confirma el niño y ve explicación breve de privacidad. Pedir micrófono solo tras
acción explícita y contexto HTTPS/localhost compatible. No usar MediaRecorder, subir audio,
guardar muestras ni reproducir la voz. Procesar energía sonora localmente, descartar buffers;
texto «El sonido mueve el pájaro; no evaluamos cómo pronuncias».

Propuesta: 2 s de silencio para ruido base y 2 s hablando cómodamente para comprobar
separación; umbral adaptado al ruido, suavizado e histéresis. Si no hay separación suficiente,
ofrecer lugar tranquilo, recalibración o controles alternativos. Nunca pedir subir mucho el volumen,
gritar o repetir un fonema como si se reconociera. Decir «Sonido detectado», no «Palabra correcta».

Denegación, dispositivo ausente, API no compatible o micrófono desconectado tienen mensajes
distintos cuando el navegador permite distinguirlos. No insistir con prompts automáticos.
Toque sostenido o Espacio/Flecha arriba sube; soltar baja; pointercancel, blur y keyup limpian
el control. Teclado solo con foco en juego; botones DOM fuera del canvas, pausa/salida accesibles.
Cambio de modo durante preparación cancela solicitud/timers y cierra el stream tardío.

Pausa manual, pestaña oculta o pérdida de foco congelan física y tiempo activo y liberan
micrófono. Reanudar requiere gesto y preparación del micrófono si corresponde; permitir
cambiar a alternativa como nuevo intento para conservar modo comparable. Límite propuesto
de pausa acumulada 5 min y caducidad de intento 15 min desde inicio servidor.
Salida explícita/unmount detiene tracks, AudioContext, RAF y todos los timers.
No reanudar automáticamente una partida activa tras recarga: recuperar estado del servidor
y ofrecer cerrar/reintentar; partidas finalizadas sí deben recuperarse en otro dispositivo.

Estados: preparación → permiso/calibración o alternativa → listo → inicio API → cuenta
atrás → jugando ↔ pausa → final → guardando → guardado/error. Un fallo al iniciar no consume
un intento confirmado. Sin red al finalizar, mantener resultado provisional y permitir
reenviar mismo intento/idempotencia; nunca presentarlo como persistido. Una recarga puede
perder el borrador local no enviado: explicarlo, recuperar lo confirmado y no fabricar historial.

### Conexión B3 → B2 → B5: recomendaciones

**Contrato actual:** `ReporteDatos` tiene exactamente cuatro campos editables, incluido
`proximos_pasos`; `ReporteSalida` añade `id_reporte_sesion`, `id_sesion`, `fecha_creacion`.
`PUT /sesiones/{id}/reporte` no admite esos metadatos de lectura. Corregir F16-01 primero.
B3 redacta recomendación textual en próximos pasos; B2 muestra texto guardado con fecha y
profesional desde reporte autorizado. No analizar texto libre para inferir una prescripción
o crear asignaciones automáticas. Enlace genérico a Mundo ASHA puede acompañar al texto,
pero no afirma que un juego esté formalmente asignado.

**Contrato formal propuesto, no existente:** recomendar Voz Aventura identificando paciente,
tratamiento, reporte de origen, juego/version, dificultad sugerida, instrucciones, autor,
fecha y estado. Profesional de la sesión/tratamiento activo crea/revoca; familia lee;
autoría proviene de identidad servidor. Paciente/reporte/tratamiento deben pertenecer al mismo
recorrido. B3 edita recomendación, B2 la consulta, B5 inicia intento con referencia opcional.
Guardar reporte textual y recomendación formal serían operaciones distintas con estados
claros: fallo de asignación no significa que el reporte no se guardó. No conceder al PADRE
capacidad de escribir una recomendación profesional ni agregar un quinto campo al reporte sin contrato.

Definir antes de migrar qué pasa al editar reporte, retirar recomendación, desactivar tratamiento
o cambiar profesional: propuesta, conservar referencia histórica y exigir asignación vigente
para acceso profesional al seguimiento; familia mantiene su propio historial autorizado.
Retirar recomendación no elimina intentos. ADMIN puede preparar relaciones; acceso educativo
administrativo se decide explícitamente, sin concederlo por defecto ni ampliar acceso a chats.

### Modelo lógico y contrato HTTP propuestos — no publicados

Lectura estática de `backend/scripts/db_creation.sql`: `actividades` ya se asocia a paciente;
`objetivos` y `mundos` dependen de actividad; `niveles` de mundo; `resultados_nivel` contiene
paciente/nivel/numero_intento/puntaje/estrellas/detalle JSONB/fecha. No hay modelos/routers
educativos equivalentes publicados. `perfiles`/`logros` no prueban progreso del juego.
No consultar filas reales ni asumir que el esquema vivo es idéntico por leer ese SQL.

| Necesidad | Reutilización candidata y hueco a revisar en MA-02 |
| --- | --- |
| Recomendación por niño | `actividades` candidata; faltan relación al reporte/tratamiento, autor, juego/version y estado formal |
| Configuración de juego | Versionar perfil/semilla/reglas; `mundos` pertenece a actividad, no asumir catálogo global. Decidir catálogo de código y referencia estable antes de nuevas tablas |
| Ciclo del intento | Registro con paciente, creador, nivel/juego/version, seed, modo, dificultad, estado, timestamps servidor, idempotencia/revisión; candidato nuevo solo si `resultados_nivel` no soporta el ciclo sin ambigüedad |
| Resultado | `resultados_nivel` candidato; resultado derivado, referencia única al intento y versión de evaluación. No atribuir `verifiedBy` clínico |
| Seguimiento | Agregado de intentos confirmados; no reutilizar `perfiles.progreso` como porcentaje clínico ni persistir contadores duplicados sin necesidad |

Propuesta de rutas bajo `/api/v1` (nombres definitivos y OpenAPI a acordar por mantenedor):

| Operación futura | Entrada/resultado mínimo |
| --- | --- |
| `GET /pacientes/{id}/recomendaciones-juego` | Lista paginada autorizada con fuente reporte/autor/fecha/estado; separar vacía de fallo |
| `POST /sesiones/{id}/recomendaciones-juego` | Juego/version/dificultad/instrucciones; servidor deriva paciente, autor y tratamiento de sesión; clave idempotente |
| `PATCH /recomendaciones-juego/{id}` | Cambios permitidos/revocación y revisión esperada; conservar trazabilidad |
| `POST /pacientes/{id}/intentos-juego` | Juego/version/modo/dificultad/recomendación opcional y clave idempotente; devuelve ID, seed/configuración, versión de reglas y caducidad |
| `POST /intentos-juego/{id}/finalizacion` | Secuencia de transiciones subir/bajar por tick, pausas y motivo de salida; devuelve resultado calculado y estado confirmado |
| `GET /pacientes/{id}/intentos-juego` | Historial paginado por cursor y filtros de juego/version/modo; IDs/fechas/estado/resultados autorizados |
| `GET /pacientes/{id}/progreso-juego` | Agregados por juego/version/dificultad/modo, recomendaciones relacionadas, datos confirmados |

Nada de `puntaje`, `passed`, `verifiedBy`, autor o paciente reemplazable en finalización.
Lista de eventos con orden, ticks dentro de 2700 pasos activos, cantidad/tamaño limitados
(propuesta 1200 transiciones, cuerpo ≤64 KiB), tipos enumerados, sin floats NaN/infinito.
Servidor reproduce física/obstáculos/colisión con seed/config propios, deriva duración y
obstáculos, coteja elapsed/caducidad con timestamps propios y rechaza final imposible o
conflicto de payload. Tolerancia de red y pausas se congela en contrato antes de implementar.
Un replay consistente valida las reglas del juego; **no puede probar que un humano habló**:
el navegador puede inventar entradas válidas. Rotular «resultado de juego validado por reglas»,
sin certificación clínica ni recompensas de valor real.

Misma clave/mismo cuerpo retorna mismo resultado sin nuevo intento; distinta finalización
de intento terminal devuelve 409. Identidad y recurso se autorizan en cada operación;
rechazar niño ajeno, recomendación ajena o de otro tratamiento, sesión vencida y escritura
de terapeuta/PADRE fuera de su función. Respuestas propuestas 401/403 o 404 según política
de ocultación vigente, 409 conflicto, 422 contrato, 503 indisponibilidad; acordar exactas en OpenAPI.

Integridad candidata: FK de tipo compatible con IDs existentes, UNIQUE de idempotencia
por actor/operación y de resultado por intento, CHECK de tiempos/contadores/estados, índices
para paciente+fecha/cursor y FK consultadas, timestamps conscientes de zona; JSONB solo
para telemetría acotada y detalle, no sustituye relaciones. Locks/transacción al finalizar
evitan duplicado concurrente y numeración de intentos; servidor asigna `numero_intento`.
Revisar permisos mínimos del rol runtime/RLS con el mantenedor y no dar acceso Data API
al frontend. Ensayar migración explícita y recuperación en BD descartable con datos sintéticos;
no DDL al arranque, no reset del esquema ni borrado de registros previos.
Retención propuesta: guardar resultados y mínima trazabilidad; plazo de eventos aún por
decidir con responsable de datos antes de piloto. Ningún audio se recoge en este modelo.

### Aceptación obligatoria de la primera entrega

1. ADMIN prepara → familia reserva → profesional atiende/reporte/recomendación → familia
   consulta → niño juega → adulto/profesional autorizado consulta resultado confirmado.
2. Dos niños, incluidos homónimos, y dos familias sin cruces; profesional asignado/ajeno,
   revocación y cambio de sesión/usuario. ID manipulado nunca amplía acceso.
3. Micrófono concedido/denegado/ausente, ruido y calibración repetida; voz cómoda mueve
   vuelo, silencio baja; alternativa táctil/teclado completa el mismo recorrido, sin audio almacenado.
4. Pausa, blur, pestaña oculta, salida, permiso tardío y reintento liberan recursos; no RAF,
   timers o micrófono activos fuera del ciclo autorizado. Móvil/teclado/reducción de movimiento.
5. Alturas variables y colisiones reproducibles a 30/60/120 Hz de dibujo; techo/suelo,
   borde de tronco, cuenta una vez, máximo 45 s y fin/abandono diferenciados.
6. Recarga, relogueo y segundo dispositivo recuperan recomendación/historial/avance
   confirmado desde API/SQL; fallo de red no fabrica éxito ni historial vacío.
7. Reenvío idéntico y dos finalizaciones concurrentes no duplican; eventos fuera de rango,
   seed/version ajena y puntuación inventada son rechazados o ignorados conforme al contrato.
8. Verificación sintética de persistencia y permisos en BD descartable, evidencia sanitizada,
   commit/PR y aceptación de equipo; ninguna cifra educativa se presenta como resultado clínico.

## Objetivo confirmado

Juegos funcionales orientados al trabajo de habilidades de lenguaje, organizados por mundos.
Cada mundo aborda una habilidad u objetivo específico, tiene varios niveles y puede tener
dificultad diferente. Ejemplos aportados por el usuario: fonología y pronunciación de la R.
Antes de implementar todo el contenido, revisarlo con detenimiento con usuario/equipo.
El catálogo no asigna un trastorno, no diagnostica ni promete resultados terapéuticos.

## Corte actual - base de navegación y cálculo, no juegos terminados

- Catálogo borrador draft-1 en frontend/src/services/learningWorlds.ts. 4 mundos, 24 niveles
  propuestos en total. Cantidades, nombres y objetivos pueden cambiar tras revisión.
- Pantalla familiar selecciona hijos autorizados por ID y conserva la selección al navegar.
  El ID almacenado en sessionStorage no es prueba de autorización ni almacena resultados.
- Progreso desconocido se presenta como sin seguimiento conectado. Se eliminaron las 47
  estrellas, nivel 3, racha 7, asignaciones y porcentajes fijos de portada/perfil/retos/academia.
- deriveWorldProgress calcula niveles secuenciales con intentos ya validados: niño/mundo/
  versión, duplicados sin inflación, conflicto de ID descartado y requisitos previos.
  null significa sin conexión; [] significa historial verificado vacío. Nunca intercambiarlos.
- La función se prueba con entradas sintéticas; todavía no recibe intentos reales de una API.
  No hay escritura educativa ni continuidad entre dispositivos. Los prototipos existentes no
  alimentan esta función ni conceden desbloqueos, insignias o mejoría clínica.

| Mundo propuesto | Habilidad | Dificultad prevista | Niveles borrador | Validación del borrador |
| --- | --- | --- | --- | --- |
| Bosque de los sonidos | Conciencia fonológica | Inicial | 6 | Respuestas objetivas, criterio por definir |
| Aventura de la R | Producción de sonidos róticos | Práctica guiada | 8 | Revisión profesional |
| Valle de las palabras | Vocabulario/relaciones de significado | Intermedio | 5 | Respuestas objetivas, criterio por definir |
| Isla de las historias | Comprensión/expresión narrativa | Integración | 5 | Revisión profesional |

Las etiquetas son una propuesta de producto, no un protocolo clínico validado. Revisión:
separar /r/ y /rr/, variantes de español, edades y apoyos; acordar las actividades de cada
nivel y cómo evaluar su objetivo. La dificultad del mundo no determina el diagnóstico del niño.
No obligar a dominar otro mundo para acceder a uno que el profesional considere apropiado.

## Arquitectura prevista y contratos por acordar

Conservar React -> HTTP/JSON -> FastAPI -> SQLAlchemy/PostgreSQL. El backend autoriza al
representante/profesional, valida resultados y decide desbloqueos; el frontend los representa.
No confiar en un campo passed/verifiedBy enviado por la familia ni en almacenamiento local.
VerifiedLearningAttempt es un contrato de lectura previsto, no un endpoint publicado.

Inventariar primero las tablas existentes de actividades, perfiles, intentos y logros; acordar
qué se reutiliza y las migraciones explícitas antes de cambiar la BD. No añadir SQL al arranque.
Entidades necesarias por contrastar: catálogo/versiones, mundo, nivel, asignación por niño,
intento, resultado validado y progreso derivado. No crear tablas duplicadas por adelantado.

Reglas por decidir/implementar:
- Cada intento tiene ID/idempotencia, niño, nivel, versión de contenido, fechas, respuestas,
  apoyos usados y evaluación. El servidor devuelve resultado confirmado o pendiente de revisión.
- Reenvío de la misma finalización no duplica estrellas/recompensas. La transacción mantiene
  intento/progreso/recompensa consistentes. Dos dispositivos no saltan requisitos previos.
- El cálculo actual conserva dominio de niveles anteriores; fallar un reintento no lo revoca.
  Conflictos de un mismo ID no suman. Decidir con el equipo cambios de versión y reevaluación.
- No validar pronunciación por volumen del micrófono, temporizador, botón de continuar o
  síntesis de voz. Definir revisión profesional o un método validado antes de automatizarla.
- Progreso educativo (niveles/intentos) y evaluación clínica (reporte del profesional) se
  presentan por separado. Las métricas y el contenido clínico no se inventan.
- Alternativa sin micrófono, permisos denegados, pausa, reintento y ayudas accesibles.
  Datos mínimos y retención por acordar; el primer juego no almacena grabaciones ni audio.

## Ruta de implementación específica

| Paso | Trabajo | Criterio de salida |
| --- | --- | --- |
| MA-01 | Validar mínimo Voz Aventura, reglas, edades/apoyos y relación al reporte; mundos posteriores siguen borrador | Pájaro/troncos, duración, controles, colisión y criterio educativo acordados, sin evaluación de pronunciación |
| MA-02 | Contrato B3→B2→B5, modelo lógico, permisos y estrategia de migración | OpenAPI propuesta y esquema revisados; ensayo/recuperación en BD descartable después de validación |
| MA-03 | Adaptar prototipo del pájaro completo sobre contrato congelado | Preparación, permisos/ruido, juego, pausa/salida/reintento, teclado/toque y final funcionan |
| MA-04 | Persistir y recuperar primer juego, replay e idempotencia | API/PostgreSQL, dos niños/dispositivos, permisos, red y duplicados aceptados; sin localStorage definitivo |
| MA-05 | Completar progresión del primer mundo | Todos sus niveles funcionales, dificultad revisada, ayuda y repetición sin duplicar premios |
| MA-06 | Ampliar mundos y producción oral | Cada objetivo tiene contenido revisado y validación acordada; sin falsos reconocimientos de fonemas |
| MA-07 | Aceptación integral del módulo | Niños distintos, permisos, errores/red, reanudación y resultados persistentes; auditoría PDF y relevo |

## Inventario heredado por revisar

Cuentos, canciones, adivinanzas, trabalenguas, laberinto y Voz Aventura tienen interacciones
de demostración. No se afirma que todas estén probadas o listas para terapia. Revisar cada
prototipo antes de reutilizarlo. Academia/retos/insignias/perfil ahora explican el seguimiento
pendiente en lugar de presentar cifras fijas. No hay un juego nuevo completo en este corte.

## Continuación

Estado: base histórica del corte04; MA-01/02 especificados en V28, pendientes de validación
e implementación. Primero corregir reportes y accesibilidad del núcleo; siguiente acción
educativa: validar reglas de Voz Aventura y contrato de recomendación con profesional/equipo.
Los 24 niveles siguen borrador posterior; no bloquean el primer juego obligatorio.
Hosting del núcleo ya registrado en V24; juego y contratos nuevos no están desplegados.
