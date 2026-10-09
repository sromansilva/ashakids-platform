# ADR 0006 - Exportación de reportes guardados por sesión

Fecha: 2026-10-09. Estado: adoptada en implementación local; corte2026-10-09-05.

## Contexto

La consulta compartida del reporte ya autorizaba por cita/sesión; la descarga era texto
o un PDF construido en frontend con truncación y datos/firma de demostración. Se necesita
una copia coherente del registro persistente para familia y profesionales autorizados.

## Decisión

1. Añadir GET /sesiones/{id}/reporte/pdf y reutilizar reporte_visible en PDF y JSON.
   Primero autorizar sesion_visible, después consultar reporte. ADMIN, padre propio y
   terapeuta de la cita conservan permisos existentes; recurso ajeno devuelve 404.
2. Renderizar con ReportLab en memoria/threadpool, sin Storage, discos ni enlaces públicos.
   Content-Disposition attachment, no-store, nosniff. Sin migración ni nuevas filas clínicas.
3. Exportar exclusivamente campos compartidos guardados y datos actuales de la cita;
   no notas privadas, firma, matrícula, diagnóstico nuevo o porcentajes clínicos inferidos.
   No crear informe mensual sin registro/criterio de evaluación acordado.
4. Usar fuentes Vera distribuidas con ReportLab, comprobar sus caracteres y devolver 422
   cuando no puedan representarse. Escapar markup y paginar el contenido completo. Fechas
   con zona convertidas a Lima; fechas sin zona se rotulan y conservan como tales.
5. Extender cliente central con respuesta binaria PDF y validación MIME/firma, guardas de
   identidad/abort y errores JSON habituales. Botón compartido sin caché clínica binaria,
   bloqueo de doble descarga, URL temporal liberada y estado honesto de recepción.

## Consecuencias y límites

La copia refleja nombres actuales y contenido guardado, no una versión histórica inmutable.
El navegador decide destino final del archivo; la UI confirma recepción/inicio de descarga.
Cambios de formulario sin guardar requieren guardar y descargar de nuevo. Ciertos emoji o
alfabetos no cubiertos devuelven 422 y el texto sigue disponible en la web. Una fuente más
amplia requiere revisión de cobertura/licencia y pruebas; no sustituir caracteres en silencio.

ReportLab/tzdata se añaden a runtime; pypdf solo a desarrollo. No se ha medido carga/memoria
con múltiples exportaciones concurrentes ni certificado el despliegue. Auditoría05 verifica
11 unidades, frontend y HTTP en réplica local; no atribuirle una suite backend completa nueva.
