---
name: "ASHAKids · extensión visual de landing V38"
description: "Marca Nunito con violeta, naranja y teal; cristal y luz difuminada para la landing pública."
colors:
  landing-purple: "#7c3aed"
  landing-purple-dark: "#5b21b6"
  landing-purple-deep: "#2d1b69"
  landing-purple-light: "#ede9fe"
  landing-purple-mid: "#ddd6fe"
  landing-orange: "#f97316"
  landing-orange-hover: "#fb923c"
  landing-orange-ink: "#351604"
  landing-orange-light: "#fff1e6"
  landing-teal: "#0d9488"
  landing-teal-light: "#ccfbf1"
  landing-ink: "#1c1135"
  landing-muted: "#615274"
  landing-bg: "#fafaf9"
  landing-white: "#ffffff"
  landing-on-dark: "#f7f4ff"
  landing-dark-muted: "#d5c7eb"
  landing-glass: "#ffffffa6"
  landing-field: "#ffffffec"
  shared-border: "#E8E5F4"
  shared-outline-hover: "#F5F3FF"
  shared-nav-muted: "#7C6F9A"
  shared-primary: "oklch(49.1% 0.27 292.581)"
  shared-primary-hover: "oklch(43.2% 0.232 292.759)"
typography:
  display:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "clamp(2.6rem,4.75vw,4.6rem)"
    fontWeight: 900
    lineHeight: 1.06
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "clamp(2rem,3.6vw,3rem)"
    fontWeight: 900
    lineHeight: 1.13
    letterSpacing: "-.03em"
  title:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 850
    lineHeight: 1.25
    letterSpacing: "-.02em"
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.75
  intro:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1.08rem"
    lineHeight: 1.75
  tag:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: ".73rem"
    fontWeight: 700
rounded:
  tag: "7px"
  control: "12px"
  cta: "14px"
  shared-button: "1rem"
  glass: "22px"
  newsletter: "28px"
  letter: "42px"
  avatar: "50%"
spacing:
  compact: "12px"
  heading-gap: "20px"
  grid-gap: "24px"
  mobile-card: "26px"
  card: "28px"
  layout-gap: "32px"
  mobile-gutter-pair: "40px"
  desktop-gutter: "48px"
  section-mobile: "64px"
  section-desktop: "96px"
components:
  button-cta:
    backgroundColor: "{colors.landing-orange}"
    textColor: "{colors.landing-orange-ink}"
    rounded: "{rounded.cta}"
    padding: "14px 26px"
  button-cta-hover:
    backgroundColor: "{colors.landing-orange-hover}"
  button-primary:
    backgroundColor: "{colors.shared-primary}"
    textColor: "{colors.landing-white}"
    rounded: "{rounded.shared-button}"
    padding: "6px 14px"
  button-primary-hover:
    backgroundColor: "{colors.shared-primary-hover}"
  button-outline:
    backgroundColor: "{colors.landing-white}"
    textColor: "{colors.landing-ink}"
    rounded: "{rounded.shared-button}"
    padding: "10px 20px"
  button-outline-hover:
    backgroundColor: "{colors.shared-outline-hover}"
  email-field:
    backgroundColor: "{colors.landing-field}"
    textColor: "{colors.landing-ink}"
    rounded: "{rounded.control}"
    padding: "15px 18px"
  glass-card:
    backgroundColor: "{colors.landing-glass}"
    textColor: "{colors.landing-ink}"
    rounded: "{rounded.glass}"
    padding: "{spacing.card}"
  tag:
    backgroundColor: "#ede9fe80"
    textColor: "{colors.landing-purple-dark}"
    typography: "{typography.tag}"
    rounded: "{rounded.tag}"
    padding: "5px 10px"
---

# Design System: ASHAKids

## Overview

**Creative North Star: "Cristal y luz para acompañar la palabra"**

La identidad conserva Nunito, el logo y los acentos violeta, naranja y teal. La extensión
visual de la landing añade cristal translúcido, iluminación difuminada y volumen suave
a un entorno infantil luminoso. La tinta oscura y los fondos tranquilos sostienen la lectura.

Este corte V38 documenta los estilos implementados en la landing pública. Los estilos
están encapsulados en `.asha-landing`; no constituye una adopción del cristal en los
paneles de familia, profesional o asesor. El contrato de composición y estrategia de esta
pantalla reside en [LANDING.md](docs/design/LANDING.md). Backend, BD, autenticación,
rutas y lógica conservan su alcance previo.

**Key Characteristics:**

