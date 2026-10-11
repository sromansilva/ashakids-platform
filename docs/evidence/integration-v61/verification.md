# V61 - Integración local de dev

Repositorio: https://github.com/sromansilva/ashakids-platform . Fecha 2026-10-11, America/Lima. Rama `codex/landing-publica`; padres del merge: local `018dc42d3649f2f309a7dd08dae1689819d83601` y remoto `498df42114833723d4aa55f6cac1ab5b029a5f21`. Commit final V61 consultable en Git.

`git fetch origin dev` aprobado. `git merge-tree --write-tree HEAD origin/dev` detectó un conflicto sólo en architecture.md. `git merge --no-commit --no-ff origin/dev` incorporó código y documentos; se resolvió el bloque final conservando contenido local/remoto, con enlaces explícitos para los dos ADR 0022. No reescritura de commits publicados. RouteAccess y paths se combinaron automáticamente; cambio de contraseña por enlace y retorno seguro coexisten. Sin conflictos pendientes.

Pruebas reales del corte: `npm run typecheck`, `npm run check:frontend` (355 archivos / máximo 500), `npm run build` (1914 módulos), `npm test` (25 rutas / 285 componentes, 19 archivos): PASS. Backend: `python -m pytest tests/test_email_activation_unit.py tests/test_email_newsletter_unit.py -q`: nueve PASS; `python -m unittest tests.test_public_worlds_unit -v`: siete PASS. Sólo unidades con respuestas/métodos simulados; ningún correo, paciente, reserva ni escritura real. Se instalaron pytest/pytest-asyncio del rango ya declarado en requirements-dev, sin cambiar dependencias versionadas. El hook de conftest escribe un rótulo de BD aislada en tmp incluso en unidades: no se usa ese archivo como evidencia de SQL.

Graphify refresh local AST sin LLM: 2400 nodos, 102 comunidades, 13 fuentes sin símbolos; check vigente. Logs de comandos en este directorio. Diff revisado; patrones habituales de secretos revisados antes del commit. `.gitignore` conserva SHA256 `446AD0816A6D88635694F9951950A3805779C7593DCC5E49BCAD0EE38F8C195C` y queda fuera del commit.

No prueba de producción, SMTP, BD real, Zoom, CI remoto ni nueva auditoría integral. Las capturas visuales anteriores son evidencia histórica V56/V59/V60, no capturas nuevas de este merge. Backend local activo no se declara reiniciado ni validado contra esta nueva fuente.

Estado: integración completada en rama local. Dev local `396efda` intacto; origin/dev continúa `498df42`. No publicación: hubo conflicto y la subida se autorizó únicamente si no los había. Próxima acción: aprobación del merge revisado, nuevo fetch para comprobar concurrencia, push sin force y sincronización de ramas.
