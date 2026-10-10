# Recuperación de la plataforma al corte V26

Fecha: 2026-10-10, America/Lima. Rama de trabajo: `piero-dev`; base compartida: `dev`.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Base recuperada: `a81e465aa02522366eb97250c38827d11ed4a0e4`,
`V26_Auditoria_Frontend_Backend_HTTPS`. Cierre: `V31_Restauracion_Plataforma_V26`.

Código, instrucciones y documentos vuelven a V26, salvo este registro y los dos avisos
de continuación en contexto/progreso. Los documentos y fuentes posteriores se retiraron
del árbol activo. Git conserva sus commits; no se reescribió el historial.

La reversión del esquema compartido restituyó `reservas.id_tratamiento NOT NULL` y
retiró exclusivamente las dos columnas, dos restricciones y el índice añadidos después
del corte. Se comprobó previamente que no contenían reservas ni planes que dependieran
de esos campos. No se borraron usuarios, pacientes ni registros clínicos. Las 26 tablas,
los conteos de registros y los permisos/RLS se conservaron. No se reconstruyó una copia
histórica de datos: se recuperó el esquema con los datos actuales conservados.

Verificaciones nuevas de recuperación:

- Backend: `python -m pytest tests -q`: 157 correctas, 50 omitidas, 19 deprecaciones.
  Pruebas con mocks/unidades; las integraciones requieren entorno local explícito y se omitieron.
- Frontend: 25 rutas y 257 componentes correctos; typecheck, check:frontend320 y build correctos.
  Aviso DEP0205 de Node. No nueva auditoría clínica ni cobertura visual completa.
- Graphify: refresh AST local y check vigente; 12 archivos sin símbolos, mapa no versionado.
- Frontend local5174, readiness API8000 y readiness HTTPS Render: HTTP200. Reversión SQL ensayada primero en PostgreSQL
  local descartable y luego aplicada a la BD compartida; evidencia sanitizada adjunta.

El hosting Render no se redeployó durante la recuperación. V26 conserva las auditorías
originales16/17 con valoración técnica91/100; este registro no asigna otro puntaje.

Respaldo recuperable local, ignorado por Git: `tmp/recuperacion-antes-v26.zip` y
`tmp/recovery-v26/`. No contiene archivos `.env`; no se publica con el repositorio.
El historial de la conversación no se elimina al restaurar archivos. Para trabajar con
contexto nuevo, abrir otro chat y tomar V26 y este registro como base.
