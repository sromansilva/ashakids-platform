# AshaKids — Estado único de implementación visual

Actualización: 2026-10-10, America/Lima. Responsable actual: Piero + asistente en este clon.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Plan: [secuencia vigente](VISUAL_IMPLEMENTATION_PLAN.md). Diseño: [DESIGN](../DESIGN.md).

## Punto exacto de continuación

- Etapa actual: **U0 terminada**, correcciones previas de reporte y acceso/campos.
- Rama: `piero-dev`, seguimiento `origin/feat/piero-dev`; base V28
  `e4e53e4ef9dc653d140f8358b8a0d44ca7dfa87c`, igual a dev/remota personal al iniciar.
- Árbol limpio al inicio. Cierre identificable: **V29_Correccion_Reportes_Accesibilidad_Acceso**.
  Este documento forma parte de ese commit: resolver el SHA con Git y verificar la
  publicación efectiva en dev/personal; la verificación exacta del cierre se entrega en el chat.
  No inferir despliegue ni CI remota a partir del título.
- U0.1 completada: reportInput selecciona cuatro campos al inicializar formulario y
  serializar servicio; con Report completo descarta IDs/fecha y conserva null. Errores
  409/422 conservan borrador; backend extra=forbid intacto.
- U0.2 completada en Inp/LoginPage: ojo con nombre/estado/control44, inputs16/ayudas14,
  foco/borde/contraste, label/feedback y atributos nativos. Login conserva credenciales
  ante fallo, bloquea doble envío, anuncia error y retira Recordarme sin efecto; copy útil.
- **Siguiente acción exacta: U1.1 tokens/primitivas y catálogo aislado.** Revisar DESIGN,
  theme.css/brand/B.tsx, Btn/Crd/Bdg/RemoteFeedback y consumidores; consolidar semántica
  con alias compatibles, estados y foco/tamaño/contraste. Inp ya sirve de primera base.
  No rehacer simultáneamente familia/administración/atención ni iniciar API educativa.
- Después U1.2 navegación/diálogos y U1.3 muestras Centro Familiar/reserva/expediente;
  presentar muestras al usuario antes de ampliar composición al producto.
- U1..U8 pendientes; no se declara aplicado el diseño a todo el producto ni implementado el juego.

## Registro del trabajo y comprobaciones

- Leídos AGENTS/contexto/relevo/plan, DESIGN/PRODUCT y fuentes de reporte/campos/acceso.
- Graphify check vigente; consulta dirigida (1500 tokens) contrastada con fuentes.
- git fetch y referencias: dev = feat/piero-dev = V28. No cambios remotos adicionales.
- Orientación paralela sustituida por secuencial; AGENTS/plan/estado se actualizan junto
  con el primer cierre U0, sin commit documental intermedio por avance incompleto.
- Fuentes: frontend/src/components/common/{ClinicalReportEditor,Inp}.tsx,
  frontend/src/services/clinicalService.ts, pages/auth/LoginPage.tsx, theme/theme.css.
  Tests: frontend-remediation (edición existente, 409/422), providers (labels) y visual-u0
  (servicio/null, ojo/valor/foco, feedback/disabled, doble acceso/fallo). Fixture visual-u0
  HTML/TSX solo DEV; fetch sintético bloquea cualquier petición no reconocida.
- Comprobaciones nuevas: npm test = 25 rutas + 263 componentes (14 archivos) correctos;
  typecheck, check:frontend323, build correctos. Detector Impeccable [] en tres entradas.
  Graphify refresh AST/no-label y check; mapa local ignorado en Git.
- Render IAB con viewport efectivo: desktop1280×720; acceso390×844 y320×740; reporte390×844.
  Texto16, ojo44×44, Tab/foco/Enter/Espacio, error de acceso; reporte422 conserva borrador
  y reintento200 sintético. Se restableció viewport. Seis parejas de contraste calculadas.
  [Evidencias sanitizadas](evidence/visual-u0-v29/README.md), incluidas capturas sintéticas.
- Error real resuelto: primera suite completa falló1/262 por placeholder obsoleto;
  selector por etiqueta y nueva cobertura422; segunda suite completa263/263 pasa.
  Avisos: DEP0205 en build; 12 fuentes sin símbolos en Graphify; LF→CRLF en Git.
- Límites: no revisión visual de cada consumidor de Inp, aceptación HTTP/SQL real,
  recuperación entre dispositivos nueva, hardware/lector de pantalla/tema oscuro o CI remota.
- Sin nuevas consultas/escrituras de BD, cuentas, migraciones o despliegue. No se repiten
  resultados de auditorías previas como si fueran nuevos.

## Relevo antes de terminar una parte

Actualizar arriba estado real, rama/SHA, archivos cambiados, comandos/resultados, fallos,
pruebas no ejecutadas y próxima acción concreta. Indicar expresamente commit/push o
«solo local, sin commit». Si hubo errores, guardar lo suficiente para reproducir sin secretos.
En el mismo clon preservar cambios. Para otro clon, Git solo transmite cierres publicados:
entregar diff sanitizado pendiente por canal acordado antes de que otro compañero continúe.

## Historial de cierres visuales

- U0 / V29: reporte existente y accesibilidad de acceso/campos; aplicación visual parcial.
- V28: especificación documental, sin implementación visual.

## Verificación de transferencia al retomar

```powershell
git status --short
git branch --show-current
git fetch origin
git log -1 --format="%H %s" origin/dev
git log -1 --format="%H %s" origin/feat/piero-dev
```

El cierre V29 debe figurar en dev y la personal de Piero. Si ya avanzó otra persona,
consultar la historia sin reescribirla y confirmar que V29 es ancestro. En otro clon,
actualizar dev por fast-forward y continuar en la rama personal del compañero actual;
no adoptar piero-dev como nombre obligatorio para todos. Preservar diff local primero.
Prompt general en [plan visual](VISUAL_IMPLEMENTATION_PLAN.md#prompt-general-de-continuación).
