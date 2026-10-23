# Login V40 — comprobación de continuidad visual

Fecha: 2026-10-10. Repositorio: https://github.com/sromansilva/ashakids-platform .
Base observada: `codex/2do-intento`, SHA `023e21bcc7fd181cf37b3769b07e441b8035278f`;
la presentación V40 revisada es un cambio local posterior a esa base.
Este documento registra comparación visual y lectura de fuentes; no es una auditoría
técnica nueva ni acredita funcionamiento de API, sesiones, permisos o BD.

## Overview

El contrato [LOGIN.md](LOGIN.md) define una extensión ordinaria en modo **Operate**:
acceder mediante código y contraseña dentro del mundo de marca establecido en V38.
Se conserva la tesis «Cristal y luz para acompañar la palabra», Nunito, el logo y los
acentos violeta, naranja y teal descritos en [PRODUCT.md](../../PRODUCT.md) y
[DESIGN.md](../../DESIGN.md).

Se compararon `LoginPage.tsx` y `login.css` con el frontmatter y las secciones de
`DESIGN.md`, y con alcance, materiales, movimiento, foco y procedencia de
`.impeccable/design.json`. Ambos archivos del sistema permanecen intactos: todavía
documentan la landing V38. Las medidas siguientes son valores de la superficie login;
no añaden tokens globales ni amplían automáticamente la adopción a otros roles.
`login.css` los declara como valores literales encapsulados bajo `.asha-login` y sus
componentes, sin una nueva escala de variables CSS.

## Colors

| Función en login | Valor real | Relación con V38 |
| --- | --- | --- |
| Tinta principal / auxiliar | `#1c1135` / `#615274` | Mismas tintas de landing |
| Fondo | `#fafaf9` | Misma base clara |
| Violeta principal / foco | `#7c3aed` / `#5b21b6` | Mismos acentos de marca |
| Selección | Fondo `#ddd6fe`, tinta `#2d1b69` | Mismo vocabulario lavanda/profundo |
| Acción de acceso | `#7c3aed`; hover `#6d28d9`; texto blanco | Acción violeta contextual al formulario; landing usa CTA naranja |
| Luz ambiental | `#ddd6fe9c` y `#ffedd580` en gradientes radiales estáticos | Misma gramática de luz; composición local |
| Panel / campo | `#ffffffb8` / `#fff` | Mayor opacidad en la superficie de entrada |
| Borde de campos | `#d8cfea` | Separación local de controles |
| Error existente | Fondo `#fef2f2`, texto `#991b1b` | Estado funcional del formulario |

Naranja (`#f97316`) y teal (`#0d9488`) siguen presentes en las letras decorativas.
Los tonos de sus gradientes son tratamientos locales de geometría, no una paleta global nueva.

## Typography

La raíz declara `Nunito, system-ui, sans-serif`. Bienvenida: `2.3rem`, peso `900`,
interlínea `1.15`, tracking `-.03em`; pasa a `2rem` bajo `1100px`.
Título del formulario: `1.75rem`, peso `900`, interlínea `1.2`, tracking `-.025em`;
en móvil estrecho usa `1.5rem`. Descripción: `.9rem` / `1.65`; etiquetas:
`.875rem`, peso `850`; entradas y envío: `.95rem`. La bienvenida auxiliar usa
`.94rem` / `1.75`, con longitud limitada a `42ch`.

Estas escalas más contenidas facilitan operar el formulario. No sustituyen los titulares
fluidos de la landing ni incorporan otra fuente. La regla de lectura conserva tinta
definida y separación entre etiqueta, entrada y acción.

## Layout

Cabecera centrada hasta `1180px`, marca a la izquierda y regreso al inicio a la derecha.
La raíz usa padding `28px 48px 44px`. La composición de acceso tiene ancho
`min(1080px,100%)`, margen superior `48px`, dos columnas iguales y gap `90px`.
En `1100px` se reduce a padding `24px 32px 40px` y gap `40px`.

Bajo `850px`, una columna de hasta `460px` prioriza el formulario y oculta toda la
bienvenida decorativa. Bajo `480px`, padding `18px 20px 32px`, margen superior
`28px`, y encabezado del campo contraseña capaz de envolver. Son reglas propias
de acceso; no se transfieren los breakpoints de landing (`767px` / `359px`).

## Elevation & Depth

Panel de entrada: fondo `#ffffffb8`, `blur(18px)` y sombra
`0 18px 50px #4524780d,inset 0 1px 1px #ffffff`.
La leyenda del arte usa `#ffffffcf`, `blur(14px)` y
`0 8px 24px #45247812`. Si falta `backdrop-filter`, ambas superficies pasan a blanco.

La profundidad mantiene luz localizada y sombras difusas de V38. El formulario tiene
superficie estable; no copia la elevación de tarjetas de landing. Los botones transicionan
`background .18s,box-shadow .2s,transform .2s`; los campos, sombra y borde `.18s`.
Al presionar envío se desplaza `1px`. Las letras permanecen en sus rotaciones iniciales.

