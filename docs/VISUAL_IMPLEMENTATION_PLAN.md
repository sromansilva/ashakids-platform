# AshaKids — Implementación visual secuencial

Orientación vigente: 2026-10-10, America/Lima. Una persona/asistente por vez, en su rama.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Base inicial: V28 `e4e53e4ef9dc653d140f8358b8a0d44ca7dfa87c`, `piero-dev`, limpio.
Sistema común: [DESIGN](../DESIGN.md) · realidad funcional: [PRODUCT](../PRODUCT.md).
Entrada única de continuación: [estado vigente](VISUAL_IMPLEMENTATION_STATE.md).
La indicación de empezar autoriza U0 y avanzar por esta secuencia; Figma sigue siendo inspiración.

## Cómo trabajar y cerrar

Cada compañero lee primero estado/contexto y confirma rama/SHA/diff/remotas. Continúa la
tarea actual, sin reiniciar desde cero ni abrir otros módulos. Un único responsable activo
mantiene componentes, estilos, navegación y contratos. Los bloques B0–B5 anteriores sirven
como mapa de alcance; su reparto paralelo queda histórico y sustituido por esta secuencia.

Una parte termina cuando funciona su alcance, están verificadas las comprobaciones
pertinentes, se conocen sus límites y el relevo/contexto queda actualizado. Entonces revisar
diff/secretos/remotas, continuar numeración real `VNN_Accion_Modulos`, commit descriptivo en
rama personal, integración en serie/push a dev y sincronización personal sin force-push.
No hacer commits periódicos por tiempo o tokens. Puede cerrarse una subtarea definida aquí
sin declarar completo el módulo restante; registrar exactamente esa diferencia.

Si el usuario avisa de relevo a mitad de parte, actualizar estado y conservar diff sin commit.
Otro asistente en el mismo clon ve ese trabajo. Otro clon no: indicar qué diff sanitizado
hay que transferir y revisar antes de continuar. No incluir .env, cookies, audio ni datos reales.
La documentación de un avance incompleto no se publica con un commit para fingir cierre.

## Secuencia y partes revisables

| Etapa | Parte concreta | Fuentes principales | Aceptación / dependencia |
| --- | --- | --- | --- |
| U0 — Correcciones previas | U0.1 reporte existente; U0.2 acceso/campos accesibles | ClinicalReportEditor, clinicalService, LoginPage, Inp y tokens necesarios | Payload exacto de cuatro campos con ReporteSalida completo; error conserva borrador; ojo con nombre/estado y objetivo 44×44; quitar Recordarme sin contrato; contraste de campos/acceso y teclado. Primer cierre conjunto si ambas están verificadas |
| U1 — Base visual | U1.1 tokens/primitivas; U1.2 navegación/diálogos; U1.3 muestras | theme/brand, Btn/Inp/Crd/Bdg/RemoteFeedback, Sidebar/PageFrame, diálogos comunes | Catálogo aislado; estados/teclado/móvil; tres muestras Centro Familiar/reserva/expediente. Revisar muestras con usuario antes de ampliar la composición a todos los flujos |
| U2 — Familia | U2.1 Centro Familiar/Mi Camino; U2.2 seguimiento/reportes/perfil/ayuda | B2 y selección de hijo compartida | Datos autorizados, próxima acción clara, vacío/error/cambio de niño, lectura de próximos pasos, PDF; escritorio/móvil |
| U3 — Atención | U3.1 reserva/agenda tres roles; U3.2 sesión/expediente/reportes | B3, BookingDialog/SessionActions/ReportWorkspace | Reserva→atención→reporte editable→lectura B2; permisos/estados reales. Recomendación textual existente, sin inventar campos formales |
| U4 — Administración | U4.1 cuentas; U4.2 pacientes/tratamientos/panel | B1 | Preparar cuenta→niño→tratamiento; roles/fechas/errores y familias correctas. Preservar datos anteriores |
| U5 — Mensajes | Ambos extremos, listado/hilo/borrador | B4 | Mismo chat autorizado, paginación/error/borrador; ADMIN no obtiene chats privados |
| U6 — Mundo ASHA mínimo | U6.1 MA-01/02 contrato; U6.2 primer juego/persistencia | B5 y MUNDO_ASHA_PLAN | Validación de reglas/modelo antes de migrar; B3→B2→B5 completo; pájaro/troncos/voz/silencio, permisos/alternativa/pausa, progreso por niño entre dispositivos. Sin audio ni evaluación clínica |
| U7 — Cobertura restante | Web pública, acceso restante y rutas secundarias retenidas | Matriz de 96 rutas, alias incluidos | Aplicar sistema a pantallas conservadas; limpiar copy interno, honestidad de funciones incompletas, navegación/alias y semántica. Sin funciones/pagos/IA nuevos |
| U8 — Aceptación integral | Recorrido real, cobertura visual, documentación final | Checklist/estado/matriz/evidencia | Flujos completos con permisos y persistencia, contraste/foco/reflujo, errores, referencias/SHA; auditoría nueva solo si se solicita/realiza ese corte, con PDF según protocolo |

Cada cierre actualiza cobertura por archivos/rutas, sin afirmar que una primitiva corregida
equivale a haber revisado todas sus pantallas consumidoras. Build y tests con mocks no
sustituyen aceptación HTTP/SQL, visual o de hardware. No crear usuarios/datos reales para
pruebas sin petición explícita; fixtures destructivas solo en BD descartable autorizada.

## Límites y dependencias que se conservan

- React→HTTP/JSON→FastAPI→SQLAlchemy/PostgreSQL; autenticación propia y autorización por recurso.
- Reporte solo cuatro campos; `proximos_pasos` comunica recomendación textual. Asociación
  formal y seguimiento educativo requieren contrato/modelo/permisos antes de API/migración.
- Mundo ASHA obligatorio con un primer juego completo; restantes mundos siguen borrador.
- No métricas/nombres/historial ficticios, borrado o renombrado AUDITORIA ni datos anteriores.
- UI dice «Horarios de Perú» sin alterar lógica horaria. Configuración de QA separada del
  runtime/piloto. No pagos, IA, reconocimiento clínico ni audio almacenado.
- Hosting manual: integración Git no despliega automáticamente; registrar SHA real cuando
  se solicite publicar imagen. Los cortes históricos no se reescriben.

## Prompt general de continuación

> Continúa AshaKids con lo que dejó el anterior compañero documentado en
> docs/VISUAL_IMPLEMENTATION_STATE.md. Lee AGENTS.md, PROJECT_CONTEXT.md, el plan visual
> y DESIGN/PRODUCT; confirma rama/SHA y preserva el diff pendiente. Sigue la siguiente acción
> exacta, trabajando solo en mi rama personal y un módulo a la vez. Actualiza el estado y
> contexto antes de relevar. Solo cuando termine una parte coherente, verificada y revisable,
> haz commit VNN_Accion_Modulos con descripción, integra/publica en dev y sincroniza mi rama.
> No declares completo lo pendiente ni implementes pagos/IA o migraciones sin contrato revisado.
