Realiza los siguientes cambios únicamente en el perfil de Padre/Representante de AshaKids. Mantén intactos los perfiles de terapeuta y administrador, las páginas públicas, la identidad visual y la lógica que no esté relacionada con este flujo.

## 1. Flujo de reserva, confirmación y pago

En la sección “Agenda y sesiones”, cuando un padre reserve una cita, esta debe crearse inicialmente con el estado “Por confirmar”.

La cita debe permanecer en ese estado hasta que el terapeuta la acepte. Cuando el terapeuta confirme la solicitud:

- Cambia el estado de “Por confirmar” a “Confirmada”.
- Actualiza el estado de forma consistente en “Agenda y sesiones”, Centro Familiar y cualquier resumen relacionado.
- La sesión confirmada debe aparecer automáticamente en la sección “Pagos”.
- Las citas pendientes, rechazadas o canceladas no deben aparecer como sesiones pendientes de pago.
- Utiliza datos simulados y no inventes pasarelas, comisiones, monedas ni políticas comerciales.

Añade estados demostrables al prototipo para comprobar el recorrido:

1. Reserva solicitada.
2. Por confirmar.
3. Confirmada por el terapeuta.
4. Pendiente de pago.
5. Pagada.

## 2. Rediseño de Padres/Pagos

La pantalla actual utiliza demasiado espacio para mostrar una sola sesión. Sustituye esa presentación por un listado vertical compacto de sesiones confirmadas pendientes de pago.

Coloca el listado dentro de un card principal titulado “Sesiones por pagar”.

Cada sesión debe mostrarse inicialmente como un card resumido y plegable. El resumen debe incluir:

- Fecha.
- Hora.
- Terapeuta.
- Niño asociado.
- Modalidad.
- Estado de pago.
- Importe solo si existe una moneda previamente definida; de lo contrario, utiliza “Importe por definir”.
- Chevron que indique si el card está contraído o desplegado.

Al hacer clic en un card, debe desplegarse con una animación suave y mostrar el detalle completo que ya existe actualmente:

- Información de la sesión.
- Terapeuta.
- Fecha, hora y duración.
- Modalidad.
- Referencia o identificador.
- Estado de confirmación.
- Estado de pago.
- Resumen o desglose permitido.
- Acciones disponibles, como pagar o consultar comprobante, únicamente cuando correspondan.

Requisitos del acordeón:

- Varias sesiones deben poder visualizarse resumidas simultáneamente.
- Abrir o cerrar una sesión no debe desplazar bruscamente la pantalla.
- El área completa del encabezado debe ser clicable.
- Debe funcionar con teclado.
- Utiliza `aria-expanded` y relación entre encabezado y contenido.
- Incluye estados hover, focus y selección consistentes.
- Los cards deben tener separación clara, bordes suaves y una jerarquía visual limpia.
- Evita tarjetas excesivamente altas, información repetida y espacios vacíos.
- Incluye estados vacíos para “No tienes sesiones pendientes de pago” y secciones diferenciadas para pendientes y pagadas.

## 3. Correcciones del menú móvil familiar

En el perfil familiar, corrige el drawer que aparece al pulsar el menú hamburguesa.

### Logo duplicado

Actualmente se muestran dos logos de AshaKids al abrir el drawer. Debe visualizarse un solo logo.

- Conserva el logo dentro del drawer.
- Oculta o evita duplicar el logo del encabezado mientras el drawer esté abierto.
- No elimines el logo del encabezado cuando el menú esté cerrado.
- Evita duplicar estructuralmente el componente Sidebar dentro del drawer.

### Información del usuario

En la parte inferior del drawer debe visualizarse correctamente:

- Avatar o iniciales.
- Nombre completo: Laura Gómez.
- Código de acceso: P1234.
- Acción “Cerrar sesión”.

El nombre no debe cortarse ni salir del contenedor. Usa `min-width: 0`, truncamiento controlado cuando sea indispensable y espacio suficiente para la información. En pantallas muy estrechas, prioriza nombre y código en dos líneas legibles.

## 4. Rediseño visual del drawer móvil

Mejora la presentación del menú desplegable:

- Fondo blanco limpio y uniforme.
- Una sola cabecera.
- Logo correctamente alineado.
- Botón para cerrar claramente visible y de al menos 44 × 44 px.
- Opciones con icono, texto y estado activo.
- Espaciado vertical consistente.
- Bordes y separadores solamente cuando aporten jerarquía.
- Elimina líneas innecesarias que dividan el contenido.
- Evita elementos decorativos que se superpongan.
- Mantén el pie del usuario visible sin cubrir las opciones.
- Si el contenido supera la altura disponible, permite scroll únicamente dentro del drawer.
- Bloquea el scroll de la página que queda detrás.

Añade una animación fluida:

- Entrada lateral suave.
- Duración aproximada de 200–250 ms.
- Fondo oscurecido con transición.
- Cierre al pulsar el fondo, el botón, una opción o la tecla Escape.
- Respeta `prefers-reduced-motion`.
- Mantén el foco dentro del drawer mientras esté abierto y devuélvelo al botón hamburguesa al cerrar.

## 5. ASHI en móvil

En pantallas móviles, el asistente ASHI ocupa demasiado espacio. Sustitúyelo por un botón flotante circular compacto.

Características:

- Tamaño aproximado de 48–52 px.
- Solo icono de ASHI dentro del círculo.
- Indicador pequeño de disponibilidad.
- `aria-label="Abrir asistente ASHI"`.
- Al pulsarlo, abre el asistente existente.
- No debe cubrir navegación, botones, formularios ni información importante.
- Respeta las áreas seguras inferiores del dispositivo.
- El formato extendido con texto puede mantenerse en tableta y escritorio.
- Añade una transición discreta sin animaciones invasivas.

## 6. Responsividad y validación

Prueba los cambios en:

- 390 px: móvil.
- 768 px: tableta.
- 1366 px: escritorio.

Criterios obligatorios:

- Cero desplazamiento horizontal.
- Ningún texto cortado de forma incorrecta.
- Un solo logo visible al abrir el drawer.
- Información completa de Laura Gómez visible.
- ASHI aparece como círculo compacto en móvil.
- Los cards de pago pueden contraerse y desplegarse.
- Las sesiones confirmadas aparecen en Pagos.
- Las sesiones “Por confirmar” no aparecen como pendientes de pago.
- La confirmación del terapeuta actualiza todas las vistas relacionadas.
- Botones con área mínima de 44 px.
- Navegación por teclado, foco visible y atributos ARIA.
- Español internacional.
- Datos claramente identificados como simulados.
- No modificar permisos, contenido clínico ni otros perfiles.

Implementa los cambios directamente, verifica que el proyecto compile y revisa visualmente todos los estados antes de finalizar.