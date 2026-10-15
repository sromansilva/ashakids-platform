# ADR0021 — adjuntos pequeños en la transacción del chat

Fecha:2026-10-10. Estado:aceptado para implementación inicial.

## Contexto

El chat persiste texto; mensaje_adjuntos conserva metadatos físicos pero no un flujo.
Render tiene disco efímero y las credenciales locales de Supabase solo incluyen una
clave pública. Se necesitan adjuntos privados durables usando la infraestructura actual.

## Decisión

Añadir contenido BYTEA nullable a mensaje_adjuntos, UUID único y SHA256. Límite10MB,
un adjunto por envío,20adjuntos/hora por emisor. Conservar columnas/filas antiguas y FK
existente; código nuevo no descarga URLs externas heredadas. Supabase Postgres almacena
binario, no se usa Supabase Auth ni Storage con permisos anónimos.

POST multipart /conversaciones/{key}/mensajes/adjunto: autenticar antes de consumir cuerpo,
limitar multipart completo10MB+64KB, extensión/cabecera aceptadas, texto validado como
mensajes existentes. Conversación bloqueada, mensaje y archivo insertados juntos.
Reintento UUID/payload idéntico no genera otro mensaje ni notificación; conflicto409.
GET /conversaciones/{key}/adjuntos/{id}: autorizar por participantes, comprobar vínculo
adjunto→mensaje→conversación;404para recurso ajeno y403para ADMIN sin rol participante.

RLS habilitada, solo rol privado runtime SELECT/INSERT y secuencia USAGE; PUBLIC/anon/
authenticated sin acceso a tabla. Permisos por persona permanecen en FastAPI. UI usa
cliente HTTP central, multipart sin Content-Type manual, lectura binaria con invalidación
por cambio de identidad. Blobs locales solo tras solicitud, revocados al salir. Documentos
se descargan; medios pueden verse/reproducirse. Cache-Control no-store y nosniff.

## Consecuencias

Persistencia estable y atomicidad sin aprovisionar storage externo. Backups Postgres
incluyen binarios: crecimiento del almacenamiento/costo y latencia aumentan con uso.
El límite requiere clips pequeños; descargas actuales se leen completas y no usan Range.
No antivirus, transcodificación, lectura de duración ni validación completa de codecs.
Formatos activos SVG/HTML y ejecutables no admitidos; TXT/PDF se entregan como descarga.
Para escala, sustituir contenido por objetos privados con compensación de fallos sin
cambiar permisos ni modelo público. Adjuntos legacy sincontenido se conservan pero no
son descargables. No DDL al arrancar;009es adopción explícita con respaldo.
