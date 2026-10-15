# ASHAKids — Guion del recorrido base en escritorio

Corte: 2026-10-11-01. Fecha: 11/10/2026, America/Lima. Rama: feat/piero-dev. Base auditada: bd8c17d79eb81b098535179f021e3b0adbfdfd11 (V89), más el cambio de domingos de este corte.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Este es un guion para ejecutar y exponer, no evidencia de una nueva sesión real completa. Ver docs/audits/auditoria-2026-10-11-01.md para resultados y pendientes.

## 1. Preparar la exposición

Usar frontend http://localhost:5174 y API http://127.0.0.1:8000, o el mismo despliegue actualizado para todos. Comprobar /health/ready y contrato: dia máximo 6 y hasta 70 turnos. Salud disponible no garantiza cada operación ni correo/Zoom.

Preparar ADMIN existente y dos correos controlados para familia y terapeuta. Las cuentas nuevas crean contraseña desde su correo. No usar DNI como contraseña ni presentar códigos rápidos de desarrollo como cuentas recién creadas. El responsable proporciona las credenciales administrativas; los códigos nuevos salen del alta/listado.

| Identidad | Código para login | Contraseña |
| --- | --- | --- |
| ADMIN existente | CODIGO_ADMIN, entregado por el responsable | Privada, ya existente |
| Nuevo tutor | CODIGO_TUTOR, generado al crear la familia | La crea su titular desde el correo |
| Nuevo terapeuta | CODIGO_TERAPEUTA, generado al crear la cuenta | La crea su titular desde el correo |

Son marcadores para completar privadamente, no credenciales válidas. No guardar claves, DNI, correos personales, enlaces de activación o cookies en informes/capturas. Ejemplos sintéticos; altas sólo en la cohorte y entorno autorizado para la exposición.

Coordinar la introducción a una hora real futura. Domingo 11/10/2026 puede atenderse si el profesional publica el turno: inicios 08:00–17:00 a la hora exacta, dentro de 90 días, hora de Lima. Elegir la próxima hora completa que siga libre al ejecutar; no copiar una hora pasada. Iniciar sesión clínica se habilita a la hora de cita. No adelantar reloj ni modificar SQL para saltar esa condición.

Cerrar sesión antes de alternar códigos. Varias pestañas del mismo navegador comparten cookies; no son tres identidades independientes. Una exposición de 15–20 minutos puede mostrar las acciones si la cita ya está coordinada para ese intervalo; no incluye la espera hasta su hora.

## 2. ADMIN: crear la familia

Explicación: “Entramos como administrador con el código asignado. Creamos una cuenta familiar, verificamos sus datos y registramos el primer hijo.”

Cuentas → pestaña de padres/familias → Nueva cuenta. Paso 1: identificación del tutor, DNI según el formulario y correo controlado. Paso 2: contacto, parentesco y dirección. Paso 3: hijo sintético, por ejemplo Alex Prueba, nacimiento 18/04/2020, Masculino y avatar. La fecha determina edad; no escribirla manualmente.

Guardar niño y comprobar su aparición en la lista del formulario; después Crear cuenta. Guardar niño prepara el alta local; la persistencia ocurre al crear la cuenta. Revisar éxito y estado de correo ENVIADO/PENDIENTE/NO_CONFIGURADO. Recargar Cuentas y obtener CODIGO_TUTOR.

**Diferencia con el flujo solicitado:** esta pantalla exige al menos un hijo. El alta individual del tutor existe como API distinta, pero la UI usa registrarFamilia. Hasta resolver REC01, este guion crea familia+primer hijo y demuestra después que el tutor añade otro. No presentar tutor sin hijo como un paso web ya implementado.

## 3. ADMIN: crear al terapeuta

Pestaña terapeutas → Nueva cuenta. Identificación: nombres, apellidos y correo controlado. DNI/Consultar RENIEC están bloqueados; no simular una consulta realizada. Perfil: área, experiencia, idiomas y habilidades textuales. Ejemplo: Comprensión y expresión del lenguaje; Español; Escucha activa. Revisar → Crear cuenta; comprobar CODIGO_TERAPEUTA y estado del correo.

