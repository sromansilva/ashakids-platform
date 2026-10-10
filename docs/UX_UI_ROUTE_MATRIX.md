# AshaKids — Matriz inicial de rutas y propiedad

Fecha: 2026-10-09. Base: V26 `a81e465aa02522366eb97250c38827d11ed4a0e4`, rama `piero-dev`.
Repositorio: https://github.com/sromansilva/ashakids-platform .

Inventario estático: **96 rutas explícitas**, incluidos alias; no equivale a 96 pantallas distintas ni a cobertura de pruebas.
Fuentes: `routeManifest.ts`, `AppRouter.tsx`, `lazyPages.ts` y `routeCapabilities.ts`.
El estado es una clasificación documental inicial, contrastada con los servicios y auditorías; no una prueba nueva por ruta.
Los archivos de abajo son entradas; sus dependencias de módulo pertenecen al mismo bloque salvo la propiedad compartida de B0/B2/B3/B4.
B0 integra todos los cambios de rutas/navegación. No editar esos archivos desde cada bloque.

[Plan, flujo y condiciones de cierre](UX_UI_PARALLEL_PLAN.md).

| Bloque | Cantidad de rutas |
| --- | ---: |
| B0 | 20 |
| B1 | 17 |
| B2 | 16 |
| B3 | 21 |
| B4 | 2 |
| B5 | 13 |
| Fuera: pagos/maqueta | 7 |

