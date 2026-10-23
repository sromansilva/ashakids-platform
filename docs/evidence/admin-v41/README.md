# V41 — comprobación del diseño de administración

Fecha: 2026-10-10, America/Lima. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama: `codex/2do-intento`. Base revisada de código: V40, `7c8f1ee2d62f22f1c4da6c14de4e344de0491c37`.
El SHA de cierre V41 se obtiene del historial Git; publicación prevista en `dev` y la rama de trabajo.
Esta es una comprobación de UI, no una nueva auditoría académica ni una validación del backend.

## Entorno y alcance

Vite en localhost:5175, API de QA en localhost:8002, PostgreSQL de QA separado en puerto 6544.
Cuenta ADMIN sintética ya existente, `a90001`. Los nombres y correos de las capturas son sintéticos.
Sin crear, editar, suspender o eliminar cuentas ni modificar registros clínicos.
No se ejecutaron migraciones ni se modificaron Supabase, autenticación, contratos HTTP o hosting.

Shell ADMIN, panel operativo, cuentas y presentación consistente de terapeutas, operación,
contenido, ML, auditoría y configuración. Los módulos demostrativos mantienen sus rótulos.
No se declara funcional un control demostrativo por haber mejorado su diseño.

## Comprobaciones nuevas

- `npm run typecheck`: correcto.
- `npm run check:frontend`: 340 archivos; máximo 498 líneas; importaciones, límites de roles y cliente HTTP correctos.
- `npm run build`: correcto, 1897 módulos, 4.53 s inicialmente y 3.45 s tras el bloque del revisor.
  Tipos nuevamente correctos después del bloque. Advertencia heredada DEP0205.
- `npm test -- --run`: 25 pruebas de rutas y 281 de componentes en 18 archivos aprobadas, 22.71 s de Vitest.
  Ejecutado antes del último bloque cosmético del revisor. npm advierte que el argumento
  `--run` es innecesario para este script; no afectó el resultado.
- Graphify `refresh`: 2216 nodos y 108 comunidades; extracción AST local, sin LLM. Aviso conocido:
  12 archivos sin símbolos. `check`: mapa actualizado.
- Detector Impeccable ejecutado una vez: aviso `gray-on-color` en AdminCuentasTable.tsx,
  antigua línea 104, salida 1. Corregido el texto de la acción a violeta; no se repitió el detector.
- Búsqueda `p90001`: una cuenta; término inexistente: estado vacío; categoría Terapeutas: dos cuentas.
  Se restauró la categoría Familias y la búsqueda vacía.
- Formulario familiar: abrir, desplazarse hasta las acciones, cancelar y cerrar con Escape.
  Sin completar datos ni enviar. Menú móvil: abrir, cerrar con Escape y navegar.
- Filtro de contenido Canciones: muestra una entrada de demostración; no se accionaron edición/eliminación.

## Evidencia visual y límites

Capturas de viewport y de secciones, no de página completa: el desplazamiento vive en un DIV.
Escritorio 1280×900: panel, cuentas, formulario arriba/abajo, terapeutas, operación,
contenido, ML, auditoría, configuración y búsqueda vacía.
Móvil 390×844 (PNG de 390×843): panel, cuentas arriba/desplazadas, formulario arriba/abajo, menú y contenido.
Ancho de la app 920×811: panel y cuentas. Las imágenes se inspeccionaron antes de revisión independiente.
Una captura inferior del formulario se sustituyó porque la primera rueda se aplicó fuera del modal.

Se corrigió en un bloque la superposición de botones flotantes sobre formularios y menú,
el tamaño de acciones de cuentas/contenido a 44 px y los nombres accesibles de contenido.
Revisión independiente inicial: fix. Se resolvieron dos hallazgos del revisor en un bloque:
franja de ayuda móvil reservada fuera del contenido desplazable e iconos Lucide de ML.
Recapturas verificadas; veredicto final ship acotado a esos dos fixes resueltos.
Geometría móvil de cuentas: contenido termina en y768, botón de ayuda empieza en y782.
No se volvió a ejecutar el detector. El usuario prioriza escritorio para los siguientes roles.
CSS de foco, fallback de blur y reduced-motion revisado en fuente; sin emular preferencias del SO.
No se verifican todas las pantallas clínicas, CRUD ni estados de errores del servidor mediante estas capturas.
Los tests existentes aportan regresión de componentes/rutas; una compilación no acredita toda la app.

El contrato y la comparación del sistema están en `docs/design/ADMIN.md` y `ADMIN_SYSTEM_CHECK.md`.
Las capturas se conservan también en `.impeccable/review/admin/` para el revisor.