Las altas son independientes y pueden prepararse en paralelo por el equipo. El profesional debe activar su cuenta antes de publicar disponibilidad.

## 4. TUTOR: activar y crear un hijo

El titular abre el enlace recibido y crea su contraseña. Si no llega, /crear-contrasena desde Solicitar enlace permite pedir otro con el código; revisar correo/spam. PENDIENTE o NO_CONFIGURADO no acredita activación: resolver entrega/configuración antes de continuar.

Login con CODIGO_TUTOR y clave creada. Centro Familiar → Para mi familia → Gestionar familia → hijos → Añadir hijo. Registrar Leo Prueba, apellidos Demo, nacimiento 26/08/2020 y avatar. Sexo todavía es texto libre en este modal: escribir exactamente Masculino, Femenino u Otro. Agregar hijo y recargar.

Seleccionar Leo en el Centro Familiar. Registrar su ID como PACIENTE_DEMO en la hoja privada. Todas las citas, reportes, planes y juegos siguientes corresponden a él, no al primer hijo creado por ADMIN.

## 5. TERAPEUTA: publicar domingos

Activar por correo y entrar con CODIGO_TERAPEUTA → Configuración → Disponibilidad. Marcar sólo los turnos dominicales en que atenderá; próxima hora futura libre y otro turno para terapia posterior. Seleccionar día permite marcar todos, pero es opcional.

Comprobar Cambios pendientes de publicar → Publicar disponibilidad. Esperar Disponibilidad publicada. Las familias ya pueden consultarla. Recargar y verificar selecciones. La duración servida por API es la de reserva: por defecto 40 minutos en desarrollo y 45 en producción, según configuración; no calcular un final distinto manualmente.

No se activa domingo automáticamente para todos. Bloqueos, turnos ocupados y no publicados siguen impidiendo reservas. Las citas confirmadas se conservan al cambiar disponibilidad.

## 6. TUTOR: reservar introducción

Para mi familia → Agenda y sesiones → Reservar cita. Elegir PACIENTE_DEMO, profesional creado, domingo con horario publicado y modalidad Virtual. Elegir un turno disponible → Revisar reserva → Confirmar cita.

La primera reserva es INTRODUCTORIA por el recorrido del niño y no exige tratamiento previo. Se guarda CONFIRMADA; no inventar otra aprobación administrativa. Anotar ID_RESERVA y recargar ambas agendas para comprobar niño/profesional/hora/modalidad.

Si no hay turnos: comprobar publicación, hora futura, ausencia y ocupación. No crear otra introducción si existe una pendiente. El servidor vuelve a comprobar disponibilidad al confirmar.

## 7. TERAPEUTA y TUTOR: sesión y Zoom

Profesional abre cita → Registrar sesión: crea ID_SESION asociado a ID_RESERVA. A la hora prevista, Iniciar sesión clínica cambia a EN_CURSO. Abrir enlace de reunión desde el detalle; el tutor usa el enlace de participante de esa misma reserva.

Zoom automático depende del backend/proveedor configurado. Si aparece pendiente/no configurado, el profesional puede usar el mecanismo existente de enlace manual y comprobarlo; no decir que la plataforma generó esa reunión. Si no existe enlace válido, registrar el bloqueo y detener la demostración de Zoom.

Entrar o salir de Zoom no registra asistencia ni cierra la sesión clínica. En atención real el profesional realiza la sesión antes de registrar observaciones. Los textos siguientes son únicamente muestras para una cohorte sintética.

## 8. TERAPEUTA: reporte y asistencia

Abrir reporte de ID_SESION. Completar Observaciones iniciales, Objetivos trabajados, Nivel de ayuda y Próximos pasos. Ejemplo sintético: Participó en actividades de comprensión; Identificar instrucciones sencillas; Apoyo verbal y visual; Practicar actividades asignadas con acompañamiento. Guardar reporte y verificar mensaje de servidor.

Al finalizar atención: Finalizar sesión → Confirmar cierre registra ASISTIO y FINALIZADA. Recargar y revisar estados. Registrar inasistencia es un resultado distinto y no habilita continuidad. Un reporte sólo con Nivel de ayuda no permite publicar plan: necesita observaciones, objetivos o próximos pasos.

## 9. TERAPEUTA: publicar plan

