# Conocimiento del proyecto y Graphify

## Primer uso (Windows, Linux o macOS)
Requiere Python 3.12+ y Git (excluir Python 3.14.1 por compatibilidad de NetworkX). Las dependencias transitivas están fijadas en `tools/knowledge/requirements-lock.txt`. Desde la raíz:

```sh
python tools/knowledge/manage.py setup
python tools/knowledge/manage.py check
python tools/knowledge/manage.py query "authenticate_user create_user_session"
python tools/knowledge/manage.py explain "AuthProvider"
python tools/knowledge/manage.py path "authenticate_user" "Usuario"
```

Usar `python3` si ese es el nombre del intérprete. Setup instala `graphifyy==0.9.79` en `.venv-graphify` y genera el mapa inicial. La skill está versionada en `.agents/skills/graphify/`; los clientes compatibles la descubren en la siguiente sesión/turno al abrir este repositorio. Otros clientes pueden seguir `AGENTS.md` y usar el mismo CLI.

## Actualización
```sh
python tools/knowledge/manage.py refresh
python tools/knowledge/manage.py check
```

Refresh reescanea AST (incluye eliminaciones), agrupa sin etiquetas LLM y exporta JSON, informe y HTML. No requiere una API key ni transmite código a un modelo. Instalar dependencias sí requiere acceso a PyPI. El HTML puede cargar bibliotecas externas para su visualización; no abrir/publicar mapas con contenido sensible.

Los comandos query/explain/path rechazan mapas faltantes u obsoletos. Las consultas buscan vocabulario de símbolos: usar nombres como `login`, `authService`, `Usuario`, no depender de traducción automática de preguntas en español. El límite de 1500 tokens es un presupuesto solicitado al CLI, no una garantía del consumo total de la conversación.

## Qué compartir
Versionar skill, configuración, scripts y documentación. No versionar `.venv-graphify/`, `graphify-out/`, `.env` ni datos reales. La skill original y referencias son del paquete oficial; conservar atribución y revisar cambios al actualizar su versión. No regenerar la skill automáticamente en cada setup.

`graphify-out/graph.json` es el mapa persistente de ese clon; `GRAPH_REPORT.md` resume el análisis y `graph.html` permite explorarlo. CI regenera y publica un artefacto temporal en GitHub Actions; cada agente local genera su propia copia para evitar usar mapas de otra revisión.

## Contexto que el mapa no conserva
Actualizar `PROJECT_CONTEXT.md` para estado y pendientes, `architecture.md` para responsabilidades y un ADR para decisiones relevantes. Incluir estos cambios en el mismo PR. No registrar credenciales, información personal de pacientes ni promesas de funcionalidades no verificadas.

## Validación y límites
La integración se propone en `feat/panticona` y se revisa por PR hacia `main`. No funciona dentro de la aplicación y no sustituye pruebas. `.graphifyignore` excluye herramientas, documentos y archivos sensibles; los documentos se leen directamente para evitar costo semántico automático.

Fuente oficial: https://github.com/Graphify-Labs/graphify

## Diagnóstico inicial del grafo

La extracción inicial indexó 144 archivos de código: 1127 nodos, 3080 relaciones brutas y 2998 pares de nodos, agrupados en 64 comunidades. Sin endpoints faltantes, referencias colgantes ni autorrelaciones. El grafo agrupado agrega 82 relaciones que comparten endpoints; consultar el código para distinguir sus tipos. Siete archivos no produjeron símbolos (incluidas algunas entradas TSX e inicializadores). CSS no tiene extractor estructural en esta versión. El mapa es parcial respecto a esos archivos.

La extracción registró 0 tokens de modelo de entrada/salida. Esto no mide ni garantiza el consumo de tokens de conversaciones que consultan el mapa. CI está definido; su ejecución remota se verifica después de subir la rama.
