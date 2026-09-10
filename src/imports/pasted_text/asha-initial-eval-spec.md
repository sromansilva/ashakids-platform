Implementa y deja completamente funcional el flujo “Evaluación Inicial ASHA” para el perfil de padre o representante, manteniendo el diseño visual, componentes, tipografía, navegación y paleta actuales de AshaKids.

OBJETIVO

La evaluación debe ofrecer una orientación inicial sobre posibles áreas de comunicación que convendría revisar con un profesional. No debe diagnosticar, prescribir tratamientos, asignar automáticamente un terapeuta ni determinar el número de sesiones.

UBICACIÓN EN EL RECORRIDO

Integra la evaluación después de:

Cuenta → Verificación → Consentimiento → Perfil infantil → Evaluación Inicial ASHA.

Cuando se crea por primera vez un perfil infantil, muestra una tarjeta de “Evaluación inicial pendiente” con el botón “Comenzar evaluación”.

También debe poder abrirse posteriormente desde:

- Mi Camino ASHA.
- Configuración → Mis hijos → Perfil del niño.
- La tarjeta de evaluación pendiente del Centro Familiar.

FLUJO DE PANTALLAS

1. Introducción

Mostrar:

- Nombre del niño seleccionado.
- Duración aproximada.
- Explicación sencilla de la finalidad.
- Aviso destacado: “Esta evaluación ofrece orientación y no constituye un diagnóstico clínico”.
- Botones “Comenzar” y “Ahora no”.

2. Consentimiento específico

Antes de presentar las preguntas, solicitar consentimiento informado para procesar las respuestas y generar una orientación automatizada.

El consentimiento debe ser:

- Explícito.
- Comprensible.
- Separado del consentimiento general de la plataforma.
- Registrado con fecha y versión.
- Revocable cuando corresponda.

No permitir continuar mientras no sea aceptado.

3. Contexto del niño

Mostrar información previamente registrada para confirmarla:

- Edad en años y meses.
- Idioma o idiomas utilizados en casa.
- Antecedentes relevantes.
- Observaciones del representante.

Permitir corregir la información antes de continuar.

4. Cuestionario adaptativo

Crear un cuestionario breve, dividido en bloques:

- Lenguaje expresivo.
- Lenguaje comprensivo.
- Pronunciación o articulación.
- Fluidez del habla.
- Comunicación social.
- Posibles señales auditivas.
- Desarrollo comunicativo esperado para la edad.

Las preguntas deben adaptarse a la edad en meses del niño.

Utilizar respuestas comprensibles como:

- Sí.
- A veces.
- Todavía no.
- No estoy seguro.

Mostrar una pregunta por pantalla o pequeños grupos de preguntas, indicador de progreso, botones “Atrás” y “Continuar” y guardado temporal del avance.

No utilizar expresiones que etiqueten al niño ni afirmar que presenta un trastorno.

5. Revisión de respuestas

Antes de enviar, mostrar un resumen editable de las respuestas.

Incluir:

- Botón “Editar”.
- Botón “Enviar evaluación”.
- Confirmación de que el resultado será orientativo.
- Explicación sobre quién podrá consultar la información.

6. Procesamiento

Simular el análisis con un estado de carga breve y accesible.

Usar el texto:

“Estamos preparando una orientación inicial. Este resultado no reemplaza la evaluación de un terapeuta”.

No utilizar mensajes como “Calculando diagnóstico” o “Detectando trastorno”.

7. Resultado orientativo

El resultado debe utilizar únicamente una de estas categorías:

- Sin señales relevantes por ahora.
- Seguimiento recomendado.
- Evaluación profesional recomendada.
- Evaluación prioritaria.

Mostrar:

- Categoría obtenida.
- Explicación en lenguaje sencillo.
- Factores principales que influyeron.
- Nivel de confianza o incertidumbre del modelo.
- Versión de la evaluación y del modelo.
- Aviso visible de que no es un diagnóstico.
- Fecha de realización.
- Estado de revisión profesional: “Pendiente”, “Revisado” o “Requiere conversación”.

No mostrar porcentajes de “probabilidad de trastorno”.

No recomendar automáticamente un número de sesiones, tratamiento o alta clínica.

8. Próximos pasos

Incluir estos botones:

- “Buscar terapeuta”.
- “Solicitar revisión profesional”.
- “Guardar y volver a Mi Camino ASHA”.
- “Descargar resumen orientativo”.

La selección de terapeutas puede usar las áreas que convendría evaluar como filtros sugeridos, pero el usuario debe conservar el control y confirmar cualquier acción.

PERMISOS Y PRIVACIDAD

- El padre puede consultar la evaluación del niño bajo su responsabilidad.
- Un terapeuta solo puede verla si está autorizado y existe una vinculación vigente.
- El administrador no puede ver respuestas ni resultados individuales.
- El administrador solo puede consultar métricas agregadas, técnicas y de gobernanza.
- ASHI puede explicar cómo funciona la evaluación, pero no responderla por el padre, modificar respuestas ni interpretar el resultado como diagnóstico.
- No utilizar conversaciones de ASHI para entrenar el modelo.
- No afirmar que los datos de Mundo ASHA entrenan automáticamente el modelo.
- Cualquier uso futuro de datos de actividades requiere consentimiento explícito, minimización, seudonimización y aprobación previa.

ESTADOS NECESARIOS

Diseña y conecta estos estados:

- Evaluación pendiente.
- En progreso.
- Guardada para continuar después.
- Procesando.
- Completada.
- Pendiente de revisión profesional.
- Revisada.
- Consentimiento retirado.
- Error de carga o procesamiento.

INTEGRACIÓN CON MI CAMINO ASHA

Agregar “Evaluación Inicial” como una etapa independiente del recorrido principal.

El orden debe quedar:

Cuenta → Verificación → Consentimiento → Perfil infantil → Evaluación Inicial → Terapeuta → Vinculación → Reserva → Sesión → Seguimiento.

Al completarse, actualizar automáticamente el estado visual de la etapa.

RESPONSIVE Y ACCESIBILIDAD

- Diseñar correctamente para escritorio, tablet y móvil.
- En móvil, usar una columna y botones de ancho completo.
- Mantener visible el progreso sin ocupar demasiado espacio.
- No generar desplazamiento horizontal.
- Usar contraste suficiente, etiquetas claras y navegación por teclado.
- Mostrar estados de carga, vacío, error, guardado y confirmación.
- Mantener el navbar móvil unificado con el resto de la plataforma.
- ASHI debe permanecer como un botón circular pequeño y no cubrir el formulario.

DATOS DEL PROTOTIPO

Todos los nombres, respuestas, resultados, porcentajes y métricas deben identificarse como “Datos simulados para demostración”.

No modificar otras funciones del prototipo. Reutiliza los componentes existentes y conecta todos los botones de este recorrido.