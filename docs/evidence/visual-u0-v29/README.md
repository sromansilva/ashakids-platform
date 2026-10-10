# Verificación de implementación U0 — V29

Fecha: 2026-10-10, America/Lima. Repositorio:
https://github.com/sromansilva/ashakids-platform . Rama de trabajo: piero-dev.
Base V28: e4e53e4ef9dc653d140f8358b8a0d44ca7dfa87c.
Cierre: V29_Correccion_Reportes_Accesibilidad_Acceso; SHA final por Git/referencias remotas.
Entorno Windows, frontend React/Vite, Node/Vitest/jsdom y navegador IAB local.
Verificación de implementación, **no auditoría técnica nueva**. Ninguna fila real o dato clínico.

## Alcance y resultados nuevos

| Comando/caso | Resultado / evidencia |
| --- | --- |
| npx vitest run tests/visual-u0.test.tsx tests/frontend-remediation.test.tsx | Primera regresión dirigida: 30 pruebas correctas; posteriormente se añadió caso422 y se ejecutó suite completa |
| npm test | 25 rutas y263 componentes correctos, 14 archivos Vitest; [salida](frontend-tests.txt) |
| npm run typecheck | Correcto, [salida](typecheck.txt) |
| npm run check:frontend | Correcto:323 archivos, máximo495 líneas; imports, fronteras por rol, rutas/cliente HTTP |
| npm run build | Correcto:1887 módulos; aviso Node DEP0205 sobre module.register; sin error de compilación |
| impeccable detect --json sobre Inp/ClinicalReportEditor/LoginPage | []; detector estático no demuestra accesibilidad integral |
| python tools/knowledge/manage.py refresh | AST local/code-only, no-label;1995 nodos. [Salida](knowledge-refresh.txt), 12 archivos sin símbolos, aviso del extractor |
| python tools/knowledge/manage.py check | Mapa vigente al cierre; no se versiona graphify-out |
| Contraste matemático sRGB | [Seis parejas](contrast.json): textos5.329–5.915, borde4.165–4.374 y blanco/primario5.699 |

La primera suite completa produjo261/262 componentes correctos: providers.test buscaba
el antiguo placeholder, cambiado a etiqueta accesible. Segunda suite completa263/263,
incluido caso de borrador422. No se ocultó ese fallo ni se relajó el contrato backend.
Cambios finales posteriores al pase: nombre del caso y eliminación de dos líneas vacías;
sin cambio de comportamiento. Typecheck y mapa se comprobaron después.

Reporte: regresión recibe Report completo con IDs/fecha y exige exactamente cuatro campos
en PUT, simulando422 por extras; preserva campos no editados. Servicio preserva null, no
muta respuesta. Casos409/422 mantienen borrador; doble envío pendiente permanece bloqueado.
Acceso: etiqueta/autocomplete, ojo nombre/estado/control/valor, disabled y descripción de
error; doble envío, fallo y conservación. Session/auth/backend no se modifican.

## Render e interacción nuevos

Entrada local: http://127.0.0.1:5174/tests/visual-u0.html . Solo desarrollo, sin ruta de
producto ni entrada en build. fetch sintético intercepta PUT y rechaza cualquier petición
no reconocida; login también es sintético. No se inicia sesión ni se escribe en backend.

- Desktop efectivo1280×720: campo16px, borde rgb(124,111,154), ojo44×44. Copia legible,
  error anunciado, contraseña alterna sin borrar valor. Tab alcanza ojo; Enter/Espacio
  lo activan, foco sólido violeta visible (computado1.6px por zoom del navegador).
- Acceso390×844 y320×740 efectivos: lectura/reflujo y controles comprobados. A320 no
  había elementos input/button/h1/p/label fuera del ancho según rectángulos DOM. No
  equivale a inspección de todas las rutas ni a prueba de zoom200%/lector de pantalla.
- Reporte390×844: fallo422 conserva «Borrador sintético conservado» y estado sin guardar;
  reintento200 muestra guardado en el servidor del fixture. Los mensajes pertenecen al
  componente; la captura no acredita persistencia real. Desktop con los cuatro campos.
- Viewport restablecido tras comprobar tamaños. Capturas usan códigos y contraseña de
  prueba, sin credenciales reales ni historias de pacientes; contraseña siempre oculta.

Capturas: [acceso desktop](login-desktop.jpg), [acceso móvil](login-mobile.jpg),
[reporte móvil/error](report-mobile-error.jpg), [reporte desktop/éxito](report-desktop-success.jpg).

## Pendiente y exclusiones

U1–U8: base común, navegación/diálogos, tres muestras, aplicación por módulo, juego/API y
aceptación integral. Inp afecta consumidores compartidos; solo login/reporte se inspeccionaron
visualmente aquí. Sin pruebas HTTP/SQL reales, DB/auth/migraciones, micrófono/hardware,
tema oscuro, aceptación clínica, auditoría PDF, CI remota confirmada ni despliegue.
Conservar evidencia heredada en sus cortes; estas cifras proceden exclusivamente de U0.