| Ruta | Bloque | Fuente de pantalla bajo frontend/src/ | Estado/precaución |
| --- | --- | --- | --- |
| `/` | B0 | `pages/public/landing/Landing.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/login` | B0 | `pages/auth/LoginPage.tsx` | Autenticación API; accesibilidad pendiente |
| `/register` | B0 | `pages/auth/Auth/RegisterSelector.tsx` | Recorrido de acceso incompleto; alta real por ADMIN |
| `/register/padre` | B0 | `pages/auth/Auth/RegisterPadre.tsx` | Recorrido de acceso incompleto; alta real por ADMIN |
| `/register/verify` | B0 | `pages/auth/Auth/RegisterVerify.tsx` | Recorrido de acceso incompleto; alta real por ADMIN |
| `/register/terapeuta` | B0 | `pages/auth/Auth/RegisterTerapeuta.tsx` | Recorrido de acceso incompleto; alta real por ADMIN |
| `/register/terapeuta/landing` | B0 | `pages/auth/Auth/TerapeutaLanding.tsx` | Recorrido de acceso incompleto; alta real por ADMIN |
| `/register/terapeuta/success` | B0 | `pages/auth/Auth/RegisterTerapeutaSuccess.tsx` | Recorrido de acceso incompleto; alta real por ADMIN |
| `/admin/reportes` | B1 | `pages/admin/AdminModulosGenerales/AdminReportes.tsx` | Mixta: maqueta administrativa; clínico en Sesiones |
| `/admin/usuarios` | B1 | `pages/admin/AdminModulosGenerales/AdminUsuarios.tsx` | Inventario conectado; revisar acciones internas |
| `/admin/pacientes` | B1 | `pages/admin/AdminModulosGenerales/AdminPacientes.tsx` | Inventario conectado; revisar acciones internas |
| `/admin/citas` | B3 | `pages/admin/AdminModulosGenerales/AdminCitas.tsx` | Inventario conectado; revisar acciones internas |
| `/admin/sesiones` | B3 | `pages/admin/AdminModulosGenerales/AdminSesiones.tsx` | Inventario conectado; revisar acciones internas |
| `/admin/analiticas` | B1 | `pages/admin/AdminModulosGenerales/AdminAnaliticas.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/mensajes` | B1 | `pages/admin/AdminModulosGenerales/AdminMensajes.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/moderacion` | B1 | `pages/admin/AdminModulosGenerales/AdminModeracion.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/solicitudes` | B1 | `pages/admin/AdminSolicitudes.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/core` | B1 | `pages/admin/AshaCore.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/onboarding` | B0 | `pages/auth/Auth/Onboarding.tsx` | Recorrido de acceso incompleto; alta real por ADMIN |
| `/forgot-password` | B0 | `pages/auth/Auth/ForgotPassword.tsx` | Recorrido de acceso incompleto; alta real por ADMIN |
| `/especialistas` | B0 | `pages/public/SpecialistsPage.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/especialidades` | B0 | `pages/public/Public/PublicEspecialidades.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/recursos` | B0 | `pages/public/ResourcesPage.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/ashi` | B0 | `pages/public/Public/PublicAshi.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/historias` | B0 | `pages/public/Public/PublicHistorias.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/sobre-nosotros` | B0 | `pages/public/AboutUsPage.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/nosotros` | B0 | `pages/public/AboutUsPage.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/planes` | Fuera: pagos/maqueta | `pages/public/Public/PublicPlanes.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/ayuda` | B0 | `pages/public/Public/PublicAyuda.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/contacto` | B0 | `pages/public/Public/PublicContacto.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/trabaja` | B0 | `pages/public/Public/PublicTrabaja.tsx` | Contenido público; verificar afirmaciones/acciones |
| `/session/waiting` | B3 | `pages/padre/SessionsMeeting/AshaSessionWaiting.tsx` | Demostración; no videollamada ni sesión clínica |
| `/session/active` | B3 | `pages/padre/SessionsMeeting/AshaSessionActive.tsx` | Demostración; no videollamada ni sesión clínica |
| `/session/end` | B3 | `pages/padre/SessionsMeeting/AshaSessionEnd.tsx` | Demostración; no videollamada ni sesión clínica |
| `/padre` | B2 | `pages/padre/dashboard/PadreHome.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/camino` | B2 | `pages/padre/journey/camino/MiCaminoAsha.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/ayuda` | B2 | `pages/padre/PadreAyuda.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/padre/recorrido` | B2 | `pages/padre/journey/PadreRecorrido.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/consentimiento` | B2 | `pages/padre/journey/PadreConsentimiento.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/padre/seguimiento` | B2 | `pages/padre/journey/PadreSeguimiento.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/evaluacion` | B2 | `pages/padre/EvalInicial/EvaluacionInicial.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/padre/hijos` | B2 | `pages/padre/journey/camino/MiCaminoAsha.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/progreso` | B2 | `pages/padre/journey/camino/MiCaminoAsha.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/reportes` | B2 | `pages/padre/reports/PadreReportes.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/config` | B2 | `pages/padre/settings/PadreConfig.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/psicologos` | B3 | `pages/padre/Padre/PadrePsicologos.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/agenda` | B3 | `pages/padre/Padre/PadreAgenda.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/mensajes` | B4 | `pages/padre/Padre/PadreMensajes.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/compras` | Fuera: pagos/maqueta | `pages/padre/Padre/PadreCompras.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/padre/recompensas` | B5 | `pages/padre/Sessions/MundoAshaHome.tsx` | Prototipo; sin progreso educativo persistido |
| `/padre/incidencias` | B2 | `pages/padre/PadreIncidencias.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/mundo-asha` | B5 | `pages/padre/Sessions/MundoAshaHome.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/cuentos` | B5 | `pages/padre/MundoAshaCuentos/MundoAshaCuentos.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/canciones` | B5 | `pages/padre/MundoAshaCanciones.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/trabalenguas` | B5 | `pages/padre/MundoAshaTrabalenguas.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/adivinanzas` | B5 | `pages/padre/MundoAshaAdivinanzas.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/juegos` | B5 | `pages/padre/MundoAsha/MundoAshaJuegos.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/laberinto` | B5 | `pages/padre/MundoAshaLaberinto.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/isla` | B5 | `pages/padre/MundoAshaIsla.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/academia` | B5 | `pages/padre/MundoAshaProgreso.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/retos` | B5 | `pages/padre/MundoAshaProgreso.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/insignias` | B5 | `pages/padre/MundoAshaProgreso.tsx` | Prototipo; sin progreso educativo persistido |
| `/mundo-asha/perfil` | B5 | `pages/padre/MundoAshaProgreso.tsx` | Prototipo; sin progreso educativo persistido |
| `/terapeuta` | B3 | `pages/terapeuta/DashboardPage.tsx` | Inventario conectado; revisar acciones internas |
| `/terapeuta/agenda` | B3 | `pages/terapeuta/TerapeutaAgenda.tsx` | Inventario conectado; revisar acciones internas |
| `/terapeuta/pacientes` | B3 | `pages/terapeuta/TerapeutaPacientes/TerapeutaPacientes.tsx` | Inventario conectado; revisar acciones internas |
| `/terapeuta/mensajes` | B4 | `pages/terapeuta/TerapeutaMensajes.tsx` | Inventario conectado; revisar acciones internas |
| `/terapeuta/reportes` | B3 | `pages/terapeuta/TerapeutaReportes.tsx` | Inventario conectado; revisar acciones internas |
| `/terapeuta/analiticas` | B3 | `pages/terapeuta/TerapeutaAnaliticas.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/terapeuta/ingresos` | Fuera: pagos/maqueta | `pages/terapeuta/TerapeutaFinanzas.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/terapeuta/valoraciones` | B3 | `pages/terapeuta/TerapeutaFinanzas.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/terapeuta/config` | B3 | `pages/terapeuta/TerapeutaConfig.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/terapeuta/datos-actividad` | B3 | `pages/terapeuta/TerapeutaDatosActividad.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/terapeuta/incidencias` | B3 | `pages/terapeuta/TerapeutaIncidencias.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/pay` | Fuera: pagos/maqueta | `pages/padre/AshaPay/AshaPayCheckout.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/pay/history` | Fuera: pagos/maqueta | `pages/padre/AshaPay/AshaPayHistory.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/pay/wallet` | Fuera: pagos/maqueta | `pages/padre/AshaPay/AshaPayWallet.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/session` | B3 | `pages/padre/SessionsMeeting/AshaSessionHome.tsx` | Demostración; no videollamada ni sesión clínica |
| `/session/prep` | B3 | `pages/padre/SessionsMeeting/AshaSessionPrep.tsx` | Demostración; no videollamada ni sesión clínica |
| `/session/summary` | B3 | `pages/padre/SessionsMeeting/AshaSessionSummary.tsx` | Demostración; no videollamada ni sesión clínica |
| `/session/rating` | B3 | `pages/padre/SessionsMeeting/AshaSessionSummary.tsx` | Demostración; no videollamada ni sesión clínica |
| `/session/rewards` | B3 | `pages/padre/SessionsMeeting/AshaSessionSummary.tsx` | Demostración; no videollamada ni sesión clínica |
| `/admin` | B1 | `pages/admin/DashboardPage.tsx` | Inventario conectado; revisar acciones internas |
| `/admin/dashboard` | B1 | `pages/admin/DashboardPage.tsx` | Inventario conectado; revisar acciones internas |
| `/admin/cuentas` | B1 | `pages/admin/AdminCuentas.tsx` | Inventario conectado; revisar acciones internas |
| `/admin/terapeutas` | B1 | `pages/admin/AdminTerapeutas.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/operacion` | B1 | `pages/admin/AdminOperacion.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/pagos` | Fuera: pagos/maqueta | `pages/admin/AdminFinanzas.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/contenido` | B1 | `pages/admin/AdminContenido.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/ml` | B1 | `pages/admin/AdminML.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/auditoria` | B1 | `pages/admin/AdminAuditoria.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/admin/config` | B1 | `pages/admin/AdminConfig.tsx` | Revisar: no incluido como persistente; contiene maquetas/pendientes |
| `/padre/dashboard` | B2 | `pages/padre/dashboard/PadreHome.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/pacientes` | B2 | `pages/padre/journey/camino/MiCaminoAsha.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/perfil` | B2 | `pages/padre/settings/PadreConfig.tsx` | Inventario conectado; revisar acciones internas |
| `/padre/mi-camino` | B2 | `pages/padre/journey/camino/MiCaminoAsha.tsx` | Inventario conectado; revisar acciones internas |

## Uso por el equipo

1. Asignar una persona por bloque y un integrador B0. Para dos personas seguir las rondas del plan.
2. Antes de editar, enumerar también los componentes/hooks importados y confirmar que no pertenezcan a otro bloque.
3. Si se unen menús o pantallas, conservar enlaces/alias y actualizar pruebas; no borrar un destino porque no aparece en el menú.
4. Retirar maquetas del recorrido principal; conservar un estado honesto si la ruta aún es accesible.
5. Los datos privados se autorizan en FastAPI. Ocultar un menú o filtrar React no sustituye permisos ni excluye datos de métricas.
6. Al cerrar un bloque, actualizar su clasificación con contrato y evidencia efectiva, sin cambiar retroactivamente este corte de base.
