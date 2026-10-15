# ADR 0007 — Mensajería entre familia y profesional

Fecha: 2026-10-09. Estado: adoptada para el mínimo de F5-01.
Código: V08_Mensajes_Familia_Terapeuta, 7fddd59d6cc6ec594c666c9c80ba184a88c9a91d.

## Contexto

Las pantallas de mensajes usaban conversaciones, respuestas y llamadas ficticias. El esquema
replicado en el corte02 ya contiene conversaciones y mensajes; no necesitamos DDL para texto.
La autenticación propia, cookies y permisos permanecen en FastAPI. ADMIN puede administrar
clínica, pero ese rol por sí solo no concede acceso al intercambio privado de participantes.

## Decisión

- Una conversación corresponde a tutor/familia y terapeuta, compartida entre sus hijos.
  Los contactos salen de pacientes activos, tratamiento ACTIVO y usuarios habilitados.
- PADRE/TERAPEUTA consulta únicamente conversaciones donde su perfil es participante.
  Se conserva lectura del historial tras finalizar la asignación. Enviar requiere chat ACTIVA,
  sin fecha_archivado, y asignación activa. No se expone un directorio general de personas.
- La API deriva el emisor de la sesión; el cliente solo manda texto (1..4000 caracteres,
  no vacío ni NUL). Campos extra se rechazan. No se permite elegir sender/leido/fecha.
- Abrir bloquea el tutor, reutiliza la primera conversación de la pareja y revalida asignación
  antes de crear. Enviar bloquea la conversación; commit termina antes de responder éxito.
- Conversaciones e historial usan cursor por ID descendente, limit+1 y máximo100;
  IDs/cursor se restringen al rango positivo INTEGER de las tablas. Contactos usa X-Total-Count.
- React consume messagingService -> apiClient. Consultas y borradores se separan por identidad;
  error de permisos oculta datos cacheados. El texto se representa escapado por React.
- El usuario actualiza manualmente para recibir respuestas. No se declara tiempo real,
  presencia, leído, llamadas ni adjuntos. Confirmación de envío requiere respuesta persistida
  válida; no hay burbujas optimistas ni reintentos automáticos de POST. El borrador se conserva
  en memoria por chat hasta salir de la pantalla o cambiar de cuenta.

## Consecuencias y límites

No cambia el esquema ni se introduce Supabase Auth. El bloqueo evita aperturas duplicadas
entre solicitudes de esta API; no existe UNIQUE(tutor,terapeuta), no se limpian duplicados
históricos y escritores externos deben respetar la misma regla. Una conversación histórica
sin terapeuta no se incluye en este módulo de dos participantes.

El envío no tiene clave de idempotencia: una respuesta perdida puede dejar un mensaje guardado.
La interfaz informa incertidumbre y pide actualizar antes de reenviar manualmente. No se promete
exactamente una entrega tras fallos de red. La revocación concurrente de asignación mediante un
escritor externo tampoco es una garantía atómica de este bloqueo; no se modifican otras tablas.

Los índices existentes de FK/PK bastan para este ensayo pequeño; no hay ensayo de carga ni
decisión de índice compuesto nueva. Medir antes de optimizar o ampliar retención/realtime.
La lectura tras logout/login se verificó por HTTP con PostgreSQL local real. Archivar/perder
asignación se verificó en unidad con dependencias simuladas; no se alteró clínica para probarlo.
La aceptación visual desktop/móvil y por otro clon sigue pendiente por bloqueo previo del navegador.

Evidencia: [auditoría06](../audits/auditoria-2026-10-09-06.md).
