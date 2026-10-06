/**
 * Orchestrator for the Terapeuta module.
 * Re-exports submodules for modularity and full backward compatibility.
 */

export { downloadPdf } from "./downloadPdf";
export { MiCaminoAsha } from "./MiCaminoAsha";
export { TerapeutaHome } from "./TerapeutaHome";
export { TerapeutaPacientes, type ExpTab } from "./TerapeutaPacientes";
export { TerapeutaAgenda } from "./TerapeutaAgenda";
export { TerapeutaReportes } from "./TerapeutaReportes";
export { TerapeutaAnaliticas } from "./TerapeutaAnaliticas";
export { TerapeutaMensajes } from "./TerapeutaMensajes";
export { TerapeutaIngresos, TerapeutaValoraciones } from "./TerapeutaFinanzas";
export { TerapeutaIncidencias, TerapeutaConfig } from "./TerapeutaConfig";
