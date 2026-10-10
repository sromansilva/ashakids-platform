# Comandos y reproducción del corte17
Ejecutados desde el repositorio; pruebas backend desde backend. Cuentas, pacientes y credenciales privadas originales no son parte de este directorio.

## Selección sin conftest ni BD
backend/.venv313/Scripts/python.exe -m pytest --noconftest -q tests/test_frontend_hosting.py tests/test_backend_hardening.py tests/test_auth_api.py tests/test_auth_security.py tests/test_config_isolation.py tests/test_mensajeria.py tests/test_report_pdf.py tests/test_models.py --basetemp ../tmp/audit17-pytest-final
Resultado:138 passed,19 warnings,9.04s. Primer basetemp restringido produjo12 errores de permisos Windows; nueva carpeta y permisos de proceso permitieron la repetición. No se cargaron las fixtures destructivas.
backend/.venv313/Scripts/python.exe -m pip check
Resultado: No broken requirements found.

## Integración autorizada
PYTHONPATH=backend; backend/.venv313/Scripts/python.exe tmp/audit16/run_hosted_journey.py
101 respuestas HTTPS esperadas. El bootstrap ADMIN existente fue local ASGI; su sesión se cerró. El guion genera una cohorte AUDITORIA17 nueva y termina sus sesiones. El prefijo no es una instrucción para operar sobre cohortes cerradas.
PYTHONPATH=backend; backend/.venv313/Scripts/python.exe tmp/audit16/followup.py --execute-authorized --source tmp/audit17-journey.json --private tmp/AUDITORIA17_20261010_021551-private.json --output tmp/audit17-followup.json
29 respuestas HTTPS esperadas. Solo usuarios/pacientes de la cohorte recién creada.
PYTHONPATH=backend; backend/.venv313/Scripts/python.exe tmp/audit16/extra.py
14 respuestas finales esperadas, esquema READ ONLY,0 diferencias de19 modelos. Los primeros intentos del harness fallaron por sintaxis, Accept HTML omitido y serialización bytes. Corregidos; ninguna credencial se imprime.
PYTHONPATH=backend; backend/.venv313/Scripts/python.exe tmp/audit16/runtime_readonly.py --private tmp/b02-runtime-private.json --output tmp/audit17-runtime.json
ACL/TLS/catálogos en READ ONLY; sin DDL ni probes DML.
PYTHONPATH=backend; backend/.venv313/Scripts/python.exe tmp/audit17-persistence.py
READ ONLY;6 usuarios,2 pacientes activos,2 tratamientos,2 reservas,2 sesiones finalizadas,1 reporte,3 mensajes y0 sesiones auth nuevas sin revocar.

## Harness conservado
Las copias sanitizadas están en harness/. Son evidencia de esta ejecución, no scripts de producción ni una autorización para reescribir la cohorte cerrada. Sus entradas tmp/*-private.json son ignoradas y NO se incluyen en Git. Al reproducir, usar credenciales propias privadas, ejecutar desde la raíz, generar otra cohorte nueva y adaptar IDs/marker de extra.py y persistence.py a ese nuevo manifiesto ANTES de cualquier escritura. No ejecutar pytest general ni phase2_sandbox sobre Supabase: hay TRUNCATE en sus fixtures.
Las escrituras nuevas permitidas fueron API; la lectura posterior fue SQL READ ONLY. No se alteraron permisos, hashes ni datos preexistentes. La contraseña runtime y la cuenta ADMIN inicial permanecen privadas.
