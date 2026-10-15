# Evidencia - revisión frontend con Supabase real

Corte 2026-10-09-12. SHA funcional a60d671a8523a016a41b50395a7db92b05698f18.
Repositorio: https://github.com/sromansilva/ashakids-platform . Rama de ejecución: feat/sroman.

`validation.json` resume comandos realmente ejecutados; no es salida cruda ni porcentaje de cobertura.
`live-readback.json` contiene las 28 respuestas HTTP comprobadas y la verificación SQL de solo lectura.
Las imágenes solo muestran registros sintéticos AUDITORIA; no se exportan contraseñas, cookies ni expedientes reales.

## Recorrido en el navegador

1. Administración inició sesión, creó familia y profesional AUDITORIA, registró paciente y asignó tratamiento mediante los formularios existentes.
2. Un email sintético con dominio no admitido devolvió 422; se conservaron los campos y se corrigió a example.com antes de guardar.
3. Familia inició sesión con su cuenta nueva y reservó usando el paciente y el tratamiento reales; la recarga conservó la cita.
4. Profesional inició sesión, confirmó la cita y registró la sesión. Iniciar estuvo bloqueado antes de su horario real.
5. Desde el expediente autorizado se abrió el historial por ID y se inició la sesión al llegar su horario.
6. Reportes profesionales guardó sus cuatro campos. La recarga conservó el contenido; no se usaron pacientes ni reportes de respaldo.
7. Se probó viewport 390x844: formularios/tarjetas apilados y menú funcional, documento/body/viewport de ancho 390, sin desborde horizontal en esas vistas. Se retiró el override al terminar.
8. El usuario aceptó el diálogo nativo de finalización; se comprobó FINALIZADA/ASISTIO y la cita COMPLETADA.
9. Familia consultó los cuatro campos, descargó el PDF desde la pantalla original y recargó conservando sesión y registros. La descarga se verificó en el archivo recibido.
10. Se bloqueó temporalmente /api en esta pestaña: error legible, controles clínicos cacheados ocultos, sin datos de respaldo. Se retiró el bloqueo y Reintentar recuperó el reporte.
11. Se comprobaron atrás/adelante, Mundo ASHA y ASHI conservados, identidad familiar correcta y rechazo de /admin/sesiones desde familia.
12. La lectura HTTP/SQL posterior confirmó los mismos IDs y reportes en la BD configurada de Supabase, con rechazo de recursos ajenos y revocación tras logout.
13. Tras logout familiar, administración entró desde Operación -> Sesiones y reportes: detalle de sesión2 FINALIZADA/ASISTIO y editor con observación sintética coincidente. No se guardó ni alteró otra vez el reporte; se cerró la cuenta administrativa. No se exportaron nombres personales de esa cuenta.

IDs retenidos con autorización: usuarios 50/51, paciente 86, tratamiento 6, cita 3, sesión 2 y su reporte. No se modificaron ni eliminaron registros de pacientes reales existentes. Los datos sintéticos deben excluirse de métricas clínicas.

## Reproducción segura

La herramienta `tools/acceptance/verify_frontend_supabase_review.py` lee esos IDs; solo login/logout escriben sesiones de autenticación. Requiere `AUDIT_SYNTHETIC_PASSWORD` externo y `PYTHONPATH=.` al ejecutarla desde backend. No incluye la contraseña. No es una semilla general ni debe ejecutarse en otra BD sin revisar los IDs y su autorización.

La suite completa de backend no se ejecutó contra Supabase. No usar fixtures con TRUNCATE en una BD compartida. Las pruebas de componentes interceptan HTTP y no prueban persistencia; esta se verificó separadamente en el navegador y en las consultas reales.