- Marca existente con tres acentos reconocibles y Nunito.
- Superficies de lectura tranquilas con cristal y luz localizada.
- Volumen mediante geometría CSS, reflejos y sombras difusas.
- Microinteracciones breves, foco visible y alternativa de movimiento reducido.

## Colors

El violeta identifica la marca, el naranja dirige la acción y el teal aporta variedad
a la ilustración. Los valores normativos están en el frontmatter; los nombres `shared-*`
identifican estilos heredados de los componentes compartidos.

### Primary

- **Violeta de marca:** énfasis de titulares, iconos y elementos geométricos.
- **Violeta profundo:** superficies oscuras de recorrido, newsletter y pie.
- **Violeta oscuro:** foco, etiquetas y detalles del arte.
- **Violeta de botón compartido:** variante primaria heredada de `Btn`, con sus valores
  OKLCH de Tailwind; no confundirla con el violeta hexadecimal de la marca.

### Secondary

- **Naranja de acción:** CTA de acceso y control de newsletter, con tinta cálida oscura.
- **Naranja claro:** atmósfera de las historias ficticias.
- **Naranja de hover:** respuesta visible al apuntar acciones de esta landing.

### Tertiary

- **Teal:** contrapunto de las letras y los iconos de comunicación.
- **Teal claro:** luz ambiental y fondos de retratos geométricos.

### Neutral

- **Tinta:** titulares y contenido principal sobre fondos claros.
- **Tinta secundaria:** párrafos y contenido auxiliar de la landing.
- **Fondo cálido y blanco:** base y superficies compartidas.
- **Blanco cristal y blanco de campo:** transparencias con funciones distintas.
- **Texto sobre violeta profundo:** titulares claros y párrafos lavanda.
- **Borde y tinta de navegación compartidos:** se conservan en los componentes existentes.

**The Lectura Rule.** Las luces y transparencias acompañan la superficie; el texto
mantiene una tinta definida y los ejemplos ficticios conservan su rótulo.

## Typography

**Display Font:** Nunito, con system-ui y sans-serif de respaldo.
**Body Font:** la misma familia; no se incorpora otra fuente.

**Character:** letras redondeadas con titulares compactos y párrafos de interlínea amplia.
El archivo `frontend/src/theme/fonts.css` ya importa Nunito de Google Fonts. Este corte
no añade fuentes. El CSS solicita algunos pesos intermedios, mientras el import existente
declara 400, 500, 600, 700, 800 y 900; el navegador resuelve los pesos disponibles.

### Hierarchy

- **Display:** titular principal con la escala fluida del frontmatter; en móvil usa
  `clamp(2.25rem,8.5vw,3.6rem)` e interlínea `1.12`.
- **Headline:** encabezados de sección; newsletter usa una escala menor
  `clamp(1.8rem,3vw,2.6rem)`.
- **Title:** nombres y títulos de tarjetas; las tarjetas de equipo reducen el título
  a `1.12rem` en móvil.
- **Body:** párrafos de sección con ancho máximo de `48ch`; el texto introductorio
  tiene `44ch`, reducido a `40ch` y `.97rem` en móvil.
- **Tag:** etiquetas compactas para especialidades y experiencia del dato demostrativo.

**The Jerarquía Rule.** Los encabezados usan balance de líneas; los párrafos conservan
la interlínea amplia del frontmatter y los bloques limitan su longitud cuando el CSS lo define.

## Layout

El contenedor de landing mide `min(1180px,calc(100% - 96px))`, centrado. El encabezado
y pie compartidos admiten hasta `1228px`. Las secciones alternan bloques claros con
superficies violeta profunda y el ritmo vertical de secciones definido en el frontmatter.

En escritorio, el hero usa `minmax(0,1.1fr) minmax(0,1fr)`; servicios y FAQ usan dos
columnas de proporción distinta. Equipo e historias usan tres columnas. En `1100px`
se reduce el ancho lateral a `calc(100% - 64px)` y algunos espacios.

En `767px` el contenedor pasa a `calc(100% - 40px)`; los bloques principales se apilan
y las secciones usan el ritmo móvil. El arte queda después del CTA. Equipo conserva un
retrato lateral de `108px`; bajo `359px` pasa a `90px`. Las historias eliminan el
desplazamiento vertical de la tarjeta central. Los detalles específicos de composición
pertenecen al contrato de la landing, no a una regla para otras pantallas.

## Elevation & Depth

La profundidad combina fondos radiales, superficies translúcidas y sombras desplazadas.
El cristal de tarjetas difumina el fondo con `blur(16px)`; el encabezado usa `blur(20px)`.
Un reflejo diagonal tenue se añade por pseudo-elemento. La luz tipo LED se representa
con gradientes difuminados estáticos: no hay destellos ni bucles de iluminación.

