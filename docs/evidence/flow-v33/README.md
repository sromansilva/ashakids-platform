# Evidencia de implementación — registro y activación

2026-10-10. BaseV32/ebb8632, trabajo codex/2do-intento. Repositorio:
https://github.com/sromansilva/ashakids-platform . No es una auditoría nueva.

- PostgreSQL17.6 local6544/ashakids_test_flujo_v33_20261010 creada vacía para este avance.
- backend-requests.json: rutas/métodos/estados observados por fixture de suite local;
  no contiene cookies, tokens, DNI, contraseñas o datos clínicos reales.
- Backend191 aprobadas/25 omitidas/19 deprecaciones; frontend267 componentes/25 rutas,
  tipos/check323/build correctos. Ver comandos/límites en docs/acceptance/NUEVO_FLUJO.md.
- familia-registrada.png: alta por asesor de familia sintética con dos hijos en web5175/API8002.
- activacion-desktop.png: ingreso de P90003 bloqueado en activación antes del panel.
  Inspección adicional móvil390x844 efectiva, restablecida después. Ninguna captura incluye
  contraseñas ni documentos reales. La rotación de credencial se ensayó por API/SQL.
- Regresión de fechas añadida tras primer ensayo UI fallido; alta posterior correcta.

Solo representa el primer avance; introducción/disponibilidad/plan/continuidad/juegos siguen
pendientes. No certifica BD compartida, hostingHTTPS ni el recorrido completo.
