# Product — AshaKids

<!-- impeccable:product-schema 1 -->

Registro de producto del corte documental V28, iniciado el 2026-10-09 (Lima).
Base leída: `piero-dev`, V27, `f9df2bc30d56b643af6dd88ab90f6ffdfdbf0fa7`.
Repositorio: https://github.com/sromansilva/ashakids-platform .
La especificación visual y educativa se entrega para validación; no está implementada.

## Platform

web

## Users

- ADMIN prepara cuentas, pacientes y tratamientos/asignaciones.
- PADRE representa a su familia, reserva atención y consulta reportes y mensajes autorizados.
- TERAPEUTA atiende a sus asignados y registra sesiones, reportes y recomendaciones.
- El niño participa en Mundo ASHA acompañado por un adulto. No se crea un nuevo rol
  de acceso infantil ni se entrega al niño el control de datos clínicos.

Edades, capacidades de lectura, apoyos y duración adecuada por niño requieren revisión
profesional. Las edades y certificaciones promocionales de la maqueta no acreditan esos hechos.

## Product Purpose

Coordinar atención y acompañamiento familiar mediante información compartida y autorizada.
El recorrido esperado es ADMIN prepara cuenta/paciente/tratamiento → familia reserva →
profesional atiende y registra reporte → recomienda un juego → familia consulta la
recomendación → niño juega → adulto/profesional consulta seguimiento autorizado.

El éxito funcional exige registros recuperables tras recarga y otro dispositivo, permisos
por recurso y mensajes honestos ante errores o capacidades incompletas.

## Operating Context

React/TypeScript/Vite → HTTP/JSON → FastAPI → SQLAlchemy/asyncpg → PostgreSQL.
Autenticación propia por código ASHA y contraseña, con sesión y cookie HttpOnly.
Supabase aloja PostgreSQL; no se usa Supabase Auth ni acceso SQL desde React.
Horarios de Perú en presentación; conservar `America/Lima` y el tratamiento de zona en código.
El hosting HTTPS registrado sirve frontend y API bajo el mismo origen; el último despliegue
documentado es V24 con publicación manual. Un push documental no prueba otro despliegue.

## Capabilities and Constraints

| Capacidad | Realidad del corte V27 y alcance siguiente |
| --- | --- |
| Cuentas, pacientes, tratamientos, citas y sesiones | Servicios conectados; conservar reglas de asignación, fechas y estados |
| Reporte clínico y PDF | Cuatro campos editables: `observaciones_iniciales`, `objetivos_trabajados`, `nivel_ayuda`, `proximos_pasos`; edición de reporte existente pendiente de corregir |
| Seguimiento familiar | Derivado de datos autorizados; cantidades de sesiones no miden mejoría clínica |
| Mensajes | Persistidos entre participantes; no prometer adjuntos, push, lectura confirmada ni acceso ADMIN a chats privados |
| Recomendación textual | Reutilizar `proximos_pasos`; no existe una asociación formal publicada entre reporte y juego |
| Mundo ASHA | Catálogo y prototipos; sin API de progreso educativo. Primera entrega obligatoria: pájaro que sube con sonido y baja con silencio, entre troncos de alturas variables |
| Micrófono | Detección local de energía sonora; no reconocimiento de pronunciación, diagnóstico ni grabación/almacenamiento de audio |

Pendientes: corrección F16-01 de reportes y F16-02/F16-03 de accesibilidad; contrato
educativo, modelo/migración, permisos, idempotencia y aceptación de persistencia.
IA, reconocimiento clínico de pronunciación, pagos y facturación quedan fuera del desarrollo.
Videollamada, recuperación por correo y evaluación automática no son servicios completos.
Conservar una explicación útil cuando una función incompleta permanezca visible.

## Brand Commitments

ASHA/Ashi identifica toda la aplicación. El usuario solicita una experiencia atractiva,
minimalista y de poca carga cognitiva, con gestión adulta y juego infantil distinguibles.
Figma Make es inspiración para criterios propios de UI, no una especificación que copiar.
Referencia: https://www.figma.com/make/Szmh1QEUMsfbVrbmnHWeMr/Ashakids?fullscreen=1&code-node-id=0-9 .
Identidad existente contrastada en código: Nunito, violeta, superficies claras y formas redondeadas.

## Evidence on Hand

Auditorías 16/17 y sus evidencias son históricas; sus pruebas no se repiten en este corte.
La lectura actual de código y la inspección acotada de Figma se registran en
[notas del corte](docs/evidence/design-plan-v28/README.md).
No hay evidencia de eficacia clínica del juego ni resultados educativos persistidos.
Nombres, récords, métricas y testimonios de maquetas no se convierten en datos del producto.
Conservar registros AUDITORIA y datos anteriores; QA sintético separado del piloto real.

## Product Principles

1. La API confirma cada escritura antes de presentar éxito.
2. Cada niño se identifica por ID autorizado; nombre o almacenamiento del navegador no concede acceso.
3. La recomendación clínica y el desempeño del juego conservan su contexto y significado propios.
4. Reutilizar el núcleo existente y cerrar un juego completo antes de ampliar mundos.
5. Mostrar la siguiente acción útil sin exigir conocer herramientas o arquitectura internas.

## Accessibility & Inclusion

Objetivo propuesto: WCAG 2.2 AA, ver criterios y fuentes en [DESIGN.md](DESIGN.md).
Teclado, foco visible, lectura legible, errores vinculados a campos y diálogos accesibles.
Juego con toque/teclado equivalente, pausa y salida; hablar cómodamente sin exigir gritar.
No se declara conformidad WCAG ni aceptación infantil por escribir esta especificación.