### Shadow Vocabulary

- **Cristal en reposo:** `0 12px 40px #4524780f, inset 0 1px 1px #ffffff`.
- **Cristal elevado:** `0 20px 45px #4524781a, inset 0 1px 1px #ffffff`.
- **CTA cálido:** `0 8px 24px #f9731626, inset 0 1px 0 #ffffff80`.
- **Bloque de letra:** `inset 0 3px 5px #ffffff8c, inset 0 -10px 16px #00000012, 0 22px 32px #45247824`.

**The Movimiento Rule.** El volumen reacciona brevemente a la interacción; no usa
animaciones continuas. Con movimiento reducido se eliminan animaciones, transiciones
y desplazamientos de hover; las letras conservan su rotación inicial.

Cuando `backdrop-filter` no está disponible, tarjetas, etiquetas del arte e iconos
decorativos pasan al fondo más opaco `#ffffffed`.

## Shapes

Los controles tienen esquinas suaves, las tarjetas un radio mayor y las letras un
contorno volumétrico. Los avatares y órbitas son circulares. Las medidas reutilizadas
están en `rounded`; los bordes finos separan FAQ, beneficios y marcadores de pasos.

## Components

### Buttons

Acciones reconocibles y contenidas. El CTA de hero usa naranja con tinta cálida,
el botón primario compartido conserva su violeta y el outline conserva su borde claro.
Los botones principales tienen altura mínima de `44px`; el pie conserva enlaces de `32px`. El CTA sube `2px` al apuntar;
los controles de navegación mantienen radio de control. `Btn` conserva su respuesta
de presión heredada `scale(.97)`.

El foco de botones, enlaces y campos usa contorno violeta oscuro de `3px`, desplazado
`4px`. El estado deshabilitado de esta raíz tiene opacidad `.65`.

### Chips

Etiquetas informativas, pequeñas y lavanda, sin comportamiento de filtro ni selección.
La lista permite varias líneas y mantiene espacios de `7px`.

### Cards / Containers

Cristal de lectura con reflejo interior. Historias usan el padding de tarjeta;
servicio usa `34px` y `26px` en móvil. La información de equipo usa `28px`,
con ajustes a `22px` y `22px 18px`. El hover solo se activa en dispositivos con
capacidad de apuntar y eleva `5px` la tarjeta.

### Inputs / Fields

El campo de correo tiene una etiqueta visible asociada y un contenedor claro.
Texto y placeholder usan las tintas documentadas. Mantiene el foco de landing y el
tipo email existente. El botón de suscripción no tiene envío implementado; este
documento registra su apariencia y no certifica un servicio de newsletter.

### Navigation

Encabezado sticky translúcido, enlaces compartidos y acceso naranja. En móvil se
conservan barra y menú existentes, sus nombres accesibles y el espacio seguro del
dispositivo. El enlace "Saltar al contenido" aparece al recibir foco.

### FAQ

Fila separada por borde y botón de ancho completo, con `aria-expanded` y
`aria-controls`. El icono rota al abrir; la respuesta entra con un asentamiento breve.
El contenido, estado y acciones conservan la lógica de `useLanding`.

### Arte de letras

La composición "hola" usa letras HTML, gradientes CSS, órbitas e iconos SVG de Lucide.
Es decorativa y tiene `aria-hidden="true"`. No es una imagen raster ni una foto.
El único raster usado por la landing es el logo heredado
`frontend/src/assets/ashakids-logo-final-transparent-1.png`, mediante `Isotipo`
en navegación/pie. No se conoce aquí su autoría externa; no atribuirla ni declarar
generación nueva. El sidecar registra esta procedencia y que el archivo no fue modificado.

## Do's and Don'ts

### Do:

- **Do** conservar Nunito, el logo existente y la paleta violeta/naranja/teal.
- **Do** mantener el foco visible, los botones principales de al menos 44px y la alternativa de movimiento reducido.
- **Do** limitar esta extensión a la landing y consultar el contrato de cada pantalla antes de adoptarla.
- **Do** conservar los rótulos de ficción y distinguir apariencia de funcionamiento comprobado.

### Don't:

- **Don't** extender estos materiales a los roles sin su encargo específico.
- **Don't** introducir datos clínicos, cifras comerciales o resultados nuevos mediante decoración o textos.
- **Don't** convertir el arte CSS en una afirmación de imagen generada ni atribuir al logo un origen desconocido.
- **Don't** modificar lógica, API, BD, autenticación o rutas como parte de este corte visual.
