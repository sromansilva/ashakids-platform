# Evidencia15 - Render HTTPS

Repositorio: https://github.com/sromansilva/ashakids-platform .
Runtime dev/V24:62905fc0480fffd21fb6b2d969592700608d64bb. Fecha Lima2026-10-09.
Los timestamps UTC de la cohorte corresponden al10 de octubre.

https-journey.json:101 respuestas esperadas HTTPS nuevas, sin payloads/credenciales.
https-smoke.json:8 respuestas públicas independientes. persistence.json:SQL READ ONLY.
pooler-tls.json:TLS1.3/CERT_REQUIRED/hostname y rol runtime. scram-preservation.json:
huellas de atributos/ACL/RLS/membresías antes/después; no verificadores SCRAM.
pooler-challenge.json:SCRAM4096/Supavisor2.9.10. render-startup.txt:log filtrado,
sin accesos clínicos. render-live.png:panel público de servicio, sin secretos.
reporte-sintetico.pdf:descarga de la sesión11 nueva, sin pacientes preexistentes.
ci-v24.json:dos jobs graph aprobados, no confundir con suite de aplicación.

Reproducción desde backend con PYTHONPATH apuntando a backend:
.venv313/Scripts/python.exe ../docs/evidence/audit-2026-10-09-15/verify-smoke.py
.venv313/Scripts/python.exe ../docs/evidence/audit-2026-10-09-15/verify-persistence.py
.venv313/Scripts/python.exe ../docs/evidence/audit-2026-10-09-15/verify-journey.py --execute-authorized
El último CREA OTRA cohorte; no ejecutarlo como prueba rutinaria. Requiere autorización
vigente de escrituras nuevas y bootstrap ADMIN privado. Los guiones requieren tmp/
render-runtime-private.json con database_url/ca_file/legacy_ca, no versionado, y .env
privado con credenciales bootstrap. Outputs/contraseñas nuevos quedan en tmp ignorado.
La lectura de persistencia verifica exclusivamente los IDs del corte15; no escribe.
No ejecutar pytest/conftest/phase2_sandbox contra esta base compartida.
Conservar usuarios72..77,pacientes95/96,tratamientos15/16,citas12/13,sesiones11/12,chat6;
excluir AUDITORIA de métricas clínicas. No borrar ni editar cohortes anteriores.
