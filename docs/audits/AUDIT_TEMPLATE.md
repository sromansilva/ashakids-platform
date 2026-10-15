# ASHAKids | Auditoría técnica — [ID y alcance]

Plantilla sin resultados. Reemplazar campos al realizar una auditoría; no entregarla como informe terminado.

Fecha/hora/zona: [America/Lima]. Responsable: [persona].
Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama: [rama]. SHA auditado: [SHA completo]. Árbol Git: [limpio o cambios detallados].
Entorno: [versiones frontend/backend/BD; aislado/compartido solo lectura].
Alcance: [operaciones/pantallas/casos]. Exclusiones: [qué no se verificó].
Entrega académica vigente: 2026-10-09 18:00 America/Lima.

## 01. Dictamen ejecutivo

[Conclusión sustentada, capacidades comprobadas, bloqueos y siguiente prioridad.]

| Indicador | Resultado de este corte | Tipo de evidencia |
| --- | --- | --- |
| Operaciones implementadas | [inventario real] | [código/OpenAPI] |
| Pruebas | [correctas/fallidas/omitidas/advertencias] | [reporte y comando] |
| Persistencia | [lectura posterior verificada o no verificada] | [entorno/caso] |
| Recorrido de roles | [casos verificados] | [E2E/API/mock: distinguir] |

## 02. Arquitectura y cambios realizados

[Capas reales, tecnologías/versiones, contratos, archivos y decisiones.]
[Modelo físico, tablas/PK/FK y correspondencia con modelos; evidencia del entorno real utilizado.]
[Cambios de este corte y qué ya existía; ADR si aplica.]

## 03. APIs funcionando: identidad y pacientes

| Método/ruta | Permiso | Estado observado | Evidencia y entorno |
| --- | --- | --- | --- |
| [operación] | [rol/recurso] | [resultado real o no ensayado] | [archivo/caso] |

[Login/logout, usuarios, pacientes, tratamiento según alcance; rechazo de acceso ajeno.]

## 04. APIs funcionando: citas, sesiones y sistema

| Método/ruta | Permiso/transición | Estado observado | Persistencia/evidencia |
| --- | --- | --- | --- |
| [operación] | [regla] | [resultado] | [caso] |

[health no equivale a readiness; readiness no certifica esquema completo ni E2E.]

## 05. APIs no operativas y capacidades faltantes

| Capacidad | Estado y evidencia | Acción dentro del alcance |
| --- | --- | --- |
| [función] | [ausente/parcial/rota/no verificada] | [tarea] |
| Pagos | Fuera del alcance de implementación por observación del profesor | Sin desarrollo ni commits dedicados; maqueta existente demostrativa |

[Separar faltantes obligatorios de ideas futuras; no presentar errores esperados 401/403/409 como API rota.]

## 06. Seguridad y riesgos priorizados

| Prioridad | Hallazgo y evidencia | Impacto concreto | Acción/responsable |
| --- | --- | --- | --- |
| [prioridad] | [hallazgo confirmado] | [afectación] | [tarea] |

[Usuarios, sesiones, permisos por recurso, validación, secretos, errores y límites realmente comprobados.]
[No revelar credenciales ni declarar pentest/cumplimiento si no se ejecutó.]

## 07. Evidencia de validación y límites

| Comando/caso | Entorno | Resultado real | Archivo reproducible |
| --- | --- | --- | --- |
| [comando/caso exacto] | [aislado] | [resultado/advertencias/omitidos] | [ruta] |

| Rúbrica recibida | Evidencia | Estado y límite |
| --- | --- | --- |
| Arquitectura/backend | [capas/operaciones/ejecución] | [estado] |
| BD/modelo físico/relaciones | [esquema y operaciones persistentes] | [estado] |
| Seguridad/validación | [permisos, pruebas funcionales/no funcionales] | [estado] |

[Evidencia histórica citada por corte, no contada como ejecución nueva. Diferenciar mocks,
API, lecturas posteriores y navegador/dispositivos reales. Casos no ensayados explícitos.]

## 08. Cierre y ruta de entrega

[Acciones ordenadas, responsables y aceptación; guion reproducible y próximo relevo.]
[Estado de commit/push/despliegue y enlace del repositorio. No afirmar publicación inexistente.]
[Qué falta para el alcance académico; recomendaciones de producción separadas del cierre académico.]
