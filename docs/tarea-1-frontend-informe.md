# Tarea 1 — Frontend limpio, modular y operativo

Fecha: 7 de octubre de 2026. Revisión local, sin commit ni publicación.

## Resultado y alcance

Se aplicó la base modular, se reemplazó el selector de pantallas por rutas declarativas y se preservaron las vistas necesarias, sus alias y los datos simulados. No se implementaron funcionalidades del backend.

Los controles de código, tipos, rutas, pruebas y build pasan. No se declara validado el sistema clínico completo ni el login contra servidor: localhost:8000/health no respondió en la comprobación actual (timeout de 4 segundos).

## Estructura final

```text
frontend/
├─ src/
│  ├─ app/
│  │  ├─ AppRouter.tsx, RouteAccess.tsx, PageBoundary.tsx
│  │  ├─ lazyPages.ts, routeManifest.ts, routeTitles.ts
│  │  ├─ providers/AppProviders.tsx
│  │  ├─ layouts/          marco público/protegido y navegación
│  │  └─ hooks/            coordinación temporal de demostración
│  ├─ pages/
│  │  ├─ public/           landing y páginas informativas
│  │  ├─ auth/             login real y registros simulados
│  │  ├─ padre/            familia, recorrido, sesiones y Mundo ASHA
│  │  ├─ terapeuta/        agenda, expedientes y panel profesional
│  │  └─ admin/            administración y prototipos conservados
│  ├─ components/
│  │  ├─ common/           controles y componentes reutilizables
│  │  ├─ illustrations/    recursos visuales
│  │  └─ assistant/        ASHI y su estado
│  ├─ hooks/               utilidades compartidas
│  ├─ types/               navegación, autenticación y contratos UI
│  ├─ mocks/               datos comunes de demostración
│  ├─ services/            adaptadores HTTP y contratos pendientes
│  ├─ api/client.ts        transporte HTTP único
│  ├─ auth/                contexto de sesión real
│  ├─ routes/paths.ts      compatibilidad temporal View/URL
│  ├─ theme/               estilos, tokens y marca
│  ├─ assets/              recursos con consumidores
│  ├─ App.tsx              exporta la composición del router
│  └─ main.tsx             arranque y providers
├─ tests/                  pruebas y fixture de navegador aislada
└─ scripts/                controles de tamaño y consumidores
```

Las pantallas grandes separan estado en hooks, secciones locales y tipos/datos comunes. Los componentes locales permanecen junto a la funcionalidad; no se enviaron todos a una carpeta global ni se dividieron solo por conteo.

## Cambios principales

- App.tsx pasó de 7.233 líneas a una línea de composición.
- Las 17 fuentes que excedían 500 líneas se descompusieron o reemplazaron por sus módulos consumidores.
- Se retiró shared.tsx; sus consumidores importan UI, ilustraciones, tipos, tokens y mocks desde su responsabilidad correspondiente.
- Las páginas se importan con React.lazy desde archivos concretos, evitando barrels que arrastren otras pantallas.
- Suspense muestra un indicador de carga; un límite de errores evita pantallas vacías y ofrece reintento.
- El router declara 96 destinos y conserva aliases anteriores. Un control compara el manifest con los destinos reales para evitar divergencias.
- RouteAccess espera la verificación de sesión, redirige al login sin sesión y bloquea cruces de rol. Las rutas desconocidas muestran 404.
- Los módulos de padre, terapeuta y admin no importan internos de otro rol; app coordina los flujos temporales.
- El login usa el servicio real. No hay contraseña de desarrollo embebida ni autenticación simulada en producción.
- VITE_API_BASE_URL centraliza la base HTTP; VITE_API_URL sigue como compatibilidad. Cookies incluidas y errores FastAPI normalizados.
- Una respuesta 401 fuera del login invalida el contexto. Solicitudes antiguas de restauración no pisan una sesión más reciente.
- El estado de envío del login es local: un error no desmonta el formulario ni desaparece al concluir la solicitud.
- Datos clínicos, registros, pagos y otros flujos no conectados se identifican explícitamente como demostración.

## Errores corregidos durante la revisión

