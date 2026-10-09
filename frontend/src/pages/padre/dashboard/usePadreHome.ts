import { useState } from "react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { kids } from "@/mocks/demo";
import { PadreNotif } from "@/types/PadreNotif";
import { useFamilyPatients } from "@/hooks/useFamilyPatients";
import { useAppointments } from "@/hooks/useAppointments";

export function usePadreHome({ go, padreUserName = "Laura Gómez", padrePlan = "exploracion", extraNotifs = [], onNotifsRead }: { go: (v: View) => void; padreUserName?: string; padrePlan?: "exploracion" | "familia"; extraNotifs?: PadreNotif[]; onNotifsRead?: () => void }) {
  const { children: familyKids, query: familyQuery } = useFamilyPatients();
  const { appointments: familyAppts } = useAppointments();
  const [activeChild, setActiveChild] = useState(0);
const [childLoading, setChildLoading] = useState(false);
const handleSetChild = (i: number, changed: boolean) => {
    if (changed) {
      setChildLoading(true);
      setTimeout(() => { setActiveChild(i); setChildLoading(false); }, 1000);
    } else {
      setActiveChild(i);
    }
  };
const [searchVal, setSearchVal] = useState("");
const [showNotifs, setShowNotifs] = useState(false);
const [notifsRead, setNotifsRead] = useState(false);
const [showReprog, setShowReprog] = useState(false);
const [showDetails, setShowDetails] = useState(false);
const [showArticle, setShowArticle] = useState<null | {
    icon: string;
    title: string;
    time: string;
  }>(null);
const [showAddChild, setShowAddChild] = useState(false);
const [newChildName, setNewChildName] = useState("");
const [newChildAge, setNewChildAge] = useState("");
const [addChildDone, setAddChildDone] = useState(false);
const [homeToast, setHomeToast] = useState("");
const staticNotifs: PadreNotif[] = [
    { icon: "📅", title: "Sesión mañana con Dra. Ruiz", time: "En 22 horas", color: B.violet, bg: B.violetLight },
    { icon: "✅", title: "Reporte de sesión disponible", time: "Hace 2 horas", color: B.success, bg: B.successLight },
    { icon: "🎯", title: "Mateo completó 3 actividades", time: "Hace 5 horas", color: B.orange, bg: B.orangeLight },
    { icon: "💬", title: "Mensaje de Dra. Ana Ruiz", time: "Ayer", color: "#2563EB", bg: "#DBEAFE" },
  ];
const notifs = [...extraNotifs, ...staticNotifs];
const hasUnread = extraNotifs.length > 0 && !notifsRead;
const searchIndex: { label: string; view: View }[] = [
    { label: "Mi agenda", view: "padre/agenda" },
    { label: "Especialistas", view: "padre/psicologos" },
    { label: "Progreso", view: "padre/progreso" },
    { label: "Reportes", view: "padre/reportes" },
    { label: "Mensajes", view: "padre/mensajes" },
    { label: "Mundo ASHA", view: "mundo-asha" },
    { label: "Recompensas", view: "padre/recompensas" },
    { label: "Configuración", view: "padre/config" },
  ];
const searchResults =
    searchVal.trim().length > 1
      ? searchIndex.filter((s) =>
          s.label
            .toLowerCase()
            .includes(searchVal.toLowerCase()),
        )
      : [];
  const childrenList = familyKids.length > 0 ? familyKids : kids;
  const child = childrenList[activeChild] ?? childrenList[0] ?? kids[0];
  const nextSessionAppt = familyAppts.find(
    (a) => (a.child.toLowerCase().includes(child.name.toLowerCase()) || child.name.toLowerCase().includes(a.child.toLowerCase())) &&
      (a.status === "confirmada" || a.status === "por confirmar")
  ) ?? familyAppts[0];
const recommendations = [
    {
      world: "🌳",
      name: "Bosque de los Cuentos",
      reason: "Actividad asignada · Mundo ASHA",
      view: "mundo-asha/cuentos" as View,
      color: "#059669",
      bg: "#D1FAE5",
    },
    {
      world: "🎵",
      name: "Montaña Musical",
      reason: "Actividad asignada · Mundo ASHA",
      view: "mundo-asha/canciones" as View,
      color: B.violet,
      bg: B.violetLight,
    },
    {
      world: "🧩",
      name: "Valle de Adivinanzas",
      reason: "Actividad educativa · Mundo ASHA",
      view: "mundo-asha/adivinanzas" as View,
      color: B.orange,
      bg: B.orangeLight,
    },
  ];
const achievements = [
    { icon: "🏆", name: "1ra sesión", color: B.orange },
    { icon: "🔥", name: "Racha 7d", color: "#EF4444" },
    { icon: "⭐", name: "12 sesiones", color: B.violet },
    { icon: "🎯", name: "Meta ASHA", color: B.teal },
  ];
const wellnessArticles = [
    {
      icon: "💙",
      title: "Cómo apoyar la terapia en casa",
      time: "5 min",
      color: B.violet,
      bg: B.violetLight,
    },
    {
      icon: "🌿",
      title: "Rutinas que potencian el aprendizaje",
      time: "4 min",
      color: B.teal,
      bg: B.tealLight,
    },
    {
      icon: "🌞",
      title: "Manejo del estrés infantil",
      time: "3 min",
      color: B.orange,
      bg: B.orangeLight,
    },
  ];
const calDays: (number | null)[] = [
    null,
    null,
    null,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
  ];
const apptDays = [30, 2, 6];
return { go, onNotifsRead, padreUserName, padrePlan, extraNotifs, activeChild, setActiveChild, childLoading, setChildLoading, handleSetChild, searchVal, setSearchVal, showNotifs, setShowNotifs, notifsRead, setNotifsRead, showReprog, setShowReprog, showDetails, setShowDetails, showArticle, setShowArticle, showAddChild, setShowAddChild, newChildName, setNewChildName, newChildAge, setNewChildAge, addChildDone, setAddChildDone, homeToast, setHomeToast, staticNotifs, notifs, hasUnread, searchIndex, searchResults, child, childrenList, nextSessionAppt, familyQuery, recommendations, achievements, wellnessArticles, calDays, apptDays };
}
