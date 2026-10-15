# V83 — navegación y limpieza del hero

Fecha: 2026-10-11, America/Lima. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama: feat/piero-dev. Base auditada de implementación: V82/e925f7164d5a3f95104cffe7852a982da2594c1b.
Ajuste visual limitado; no auditoría técnica académica nueva.

## Cambios

Orden del navbar y de secciones: hero, Cómo funciona, Mundo ASHA, Especialistas,
Preguntas frecuentes. Audiencias, terapias, ejemplos y newsletter conservados después.
Se retiran ambos indicadores con check del hero y la etiqueta Demostración de su burbuja.
Tipografía ligeramente menor, conservando textos, acciones, ilustración y paleta v1.1.

## Comprobaciones nuevas

- npm run typecheck: PASS.
- npm run check:frontend: PASS, 369 archivos, máximo 495 líneas.
- npm run build: PASS, 1924 módulos.
- npx vitest run tests/interactions.test.tsx: PASS, cuatro pruebas existentes.
- impeccable detect --json sobre cinco archivos cambiados: [].
- git diff --check: PASS.
- Navegador IAB 1159×811 y 375×812: orden de enlaces/DOM, ausencia de checks y etiqueta,
  título desktop 55.6416px, título móvil 33px, sin overflow horizontal.
- Cuatro clics desktop y cuatro móvil: hashes correctos dentro de la misma landing;
  diálogo móvil cierra después de cada selección.
- Frontend y catálogo público vía proxy HTTP200 en localhost:5174, API8000 healthy.
- Graphify refresh/check: extracción AST local sin LLM, mapa vigente; 15 fuentes sin símbolos.

Capturas nuevas: desktop.jpg y mobile.jpg. No secretos ni datos de pacientes.

## Advertencias y alcance

Node DEP0205 de module.register y aviso React fetchPriority en PublicIllustration existente.
No se modificaron esas dependencias/componentes. No prueba completa de pantallas ni suite
completa; no login, DML, migraciones, correo, Zoom o reservas. Sin nueva arquitectura.
Vista 5174 usa VITE_API_BASE_URL=/api/v1 sólo en su proceso; .env.local intacto.

## Publicación

Cierre autorizado V83 a dev y feat/piero-dev con push normal, sujeto a comprobación efectiva
de refs al finalizar. No declarar deploy/CI aprobado por un push. Consultar Git para SHA final.
