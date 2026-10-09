

export type AdventureStep =
  | "welcome"
  | "consent"
  | "context"
  | "adventure-map"
  | "station-1"
  | "station-2"
  | "station-3"
  | "station-4"
  | "station-5"
  | "parent-observations"
  | "child-celebration"
  | "adult-result"
  | "next-steps";

export type ResultCategory =
  | "sin-senales"
  | "seguimiento"
  | "evaluacion-prof"
  | "evaluacion-prioritaria";

export type StationId = 1 | 2 | 3 | 4 | 5;

export type ParentAnswer = "Frecuentemente" | "Algunas veces" | "Todavía no" | "No estoy seguro";

export interface StationResult {
  stationId: StationId;
  completed: boolean;
  hintsUsed: number;
  attempts: number;
  method: "buttons" | "voice";
  timeApprox: number; // seconds
}
