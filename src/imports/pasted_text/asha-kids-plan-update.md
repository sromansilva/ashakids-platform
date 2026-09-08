Actualiza el sistema de planes del prototipo AshaKids manteniendo el diseño visual, componentes, tipografía, colores y navegación actuales. No modifiques los perfiles de terapeuta o administrador salvo donde sea necesario para reconocer el plan de una familia.

## 1. Planes disponibles

En la sección pública `Home → Planes`, mostrar únicamente dos planes:

### Plan Exploración

Incluye:

- Un solo perfil infantil.
- Mundo ASHA básico.
- Bosque de los Cuentos.
- Montaña Musical.
- Valle de Adivinanzas.
- Comunicación con el terapeuta vinculada a una sesión.
- Reportes básicos.

### Plan Familia

Incluye:

- Hijos ilimitados.
- Todas las funcionalidades actuales del perfil de padre.
- Acceso completo a Mundo ASHA.
- Todas las actividades, mundos y contenidos disponibles.
- Comunicación con terapeutas vinculada a las sesiones correspondientes.
- Reportes completos.
- Prioridad en agenda.

Eliminar completamente el plan “Avanzado” de:

- Home.
- Comparaciones de planes.
- Modales.
- Configuración.
- Pagos.
- Datos de demostración.
- Cualquier otra pantalla donde aparezca.

No inventar precios, descuentos, monedas ni periodos de facturación. Si se necesita mostrar esa información, utilizar “Por definir”.

## 2. Comparación de planes

Crear una comparación sencilla entre Exploración y Familia.

La tabla o sección comparativa debe mostrar claramente:

- Número de hijos: `1` frente a `Ilimitados`.
- Mundo ASHA: `Básico` frente a `Completo`.
- Reportes: `Básicos` frente a `Completos`.
- Comunicación: disponible para sesiones vinculadas en ambos planes.
- Prioridad en agenda: no incluida en Exploración e incluida en Familia.

Destacar Familia como el plan con mayor cobertura, sin utilizar mensajes agresivos ni ocultar las limitaciones de Exploración.

## 3. Acceso rápido de demostración

En la pantalla que aparece al presionar “Iniciar sesión”, actualizar “Acceso rápido de demo” para mostrar cuatro opciones:

- Padre / Madre — Exploración.
- Padre / Madre — Familia.
- Terapeuta.
- Administrador.

El acceso antiguo “Padre / Madre” debe convertirse en:

`Padre / Madre — Exploración`

Este usuario conservará el perfil de Laura Gómez, pero tendrá asignado el plan Exploración.

Crear una nueva opción:

`Padre / Madre — Familia`

Este acceso debe abrir el mismo perfil familiar con todas las funcionalidades actuales y con el plan Familia asignado.

Cada botón debe iniciar correctamente la experiencia correspondiente. Mantener una apariencia clara, ordenada y responsive.

## 4. Plan asignado a cada padre

A partir de ahora, toda cuenta de padre o representante debe tener un plan asignado:

- Exploración.
- Familia.

Mostrar el plan junto al nombre del usuario en:

- Encabezado del panel.
- Parte inferior del menú lateral.
- Menú hamburguesa móvil.
- Menú o tarjeta del perfil.
- Configuración de la cuenta.

Ejemplos:

`Laura Gómez · Plan Exploración`

`Laura Gómez · Plan Familia`

Utilizar un badge discreto y consistente. El nombre nunca debe quedar cortado en móvil.

## 5. Experiencia del Plan Exploración

El acceso `Padre / Madre — Exploración` debe conservar las funciones esenciales del perfil familiar, aplicando estas limitaciones:

### Perfiles infantiles

- Permitir únicamente un hijo.
- Mostrar solamente el perfil de Mateo en el selector de niños.
- No mostrar perfiles adicionales ni opciones para cambiar a otro niño.
- No eliminar el botón “Añadir hijo”; utilizarlo para explicar la mejora disponible en Familia.

### Mundo ASHA

En `Mundo ASHA → Mapa del Mundo`, mostrar únicamente:

1. Bosque de los Cuentos.
2. Montaña Musical.
3. Valle de Adivinanzas.

En `Explorar mundos`, mostrar también solamente esas tres categorías.

No mostrar para el Plan Exploración:

- Isla Creativa.
- Laboratorio de Juegos.
- Academia ASHA.
- Camino de los Retos.
- Actividades adicionales.
- Trabalenguas.
- Insignias u otras categorías adicionales.

No mostrar mundos bloqueados o parcialmente visibles. La experiencia básica debe verse intencional y limpia, no como una versión incompleta o dañada.

### Mi Camino ASHA

En `Mi Camino ASHA → Actividades`, mostrar únicamente:

