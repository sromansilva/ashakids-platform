Realiza los siguientes ajustes de consistencia y responsividad móvil en AshaKids. Aplica el mismo comportamiento en todas las rutas y perfiles, incluyendo `/home`, páginas públicas, `/padre`, `/terapeuta`, `/admin` y sus vistas internas.

No modifiques el navbar de escritorio ni la lógica funcional de cada perfil.

## 1. Unificar el navbar móvil

Actualmente el orden, tamaño o distribución del navbar cambia según la pantalla. Crea un único componente compartido para el encabezado móvil y úsalo en todas las rutas.

El navbar debe mantener siempre esta estructura:

- Izquierda: botón del menú hamburguesa.
- Centro: título breve de la pantalla actual, con truncamiento controlado.
- Derecha: únicamente el isotipo o icono de AshaKids, sin el texto “AshaKids”.

No cambies la orientación ni el orden según la página o el rol.

Requisitos:

- Altura visual consistente en todas las pantallas.
- Botón hamburguesa de al menos 44 × 44 px.
- Isotipo compacto de aproximadamente 32–36 px.
- Título centrado dentro del espacio realmente disponible.
- Usa `min-width: 0` y truncamiento con puntos suspensivos para títulos largos.
- El logo y el menú no deben desplazarse cuando cambie el título.
- No dupliques el navbar ni el logo al abrir el drawer.
- Mantén `aria-label`, `aria-expanded`, foco visible y navegación por teclado.
- En las páginas públicas, el menú debe contener las opciones públicas; en los perfiles autenticados debe mostrar las opciones correspondientes al rol, pero el encabezado debe conservar exactamente la misma estructura visual.

## 2. Respetar cámara, notch y Dynamic Island

El navbar no debe ocupar ni quedar oculto detrás de la cámara, notch o Dynamic Island del teléfono.

Implementa soporte para áreas seguras:

- Usa `padding-top: env(safe-area-inset-top)`.
- Mantén el contenido principal del navbar debajo del área segura.
- Evita alturas fijas que ignoren el `safe-area-inset-top`.
- No centres elementos tomando como referencia toda la pantalla si existe una zona ocupada por la cámara.
- El navbar debe permanecer legible tanto en navegadores normales como en una vista instalada tipo PWA.
- No añadas espacios excesivos en dispositivos que no tengan notch.

La estructura recomendada es:

1. Contenedor exterior con fondo blanco y `padding-top` de área segura.
2. Fila interior del navbar con altura aproximada de 56 px.
3. Menú a la izquierda, título centrado e isotipo a la derecha.

## 3. Mejorar el chatbot ASHI en móvil

El botón flotante debe mantenerse como un círculo compacto de aproximadamente 48–52 px. Al abrirlo, el panel del chatbot no debe ocupar toda la pantalla.

En móvil, muestra ASHI como un panel flotante compacto o una hoja inferior de tamaño controlado:

- Ancho: `calc(100vw - 24px)` o similar.
- Alto automático según el contenido.
- Altura máxima aproximada de `65vh`.
- Máximo absoluto de `520px`.
- Bordes superiores redondeados.
- Scroll únicamente dentro del historial de mensajes.
- Encabezado compacto con icono, nombre ASHI, estado y botón cerrar.
- Área de escritura siempre visible dentro del panel.
- No cubrir completamente el contexto de la página.
- Mantener separación del navbar, navegación inferior y áreas seguras.
- Usar `padding-bottom: env(safe-area-inset-bottom)`.
- Permitir cerrar mediante botón, Escape o pulsando fuera.
- Devolver el foco al botón flotante al cerrar.
- Respetar `prefers-reduced-motion`.

Distribuye el contenido interno con esta jerarquía:

1. Encabezado compacto.
2. Historial de conversación con scroll.
3. Sugerencias rápidas, únicamente cuando haya espacio.
4. Campo de mensaje y botón enviar.

Evita márgenes excesivos, mensajes demasiado anchos y grandes zonas vacías.

## 4. Corregir la información del usuario en el drawer

La información del usuario sigue sin visualizarse correctamente en la parte inferior del menú hamburguesa. Reestructura el drawer para que tenga tres zonas:

1. Cabecera fija.
2. Navegación central desplazable.
3. Pie de usuario fijo y completamente visible.

El drawer debe usar una estructura equivalente a:

- Altura: `100dvh`.
- `padding-top: env(safe-area-inset-top)`.
- `padding-bottom: env(safe-area-inset-bottom)`.
- Layout vertical con `display: flex` y `flex-direction: column`.
- Navegación con `flex: 1`, `min-height: 0` y `overflow-y: auto`.
- Pie del usuario con `flex-shrink: 0`.

El pie debe mostrar:

- Avatar o iniciales.
- Nombre completo.
- Rol o código correspondiente.
- Acción “Cerrar sesión”.

Ejemplo familiar:

- Laura Gómez.
- Código P1234.
- Cerrar sesión.

Ejemplo terapeuta:

- Dra. Ana Ruiz.
- Terapeuta.
- Cerrar sesión.

Ejemplo administrador:

- Administrador.
- Admin.
- Cerrar sesión.

Requisitos adicionales:

- El nombre no debe quedar cortado verticalmente.
- Usa `min-width: 0` en el contenedor de texto.
- Permite dos líneas si el nombre es largo.
- No escondas el pie debajo del viewport.
- No permitas que ASHI cubra el pie del usuario.
- No dupliques el logo en la cabecera del drawer.
- El pie debe conservar contraste, espaciado y área táctil suficiente.
- El drawer debe bloquear el scroll de la página de fondo.

## 5. Consistencia visual del drawer

Mantén el mismo diseño base para todos los roles:

- Fondo blanco uniforme.
- Un solo logo.
- Botón cerrar claramente visible.
- Opciones con icono, texto y estado activo.
- Espaciado consistente.
- Sin líneas divisorias innecesarias.
- Separadores únicamente entre navegación y pie cuando aporten jerarquía.
- Animación lateral suave de 200–250 ms.
- Fondo oscurecido con transición.
- Cierre con botón, Escape, clic exterior o selección de una opción.
- Trampa de foco mientras esté abierto.

El contenido de navegación puede cambiar por rol, pero su estructura, dimensiones y comportamiento deben ser compartidos.

## 6. Validación obligatoria

Prueba las modificaciones en:

- 360 px.
- 390 px.
- 430 px.
- 768 px.
- Escritorio para confirmar que no sufrió cambios.

Verifica en `/home`, `/padre`, `/terapeuta` y `/admin`:

- El navbar conserva siempre el mismo orden.
- El isotipo no invade el notch o Dynamic Island.
- El título no se superpone con el menú ni con el logo.
- No aparece dos veces el logo.
- El drawer muestra completamente la información del usuario.
- La navegación central puede desplazarse sin mover el pie.
- ASHI no ocupa toda la pantalla.
- ASHI no cubre botones, navegación ni datos del usuario.
- No existe desplazamiento horizontal.
- El contenido respeta las áreas seguras superior e inferior.
- La navegación por teclado y el foco funcionan correctamente.
- El proyecto compila sin errores.

Implementa estos cambios mediante componentes compartidos, evitando mantener versiones diferentes del navbar o drawer para cada página.