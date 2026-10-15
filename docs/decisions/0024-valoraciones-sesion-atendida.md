# ADR 0024: valoraciones de sesiones atendidas

Fecha: 2026-10-11. Estado: adoptado en V72.

La familia puede calificar una sesión FINALIZADA/ASISTIO incluso al volver a una fecha histórica de su agenda. Se guardan 1–5 estrellas y comentario opcional de hasta 1000 caracteres. El terapeuta ve el nombre del autor; el listado no proyecta datos del niño.

React consume FastAPI con autenticación propia. Escribir exige PADRE y pertenencia a la familia de ese paciente, sin permisos ampliados de contexto clínico. TERAPEUTA consulta sus reservas; ADMIN puede consultar el listado. La fecha transcurrida no impide opinar.

valoraciones_sesion tiene FK a sesiones/usuarios, UNIQUE por sesión y CHECK de calificación. El bloqueo de sesión serializa envíos concurrentes. Reintento idéntico devuelve la opinión existente; uno diferente produce 409. No hay edición ni eliminación. El frontend invalida consultas tras guardar.

Migración011 explícita, sin DDL al iniciar la API. RLS, SELECT/INSERT y USAGE de secuencia para ashakids_runtime; sin UPDATE/DELETE ni acceso PUBLIC/anon/authenticated/service_role. Las políticas runtime habilitan al backend; los permisos por familia/terapeuta se verifican en FastAPI. No Supabase Auth ni conexión directa desde React. Tabla ausente produce 503 específico y Próximamente; otros errores son visibles con reintento.

Adopción con respaldo privado verificado y conservación de 32 tablas previas. Sin usuarios/opiniones de prueba compartidos. Pruebas SQL/HTTP en PostgreSQL local descartable. [Evidencia](../evidence/therapist-reform-2026-10-11/verification.md).

Una sola opinión por sesión para la familia. No se inventan satisfacción, recomendación o puntualidad. Moderación/edición y métricas adicionales pendientes; no se añade transporte en tiempo real.
