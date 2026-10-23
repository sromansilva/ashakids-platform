# Administración ASHAKids — extensión V41

Modo: Operate. Construcción directa, mundo establecido de landing/login heredado.
THESIS: espacio de gestión claro, con navegación estable y registros como protagonistas.
OWN-WORLD: Nunito y marca violeta/naranja/teal; cristal tranquilo en shell/paneles y luz
lavanda estática, campos/filas opacos donde favorecen lectura y contraste.
STORY: reconocer sección → consultar resumen/filtrar → abrir detalle/formulario → acción existente.
FIRST VIEWPORT: sidebar claro, selección violeta y contexto superior; resumen compacto,
acciones reconocibles y área de próximas citas. Móvil conserva topbar/drawer existentes.
FORM: densidad operativa, radios12–18px, jerarquía fija, transiciones150–200ms sin entradas decorativas.
FINISH: revisión independiente en desktop/móvil/ancho real, contraste y estados; documentación
comparativa con DESIGN vigente. Sin raster nuevo ni dependencia de imágenes externas.

Alcance: shell solo ADMIN, panel, cuentas y estilos consistentes en páginas/diálogos admin.
Conservar rutas, data queries, filtros, callbacks, guard, menús/modales y rótulos demostrativos.
No modificar lógica de autenticación/API/BD ni convertir demos en funciones. No pagos ni Supabase.
Shared DashLayout/Sidebar/OperationalDashboard reciben solo clases/markup de presentación;
CSS aislado en .asha-admin, sin efectos en familia/terapeuta. Formularios siguen todos sus campos.
Sin elevar métricas de demostración a hechos ni falsear registros. Verificar interacción sin
crear/suspender/eliminar cuentas ni escribir registros clínicos reales.
