# Verificación del rediseño público V51

Fecha de trabajo: 2026-10-10, America/Lima. Implementación visual, no auditoría técnica nueva.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Base: `origin/dev`, SHA `5dd572cb37a679d5e8674a0cf1910426d925a1f9` (V50).
Rama: `codex/landing-publica`; commit local V51, SHA consultable en Git.
No integración ni push a dev u otra rama: pendiente de aprobación humana.

## Alcance y procedencia

Se leyeron AGENTS, contexto, arquitectura, plan y relevo, junto a la guía y PNG del kit.
Se examinaron landing/hook, navegación/pie, Btn/Crd, logo, Ashi y montaje del dock.
Fetch confirmó V50 posterior al dev local V49/396efda. La rama se creó desde origin/dev.
La modificación previa de `.gitignore` (`*.crt`, `*.pem`) se preserva fuera de este commit.

Nunito, hero, botones, superficies y composición proceden del kit v1 y de la imagen
adjunta del usuario; no se generaron ni editaron imágenes runtime. El logo oficial se
conserva. No hay robot Ashi integrable: se usa el espacio decorativo h/o/l/a existente,
con pendiente explícito; no se presenta el oso como el robot. No se añadieron flotantes.

## Comparación visual e iteraciones

Referencia [original adjunta](reference.png), copiada sin modificación: logo bicolor,
hero con tinta/violeta, fondos cálidos, halo lavanda localizado,
botones con relieve, tarjetas claras y tres columnas inferiores. Se adoptan esos rasgos
para el contenido real, sin copiar los textos o destinos diferentes de la maqueta.

Tras inspeccionar capturas se movieron los tres pasos inmediatamente después del hero,
se eliminó la banda oscura de pasos/newsletter, se ajustaron jerarquía y márgenes, y se
mejoró la legibilidad de los botones deshabilitados y avatares. A768px la navegación
pasó al menú existente para evitar etiquetas apretadas. Se revisaron escritorio, móvil,
320px, tablet y menú; la diferencia visual principal pendiente son las ilustraciones.

Las capturas completas finales expanden temporalmente los contenedores html/body/#root
en el script, porque el runtime desplaza #root. Luego restauran sus estilos; no se cambian
los estilos globales de la aplicación. Las capturas viewport conservan el scroll real.
El menú se captura tras terminar su animación; se descartó la captura intermedia recortada.

## Comprobaciones nuevas

- `npm --prefix frontend run typecheck`: correcto.
- `npm --prefix frontend run check:frontend`:343archivos, máximo498líneas; correcto.
- `npm --prefix frontend run build`: correcto,1903módulos; no cobertura de pantallas por ello.
- `npm --prefix frontend test`:25rutas y281componentes/18archivos aprobados.
- `node docs/evidence/landing-v51/verify-browser.cjs`: Chrome headless local, API/v1
  interceptada con401; ninguna sesión/BD/escritura externa. Resultados en browser-results.json.
- Seis anchos:1440,390,320,768,1024,1920px. Sin overflow horizontal al comprobar también
  #root con ocultación desactivada; botones visibles >=44px de alto. Nunito cargado.
- Línea base de contenido en baseline.json, tomada de V50 antes de editar: mismo conjunto
  de palabras visibles y rótulos de botones tras redistribuir secciones; anchors idénticos.
  La capitalización visual de Asha usa CSS; el nombre de botón sigue siendo AshaKids.
- Cinco FAQ abren/cierra con clic/Enter y conservan sus respuestas.18acciones de navegación
  muestran los destinos existentes. Menú móvil abre, navega a Mundo ASHA y se cierra.
- Foco del enlace Saltar al contenido visible; reduced-motion emulado: transition0s,
  animation none. Newsletter editable sigue sin generar envío al pulsar su botón.
- Ningún nuevo botón ASHI/WhatsApp en la landing; cero errores runtime de navegador.
- Graphify:setup del entorno local, query con presupuesto1500 y fuentes confirmadas;
  refresh AST local/code-only:2285nodos/108comunidades; check vigente al cierre.
  Mapa excluido de Git. Refresh sandbox se detuvo tras AST; interrumpido y repetido
  fuera del sandbox con éxito antes del check final.
- PostCSS:205reglas parseadas; todos los selectores limitados a `.asha-landing`.
  La primera comprobación dividía comas dentro de `:is`, falso positivo corregido
  usando `rule.selectors`; no era un selector global ni error del CSS.
- Diff y archivos de texto del corte revisados para secretos; ninguna credencial añadida.

## Incidencias y límites

Python de WindowsApps no ejecutable: se usó Python3.12 del runtime y .venv-graphify.
Fetch y creación de rama requirieron permiso de escritura Git fuera del sandbox.
Primer Vite/npm perdió flags de host/puerto: se inició Vite por Node en127.0.0.1:5176.
Playwright default buscó un Chromium inexistente: se usó Chrome instalado.
Primer filtro `**/api/**` interceptaba módulos JS; se corrigió a `**/api/v1/**` antes
de recoger la línea base válida. Build en sandbox falló EPERM/realpath; repetido con
permisos y resultado correcto. Graphify advierte12archivos sin símbolos y omite archivos
no soportados; no son fallos runtime. La query se trunca40/580nodos con su presupuesto.

No se ejecutaron pruebas backend/BD, aceptación clínica, integración Zoom, envío de correo,
WhatsApp o IA. No se promete fidelidad completa con Ashi ni aprobación humana del diseño.
Las inconsistencias heredadas de registro/paquetes/newsletter no se corrigen en este corte.
Los resultados históricos de V38/V50 no se contabilizan como comprobaciones nuevas.

Capturas finales: desktop.png y mobile.png completas; *-viewport.png conservan el tamaño
visible, tablet.png/small-mobile.png cubren otros anchos; mobile-menu.png muestra el menú.
  Las capturas before-* son la línea base viewport, no evidencia de todas las secciones.
  El build final del código vigente está registrado en build-final.txt (26.20s).
