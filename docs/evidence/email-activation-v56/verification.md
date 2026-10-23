# Verificación funcional V56 — 2026-10-10, America/Lima

Repositorio https://github.com/sromansilva/ashakids-platform . Rama codex/2do-intento;
base64cbb3599aa5d705a345ef0fabcfc11fdf384dbd. Windows, backend/.venv, frontendNode/Vite.
No auditoría nueva ni PDF. No datos/usuarios reales creados ni secretos guardados.

- pytest test_email_activation_unit.py test_email_newsletter_unit.py:9passed.
  Token inválido/manipulado/vencido/noASCII, correo/cuenta alterados, consumo/reuso,
  política12–128, pendiente sinlogin, inexistente sin envío. DB/Gmail son mocks.
- pytest test_family_activation.py:9skipped por falta de URL local explícita.
  Concurrencia y revocaciónSQL quedan preparados, no comprobados con PostgreSQL.
- Vitest family-activation:11passed; suitecompleta18archivos284passed sobre árbol local
  con cambios previos de adjuntos. No atribuir esos adjuntos a V56.
- routing:25passed. typecheck/checkfrontend/build:correctos (1903módulos).
- Impeccable detect:trescomponentes []. Capturas efímeras inspeccionadas escritorio1280x720
  y móvil390x844 sin desbordamiento. No se creó/cambió contraseña usando UI real.
- Graphify refresh:2396nodos,124comunidades,code-only,noLLM;12archivos sin símbolos habitual.
- AvisoNodeDEP0205 heredado; fallos funcionales nuevos observados:ninguno en estas pruebas.
- Render leído:V55Live, inventario sinGmail. OAuth/recepción/alta compartida no verificados.
  Siete variables privadas guardadas con autorización posterior; deployV55 iniciado.
  Recepción y deploy del código nuevo por verificar. No equivale a correo recibido.


## Resultado Render — cierre documental V57

Variables guardadas con autorización expresa; siete nombres persistidos sin mostrar valores.
V56/66754c5Live,dep-db5fq4jrjlhs73aoh0d0,38.5s. Readiness200 y OpenAPI200 con ambas
operaciones presentes; páginaHTTPS visible sin sesión. Véase https-smoke.json y render-live.png.
No OAuth/envío/recepción real ni pruebas de activación sobre BD compartida. El fallo inicial
de identidadGit se corrigió con la identidadCodex usada en los dos commits previos; push a
ambas ramas confirmado. No secretos en archivos. Cambios de adjuntos preservados aparte.
