# Evidencia de implementación V35: planes e historial

2026-10-10 America/Lima. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama codex/2do-intento, base V34/84078ae. Consultar Git para SHA del cierre. No auditoría
académica nueva, despliegue ni adopción en dev/Supabase.

Migración004 aplicada explícitamente en PG17.6 local127.0.0.1:6544, DB test
ashakids_test_flujo_v34_20261010 y QA independiente ashakids_test_flujo_qa_20261010.
Runtime no superuser, políticas permisivas locales únicamente; no demuestra ACL compartida.

- pytest tests -q:199 aprobadas,25 omitidas,19 deprecaciones,51.28s. Nuevos3 casos SQL
  cubren atención sin plan previo, autor/permisos,2 terapeutas,PDF,versiones,reingreso,
  revocación al cancelar y publicación concurrente201/409. No datos ni usuarios reales.
- Vitest270 finales (incluye3 nuevos casos de plan): publicación, conservación del borrador al
  rechazo y reporte/plan ajenos en lectura. Tipos/check328/build2.56s correctos.
- backend-requests.json conserva únicamente método/ruta/status de la suite completa.
- UI1280x720: t90001 registró/inició sesión1, guardó4 textos y publicó plan1 de Ana con
  Lenguaje/Habla y4 recomendadas. Datos sintéticos en QA; reloj movido a9oct08:00.
  Cierre native confirm bloqueó IAB; no evidencia de cierre UI en este corte. Confirmación
  trasladada a la app; repetir en V36. No afirmar todas las pantallas por compilación.

Errores reales: parche rechazado sin coincidencia, expectativa de query id_paciente
ignorada corregida a paciente/contexto, script npm check inexistente corregido a
check:frontend; popup native IAB inmovilizó tab2 y se pidió al usuario cerrarlo.
Sin fuerza de Git, modificación de .env, CI remota ni prueba contra Supabase. Extensiones
de soporte/reseñas/adjuntos/analítica educativa siguen diferidas, pagos fuera de alcance.
