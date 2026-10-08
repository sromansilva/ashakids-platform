import { useState } from "react";
import { View } from "@/types/navigation";
import { kids } from "@/mocks/demo";

export function usePadreConfig({ onNameChange, padrePlan = "exploracion", go: configGo }: { onNameChange?: (n: string) => void; padrePlan?: "exploracion" | "familia"; go?: (v: View) => void }) {
const [tab, setTab] = useState<
    | "cuenta"
    | "hijos"
    | "notificaciones"
    | "privacidad"
    | "seguridad"
  >("cuenta");
const [toast, setToast] = useState("");
const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };
const [nombre, setNombre] = useState("Laura Gómez");
const [email, setEmail] = useState("laura.gomez@email.com");
const [tel, setTel] = useState("+1 (555) 987-6543");
const [ciudad, setCiudad] = useState("Ciudad de México");
const [showPhotoModal, setShowPhotoModal] = useState(false);
const [selectedAvatar, setSelectedAvatar] = useState("👤");
const userAvatarOptions = ["👤", "🦊", "🐻", "🐰", "🦁", "🐼", "🐨", "🐸", "🦋", "🌟", "🎭", "🌺"];
const [showPwConfirmModal, setShowPwConfirmModal] = useState(false);
const [pwConfirmInput, setPwConfirmInput] = useState("");
const [childList, setChildList] = useState(kids);
const [showAddChildModal, setShowAddChildModal] =
    useState(false);
const [showPlanUpgradeModal, setShowPlanUpgradeModal] = useState(false);
const [editChild, setEditChild] = useState<
    (typeof kids)[0] | null
  >(null);
const [deleteChild, setDeleteChild] = useState<
    (typeof kids)[0] | null
  >(null);
const [newCN, setNewCN] = useState("");
const [newCA, setNewCA] = useState("");
const [newCS, setNewCS] = useState("Lenguaje");
const [newBirth, setNewBirth] = useState("");
const [newAvatar, setNewAvatar] = useState("🐻");
const avatarOptions = [
    "🐻",
    "🦊",
    "🐼",
    "🐨",
    "🐸",
    "🦁",
    "🐙",
    "🦋",
    "🐬",
    "🦄",
    "🐧",
    "🐺",
    "🦝",
    "🐱",
    "🐶",
    "🐹",
    "🐰",
    "🦔",
    "🦜",
    "🐳",
  ];
const [notifs, setNotifs] = useState({
    citas: true,
    recordatorios: true,
    reportes: true,
    mensajes: true,
    progreso: true,
    promo: false,
  });
const toggleN = (k: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [k]: !n[k] }));
const [consentsPriv, setConsentsPriv] = useState({
    dataPerfil: true,       // OBLIGATORIO - ya aceptado
    compartirTerapeuta: true, // OBLIGATORIO - ya aceptado
    camaraSessiones: true,  // Contextual - activo
    vozActividades: false,  // OPCIONAL - no activo
    mlInvestigacion: false, // OPCIONAL ML - desactivado por defecto
  });
const toggleConsentsPriv = (k: keyof typeof consentsPriv) => {
    if (k === "dataPerfil" || k === "compartirTerapeuta") return; // obligatorios no se pueden revocar aquí
    setConsentsPriv(prev => ({ ...prev, [k]: !prev[k] }));
  };
const [showRevokeOptional, setShowRevokeOptional] = useState(false);
const [showDownloadModal, setShowDownloadModal] =
    useState(false);
const [downloadSent, setDownloadSent] = useState(false);
const [accountStatus, setAccountStatus] = useState<"activa" | "desactivada">("activa");
const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
const [showReactivateFlow, setShowReactivateFlow] = useState(false);
const [reactivateCode, setReactivateCode] = useState("");
const [pwCurrent, setPwCurrent] = useState("");
const [pwNew, setPwNew] = useState("");
const [pwConfirm, setPwConfirm] = useState("");
const [show2FA, setShow2FA] = useState(false);
const [twoFADone, setTwoFADone] = useState(false);
const [showDeleteAccount, setShowDeleteAccount] =
    useState(false);
const [deleteConfirm, setDeleteConfirm] = useState("");
const tabs = [
    { key: "cuenta" as const, label: "Mi cuenta", icon: "👤" },
    { key: "hijos" as const, label: "Mis hijos", icon: "👧" },
    {
      key: "notificaciones" as const,
      label: "Notificaciones",
      icon: "🔔",
    },
    {
      key: "privacidad" as const,
      label: "Privacidad",
      icon: "🛡️",
    },
    {
      key: "seguridad" as const,
      label: "Seguridad",
      icon: "🔐",
    },
  ];
return { onNameChange, configGo, padrePlan, tab, setTab, toast, setToast, showToast, nombre, setNombre, email, setEmail, tel, setTel, ciudad, setCiudad, showPhotoModal, setShowPhotoModal, selectedAvatar, setSelectedAvatar, userAvatarOptions, showPwConfirmModal, setShowPwConfirmModal, pwConfirmInput, setPwConfirmInput, childList, setChildList, showAddChildModal, setShowAddChildModal, showPlanUpgradeModal, setShowPlanUpgradeModal, editChild, setEditChild, deleteChild, setDeleteChild, newCN, setNewCN, newCA, setNewCA, newCS, setNewCS, newBirth, setNewBirth, newAvatar, setNewAvatar, avatarOptions, notifs, setNotifs, toggleN, consentsPriv, setConsentsPriv, toggleConsentsPriv, showRevokeOptional, setShowRevokeOptional, showDownloadModal, setShowDownloadModal, downloadSent, setDownloadSent, accountStatus, setAccountStatus, showDeactivateConfirm, setShowDeactivateConfirm, showReactivateFlow, setShowReactivateFlow, reactivateCode, setReactivateCode, pwCurrent, setPwCurrent, pwNew, setPwNew, pwConfirm, setPwConfirm, show2FA, setShow2FA, twoFADone, setTwoFADone, showDeleteAccount, setShowDeleteAccount, deleteConfirm, setDeleteConfirm, tabs };
}
