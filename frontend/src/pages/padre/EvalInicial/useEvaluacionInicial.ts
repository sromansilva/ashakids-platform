import { useState } from "react";
import { View } from "@/types/navigation";
import { AdventureStep } from "@/pages/padre/EvalInicial/types";
import { StationId } from "@/pages/padre/EvalInicial/types";
import { ParentAnswer } from "@/pages/padre/EvalInicial/types";
import { StationResult } from "@/pages/padre/EvalInicial/types";
import { ResultCategory } from "@/pages/padre/EvalInicial/types";

export function useEvaluacionInicial({
  go,
  childName = "Mateo",
  childAgeMonths = 84,
}: {
  go: (v: View) => void;
  childName?: string;
  childAgeMonths?: number;
}) {
const [step, setStep] = useState<AdventureStep>("welcome");
const [consentGeneral, setConsentGeneral] = useState(false);
const [consentMic, setConsentMic] = useState(false);
const [_useMic, setUseMic] = useState(false);
const [stationResults, setStationResults] = useState<Partial<StationResult>[]>([]);
const [completedStations, setCompletedStations] = useState<StationId[]>([]);
const [currentStation, setCurrentStation] = useState<StationId>(1);
const [parentObs, setParentObs] = useState<Record<string, ParentAnswer>>({});
const [processing, setProcessing] = useState(false);
const [resultCategory, setResultCategory] = useState<ResultCategory>("seguimiento");
const [childLangs, setChildLangs] = useState("Español");
const [childBackground, setChildBackground] = useState("");
const [childNotes, setChildNotes] = useState("");
const ageYears = Math.floor(childAgeMonths / 12);
const ageMonthsRem = childAgeMonths % 12;
function handleStationComplete(result: Partial<StationResult>) {
    const newResults = [...stationResults, result];
    setStationResults(newResults);
    if (result.stationId) {
      setCompletedStations(prev => [...prev, result.stationId!]);
    }
    // Move to next station or parent observations
    if (currentStation < 5) {
      const next = (currentStation + 1) as StationId;
      setCurrentStation(next);
      setStep("adventure-map");
    } else {
      setStep("parent-observations");
    }
  }
function handleParentObsChange(qId: string, answer: ParentAnswer) {
    setParentObs(prev => ({ ...prev, [qId]: answer }));
  }
function handleParentObsSubmit() {
    setStep("processing" as any);
    setProcessing(true);
    setTimeout(() => {
      // Compute result
      const answeredCount = Object.keys(parentObs).length;
      const todonoCount = Object.values(parentObs).filter(a => a === "Todavía no").length;
      const ratio = answeredCount > 0 ? todonoCount / answeredCount : 0;
      let cat: ResultCategory = "sin-senales";
      if (ratio > 0.6) cat = "evaluacion-prioritaria";
      else if (ratio > 0.4) cat = "evaluacion-prof";
      else if (ratio > 0.2) cat = "seguimiento";
      setResultCategory(cat);
      setProcessing(false);
      setStep("child-celebration");
    }, 2800);
  }
function downloadPdf() {
    const content = `ORIENTACIÓN INICIAL ASHA\nDatos simulados para demostración\n\nNiño: ${childName}\nEdad: ${ageYears} años ${ageMonthsRem} meses\nFecha: ${new Date().toLocaleDateString("es-ES")}\n\nResultado orientativo: ${resultCategory}\n\nEste resultado es orientativo y no constituye un diagnóstico clínico.\nVersión evaluación: 1.0-demo | Modelo: ASHA-Eval-v1`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orientacion-asha-${childName.toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
return { go, childName, childAgeMonths, step, setStep, consentGeneral, setConsentGeneral, consentMic, setConsentMic, _useMic, setUseMic, stationResults, setStationResults, completedStations, setCompletedStations, currentStation, setCurrentStation, parentObs, setParentObs, processing, setProcessing, resultCategory, setResultCategory, childLangs, setChildLangs, childBackground, setChildBackground, childNotes, setChildNotes, ageYears, ageMonthsRem, handleStationComplete, handleParentObsChange, handleParentObsSubmit, downloadPdf };
}
