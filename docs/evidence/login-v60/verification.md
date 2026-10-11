# V60 - Presentación de inicio de sesión

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama `codex/landing-publica`; SHA base `47a5470369191875db68941fee286b035bd06f03` más diff V60. Commit final consultable en Git. Sólo local, sin push ni integración en dev. Fetch: `origin/dev` `498df42` / V58, cinco commits pendientes de conciliación; dev local `396efda` intacto. `.gitignore` previo fuera del commit.

Única fuente de runtime modificada: `frontend/src/pages/auth/login.css`. Tokens v1 encapsulados, Nunito, tarjeta blanca, cabecera suave, violeta protagonista, aqua en beneficios, campos amplios y botón con relieve. Imagen de letras y textos idénticos al baseline. LoginPage y autenticación intactos; Recordarme no adquiere persistencia nueva.

[Antes escritorio](before-desktop.png), [después escritorio](login-1536.png), [móvil](login-375.png), [carga](login-loading.png), [error](login-error.png), [resultados](browser-results.json) y [arnés](verify-browser.cjs). Capturas de ancho 320/375/768/1024/1536; presentación inspeccionada en escritorio y móvil. Para captura completa, html/body/root se expanden temporalmente en el arnés.

Chrome emulado: sin desbordamiento ni botones menores de 44 px, campos de al menos 48 px, un h1, fuente Nunito; textos/arte contra baseline. Vacío sin envío, prellenado de usuario de desarrollo sin contraseña ni autenticación, visibilidad de contraseña, Recordarme, carga y deshabilitado, error 401 simulado y recuperación del formulario, foco, movimiento reducido, rutas de recuperación e inicio. Cero errores JS. Sólo una solicitud de login sintética interceptada; ningún login real, sesión, BD, correo o reserva.

Tipos: PASS. Check:frontend: PASS (354 archivos, máximo 500). Build: PASS (1913 módulos). Diez pruebas existentes en access/providers/login-destination: PASS, tres archivos. Logs en typecheck.txt, frontend-check.txt, build.txt y component-tests.txt. No pruebas backend nuevas ni suite completa repetida: la suite V59 es evidencia histórica separada.

Graphify refresh/check local, 2374 nodos / 103 comunidades, 13 fuentes sin símbolos. Primera comprobación de foco detectó outline anulado por el reset de input: corregido explícitamente en CSS. Segunda ejecución del arnés necesitó esperar la pantalla al volver de recuperación; verificación final aprobada. Sin Safari, lector de pantalla, dispositivos físicos ni prueba de autenticación real.

Preview http://127.0.0.1:5176/login . Backend :8002 con recordatorios desactivados. Revisión visual local, sin auditoría técnica integral nueva. Pendiente aprobación del usuario; no publicar en dev.