- Bosque de los Cuentos.
- Montaña Musical.
- Valle de Adivinanzas.

Mantener los avisos de que Mundo ASHA es un complemento educativo y que la participación no equivale a progreso clínico.

### Comunicación

Permitir comunicación únicamente con el terapeuta relacionado con una sesión confirmada o en seguimiento.

No mostrar conversaciones generales con terapeutas que no tengan una sesión o vinculación válida.

### Reportes

Mostrar una versión básica que incluya:

- Historial de sesiones.
- Resumen general compartido por el terapeuta.
- Actividades recomendadas.

No mostrar analíticas avanzadas, comparaciones predictivas ni interpretaciones clínicas generadas automáticamente.

## 6. Modal para añadir otro hijo

En `Configuración → Mis hijos`, el usuario Exploración debe ver únicamente un hijo.

Cuando presione “Añadir hijo”, no abrir directamente el formulario. Mostrar un modal con:

### Título

`Añade más perfiles con el Plan Familia`

### Mensaje

`Tu Plan Exploración permite administrar un perfil infantil. Con el Plan Familia puedes añadir hijos ilimitados y acceder a más herramientas de acompañamiento.`

### Beneficios del Plan Familia

- Hijos ilimitados.
- Mundo ASHA completo.
- Reportes completos.
- Prioridad en agenda.
- Todas las funcionalidades familiares disponibles.

### Acciones

- Botón principal: `Conocer Plan Familia`.
- Botón secundario: `Ahora no`.
- Botón para cerrar el modal.

“Conocer Plan Familia” debe llevar a la comparación de planes. No simular una compra ni solicitar datos de pago mientras los precios y el proceso comercial no estén definidos.

## 7. Experiencia del Plan Familia

El acceso `Padre / Madre — Familia` debe mantener todas las funcionalidades actuales del padre:

- Múltiples perfiles infantiles sin límite visible.
- Selector de niños.
- Mundo ASHA completo.
- Los siete mundos.
- Actividades adicionales.
- Reportes completos.
- Comunicación por sesiones vinculadas.
- Prioridad en agenda.

Mostrar un badge visible:

`Plan Familia`

Cuando solicite una cita, mostrar de forma discreta:

`Prioridad en agenda incluida`

La prioridad no debe garantizar disponibilidad ni confirmar automáticamente una sesión. Toda cita debe continuar requiriendo confirmación del terapeuta.

## 8. Reglas compartidas

En ambos planes deben mantenerse:

- Registro autónomo del padre.
- Verificación de la cuenta.
- Consentimiento para tratar datos infantiles.
- Perfil infantil.
- Evaluación Inicial ASHA.
- Directorio de terapeutas aprobados.
- Solicitud y confirmación de citas.
- Pago después de la confirmación correspondiente.
- Sesiones.
- Seguimiento terapéutico.
- Privacidad y seguridad.
- ASHI con capacidades limitadas.

El plan nunca debe modificar permisos clínicos, consentimientos, privacidad, vinculación con terapeutas ni seguridad de los datos.

## 9. Estados e interacciones

Implementar y conectar:

- Cambio visual según el plan del usuario demo.
- Restricciones de contenido del Plan Exploración.
- Modal de mejora al intentar añadir otro hijo.
- Navegación hacia la comparación de planes.
- Regreso correcto al panel familiar.
- Indicadores del plan en escritorio y móvil.
- Estados de carga, vacío y error cuando correspondan.

No dejar botones sin interacción.

## 10. Responsive

Revisar escritorio, tablet y móvil.

En móvil:

- Mantener el mismo modelo de navbar en todas las pantallas.
- Mostrar solamente el isotipo de AshaKids en el encabezado.
- Colocar el menú hamburguesa y el isotipo en posiciones consistentes.
- Mostrar nombre y plan del usuario al final del menú desplegable.
- Evitar que el texto se corte.
- No producir desplazamiento horizontal.
- Mantener el modal de cambio de plan dentro de la pantalla.
- Mantener ASHI como un círculo pequeño que no tape botones ni información.
- Utilizar una animación fluida al abrir y cerrar el menú.

## 11. Datos de demostración

Indicar claramente que los perfiles, planes y comportamientos son datos simulados para el prototipo.

No agregar precios, monedas, descuentos, cobros recurrentes ni condiciones comerciales que no hayan sido especificadas.

Antes de terminar, verifica que:

- “Avanzado” haya desaparecido completamente.
- Los dos accesos familiares abran experiencias diferentes.
- Exploración permita solamente un hijo y tres mundos.
- Familia permita hijos ilimitados y el contenido completo.
- El plan aparezca junto al nombre del padre.
- La prioridad en agenda no confirme citas automáticamente.
- El diseño funcione correctamente en escritorio y móvil.