El indicador de espera usa `login-spin 1s linear infinite` únicamente durante carga.
`prefers-reduced-motion: reduce` elimina animaciones y transiciones de la raíz,
incluido ese indicador, y elimina el desplazamiento al presionar envío. Se documenta
la regla CSS; las capturas estáticas no prueban su comportamiento durante interacción.

## Shapes

Panel: radio `24px`, reducido a `20px` bajo `480px`; padding `38px`, `30px` bajo
`1100px` y `28px 22px` bajo `480px`. Campos y envío: `12px`; botón de visibilidad:
`10px`; bloques de letras: `34px`. Son diferencias de densidad y función permitidas
por el contrato Operate frente al radio de tarjeta de landing (`22px`) y letra (`42px`).
No constituyen una reparación de deriva del sistema global.

## Components

- **Acceso:** etiquetas visibles asociadas mediante `htmlFor`, código limitado a seis
  caracteres y autocompletado `username` / `current-password`. Visibilidad de contraseña
  conserva su estado, con nombre accesible y `aria-pressed`. Error usa `role="alert"`.
- **Foco:** botones y entradas usan contorno `3px solid #5b21b6`, desplazado `4px`;
  el contenedor de campo añade borde violeta y sombra `0 0 0 3px #7c3aed12` con foco interno.
- **Tamaño:** campos con mínimo `52px`, botón de visibilidad `44px`, botones de la raíz
  con mínimo `44px`; recuperación usa excepción móvil de `34px` bajo `480px`.
  La etiqueta Recordarme tiene mínimo `28px` y checkbox nativo de `18px`.
- **Estados:** campos/envío conservan deshabilitado durante carga; botones deshabilitados
  usan opacidad `.6`. Recordarme sigue siendo estado de interfaz, sin persistencia nueva.
- **Desarrollo:** el bloque de tres accesos permanece condicionado por
  `import.meta.env.DEV`; solo rellena el código. Las capturas muestran este bloque de
  desarrollo. Su presencia no representa una incorporación a producción ni una sesión autenticada.
- **Marca y arte:** `AshaKidsLogo` reutiliza el raster heredado
  `frontend/src/assets/ashakids-logo-final-transparent-1.png`, variante header de `44px`.
  No se generó un raster nuevo. «hola» son letras HTML con geometría, gradientes y
  sombras CSS, `aria-hidden="true"`; los iconos proceden de Lucide React existente.
  No se atribuye autoría externa al logo.

El diff de `LoginPage.tsx` conserva `handleSubmit`, `login`, callbacks de éxito/regreso/
recuperación y prefill. Los textos de especialistas, progreso y disponibilidad provienen
del login anterior; esta documentación no los certifica ni introduce claims comerciales nuevos.

## Do's and Don'ts

- Conservar el contrato de esta superficie y los valores de marca heredados.
- Tratar las diferencias de medida y material como decisiones locales de formulario.
- Mantener `DESIGN.md` y `.impeccable/design.json` como referencia V38 sin reescribirlos
  para este corte; no extender automáticamente la presentación a paneles de otros roles.
- Distinguir inspección visual y lectura de código de comprobaciones funcionales.

## Evidencia comprobada y límites

Se abrieron e inspeccionaron los tres PNG y se leyeron sus dimensiones reales:

| Captura local | Dimensiones | Evidencia visible |
| --- | --- | --- |
| `.impeccable/review/login/desktop.png` | `1280 × 900` | Marca, bienvenida/arte, formulario y bloque DEV completos |
| `.impeccable/review/login/mobile.png` | `390 × 843` | Marca y regreso, acceso prioritario, bienvenida oculta y bloque DEV |
| `.impeccable/review/login/user-920.png` | `920 × 811` | Dos columnas en ancho del panel; arte/formulario y DEV visibles |

No se observan regiones en blanco por carga, capturas negras ni cortes de los controles
principales en estas imágenes. El dictamen `ship` del revisor independiente, informado
en el encargo de documentación, corresponde a esos tres viewports. Esta comprobación
no vuelve a abrir una ronda de fixes ni acredita todos los tamaños o estados.

Se verificó la continuidad con V38 mediante sus documentos y sidecar; no se ejecutó
una comparación nueva en navegador con la landing. No se realizaron aquí pruebas de
API, autenticación real, recuperación, persistencia, backend o BD ni nuevas capturas.
El check inicial del documentador indicó mapa faltante/obsoleto. Después, el hilo
principal informó `refresh` completado (2214 nodos, 113 comunidades y advertencias
de 12 archivos sin símbolos), con `check` final previsto antes del commit. Es evidencia
comunicada por ese hilo, no una segunda ejecución del documentador.
Este documento es el único archivo escrito por el documentador; no realizó commit ni push.
