# ASHAKids: landing pública V53

Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama local `codex/landing-publica`, incluye `origin/dev` a6eda9f (V51 documental Zoom).
Sin push ni cambios en la rama dev local, pendiente de aprobación.

Contrato: [sistema v1](docs/design/ashakids-ui-kit-v1/ASHAKIDS_DESIGN_SYSTEM.md)
y [kit](docs/design/ashakids-ui-kit-v1/ASHAKIDS_UI_KIT.png).
Tokens/controles en `landing-kit.css`, composición previa en `landing.css` y nueva
composición en `landing-reference.css`, siempre bajo `.asha-landing`.
`landing-continuity.css` extiende esa escala/materiales a todas las secciones restantes.
Nunito conserva la carga existente. Btn/Crd no cambian; paneles privados conservan tema.
Paleta base: violeta #7C3AED/#5B21B6, aqua #0F766E, naranja #F97316, lavanda #EDE9FE,
fondo #FAFAF9, tinta #1C1135 y texto secundario #615274. Cristal blanco84%, radios24px,
botones con relieve inferior4px. Hero escritorio53–76px/1.02, títulos48px, tarjetas26px.

V52 adapta expresamente los textos visibles del hero, navegación de escritorio y tres
tarjetas a la nueva petición del usuario. Conocer ASHAKids abre Sobre Nosotros; Explorar
Mundo ASHA abre el mundo público; Familias abre login; Terapeutas abre Especialistas.
Los destinos anteriores permanecen en tarjetas, hero o pie; Recursos se añade sólo
al pie de la landing. Las demás secciones, FAQ, atribuciones, newsletter y ejemplos
ficticios conservan su contenido anterior.

Wordmark Nunito violeta/naranja con rayos CSS; el archivo oficial Isotipo se conserva
en el proyecto, pie y otras páginas. Hero con Ashi robot, bloques A/B, alfombra y escena
infantil. Burbuja y onda estática HTML/SVG. Familia, terapeuta y libros/estrella usan PNG
transparentes recreados con ImageGen desde la referencia autorizada. No son exportaciones
originales del archivo fuente; permanecen pequeñas diferencias de detalle.
Procedencia e instrucciones en [prompts](docs/evidence/landing-v52/prompts.md).

Tarjetas de audiencia son botones con destinos existentes. Foco visible, controles
de al menos44px y movimiento reducido verificados en escritorio. La fidelidad responsive
V52 queda diferida por prioridad explícita del usuario; capturas móviles V51 son históricas.

La landing monta una sola instancia del asistente con `appearance="landing"`.
Dock Ashi/WhatsApp reutiliza hook, panel y URL existentes, sin cambiar su lógica.
Robot también como avatar del panel público; avatares privados intactos. Panel rotulado
Demo y conversación identificada como demostración. Escape devuelve foco al trigger.
No se implementó IA remota, voz ni envío de newsletter. WhatsApp conserva el enlace
externo, sin envío automatizado ni verificación de entrega.

Ver [comprobaciones y capturas](docs/evidence/landing-v52/verification.md).

## Continuidad visual V53

El hero y las tarjetas de audiencia aprobados se conservan. Pasos con imágenes y
conectores decorativos; terapias con tarjeta ilustrada; equipo con cabecera ilustrada
y retratos de iniciales originales, sin atribuir fotos genéricas a profesionales.
Ejemplos ficticios con cristal cálido y aviso visible; FAQ con Ashi decorativo y acordeón
existente; newsletter ilustrada y formulario blanco; pie con escala tipográfica mayor.
Todo el contenido y nombres/estados de controles se compararon contra V52 y se conservan.

Escritorio: títulos de sección40–48px, títulos de tarjeta27px, cuerpo17–18px,
botones52px, radios20–32px y espaciado vertical84px. Columnas inferiores dejan136px
libres a la derecha para el dock. Los assets de V52 se reutilizan con carga diferida;
no se generaron imágenes adicionales ni se aumentó el peso del conjunto de PNG.
Sin animaciones nuevas ni cambios funcionales o estilos de paneles privados.

Ver [evidencia V53](docs/evidence/landing-v53/verification.md) y capturas de cada sección.
Responsive sigue diferido; las pruebas de componentes V52 son evidencia histórica,
no se volvieron a ejecutar en este corte de presentación.
