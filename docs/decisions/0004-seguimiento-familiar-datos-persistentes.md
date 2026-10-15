# ADR 0004 - Modelo de lectura para seguimiento familiar

Fecha: 2026-10-09. Estado: adoptado en el árbol local, pendiente de commit compartido.

## Contexto

Centro Familiar y Mi Camino ASHA mezclaban pacientes/citas persistentes con niños de
respaldo, hitos completos, cifras y reportes ficticios. La selección por nombre podía
mezclar hermanos homónimos; una cita completada podía aparecer como próxima.

## Decisión

Usar useFamilyTracking y summarizeFamily para ambas vistas, consumiendo los contratos
existentes patients/treatments/appointments/sessions/reports vía clinicalService.
React Query conserva claves por identidad. Tratamientos y reporte se consultan por
ID del paciente/sesión; los agregados filtran id_paciente, no el nombre.

Guardar únicamente el ID del hijo seleccionado en sessionStorage con clave por usuario.
Validarlo contra pacientes activos recibidos en cada montaje; si ya no existe, seleccionar
uno permitido. La selección funciona sin almacenamiento si el navegador lo bloquea.
No guardar reportes, credenciales ni perfiles en ese almacenamiento.

Contar sesiones FINALIZADA/ASISTIO y reportes disponibles; usar America/Lima para fechas
y mes. Excluir citas canceladas/completadas/vencidas de próximas; sesión EN_CURSO tiene
prioridad. Esas cifras son registros operativos, no porcentaje de mejora clínica.

Estados del recorrido corresponden a perfil, tratamiento, reserva no cancelada, asistencia
y reporte existentes. No inferir consentimiento, evaluación, correo verificado o firma.
Errores de lectura ocultan agregados cacheados; vacíos no usan niños de demostración.

## Consecuencias y límites

No hay endpoint agregado nuevo, cambios SQL ni autenticación adicional. El backend mantiene
autorización; filtros del frontend no sustituyen sus permisos. Paginación obtiene todo el
conjunto autorizado para derivar cifras; si aumenta el volumen, evaluar un agregado paginado
del servidor, con contrato y evidencia nuevos. No es una prueba de carga.

Mi Camino reutiliza SessionActions para consulta de sesión/reporte y descarga TXT real.
Los antiguos fragmentos de demo siguen en el repositorio como código sin importar desde
las dos entradas actuales; no se certifican ni se activan sus pantallas por esta decisión.
Mundo ASHA sigue siendo demostración identificada; no representa asignaciones clínicas.

Validación de la decisión: auditoría 2026-10-09-03; 12 casos nuevos dentro de 165 componentes,
25 rutas y navegador local con familias/hijos sintéticos. No despliegue ni escrituras Supabase.
