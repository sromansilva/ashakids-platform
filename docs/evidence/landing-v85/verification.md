# V85 — especialistas informativos

2026-10-11, America/Lima. Rama feat/piero-dev; base V84/6e7dd7ea9dd7f8efdc3cbb4cbab6dddceae6e10f.
Repositorio: https://github.com/sromansilva/ashakids-platform . Ajuste visual, no auditoría nueva.

Se eliminan Agendar de las tres tarjetas, navegación a login, prop go e imports no usados.
Sin cambios en dashboard, reservas, API ni BD.

PASS: npm run typecheck; npm run check:frontend (370 archivos/máximo495);
npx vitest run tests/interactions.test.tsx (cuatro pruebas); detector impeccable[];
git diff --check; Graphify refresh/check AST local (quince fuentes sin símbolos).
IAB1480×811: tres tarjetas y cero botones en #landing-specialists; captura
specialists-desktop.jpg. No datos personales ni secretos.

No build, móvil, suite completa, backend, login, correo, Zoom, DML o migraciones nuevos.
No certificación funcional de reservas ni CI/deploy. Cierre V85 y publicación normal
a dev/feat/piero-dev autorizados; comprobar resultado efectivo en refs Git.
Siguiente: revisión visual del usuario.
