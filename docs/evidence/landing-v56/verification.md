# V56 - Landing unificada: evidencia y continuidad

Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama codex/landing-publica; base 796fc28 + diff V56; último origin/dev conocido ca9e1b3.
Commit final V56 consultable en Git, sólo local. .gitignore previo fuera del commit.

[Informe editable](../../audits/auditoria-2026-10-10-01.md) contiene ocho secciones,
hallazgos, contratos, límites y comandos. [PDF](../../../output/pdf/Auditoria_Landing_ASHAKids_2026-10-10_01.pdf).
Resultados: 25 rutas, 283 componentes / 19 archivos; 7 pruebas backend unit/ASGI sin BD; tipos / check 353, máximo 500 / build 1912.
[Chrome](browser-results.json):7 viewports,modales/teclado/foco/roles/retorno/asignación,
5 FAQ conservadas,único WhatsApp/Demo/Escape,reduced-motion, cero errores JS.
[Newsletter](newsletter-results.json): respuestas simuladas, ningún correo enviado.
[Catálogo real local](live-api.json):metadatos 200 sin ejercicios. [Pesos](image-optimization.json):
18 originales: 25.699.508 bytes; variantes máximas: 1.034.508 bytes, reducción del 96% de ese conjunto.
37 WebP estáticos con hashes, alpha y srcset. Originales intactos; no generación nueva.

[Landing completa](landing-complete.png), [móvil](viewport-375.png),
[Mundos escritorio](worlds-1536.png), [modal](access-modal.png), capturas para cada ancho.
Para capturas de sección se ocultan temporalmente header/dock/skip sólo en el arnés;
las capturas de viewport usan la UI intacta. No certificar Safari, SMTP, BD, reservas
reales ni SEO integral. No hay Lighthouse ni impacto ambiental medido.

Incidencias: encoding al editar corregido;overflow 320 por gaps corregido;trampa Tab
explicitada;arnés API de login corregido;retorno seguro unificado tras carrera real.
Fallo de fetch por conexión GitHub:443 al cierre registrado. Graphify 2373/100, 13 fuentes
sin símbolos;mapa local vigente tras refresh/check. Backend httpx faltaba: se instaló
la dependencia dev ya declarada, sin modificar requirements. Primer npm desde raíz
falló por ausencia package.json: luego se ejecutó desde frontend. Sin lint separado;
check:frontend es la comprobación propia del repositorio.

Preview :5176 -> API :8002, recordatorios desactivados, API :8000 anterior conservada.
Pendientes reales: registro público/directorio públicos no funcionales;Solicitar cuenta
abre instrucciones y profesionales claramente demo. FAQ histórica conserva menciones
pagos/factura sin implementar pagos. No publicar hasta aprobación explícita.

PDF final de cuatro páginas renderizado e inspeccionado en `pdf-final-review`. `pdf-review` conserva la revisión anterior de seis páginas, previa al ajuste de párrafos.
