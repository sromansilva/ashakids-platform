# ADR 0005 - Experiencia del núcleo y límite educativo

Fecha: 2026-10-09. Estado: adoptada en implementación local. Complementa ADR 0004.

## Contexto

Seguimiento familiar ya utiliza registros del servidor, pero recorrido/seguimiento alternos,
paneles por rol, acceso público y configuración conservaban cifras o éxitos simulados.
El usuario solicita continuar fase 3 y dedicar una etapa propia a Mundo ASHA por habilidades
y niveles; aún no existen contratos educativos ni de correo/consentimiento para esas vistas.

## Decisión

1. Reutilizar FamilyTrackingPanel en recorrido/seguimiento; OperationalDashboard agrega
   pacientes/citas/sesiones autorizados y cuentas únicamente para ADMIN. Lectura paginada
   mediante servicios existentes, sin endpoints nuevos ni autenticación alternativa.
2. Mantener el alta y cambios de credenciales por administración ya disponibles. Rutas públicas
   explican el acceso actual, sin pedir datos para un registro inexistente ni simular correo.
   Esto documenta el flujo existente; no elimina un endpoint público operativo.
3. Configuración familiar conserva consulta de identidad y CRUD real de hijos, sin límite de
   plan. Privacidad, notificaciones, 2FA y cambios de cuenta no implementados muestran su estado.
   Los componentes heredados correspondientes quedan sin renderizar desde esta entrada.
4. useSelectedFamilyPatient comparte selección por ID autorizado, por usuario, con seguimiento
   y Mundo ASHA. El almacenamiento no reemplaza permisos de FastAPI ni contiene historial.
5. Mundo ASHA usa catálogo de contenido borrador y un cálculo puro de progreso verificado.
   Mientras falte la API, estado desconocido y prototipos separados; no inventar ceros,
   asignaciones, premios o pronunciación correcta. Juegos completos en MUNDO_ASHA_PLAN.md.
6. routeCapabilities etiqueta extensiones no revisadas y sesiones virtuales prototipo. La
   ausencia de etiqueta en el núcleo indica contrato conectado, no certificación de toda pantalla.

## Consecuencias

No cambia el modelo físico, la seguridad ni las capas backend. El alcance comprobado del
núcleo queda más claro. Se posponen registro público/correo/consentimiento y juegos completos;
requieren definición/contrato/evidencia propios. Debe revisarse publicidad y módulos heredados
en aceptación final. Agregados actuales leen listas completas: si crece el volumen, medir y
decidir endpoints de resumen, no inventar cifras ni paginación incompleta silenciosamente.
