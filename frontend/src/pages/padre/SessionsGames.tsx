/**
 * Orchestrator for the Sessions & Games module (Padre / Mundo ASHA).
 * Re-exports submodules for modularity and full backward compatibility.
 */

export {
  SimulatedDataLog,
  ExitConfirmModal,
  SESSION_THERAPIST,
  Confetti,
  type VoiceRecognition,
} from "./GamesShared";
export { MundoAshaCuentos } from "./MundoAshaCuentos";
export { MundoAshaCanciones } from "./MundoAshaCanciones";
export { MundoAshaLaberinto } from "./MundoAshaLaberinto";
export { MundoAshaTrabalenguas } from "./MundoAshaTrabalenguas";
export { MundoAshaAdivinanzas } from "./MundoAshaAdivinanzas";
export { MundoAshaJuegos } from "./MundoAshaJuegos";
export {
  MundoAshaAcademia,
  MundoAshaRetos,
  MundoAshaInsignias,
  MundoAshaPerfil,
} from "./MundoAshaProgreso";
export { MundoAshaIsla } from "./MundoAshaIsla";
