# ADR0022 - Catálogo descriptivo y acceso a ejercicios

Fecha2026-10-10. Estado: adoptado localmente, pendiente de aprobación/publicación.

Contexto: GET juegos/catalogo era anónimo y entregaba prompts/choices de cada nivel.
La landing integrada debe informar sobre mundos sin exponer ejercicios privados.
El resumen de paciente además incluía niveles no asignados aunque no fueran jugables.

Decisión: catálogo público mantiene id/version/name/description y levels con number
únicamente. API privada del resumen conserva ejercicios sin respuestas sólo en mundos
asignados. Escritura sigue validando PADRE, paciente_visible/es_familia, actividad del
paciente y asignación al plan. Sin migraciones, políticas SQL o nuevas autenticaciones.
Frontend distingue PublicWorld de BasicWorld; WorldCards no ejecuta actividades.
Retorno al mundo es un código conocido en ruta existente, nunca autorización por URL.

Consecuencias: clientes públicos que dependan de prompts deben usar resumen autorizado.
Cliente actual actualizado y tests unit/ASGI sinBD; otros clientes externos deben revisar
el contrato antes de publicar. CachéHTTP de API sigue no-store. No se certifica ACL/BD
real por los mocks. Ver auditoría2026-10-10-01 y evidencia landing-v56.
