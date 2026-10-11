# ASHAKids: landing integrada V56

## Mundo ASHA: mapa web, corte world-map-v70

El módulo familiar extiende la identidad de ASHAKids con un mapa de cinco mundos,
fondo de archipiélago y los cinco PNG de landing mediante sus WebP existentes.
Hover/foco, rutas de niveles cuadrados y juego en dialog; permisos y progreso preservados.
Detalles y alcance en [diseño de Mundo ASHA](docs/design/mundo-asha-web.md).
Escritorio verificado; responsive diferido por el usuario. No reemplaza los estilos de landing.

Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama local `codex/landing-publica`, incluye `origin/dev` ca9e1b3 (V54).
Sin push ni cambios en la rama dev local, pendiente de aprobación.

Contrato: [sistema v1](docs/design/ashakids-ui-kit-v1/ASHAKIDS_DESIGN_SYSTEM.md)
y [kit](docs/design/ashakids-ui-kit-v1/ASHAKIDS_UI_KIT.png).
Tokens/controles en `landing-kit.css`, composición previa en `landing.css` y nueva
composición en `landing-reference.css`, siempre bajo `.asha-landing`.
`landing-continuity.css` extiende esa escala/materiales a todas las secciones restantes.
Nunito conserva la carga existente. Btn/Crd no cambian; administración se migra expresamente en V67.
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
No se implementó IA remota ni voz. El newsletter funcional de dev se conserva;
sus estados se verificaron con respuestas simuladas, sin envíos reales. WhatsApp conserva el enlace
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

## Ilustraciones y Mundo ASHA V55

Las ocho ilustraciones inferiores ahora son escenas distintas: registro familiar,
búsqueda, videollamada, juego de lenguaje, equipo de cuidado, padre/hijo con bloques,
Ashi sentado y sobre de consejos.14PNG únicos del lote-v54 generados por ImageGen:
[prompts y procedencia](docs/evidence/landing-v55/imagegen-manifest.json).
Hero/audiencia previos intactos. FAQ mantiene preguntas/respuestas y acordeón, con
cristal lavanda/aqua y nueva pose del mismo robot. Feedback/consentimiento del newsletter
remoto adaptado a fondo claro conservando formulario, validación y petición.

Mundo ASHA público adopta `.asha-landing.asha-ui.asha-mundo` y `public-mundo.css`, hero
archipiélago y cinco ilustraciones independientes. Datos/estados/reintento/login conservados;
ningún cambio al juego privado. Nav adopta marca sólo con `presentation="asha"` o landing.
Nunito, paleta, foco, reduced-motion y relieve se reutilizan; desktop verificado en
1536/1440/1280. [Verificación](docs/evidence/landing-v55/verification.md).
Responsive y optimizaciónPNG quedan diferidos. No publicar hasta aprobación explícita.

## Integración y adaptación V56

Sección Descubre Mundo ASHA después de pasos:cinco ilustraciones existentes,3+2centradas,
2columnastablet/1móvil. WorldCards,PublicDialog y PublicIllustration reutilizables;sinotrohero.
Navegación anclas y offsets;CTAhero Solicitar cuenta/manual y Explorar terapeutas.
ServicioConocer especialistas contextual;Ver todos abre directorio demo;Agendar conservado.
Perfiles claramenteejemplos,sin disponibilidades ficticias.AshiDemo/WSPúnicos;barra inferior
móvil fuera del área desplazable.Paleta/Nunito/mascota originalesintactos.

37WebP responsive con alpha/hashedcache y manifiesto regenerable por tools/images;
originalesPNGconservados,hero fetchPriorityhigh,resto lazy.Canonicallanding/idiomaes,
robotsnoindexpreviointacto.7viewportsChrome/foco/Tab/Escape/reducedmotion comprobados.
[Auditoría y límites](docs/evidence/landing-v56/verification.md). No publicar hasta aprobación.

## V59 - Marca del footer y navegación interna

Sólo landing: footer lavanda #F3EEFB, tarjeta blanca para logo oficial, marca violeta/naranja, controles de 44 px, columnas 4/3/2 según ancho y marca a ancho completo en móvil. CSS encapsulado en `landing-footer.css`; otras páginas conservan footer anterior. Especialistas se consulta por anclas dentro de la landing, sin Ver todos. Favicon PNG reutiliza logo oficial sin modificaciones.

## V60 - Presentación del inicio de sesión

