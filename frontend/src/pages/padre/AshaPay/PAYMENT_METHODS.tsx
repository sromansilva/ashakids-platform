import { B } from "@/theme/brand/B";

// ─── ASHA Pay ──────────────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
  { id: "card",     icon: "💳", label: "Tarjeta",          sub: "Crédito o Débito",            color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "yape",     icon: "📱", label: "Yape",             sub: "Pago inmediato",               color: "#6D28D9", bg: "#EDE9FE", border: "#C4B5FD" },
  { id: "plin",     icon: "📲", label: "Plin",             sub: "Rápido y sin comisión",        color: "#0891B2", bg: "#E0F2FE", border: "#7DD3FC" },
  { id: "gpay",     icon: "🟢", label: "Google Pay",       sub: "Paga con tu cuenta Google",   color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" },
  { id: "apple",    icon: "🍎", label: "Apple Pay",        sub: "Touch o Face ID",             color: "#1C1135", bg: "#F1F5F9", border: "#CBD5E1" },
  { id: "paypal",   icon: "🅿️", label: "PayPal",           sub: "Protección al comprador",     color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "transfer", icon: "🏦", label: "Transferencia",    sub: "Cuenta bancaria",             color: "#0D9488", bg: "#CCFBF1", border: "#5EEAD4" },
  { id: "wallet",   icon: "💙", label: "Wallet ASHA",      sub: "S/ 120.00 disponibles",       color: B.violet,  bg: B.violetLight, border: "#A78BFA" },
];