- Formularios de terapeuta trataban un valor string como un evento DOM; ahora respetan el contrato de Inp.
- La ilustración Blob ocultaba el constructor del navegador empleado al descargar reportes.
- El hook del asistente podía resolver una copia obsoleta sin su avatar; se conserva la implementación correcta.
- Se corrigieron tipos de citas, campos de nuevos hijos, estilos ML, una etiqueta de auditoría y referencias a tokens inexistentes.
- Navegación de evaluación apuntaba a identificadores sin pantalla; usa agenda y psicólogos existentes.
- La selección de un paciente desde una lista filtrada usa su posición real, no la posición filtrada.
- Se retiraron 308 símbolos importados sin uso mediante revisión semántica de TypeScript.

## Limpieza y preservación

El detalle de cada ruta retirada y sus motivos está en [frontend-cleanup-inventory.md](frontend-cleanup-inventory.md).

- Git registra 82 archivos originales retirados: 70 de código reemplazado/sin consumidores y 12 recursos multimedia.
- El inventario también registra paneles intermedios generados y posteriormente reemplazados; no confundirlos con archivos originales eliminados.
- Se conservaron las vistas únicas de registro y administración como destinos explícitos, sin implementar persistencia nueva.
- Se retiraron 53 dependencias directas sin consumidores o reemplazadas por la dependencia pública usada.
- Vite y React Router se actualizaron dentro de sus versiones principales; Vitest 4.1.11 evita las vulnerabilidades encontradas en la primera versión instalada.
- Se conservaron servicios pendientes, contratos, atribuciones, documentación y configuraciones necesarias.
- package-lock.json ya tenía una modificación local; se actualizó mediante npm sobre ese archivo, sin restablecerlo desde Git.
- No se modificó backend, no se ejecutó pull y no se publicó nada.
- Los originales versionados retirados son recuperables desde Git. Los scripts y paneles temporales creados en esta tarea se retiraron al terminar.

El análisis de consumidores recorre imports/exports estáticos, imports dinámicos, estilos y entradas de pruebas. El análisis de medios también revisó nombres/referencias de recursos en código y rutas públicas. No se consideró un servicio pendiente como basura solo por no usarse todavía.

## Validación automática

| Control | Resultado |
| --- | --- |
| Pruebas originales de routing | 25/25 |
| Vitest + React Testing Library | 120/120, siete archivos de pruebas |
| Total de pruebas frontend | 145/145 |
| TypeScript noEmit | Correcto |
| Build Vite de producción | Correcto, sin aviso de chunk mayor a 500 kB |
| Límite físico de líneas | 278 archivos revisados; máximo 495 |
| Imports locales y límites entre roles | Sin incidencias detectadas |
| fetch fuera del cliente HTTP | Ninguno |
| Manifest frente al router | Sin destinos ausentes ni duplicados |
| Marcadores de conflicto | Ninguno en los archivos revisados |
| Código/medios sin consumidor final | Inventario vacío; servicios/tipos pendientes preservados |
| npm audit | Cero vulnerabilidades reportadas |

El contador incluye código, estilos, configuración y pruebas (.ts, .tsx, .js, .jsx, .mjs, .cjs, .css, .html, .json, .yaml). Excluye node_modules, dist, .git, .vite, binarios y package-lock.json generado. Cuenta líneas físicas, incluidos comentarios y blancos; el mayor archivo es src/pages/padre/MundoAshaIsla.tsx.

Las pruebas cubren montaje de todos los destinos y aliases, los tres roles, sesión en verificación, falta de sesión, acceso denegado, 404, restauración con providers, login fallido, expiración, logout, cookies y errores HTTP/red. Incluyen interacción del asistente, campos de configuración y las secciones del expediente simulado. Los mocks de voz/canvas en jsdom no prueban los dispositivos reales.

## Verificación en navegador

- 96/96 destinos montaron sin mostrar error de página, 404 inesperado ni bloqueo inesperado, usando una fixture aislada por rol.
- La consola de esa pestaña no registró errores durante el barrido.
- Se revisaron los paneles público, padre, terapeuta y admin en presentación móvil; no hubo desbordamiento horizontal del documento en esos paneles (ancho CSS observado: 482 px). Se abrió el menú móvil de padre.
- En la aplicación normal: landing, especialistas, login y acceso a /padre sin sesión, con redirección correcta a /login.
- En el build de producción servido temporalmente: login sin accesos rápidos, landing y especialistas, recarga de /especialistas y navegación atrás/adelante correctas, sin errores de consola en ese recorrido.
- Se comprobaron también aliases mediante las pruebas de montaje.

