# Mundo ASHA: diseño web

## Isla de las Palabras / 2026-10-16

Colección de diez juegos ilustrados de acceso libre dentro de LENGUAJE. Hero con
árbol/isla de la landing; Nunito, lavanda/aqua y diez acentos coral/amarillo/verde/
lila/azul. Tarjetas con relieve y24ilustraciones propias ImageGen semitridimensionales
en WebP transparente. Datos centrales wordContent.ts, estilos aislados .word-world.
Menú3columnas en escritorio y2en móvil; tarjetas grandes y botones≥44px. La marca
«Jugado en esta visita» describe memoria local del componente, sin premios guardados.

Mecánicas específicas: buscar, memoria, cestas, secuencia, opuestos, sílabas, añadir/
quitar cantidades, zonas espaciales, rimas y vagones de frases. Instrucciones habladas
opcionales, feedback amable, vuelta/repetición, foco y movimiento reducido.
Evidencia nueva y procedencia en [words-v101](../evidence/words-v101/verification.md).

## Juegos de sonidos / 2026-10-16

Refinamiento V100 solicitado por el usuario: se conserva la estructura y el contenido
de los tres niveles, con acabado SVG semitridimensional. Modelado con gradientes
radiales, reflejos pequeños, sombras de contacto y contornos suaves. Una granja
vectorial original integra los animales con el escenario. Superficies de juguete
lavanda/aqua/amarillo, bordes inferiores con relieve, marcos y pulsación hundida.
Las fichas de asociación conservan su color neutro, sin dar pistas de la respuesta.
Animaciones de respuesta y respeto a movimiento reducido conservados; sin WebGL,
imágenes raster nuevas, dependencias ni cambios de audio/reglas/persistencia.

HABLA abre una granja con tres niveles libres: Toca y descubre, ¿Quién está sonando?
y Cada sonido en su lugar. Ilustraciones SVG originales de vaca/gato/perro/pollito,
audio real local, Nunito, lavanda #E6DDFC, coral #FFE0D2, turquesa #CFF1EB,
amarillo #FFF0B6 y tinta #30224B. Fondos tranquilos, ilustraciones protagonistas,
tarjetas amplias y botones con relieve; animación breve sólo ante interacción/éxito.
Grilla 4/2 para explorar y opciones 2/3 centradas; menú vertical en móvil.

Práctica de la visita sin premios guardados; las actividades anteriores están en
«Para la familia». Ver [ADR 0025](../decisions/0025-practica-sonidos-sin-reinterpretar-intentos.md).
Control único de audio, mute/repetición, errores recuperables, escucha completa,
teclado/foco, alternativa de toque al arrastre y movimiento reducido. La verificación
de esta extensión incluye móvil; no amplía la cobertura de las otras pantallas.

## Diseño previo del mapa

Modo de la pantalla: Operate. El niño y su familia eligen un mundo asignado, visitan un nivel y responden una actividad. Extensión del sistema ASHAKids existente; se conservan Nunito, marca, ilustraciones de landing, contratos y permisos.

Dirección solicitada: mapa de cinco mundos con ilustración de fondo acorde a los PNG existentes, ilustraciones encima con hover, una ruta de niveles cuadrados y juegos en modal. Web de escritorio prioritaria, responsive diferido. No se cambia la identidad de otras páginas.

Estructura: título/contexto breve, selector de niño y progreso, mapa. Al entrar: volver a mundos, nombre/descripcion/progreso, camino de tres niveles y escenario del mundo elegido; medalla y aclaración de acceso libre. Un modal enfoca la actividad, mantiene feedback y bloquea el cierre durante el guardado. Cerrarlo sin guardar no otorga progreso.

Colores por mundo en worldArt.ts. Fondo de archipiélago ImageGen, 1536 × 1024, servido como WebP de 215 KB. Imágenes reutilizadas mediante PublicIllustration y su manifiesto existente. Selectores bajo .asha-worlds y .asha-game-dialog; estilos globales y paneles ajenos conservados.

Estados: asignado, pendiente de asignación, disponible, completado, próximo nivel sugerido (sin bloquear otros), guardando, feedback correcto/incorrecto, fallo/reintento, sin hijos/sin asignaciones. Foco visible, dialog nativo, Tab confinado, Escape, foco de retorno y movimiento reducido.

Verificación de implementación y límites en [world-map-v70](../evidence/world-map-v70/verification.md). La compilación no acredita aceptación clínica ni responsive.
