# Notas del corte documental V28 — diseño y juego mínimo

Repositorio: https://github.com/sromansilva/ashakids-platform .
Base leída: V27 `f9df2bc30d56b643af6dd88ab90f6ffdfdbf0fa7`, rama `piero-dev`.
Corte iniciado el 2026-10-09 (Lima). Commit final identificable por
`V28_Actualizacion_Documentacion_Diseno_Juegos`; obtener SHA desde Git, no es el SHA base.
Planificación/revisión documental; no auditoría técnica nueva ni pruebas clínicas.
No se requiere un informe académico/PDF nuevo para esta tarea documental.

## Alcance y fuentes

Leídos contexto, plan/relevo, arquitectura, plan paralelo/matriz y Mundo ASHA. Graphify
consultó `useVozAventuraGame ClinicalReportEditor useSelectedFamilyPatient` con presupuesto
por defecto 1500 tokens: 42 de 148 nodos visibles de un mapa de 1986 nodos. La truncación
se resolvió leyendo fuentes concretas; no se cargó graph.json completo ni se infirieron HTTP
desde aristas. `python tools/knowledge/manage.py check`: vigente antes de trabajar.

Contrastes de fuentes actuales:

- `frontend/src/theme/{theme.css,fonts.css,brand/B.tsx}` y comunes `Btn`, `Inp`, `Crd`, `Bdg`:
  identidad, divergencia primary CSS/violet-700, muted débil, borde decorativo y semántica.
- `ClinicalReportEditor`, `clinicalService`, `types/clinical.ts`, `backend/app/schemas/clinica.py`
  y `services/sesiones.py`: cuatro campos editables; salida añade tres metadatos; lectura
  sigue autorización de sesión/cita. No se modifica el backend estricto.
- `useSelectedFamilyPatient`, `familyTracking`, `FamilyTrackingPanel`, `BookingDialog`:
  selección por ID, reportes existentes y texto horario; sin disponibilidad publicada nueva.
- `useVozAventuraGame.ts`, `VozAventuraGameVozAventura.tsx`, `voiceConfig.ts`: estados/
  analizador, calibre 1600 ms, 28 s/intentos 2/Mateo, mariposa/tubos, física por frame y
  colisiones `safe`. Lectura estática, sin probar hardware ni activar micrófono.
- `backend/scripts/db_creation.sql`: relaciones actividades→mundos→niveles y resultados
  por paciente/nivel; no prueba del esquema vivo. No modelo/endpoint educativo publicado.

## Inspiración Figma, inspección acotada

Referencia proporcionada:
https://www.figma.com/make/Szmh1QEUMsfbVrbmnHWeMr/Ashakids?fullscreen=1&code-node-id=0-9 .
El usuario aclara que sirve solo de inspiración para criterios propios de UI.
Se utilizó IAB sin modificar el archivo Figma, sin publicar/copiar diseño ni enviar datos reales.
Se abrió el acceso rápido de demo familiar existente; no se ingresaron credenciales propias.

| Vista/estado observado | Hallazgo útil / límite |
| --- | --- |
| Portada | Tono cálido, jerarquía amplia y marca; copy de servicios/certificaciones no acredita capacidades reales |
| Acceso | Formulario redondeado, ojo sin nombre visible en AX, Recordarme como contenedor; correo/demo no es autenticación actual |
| Centro Familiar | Banner ilustrado y tarjetas; Mateo/Laura, cifras 12/8 de 10/racha/gráfico son demo, no fuente de datos |
| Agenda | Calendario y vacío visible; objetivo de navegación claro, controles pequeños no se adoptan como regla |
| Reserva, primer paso | Diálogo con progreso y selección; ratings/personas de demo no se importan ni prueban contrato de disponibilidad |
| Mundo ASHA | Identidad Ashi y mapa; avisos repetidos, 47 estrellas/nivel 3/racha 7 son prototipo |
| Voz Aventura, preparación | Escena, instrucciones y dos modos; mariposa y 28 s/Mateo, sin partida/micrófono iniciado |

No se inspeccionaron todas las pantallas, modo profesional/admin ni todos los pasos del
diálogo. No revisión móvil/responsive exhaustiva: capturas del viewport disponible.
Valores hex/fuentes exactos provienen del repositorio y del antecedente de portada declarado
por el usuario; no se simula una extracción de estilos computados de todas las vistas.

## Contraste de parejas de especificación