`login.css` aplica el sistema v1 sólo bajo `.asha-login`: violeta #7C3AED, base #5B21B6, verde agua #0F766E, naranja #F97316, fondo #FAFAF9, Nunito 400–900, radios de 14 px en controles y 24 px en paneles. Formulario blanco, cabecera y panel de desarrollo suaves. Relieve inferior de 5 px en botón principal; campos de 56 px y controles de 44 px. Estados visuales de foco, carga, error y movimiento reducido. Arte decorativo de letras, textos y comportamiento originales conservados. Paneles privados y otras superficies sin migración visual.
## V67 — superficie administrativa

Migración visual exclusiva de `.asha-admin`: Nunito, violeta #7C3AED/#5B21B6,
blanco cálido, lavanda y acentos agua/naranja. Menú de cristal suave, tarjetas
de 20–28 px y controles de al menos 44 px; datos y formularios blancos.
Dashboard con Ashi robot aprobado existente, decorativo y exclusivo de modo admin.
Contenido/ML conservan Próximamente, sin afirmar nuevas funciones.
Configuración se organiza en dos columnas; auditoría e incidencias mantienen datos
y controles vigentes. Sin modificación visual del panel padre o terapeuta.
Evidencia y límites: [verificación V67](docs/evidence/admin-visual-v67/verification.md).

## V76 — formularios administrativos

Los formularios modales de cuentas, usuarios y pacientes comparten cabecera con icono,
superficie lavanda, campos blancos, etiquetas externas, controles de 48 px y pie de
acciones fijo. El alta de familia conserva su flujo de tres pasos. Tipo de documento
permanece visible y fijo en DNI; la consulta RENIEC sigue deshabilitada. Los campos
usan separación vertical explícita para que etiquetas y bordes no se superpongan.
Auditoría retira el aviso descriptivo superior solicitado; conserva títulos, eventos,
errores y estados vacíos. Sin cambios de permisos ni operaciones clínicas.

## V83 — navegación y hero de landing

Las cuatro secciones principales aparecen inmediatamente tras el hero: Cómo funciona,
Mundo ASHA, Especialistas y Preguntas frecuentes. Menú desktop/móvil en el mismo orden,
con anclas internas. Audiencias, terapias, ejemplos y newsletter se conservan después.
Se retiran los dos indicadores con check y Demostración sólo de la burbuja decorativa.
El asistente interactivo conserva su aviso. Título desktop clamp(51px,4.8vw,73px),
introducción clamp(19px,1.78vw,27px), título móvil 33px; Nunito, paleta, Ashi y controles
existentes conservados. Ver docs/evidence/landing-v83/verification.md.

## V84 — tarjetas de mundos y audiencias

Mundo ASHA usa cristal blanco84%, blur14px y borde violeta12% sobre fondo lavanda/agua.
Ilustraciones con tintes transparentes, texto legible y controles sólidos; fallback blanco.
CTA únicos: Descubre los sonidos, Juega con las palabras, Encuentra tu ritmo,
Explora tu voz y Descubre los gestos. Acceso y catálogo conservados.
Audiencias con giro al pulsar/teclado, frente imagen/título, reverso de acompañamiento
profesional. Sin flechas, enlaces ni rutas; aria-expanded y caras aria-hidden alternadas.
Giro420ms, sin transición con reduced-motion; reverso sólido para lectura.
FAQ reemplaza paquetes por acompañamiento del lenguaje; párrafo de mundos retirado
por petición expresa. Estilos limitados a landing-refinements.css.

## V85 — especialistas informativos

Las tres tarjetas de especialistas de la landing muestran únicamente información;
se retira Agendar y el salto a login. La reserva se conserva en el dashboard.

## V86 — Glass visible y respuesta ligera

Landing: blanco74%, borde violeta20%, blur18px y fondos lavanda/agua en tarjetas y navbar. Ejemplos familiares blanco80%. Login: panel y barra superior con el mismo formato, campos blancos y fondo lavanda/naranja/agua. Móvil<768px y navegadores sin soporte usan superficies sólidas. FAQ y newsletter conservan fondo sólido.

Feedback120–180ms, giro320ms y FAQ160ms; navbar subraya, flechas avanzan3px y mundos responden con borde/sombra. Reduced-motion elimina movimiento. Hero desktop46–66px, introducción18–24px, botones16–20px; móvil título31px y botones16px, conservando áreas de interacción. Textos de apoyo señalados en especialistas y ejemplos retirados.
