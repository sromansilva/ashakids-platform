---
name: AshaKids
description: Una identidad cálida y clara para acompañamiento familiar y práctica infantil
colors:
  primary: "#7C3AED"
  primary-hover: "#5B21B6"
  primary-soft: "#EDE9FE"
  background: "#FAFAF9"
  surface: "#FFFFFF"
  text: "#1C1135"
  text-secondary: "#6B5E8A"
  border-decorative: "#E8E5F4"
typography:
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  control: "16px"
  card: "24px"
  pill: "999px"
spacing:
  compact: "8px"
  normal: "16px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
---

# Design System: AshaKids

## Overview

Estado: sistema maestro propuesto para validación, corte documental V28. No se ha aplicado
al frontend. Contexto funcional: [PRODUCT.md](PRODUCT.md). Base contrastada V27,
`f9df2bc30d56b643af6dd88ab90f6ffdfdbf0fa7`, `piero-dev`.
Repositorio: https://github.com/sromansilva/ashakids-platform .

**Dirección: acompañamiento claro.** La identidad ASHA/Ashi transmite cercanía mediante
Nunito, violeta y curvas suaves; la composición permite entender la próxima acción sin
competir con ilustraciones, indicadores o avisos. La gestión adulta privilegia lectura y
decisiones; el área infantil concentra atención en una tarea y su respuesta inmediata.
Comparten logo, lenguaje, tipografía, colores y componentes básicos.

**Autoridad visual.** Figma es inspiración, según aclaración del usuario. No determina
capacidades, textos, navegación ni valores normativos. El frontmatter conserva valores
extraídos del repositorio como base para la próxima implementación; las tablas de mejoras
indican decisiones propuestas que B0 debe validar y trasladar a tokens una sola vez.
No añadir una segunda paleta independiente por módulo.

| Evidencia | Observado | Uso en la propuesta |
| --- | --- | --- |
| `theme/theme.css`, `theme/brand/B.tsx`, `theme/fonts.css` | Nunito, violeta primario, fondo cálido, texto oscuro, borde lavanda; variantes heredadas divergentes | Conservar identidad; B0 unifica semántica y alias de compatibilidad |
| `Btn`, `Inp`, `Crd`, `Bdg` | Botones/campos redondeados, tarjetas blancas, badges suaves; estilos directos y objetivos pequeños | Reutilizar APIs, normalizar estados/tamaño; corregir semántica |
| Figma Make: portada y acceso | Espacio generoso, marca e ilustración; acceso por correo de demo | Inspiración de tono; producto usa código ASHA y alta administrativa |
| Figma: Centro Familiar, agenda y primer paso de reserva | Banner, tarjetas, calendario y diálogo secuencial | Priorizar próxima acción; no importar porcentajes, ratings ni profesionales ficticios |
| Figma: Mundo ASHA y preparación de Voz Aventura | Ashi, escena ilustrada y panel de instrucciones | Una escena de juego, menos avisos repetidos, controles claros; pájaro requerido |

Inspección acotada en navegador de la referencia; no revisión de todas las vistas ni
aceptación visual de la aplicación. Tokens exactos contrastados en código; no se atribuyen
mediciones CSS nuevas a capturas. [Detalle y límites](docs/evidence/design-plan-v28/README.md).

## Colors

El violeta expresa acción/selección; el texto oscuro sostiene la lectura. El fondo cálido y
las superficies blancas permiten agrupación suave. Turquesa y naranja son acentos limitados,
no acciones principales rivales ni señales clínicas.

### Primary

Usar `primary` para acción principal, enlace y selección; `primary-hover` para interacción
activa y `primary-soft` para fondos de selección. Una acción dominante por sección.
El botón actual usa `violet-700`, distinto del primario CSS: B0 resolverá esa divergencia.
Preferir relleno sólido en gestión. Gradientes solo en ilustración; si contienen texto,
verificar el contraste de cada zona bajo él.

### Secondary and semantic colors — mejoras propuestas

| Token propuesto | Valor | Función y pareja permitida |
| --- | --- | --- |
| `text-muted-accessible` | `#6B5E8A` | Ayuda, placeholder y metadatos sobre blanco/fondo claro |
| `control-border` | `#7C6F9A` | Delimitar controles sobre blanco o `#F5F3FF` |
| `success-text` / `success-bg` | `#166534` / `#DCFCE7` | Confirmación guardada y estados correctos, con icono/texto |
| `warning-text` / `warning-bg` | `#92400E` / `#FEF3C7` | Situación que requiere atención o acción, sin alarmar |
| `danger-text` / `danger-bg` | `#B91C1C` / `#FEE2E2` | Error de campo o acción destructiva |
| `info-text` / `info-bg` | `#5B21B6` / `#EDE9FE` | Información operativa y selección |
| `teal-text` / `teal-bg` | `#0F766E` / `#CCFBF1` | Acento educativo secundario y etiquetas |
| `orange-text` / `orange-bg` | `#9A3412` / `#FFF1E6` | Acento cálido; naranja vivo solo decoración |

### Neutral and contrast

