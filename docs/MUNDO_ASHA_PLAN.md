# Mundo ASHA - Etapa propia de juegos por habilidades y niveles

**Alcance actualizado 2026-10-10:** consultar [flujo maestro](FLUJO_MAESTRO_ACTUALIZADO.md).
Áreas: fluidez/ritmo, habla y comprensión/expresión; uno o varios mundos asignados por terapeuta
al niño. Primera entrega reducida reutiliza juegos y demuestra progresión/desbloqueo hasta
completar mundo. Demo explícita o persistencia servidor inicial pendiente de precisión.
Cuatro mundos/24 niveles y MA-01..MA-07 inferiores son antecedentes, no catálogo aprobado
ni obligación de completar todo el contenido para el nuevo mínimo.

Petición del usuario: 2026-10-09. Es una etapa extensa, independiente de las fases del núcleo.
No renumerar las fases existentes ni dar por terminados los juegos por mostrar el catálogo.
Este documento es la entrada progresiva del módulo; el contexto maestro enlaza aquí.

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
- Alternativa sin micrófono, permisos denegados, pausa, reintento y audio accesible. Definir
  datos mínimos, consentimiento si corresponde y retención antes de guardar grabaciones.

## Ruta de implementación específica

| Paso | Trabajo | Criterio de salida |
| --- | --- | --- |
| MA-01 | Revisar mundos, objetivos, edades, /r/-/rr/, cantidades y validación con el usuario/profesional | Matriz de contenidos aprobada; cada nivel tiene tarea y criterio observable |
| MA-02 | Inventario de tablas/contratos, autorización y migraciones | Contrato HTTP y modelo físico revisados; migración reversible ensayada en BD descartable |
| MA-03 | Construir un nivel completo de un mundo elegido | Instrucción, juego, respuesta, error, evaluación, fin y repetición funcionan; audio/teclado/móvil revisados |
| MA-04 | Persistir intentos y requisitos previos | Recarga, otro dispositivo y cambio de usuario conservan/protegen progreso; duplicado/conflicto ensayados |
| MA-05 | Completar progresión del primer mundo | Todos sus niveles funcionales, dificultad revisada, ayuda y repetición sin duplicar premios |
| MA-06 | Ampliar mundos y producción oral | Cada objetivo tiene contenido revisado y validación acordada; sin falsos reconocimientos de fonemas |
| MA-07 | Aceptación integral del módulo | Niños distintos, permisos, errores/red, reanudación y resultados persistentes; auditoría PDF y relevo |

## Inventario heredado por revisar

Cuentos, canciones, adivinanzas, trabalenguas, laberinto y Voz Aventura tienen interacciones
de demostración. No se afirma que todas estén probadas o listas para terapia. Revisar cada
prototipo antes de reutilizarlo. Academia/retos/insignias/perfil ahora explican el seguimiento
pendiente en lugar de presentar cifras fijas. No hay un juego nuevo completo en este corte.

## Continuación

Estado: base local implementada y verificada en auditoría 2026-10-09-04; MA-01 pendiente.
La siguiente tarea de este módulo es revisar la matriz con el usuario, no desarrollar los
24 niveles de una vez. El núcleo sigue su plan, sin pagos nuevos y sin desplegar todavía.
