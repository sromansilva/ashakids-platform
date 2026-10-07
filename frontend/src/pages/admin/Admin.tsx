/**
 * Orchestrator for the Admin module.
 * Re-exports submodules for modularity and full backward compatibility.
 */

export { AdminPanel } from "./AdminPanel";
export { AdminOperacion } from "./AdminOperacion";
export { AdminML } from "./AdminML";
export {
  AdminCuentas,
  type AccountRole,
  type AccountStatus,
  type ManagedAccount,
  INITIAL_ACCOUNTS,
  STATUS_LABEL,
  STATUS_COLOR,
} from "./AdminCuentas";
export { AdminAuditoria } from "./AdminAuditoria";
export { AdminTerapeutas, AdminTerapias } from "./AdminTerapeutas";
export { AdminFinanzas, AdminPagos } from "./AdminFinanzas";
export { AdminContenido } from "./AdminContenido";
export { AdminConfig } from "./AdminConfig";
export { AshaCore } from "./AshaCore";
export {
  adminMonthly,
  AdminReportes,
  AdminUsuarios,
  AdminPacientes,
  AdminCitas,
  AdminSesiones,
  AdminAnaliticas,
  AdminMensajes,
  AdminModeracion,
} from "./AdminModulosGenerales";
