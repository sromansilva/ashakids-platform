# Verificacion local de APIs con Postman

Fecha: 2026-10-08  
Alcance: todas las operaciones expuestas por el documento OpenAPI actual del backend.

## Resultado

La coleccion local de Postman finalizo correctamente:

| Medida | Resultado |
| --- | ---: |
| Operaciones OpenAPI verificadas | 32 de 32 |
| Solicitudes principales de la coleccion | 2 |
| Aserciones | 109 |
| Aserciones fallidas | 0 |
| Duracion de la ejecucion | 1.377 s |

Las dos solicitudes principales son orquestadoras: ejecutan secuencias HTTP adicionales mediante `pm.sendRequest` para conservar una prueba reproducible de todos los roles y recursos en una sola coleccion local.

## Cobertura comprobada

- Raiz, `health` y `ready`.
- Autenticacion: inicio de sesion, identidad actual y cierre de sesion.
- Perfiles de administrador, padre y terapeuta.
- Gestion de usuarios, pacientes, tratamientos, citas y sesiones.
- Reglas de acceso por rol para administrador, padre y terapeuta.
- Transiciones validas de sesion: iniciar, registrar reporte, cerrar y consultar reporte.
- Respuestas esperadas de error: acceso anonimo (`401`), reporte inexistente (`404`) y transiciones fuera de estado (`409`). Esas respuestas fueron aserciones exitosas, no fallas de la ejecucion.

## Aislamiento y seguridad

La ejecucion uso una instancia PostgreSQL temporal en `127.0.0.1` y un backend temporal en el puerto `8001`. Se poblaron solo identidades y datos sinteticos de prueba. No se consulto, modifico ni se uso la base de datos remota de Supabase.

Al terminar la verificacion se deben detener el backend temporal y la base temporal. El backend habitual del equipo, si existe en el puerto `8000`, no forma parte de esta limpieza.

## Artefactos reproducibles

- Coleccion: `postman/collections/ASHAKids Backend Local Verification/`
- Entorno: `postman/environments/ASHAKids Local Isolated.environment.yaml`
- Preparacion segura de datos: `backend/scripts/setup_postman_sandbox.py`

La contrasena sintetica se inyecta en tiempo de ejecucion; no se guarda en la coleccion ni en el entorno. La coleccion no fue publicada ni sincronizada a Postman Cloud.
