# Centro Familiar infantil

Fecha: 2026-10-11. Corte V88 publicado en dev y feat/piero-dev: 15ed694f57dacacfa397ef408f7969b759cb6926, base bf868da/V87. Estado final y límites en IMPLEMENTATION_PROGRESS.md.

Modo de pantalla: Operate. Usuario principal: niño acompañado por su familia. Acción principal: explorar actividades asignadas. Acción secundaria: consultar su recorrido. El adulto accede a los detalles desde Para mi familia.

## Estructura y comportamiento

- Cabecera breve con inicio, perfil de niño y entrada familiar. Selección por ID del paciente, sin nombres ficticios de fallback.
- Dos destinos iniciales ilustrados; ningún porcentaje clínico o indicador de productividad.
- Mi mundo presenta sólo asignaciones devueltas por la API y abre los niveles y juego existentes. Una URL de un mundo no asignado muestra aviso y la lista permitida.
- Mi camino representa tres momentos derivados de registros: primer encuentro, plan publicado y reserva de terapia. Una reserva se describe como reserva, nunca como asistencia ni mejoría clínica.
- Para mi familia conserva introducción/reservas, Actualizar seguimiento, resumen, planes, sesiones y reportes en superficies legibles. Herramientas adultas enlazan a sus rutas existentes.
- Carga, error/reintento, perfil vacío y mundo pendiente tienen estados explícitos. Regresar y abrir apartados cambia foco sin esconder la cabecera. El navegador puede recuperar la sección mediante parámetros.

## Presentación

Referencia aprobada: dos tarjetas grandes, Mi mundo / Mi camino, con Ashi y entrada familiar superior. Se reutilizan las ilustraciones reales de los mundos; el título de la actividad proviene del servidor. Glass visible en paneles breves sobre lavanda/aqua; campos y lectura clínica sólidos. En móvil se apilan tarjetas, se elimina blur y se conservan acciones táctiles amplias. Sin animación ambiental; respuesta sutil al pulsar y hover de ilustración, respetando movimiento reducido.

## Assets nuevos

PNG originales en frontend/public/illustrations y WebP320/640 en optimized, sólo dos entradas nuevas en publicAssets. PNG conservan transparencia.

- family-ashi-wave-v88: generación de Ashi blanco/morado, rostro digital aqua y corazón, saludando, cuerpo completo, sin texto ni fondo, siguiendo mascota ASHA existente. Origen generado exec-ca294e59-b489-4740-a736-02900891e416.
- family-storybook-v88: libro abierto 3D amable con borde morado, sendero aqua, colinas y sol; sin texto ni fondo. Origen generado exec-3d6087c4-a5fb-4fb4-9268-742b7607ed4c.

v88 identifica el corte de diseño y sus assets; el SHA efectivo se consulta en Git.

## Verificación y límites

Validación inicial: 57 pruebas de centro, seguimiento, juegos y coherencia. Cierre: suite completa de 319 pruebas, incluyendo reserva introductoria y terapia con paciente/plan correctos, guardado de juego y actualización de lecturas. Revisión visual aislada en escritorio y375px con información ficticia, sin contacto a la BD ni nuevas cuentas. Se verifican inicio, mundos/niveles, recorrido, herramientas familiares, cambio de perfil, carga de imágenes y ausencia de overflow horizontal móvil. Fixture temporal retirado; capturas locales ignoradas. El guardado se verifica con servicio simulado y pruebas existentes, no con escritura real. Las vistas adultas operativas conservan su diseño previo al navegar fuera del centro.
