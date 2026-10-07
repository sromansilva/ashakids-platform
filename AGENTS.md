# ASHAKids: instrucciones compartidas para agentes

## Antes de modificar el proyecto
- Leer `docs/PROJECT_CONTEXT.md`; consultar `docs/architecture.md` si afecta la estructura.
- Usar `python tools/knowledge/manage.py check`. Si falta el entorno, ejecutar `setup`; si el mapa está obsoleto, ejecutar `refresh`.
- Para investigar relaciones, usar la skill `.agents/skills/graphify/SKILL.md` y el entorno `.venv-graphify`. En este proyecto los comandos de `tools/knowledge/manage.py` sustituyen la instalación global y los ejemplos bash del proveedor.
- Consultar símbolos concretos: `python tools/knowledge/manage.py query "authenticate_user create_user_session"`. El presupuesto inicial es 1500 tokens. No cargar todo `graph.json` o todo el informe en una conversación.
- Confirmar los hallazgos leyendo los archivos y líneas relevantes. Las relaciones inferidas no garantizan llamadas reales ni conexiones HTTP entre lenguajes. Si la consulta no encuentra resultados, buscar en código.

## Arquitectura y límites
- Frontend React -> HTTP/JSON -> FastAPI -> SQLAlchemy/PostgreSQL. No conectar el frontend directamente a PostgreSQL ni implementar autenticación con Supabase Auth.
- Graphify es una herramienta de desarrollo; no añadirlo al runtime, dependencias de frontend o `backend/requirements.txt`.
- Usar análisis AST local (`--code-only`) y etiquetas sin LLM (`--no-label`) por defecto. No analizar credenciales, archivos de pacientes, logs ni datos reales; respetar `.graphifyignore`.
- No crear usuarios ni modificar tablas reales para pruebas sin una petición explícita. Las pruebas de integración existentes crean sesiones de desarrollo; ejecutarlas solo cuando corresponde y reportar advertencias.

## Al terminar cambios importantes
- Actualizar `docs/PROJECT_CONTEXT.md` cuando cambien funciones, pendientes o limitaciones.
- Actualizar `docs/architecture.md` y crear un ADR en `docs/decisions/` cuando cambie una decisión de arquitectura; no inventar decisiones pasadas.
- Ejecutar `python tools/knowledge/manage.py refresh` después de modificar fuentes y `check` antes de entregar. El mapa generado no se versiona: cada clon lo genera con la misma configuración.
- Ejecutar las pruebas pertinentes, reportando fallos, advertencias y alcance realmente verificado. No afirmar cobertura de todas las pantallas por una compilación exitosa.
