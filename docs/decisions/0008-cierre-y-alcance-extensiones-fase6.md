# ADR 0008 — Cierre y alcance de extensiones de Fase 6

Fecha: 2026-10-09. Estado: Adoptada para la entrega académica.
Referencia de entrega: [DELIVERY_CHECKLIST.md](../DELIVERY_CHECKLIST.md).

## Contexto

El plan inicial de desarrollo contemplaba una fase de extensiones avanzadas (Fase 6: Teleconsulta WebRTC, Reconocimiento de Voz, Asistente IA/ASHI y Notificaciones por Correo SMTP). Tras recibir la observación del profesor y los criterios formales de la rúbrica de evaluación (Arquitectura Backend, Integración con Base de Datos y Seguridad/Validación con Pruebas), y considerando la fecha límite improrrogable del 9 de octubre a las 18:00 Lima, el equipo acordó evaluar qué extensiones aportan valor verificable a la rúbrica y cuáles deben diferirse para garantizar la estabilidad y reproducibilidad del núcleo.

## Decisión

Se formaliza el cierre del alcance de la Fase 6 adoptando las siguientes directrices arquitectónicas:

1. **Teleconsulta y Sesiones Virtuales**:
   - Se mantiene la compatibilidad de sesiones virtuales mediante el atributo de cita `modalidad` (`PRESENCIAL` | `VIRTUAL`) y el campo `localizacion` (que alberga enlaces de videollamada segura o consultorio).
   - El frontend mantiene el flujo de sesión estructurado en `/session/waiting`, `/session/active` y `/session/end`.
   - Se **difiere** la implementación de un servidor WebRTC propio (señalización por WebSocket y servidores STUN/TURN dedicados), dado que requeriría infraestructura de red y certificados no exigidos en la rúbrica.

2. **Reconocimiento de Voz y Fonética**:
   - Los juegos interactivos que estimulan el lenguaje se mantienen dentro de la etapa independiente y extensa de Mundo ASHA ([MA-01..MA-07](../MUNDO_ASHA_PLAN.md)).
   - Se **difiere** el motor de análisis fonético por red neuronal en tiempo real; la evaluación del habla se sustenta clínicamente en el registro y reporte estructurado del terapeuta colegiado (`observaciones_iniciales`, `objetivos_trabajados`, `nivel_ayuda`, `proximos_pasos`).

3. **Asistente Virtual ASHI (IA)**:
   - El asistente virtual ASHI opera mediante lógica reactiva local en el cliente React (componente visual `AshaAssistant`), proporcionando guía de navegación y orientación contextual sin transmitir datos personales de pacientes a APIs externas de pago (OpenAI, Anthropic, etc.).
   - Esta decisión protege la privacidad de los menores según normativas de protección de datos de salud y evita puntos únicos de fallo por cuotas o latencias.

4. **Notificaciones y Correo (SMTP)**:
   - Se **difiere** la integración con proveedores SMTP transaccionales externos.
   - Toda la comunicación clínica y administrativa queda resuelta y centralizada mediante el módulo de mensajería interna privada verificado en la Fase 5 (ADR 0007), el cual almacena los mensajes de forma persistente en PostgreSQL, respeta el aislamiento por participantes asignados y cuenta con paginación por cursor.

## Consecuencias y Límites

- **Positivas**: El sistema elimina dependencias de red no controladas, costos de APIs externas y riesgos de inestabilidad durante la presentación académica.
- **Trazabilidad**: Las funcionalidades del núcleo (agenda, expedientes, sesiones, reportes clínicos, descarga de PDF y mensajería autenticada) quedan 100% verificadas y documentadas sin elementos ficticios.
- **Transición**: Se da por concluida formalmente la Fase 6, habilitando el paso inmediato a la Fase 7 (Resolución y Paquete de Entrega Académica).
