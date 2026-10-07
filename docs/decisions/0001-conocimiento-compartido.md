# ADR 0001: conocimiento compartido para agentes

Fecha: 2026-10-07. Estado: propuesta implementada en rama de trabajo, pendiente de revisión por PR.

## Necesidad
Facilitar la incorporación de colaboradores y reducir lecturas repetidas del código en sesiones de agentes sin modificar el runtime de ASHAKids.

## Decisión
Versionar la skill oficial de Graphify, fijar su versión y ofrecer un comando multiplataforma en `tools/knowledge/`. Generar el mapa localmente con AST y sin llamadas a modelos. Consultar fragmentos con presupuesto inicial de 1500 tokens y verificar el código relevante.

Mantener contexto de producto y decisiones en Markdown versionado. El grafo es derivado y se ignora en Git: evita conflictos, rutas de máquina y snapshots obsoletos. Cada clon lo genera al instalar; CI produce un artefacto descargable. `sources.json` verifica modificaciones, adiciones y eliminaciones de fuentes de aplicación, tests y configuración del flujo.

## Consecuencias
Cada colaborador necesita Python y ejecutar setup. Los agentes reciben instrucciones compartidas pero no se garantiza que todos los clientes las cumplan. No hay ahorro fijo de tokens garantizado. La actualización de documentos necesita criterio humano o del agente; no se deduce automáticamente la intención a partir del código.

No se instalan hooks de Git ni procesos permanentes. El agente regenera después de cambios importantes y CI regenera en pushes y PRs relevantes. El análisis AST no prueba las conexiones HTTP entre frontend y backend ni verifica reglas de negocio.
