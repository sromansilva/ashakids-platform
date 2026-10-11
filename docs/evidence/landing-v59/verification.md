# V59 - Terapeutas en landing, footer y favicon

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama `codex/landing-publica`; SHA base `4740ffe132e716396dcb4a744b2c5a093620653e` más el diff V59. Commit final local consultable en Git. Sin publicación ni integración hacia dev; `.gitignore` del usuario excluido.

Se retira Ver todos del apartado de terapeutas. Explorar terapeutas, tarjeta Terapeutas y Especialistas del footer apuntan a `#landing-specialists`; no abren el directorio separado. Agendar conserva el login y no crea reservas. Mundo ASHA del footer apunta a su sección. La ruta pública de especialistas se conserva para enlaces externos existentes.

Footer de landing con fondo lavanda, tarjeta de marca y logo oficial, rótulo violeta/naranja, columnas legibles y controles de 44 px como mínimo. Variante encapsulada; footers de otras páginas conservados. Favicon y apple-touch-icon usan una copia exacta del PNG oficial, sin regenerar ni modificar la marca. Se conserva la tipografía y el contenido del footer.

Chrome local con catálogo público real: anchos 320, 375, 768, 1024 y 1536 px; sin desbordamiento, logo cargado y cero errores JS. Tres entradas de terapeutas verificadas con pathname `/` y hash de sección. Agendar abre `/login`. Footer de `/especialistas` mantiene variante anterior. Favicon 200 PNG idéntico al archivo oficial. [Resultados](browser-results.json), [arnés](verify-browser.cjs), [footer escritorio](footer-1536.png), [footer móvil](footer-375.png) y [terapeutas](therapists-desktop.png). Se inspeccionaron las capturas de escritorio y móvil. En capturas de sección se ocultan temporalmente nav/dock/skip para inspeccionar el componente completo.

Tipos, check:frontend y build aprobados (354 archivos / máximo 500; 1913 módulos). Suite final: 25 rutas y 283 componentes en 19 archivos, PASS; log en `frontend-tests.txt`. La primera ejecución falló en una expectativa del botón/directorio antiguo; `interactions.test.tsx` se ajustó al nuevo comportamiento solicitado. Resultado inicial conservado en `frontend-tests-initial.txt`. Graphify refresh local: 2374 nodos, 103 comunidades; 13 fuentes sin símbolos; check vigente. No hay pruebas backend nuevas: backend, BD, registro, reservas, SMTP y permisos no cambiaron. No login real, envíos ni escrituras. No auditoría técnica integral nueva.

La primera revisión del navegador encontró el preview detenido; se reiniciaron Vite :5176 y API :8002 con recordatorios desactivados. Preview actual: http://127.0.0.1:5176/ . Pendiente revisión del usuario; no publicar hasta autorización explícita.

Fetch de cierre aprobado: `origin/dev` avanzó a `498df42` / V58 con cinco commits nuevos de cuentas, correo y documentación. Se usa V59 como siguiente versión. Esos cambios no se integran en este ajuste visual local. Dev local sigue en `396efda`; ramas divergen respecto al remoto.
