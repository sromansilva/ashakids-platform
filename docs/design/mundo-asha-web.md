# Mundo ASHA: diseño web

Modo de la pantalla: Operate. El niño y su familia eligen un mundo asignado, visitan un nivel y responden una actividad. Extensión del sistema ASHAKids existente; se conservan Nunito, marca, ilustraciones de landing, contratos y permisos.

Dirección solicitada: mapa de cinco mundos con ilustración de fondo acorde a los PNG existentes, ilustraciones encima con hover, una ruta de niveles cuadrados y juegos en modal. Web de escritorio prioritaria, responsive diferido. No se cambia la identidad de otras páginas.

Estructura: título/contexto breve, selector de niño y progreso, mapa. Al entrar: volver a mundos, nombre/descripcion/progreso, camino de tres niveles y escenario del mundo elegido; medalla y aclaración de acceso libre. Un modal enfoca la actividad, mantiene feedback y bloquea el cierre durante el guardado. Cerrarlo sin guardar no otorga progreso.

Colores por mundo en worldArt.ts. Fondo de archipiélago ImageGen, 1536 × 1024, servido como WebP de 215 KB. Imágenes reutilizadas mediante PublicIllustration y su manifiesto existente. Selectores bajo .asha-worlds y .asha-game-dialog; estilos globales y paneles ajenos conservados.

Estados: asignado, pendiente de asignación, disponible, completado, próximo nivel sugerido (sin bloquear otros), guardando, feedback correcto/incorrecto, fallo/reintento, sin hijos/sin asignaciones. Foco visible, dialog nativo, Tab confinado, Escape, foco de retorno y movimiento reducido.

Verificación de implementación y límites en [world-map-v70](../evidence/world-map-v70/verification.md). La compilación no acredita aceptación clínica ni responsive.