Cálculo Python local sobre colores opacos sRGB, fórmula de luminancia relativa W3C:
canal c/255 linealizado con c/12.92 si c≤0.04045, o ((c+0.055)/1.055)^2.4;
L=0.2126R+0.7152G+0.0722B; razón (Lmayor+0.05)/(Lmenor+0.05).
Presentación a tres decimales; aceptación usa valor sin redondear.

| Pareja | Razón | Uso propuesto |
| --- | ---: | --- |
| #7C3AED / #FFFFFF | 5.699:1 | Texto blanco de primario |
| #6B5E8A / #FFFFFF | 5.844:1 | Ayuda/texto secundario |
| #6B5E8A / #FAFAF9 | 5.596:1 | Texto secundario sobre fondo |
| #7C6F9A / #FFFFFF | 4.568:1 | Borde de control |
| #7C6F9A / #F5F3FF | 4.165:1 | Borde de control; no texto normal sobre ese fondo |
| #166534 / #DCFCE7 | 6.492:1 | Éxito |
| #92400E / #FEF3C7 | 6.367:1 | Advertencia |
| #B91C1C / #FEE2E2 | 5.296:1 | Error |
| #5B21B6 / #EDE9FE | 7.566:1 | Información |
| #0F766E / #CCFBF1 | 4.857:1 | Turquesa semántico |
| #9A3412 / #FFF1E6 | 6.603:1 | Naranja semántico |
| #9E95B7 / #FFFFFF | 2.824:1 | Heredado, no texto normal propuesto |
| #E8E5F4 / #FFFFFF | 1.239:1 | Borde decorativo, insuficiente como única identificación de control |

Estas parejas no son una prueba WCAG de la aplicación. No cubren alfa, gradientes,
estados interactivos, fondos diferentes o render final. No confundir 2.824:1 calculado aquí
con F16-02 2.575:1 histórico sobre otra pareja/contexto.
Fuentes consultadas: [texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[controles](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) y
[diálogos](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Comandos, incidencias y límites

- `git status --short --branch`, `git branch -vv`, `git log -10 --oneline`, `git remote -v`,
  `git ls-remote --heads origin dev feat/piero-dev`: limpio y referencias iguales a V27 al inicio.
- `git fetch origin`, `git merge --ff-only origin/dev`: actualizado, sin cambios.
- Impeccable `context` ejecutado una vez: PRODUCT/DESIGN ausentes; fuentes de código y
  petición explícita cubren contexto. Se crean propuesta y sidecar documental de extensiones;
  catálogo/snippets y decisiones de construcción visual quedan para B0 posterior.
- Primeras lecturas de tres rutas supuestas y actividades.py fallaron; `rg --files` localizó
  B.tsx/theme.css/clinica.py reales y SQL educativo. No archivo actividades.py creado.
- Un parche rechazado por contexto distinto no modificó el archivo; siguiente parche aplicado.
- Figma no accesible con web, sí por IAB. `supabase.com/changelog.md` devolvió tipo MIME
  no admitido por web; no implementación/versiones Supabase deducidas de ese fallo.
- Skills Graphify/Impeccable/Supabase/Postgres consultadas; ninguna consulta de filas,
  escritura, DDL, prueba destructiva o migración. Arquitectura vigente conservada; contrato
  educativo aún propuesto, no decisión arquitectónica adoptada ni ADR ficticio.
- No suites runtime/build/frontend/backend nuevas. Resultados de auditorías16/17 son
  heredados; no se copian como evidencia obtenida nuevamente.
- Primer intento de commit rechazado por identidad de autor no configurada. Cinco commits
  previos coinciden en Piero Anticona/correo noreply; se usa esa identidad mediante opciones
  `git -c` por invocación. No cambio global de configuración. `gh` ausente del PATH:
  no ejecución/comprobación nueva de CI por ese CLI. El workflow de mapa filtra rutas de
  fuentes/config y no exige ejecución por este conjunto documental.

Verificación documental ejecutada: 76 referencias de enlaces locales, cero ausentes;
fences/headings canónicos y JSON del sidecar correctos. `git diff --check` sin errores;
escaneo de patrones en añadidos sin hallazgos (no garantía absoluta), alcance solo documental.
Graphify check final vigente; sin refresh porque no se modifican fuentes runtime.
Git avisa conversión LF→CRLF del plan Mundo ASHA, sin conflicto ni pérdida de texto.
Publicación Git debe comprobarse después del push; no confundirla con despliegue Render.
