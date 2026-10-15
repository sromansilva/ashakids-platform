# Verificación V52 — adjuntos

Fecha2026-10-10 America/Lima; repositorio https://github.com/sromansilva/ashakids-platform .
Base a6eda9f/V51, codex/2do-intento; SHA de cierre en commitV52/gitlog.

27pruebas backend pasaron14.40s:2integración PostgreSQL17aislado+25mensajería.
283pruebas frontend pasaron28.21s (18archivos),18chat; typecheck/build/check correctos.
Caso nuevo de UI:envío de adjunto solo, FormData/boundary, respuesta válida antes de limpiar,
reintento de red con mismaUUID, rechazo tamaño en selector. Casos backend incluyen acceso
por participante, rechazo ajeno/admin, persistencia bytes, UUID/conflicto, chatarchivado,
formatos/cabeceras y tamaño. Estos tests son locales, no registros reales.

Esquema inicial ensayado en nueva BDlocal; migración009adoptada explícitamente en BD
compartida tras backup/listverificados y comparación hashfilasprevias iguales.
Sanitizado database-adoption.json; backup privado fuera de Git. No archivos/pacientes
creados en BDcompartida para probar. No se interpreta readiness como cobertura completa.
Node module.register DEP0205 heredada. Detector MessageThread sinhallazgos.