En la misma sesión, Plan de trabajo → Definir plan de trabajo. Nombre: Plan de comprensión — prueba; Área principal: Comprensión y expresión; Sesiones recomendadas:4; Mundos para practicar: Comprensión y expresión; recomendaciones para familia. Publicar plan y anotar ID_TRATAMIENTO.

Recargar: ACTIVO, autor, sesión de origen y mundos correctos. Una sesión conserva una versión de plan; otro se publica en una atención posterior y reemplaza el vigente manteniendo historial. Las sesiones son recomendación, no cuota ni requisito de pagos/juego.

## 10. TUTOR: continuidad y PDF

Centro Familiar → PACIENTE_DEMO → Para mi familia → Actualizar seguimiento. Revisar reporte/plan en las pestañas; Todos los reportes muestra historial y PDF de sesión disponible. Abrir/descargar comprobando niño/profesional/sesión.

Agenda y sesiones → Reservar cita propone ahora TERAPIA con plan vigente. Elegir otro horario futuro publicado → revisar → confirmar. Requiere introducción FINALIZADA/ASISTIO, reporte válido y plan ACTIVO. Zoom abierto o reporte aislado no bastan.

## 11. NIÑO con acompañamiento: juego y premios

Inicio del Centro Familiar, PACIENTE_DEMO → Mi mundo → Explorar. Aparece La Isla de las Palabras por el plan; no los cinco mundos si se asignó uno. La API rechaza intentos en mundos no asignados.

Completar tres niveles básicos. Primer acierto por nivel: +100 XP; completar los tres: medalla y +100 XP adicional. Perfil nuevo con 0 XP alcanza 400 XP y nivel de perfil 3 (1+XP//200). Si ya tenía XP, comparar el valor previo. Nivel del perfil es diferente del número de nivel del juego.

Recargar y reseleccionar niño: conservar niveles/XP/medalla. Repetir un nivel ya premiado no vuelve a sumar. Los tres niveles son libres dentro del mundo asignado; no hay desbloqueo obligatorio 1→2→3. El juego no mide mejoría clínica.

El Centro Familiar muestra juego/resultados, pero aún no ofrece acceso claro al resumen global de XP/nivel/insignias. Para exponerlos, usar provisionalmente /mundo-asha/perfil y /mundo-asha/insignias existentes, con ese niño seleccionado. Documentado en REC06; no atribuir un botón inexistente a la nueva vista.

## 12. Mostrar el resto manteniendo el hilo

Para mi familia: Mensajes con el profesional vinculado, adjunto autorizado si corresponde, Todos los reportes, Terapeutas e Incidencias. ADMIN: Auditoría y seguridad muestra eventos CRUD reales, filtros y detalle; no porcentajes, accesos o alertas inventados. Logos de Configuración no prueban integraciones activas.

Explicar arquitectura: React llama FastAPI por HTTP; API valida identidad/rol/paciente; SQLAlchemy persiste PostgreSQL. Zoom/correo son externos. Mostrar relaciones usuario/tutor/paciente, reserva/sesión/reporte/tratamiento y resultados/perfil/logros sin abrir configuraciones privadas.

## 13. Hoja de aceptación de la exposición

| Paso | Comprobación | Evidencia sanitizada |
| --- | --- | --- |
| Altas/activación | Recarga, código y login/rol correctos | Estado de correo sin token/clave/DNI |
| Hijo | Mismo ID en todas las vistas | Captura sintética |
| Domingo | Publicación real y turno visible al tutor | Respuesta y relectura |
| Introducción | CONFIRMADA → EN_CURSO → FINALIZADA/ASISTIO | IDs/estados de cohorte autorizada |
| Reporte/plan | Guardados, plan ACTIVO de esa sesión | Relectura/PDF sanitizado |
| Continuidad | TERAPIA con plan correcto | Reserva en ambas agendas |
| Juego | Premios únicos persistentes tras recarga | XP previo/final, nivel y medalla |
| Permisos | Identidades ajenas no acceden | Sólo cuentas de prueba autorizadas |

Este corte automatizado no completó esta hoja con escrituras clínicas reales. El informe distingue verificaciones ejecutadas de aceptación humana pendiente.