`border-decorative` separa tarjetas; no delimita por sí solo un campo o icono que deba
identificarse. `#9E95B7` permanece como color heredado, no como texto legible nuevo.
No usar naranja vivo con texto blanco pequeño, turquesa vivo con blanco pequeño ni verde
heredado para contenido sin medir primero. Los estados nunca dependen solo del color.

Objetivo de especificación: texto normal ≥4.5:1, grande ≥3:1; información visual necesaria
de controles/estados ≥3:1 respecto del color adyacente. Grande significa al menos 24 CSS px
normal o aproximadamente 18.67 px en negrita. No redondear una razón insuficiente para aprobar.
Fuentes: [contraste de texto W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
y [contraste no textual W3C](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
Razones de las parejas propuestas calculadas localmente en las notas del corte; no equivalen
a conformidad de pantallas, transparencia, hover, foco o gráficos aún no implementados.

## Typography

Nunito con fallback del sistema; conservar lectura si falla su carga. El código actual
importa Google Fonts; no añadir familias ni pesos por pantalla. Evaluar alojamiento local
en una tarea posterior con licencias y tamaño, sin introducir dependencia en este cierre.

Escala propuesta, sobre raíz de 16 px; usar rem y permitir zoom:

| Rol | Tamaño / interlínea / peso | Aplicación |
| --- | --- | --- |
| Display | 32–48 px / 1.15 / 800 | Portada y entrada infantil; nunca para sustituir títulos de formularios |
| Título de página | 28–32 px / 1.25 / 800 | Un h1 significativo por vista |
| Título de sección | 20–24 px / 1.3 / 700 | Bloques de tarea |
| Cuerpo | 16 px / 1.5 / 500 | Instrucciones, informes y campos |
| Etiqueta | 14–16 px / 1.4 / 700 | Formularios y navegación |
| Metadato | 14 px / 1.5 / 500–600 | Fecha, profesional y ayuda |

Evitar textos esenciales de 12 px y párrafos en mayúsculas. Reportes admiten saltos de línea
y palabras largas sin corte de contenido. Cifras alineadas en tablas, sin porcentajes
educativos o clínicos inventados. Para infancia: instrucción de una frase y apoyo opcional;
audio nunca es el único canal.

## Layout

Ritmo propuesto: 4, 8, 12, 16, 24, 32, 48 y 64 px. Los pasos 8/16/24 ya aparecen en
componentes; consolidar el resto en B0. Separar secciones más que elementos de la misma tarea.
Gestión con título/contexto, acción principal, contenido y detalle progresivo; evitar
transformar cada dato en una tarjeta. Informes usan ancho de lectura de unas 65–75 letras.

Rejilla propuesta: contenido máximo 1200 px; márgenes 24–32 px en escritorio y 16 px en
móvil. Dos columnas solo cuando comparación y lectura lo requieren. Formularios en una
columna hasta 640 px; sidebar a partir de 1024 px y drawer por debajo. Son umbrales de
diseño a validar con contenido, no declaración de compatibilidad ya verificada.

Reflujo a 320 CSS px, zoom 200% y revisión 390/768/1280 px. No ocultar desbordamiento de
forma global para fingir reflujo; tabla extensa puede tener región desplazable etiquetada,
con acciones disponibles fuera de columnas ocultas. En móvil mostrar filas como listas
cuando la comparación tabular no sea esencial. Reservar safe areas y espacio para teclado
virtual; no tapar guardar, pausa o salida con barras o widgets flotantes.

Navegación propuesta por rol:

- Familia: Centro Familiar, Mi Camino, Agenda, Mensajes, Mundo ASHA; perfil/ayuda secundarios.
- Terapeuta: Panel, Agenda, Pacientes, Reportes, Mensajes.
- ADMIN: Panel, Cuentas, Pacientes, Citas, Sesiones; reporte clínico desde sesión.

Mantener alias/acceso directo, título de ruta y retorno útil. Sidebar con ruta activa mediante
texto, forma y `aria-current`; drawer con nombre, foco y cierre. Selección por ID del niño
visible en B2/B5; mostrar nombre real autorizado y distinguir homónimos sin exponer datos
innecesarios. El inicio del juego incluye contexto del niño para el adulto.

## Elevation & Depth

Superficies y espacio agrupan la información; sombra discreta solo donde explica una capa.
Propuesta: tarjeta `0 2px 8px rgba(28,17,53,.06)` y diálogo `0 16px 48px rgba(28,17,53,.18)`.
Evitar sombra/gradiente en toda fila. Overlay del diálogo separa el fondo y bloquea su interacción.
B0 documentará una escala única de z-index para navegación, diálogos y avisos; no añadir
valores arbitrarios por bloque. Foco visible con primario sólido de 2 px y separación de 2 px,
verificado contra la superficie adyacente y sin quedar recortado.

## Shapes

Conservar controles curvos y tarjetas suaves: radios del frontmatter, píldora para badge,
no para todo párrafo. Las formas de Ashi/escena infantil pueden ser más expresivas; el marco
de controles sigue siendo familiar. Reutilizar assets ASHA/Ashi existentes, comprobar licencia
y no sustituir logo o mascota por emoji. Ilustración decorativa con alt vacío; información
relevante con alternativa breve. Imagen no sustituye texto de instrucción.

El juego representa un pájaro entre troncos, con siluetas claras, hitbox coherente y sin
detalle visual que oculte obstáculos. El prototipo dibuja mariposa/tubos: planificar adaptación,
sin atribuirla como implementada. Evitar estímulos simultáneos o fondos que comprometan lectura.

## Components

B0 es el único mantenedor de primitivas, estilos y navegación. Dueños de flujos consumen
interfaces congeladas y solicitan extensiones. Componentes existentes se reutilizan antes
de introducir alternativas. Catálogo ejecutable y tres muestras son entregas futuras.

| Componente / origen | Especificación propuesta y aceptación |
| --- | --- |
| `Btn` | Variantes primary/secondary/ghost/outline/danger; acción real, nombre accesible, hover/focus/pressed/disabled/pending. Altura y objetivo táctil mínimo interno 44×44 px; compacto solo si conserva objetivo. Esperar API; no duplicar envío |
| `Inp` + selects/textarea | Etiqueta visible, required explicado, ayuda/error por ID; `aria-invalid`; error conserva borrador. Botón ojo 44×44 con Mostrar/Ocultar contraseña y estado; icono no es nombre |
| Checkbox | Input nativo, etiqueta clicable y estado real; Recordarme se implementa con contrato o se retira, nunca div simulando control |
| `Crd` | Contenedor semántico según contenido; clic navegable con link, acción con button. No usar div clicable como único acceso ni anidar controles en una tarjeta botón |
| `Bdg` | Estado en palabras e icono opcional; paleta semántica; jamás color como única distinción |
| Tabla/lista | Encabezados, orden/filtro claro, fechas legibles; sin columnas o métricas sintéticas. Paginación o carga incremental explícita |
| Pestañas | Activación y foco de teclado, panel asociado y seleccionado; navegación entre páginas mediante links |
| Diálogo / `BookingDialog` | Nombre, `aria-modal`, foco inicial útil y contenido, fondo inerte, Escape y restauración de foco. Cierre con borrador pide decisión; envío pendiente tiene estado explícito |
| `RemoteFeedback` / vacío | Carga indica qué se espera; vacío confirmado distingue sin datos de error/desconectado; reintento solo lectura cuando procede |
| Aviso/toast | Éxito tras respuesta; `role=status` para información, alert para error urgente. Mensaje importante queda también junto a la tarea |
| `ClinicalReportEditor` | Solo los cuatro campos editables; próximos pasos contiene recomendación textual, metadatos fuera del payload. Reporte compartido se explica; texto privado no se introduce ahí |
| `ReportDownload` | Descarga del reporte guardado, estado y error; no presentar borrador como PDF confirmado |
| Juego / canvas | Controles DOM accesibles alrededor de escena; instrucciones, modo, pausa, tiempo y resultado legibles sin canvas. Teclado limitado al juego, nunca capturar Espacio en formularios |

Comportamiento de diálogos basado en [patrón W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
No declarar accesibilidad por añadir solo atributos: probar teclado, cierre y retorno de foco.

Estados obligatorios: inicial, cargando, vacío confirmado, error recuperable, sin permiso,
sesión vencida, envío pendiente, éxito guardado, cambios sin guardar y capacidad incompleta.
En seguimiento: error no muestra agregados de otra identidad; desconocido no se convierte
en cero. En juego: permiso micrófono denegado, no compatible, calibración, ruido, listo,
cuenta atrás, jugando, pausa, final y guardado pendiente/error/confirmado.

Movimiento propuesto: feedback 120–180 ms; panel/diálogo 180–240 ms con desaceleración,
sin desplazamiento decorativo grande. `prefers-reduced-motion` elimina partículas, bobbing,
shimmer y transiciones innecesarias. El vuelo esencial conserva reglas y ofrece modo visual
reducido/alternativa; pausa siempre alcanzable. Sin sonido automático, flashes, confeti
permanente, castigo por salir ni rachas usadas para presionar al niño.

## Do's and Don'ts

- Mostrar acción, contexto del niño y fuente del dato; separar desempeño del juego de valoración clínica.
- Conservar mensajes operativos, privacidad/consentimiento y límites útiles; trasladar arquitectura a docs.
- En UI usar «Horarios de Perú»; no cambiar zona, offsets ni validaciones del servidor.
- No trasladar acceso por correo, ratings, porcentajes, testimonios o logros de Figma como hechos.
- No convertir pagos, IA o reconocimiento de pronunciación en dependencias del recorrido.
- No copiar contraste débil, iconos sin nombre, divs interactivos ni widgets que tapan controles.

Validación pendiente: responsables nominales, contenidos/edades/apoyos, tokens propuestos
y tres muestras (Centro Familiar, reserva, expediente profesional) antes del rediseño.
Primera implementación sigue siendo F16-01 y accesibilidad. Consultar
[plan paralelo](docs/UX_UI_PARALLEL_PLAN.md) y [primer juego](docs/MUNDO_ASHA_PLAN.md).