La fixture tests/browser-harness.html usa identidades ficticias, MemoryRouter y un contexto de pruebas: no se autenticó contra el servidor, no creó usuarios ni escribió datos. Está guardada para reproducir la QA en desarrollo y no entra en el build normal.

No se afirma QA visual exhaustiva de cada modal/estado, dispositivo físico o sesión autenticada real. Los errores históricos del navegador producidos durante HMR no se confunden con errores del recorrido fresco verificado.

## Tamaño de producción

Medidas en kB decimales; gzip calculado sobre los archivos emitidos.

| Archivo/grupo | Sin comprimir | gzip |
| --- | ---: | ---: |
| Entrada JS anterior | 1.020,69 kB | 241,34 kB |
| Entrada JS actual | 259,81 kB | 82,81 kB |
| MiCaminoAsha, mayor pantalla diferida | 47,79 kB | 12,40 kB |
| TerapeutaPacientes | 44,22 kB | 10,62 kB |
| Evaluación inicial | 42,19 kB | 10,58 kB |
| PadreConfig | 41,05 kB | 9,36 kB |
| PadreHome | 37,64 kB | 9,40 kB |
| CSS principal | 85,81 kB | 15,34 kB |

Se emitieron 130 archivos JS, aproximadamente 1.197,20 kB en total. La entrada inicial es alrededor de 74,5 % menor, pero el total de código no disminuyó: se conservaron pantallas adicionales y la separación genera chunks compartidos. No todos los archivos se descargan al entrar; se solicitan por ruta. No se midió latencia real ni Core Web Vitals, por lo que no se atribuye un porcentaje de mejora de tiempo de carga.

El build no contiene identificadores rápidos p00001/t00001/a00001, texto de la fixture ni contraseñas de pruebas. El logo utilizado se conserva; su PNG emitido pesa 297,47 kB.

## Pendientes reales para las tareas siguientes

1. Arrancar/configurar la API y verificar login, sesión recargada, expiración y logout reales para los tres roles, con cookies y CORS del entorno definitivo.
2. Definir y conectar endpoints de pacientes, citas, sesiones, pagos, mensajes y reportes. Los servicios existentes no demuestran que tales endpoints estén implementados.
3. Definir el registro y recuperación de contraseña reales; las pantallas actuales conservan el flujo ilustrativo.
4. Verificar voz, reconocimiento, cámara, canvas y juegos en dispositivos/navegadores reales, sin tomar los mocks de jsdom como prueba.
5. Completar pruebas de formularios y estados de negocio, revisiones de accesibilidad y QA visual de todos los tamaños/modalidades.
6. Mantener los permisos del servidor como autoridad. Las rutas de /session y /pay conservan el contrato PADRE; cualquier ampliación al rol terapeuta requiere definición explícita.
7. Configurar VITE_API_BASE_URL o proxy /api/v1, HTTPS/cookies y fallback SPA a index.html antes del despliegue. Vite preview valida localmente, no reemplaza esta configuración.

## Reproducción

Desde frontend:

```text
npm test
npm run typecheck
npm run check:frontend
node scripts/audit-unused.cjs
npm run build
npm audit
```

Con el servidor de desarrollo, abrir /tests/browser-harness.html para QA aislada. No publicar el servidor de desarrollo ni esa fixture.

Se actualizaron architecture.md, PROJECT_CONTEXT.md y ADR 0002. Graphify se regeneró mediante AST local sin LLM y quedó vigente; su análisis no sustituye las comprobaciones de tipos, navegador y build.

## Cierre

La base modular del frontend y sus controles quedan aplicados y verificados. La limpieza no dejó referencias rotas detectadas y todos los archivos fuente revisados cumplen 500 líneas. La verificación end-to-end contra la API y el despliegue completo siguen pendientes, expresamente documentados.
