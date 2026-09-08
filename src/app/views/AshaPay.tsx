import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Mail, Search, Check, User, ArrowRight, CheckCircle } from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, Inp, Confetti, Ashi } from "../shared";

// ─── ASHA Pay ──────────────────────────────────────────────────────────────────

const ASHA_PAY_PACKAGE = { therapist: "Dra. Ana Ruiz", av: "AR", color: B.violet, specialty: "Terapia del Lenguaje", modality: "Virtual", date: "Miérc. 6 Ago 2026", time: "10:00 AM", duration: "45 min", price: 45 };

const PAYMENT_METHODS = [
  { id: "card",     icon: "💳", label: "Tarjeta",          sub: "Crédito o Débito",            color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "yape",     icon: "📱", label: "Yape",             sub: "Pago inmediato",               color: "#6D28D9", bg: "#EDE9FE", border: "#C4B5FD" },
  { id: "plin",     icon: "📲", label: "Plin",             sub: "Rápido y sin comisión",        color: "#0891B2", bg: "#E0F2FE", border: "#7DD3FC" },
  { id: "gpay",     icon: "🟢", label: "Google Pay",       sub: "Paga con tu cuenta Google",   color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" },
  { id: "apple",    icon: "🍎", label: "Apple Pay",        sub: "Touch o Face ID",             color: "#1C1135", bg: "#F1F5F9", border: "#CBD5E1" },
  { id: "paypal",   icon: "🅿️", label: "PayPal",           sub: "Protección al comprador",     color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "transfer", icon: "🏦", label: "Transferencia",    sub: "Cuenta bancaria",             color: "#0D9488", bg: "#CCFBF1", border: "#5EEAD4" },
  { id: "wallet",   icon: "💙", label: "Wallet ASHA",      sub: "S/ 120.00 disponibles",       color: B.violet,  bg: B.violetLight, border: "#A78BFA" },
];

const TRANSACTIONS = [
  { id: "ASH-2024", date: "29 Jul 2026", therapist: "Dra. Ana Ruiz",       pkg: "Sesión individual 45 min", amount: 45,  status: "pagado",     method: "💳"  },
  { id: "ASH-2023", date: "22 Jul 2026", therapist: "Lic. C. Mendoza",     pkg: "Sesión individual 60 min", amount: 50,  status: "pagado",     method: "💙"  },
  { id: "ASH-2022", date: "15 Jul 2026", therapist: "Dra. Ana Ruiz",       pkg: "Paquete 6 horas",          amount: 210, status: "pagado",     method: "💳"  },
  { id: "ASH-2021", date: "08 Jul 2026", therapist: "Dra. María Torres",   pkg: "Sesión individual 45 min", amount: 55,  status: "reembolsado",method: "🅿️"  },
  { id: "ASH-2020", date: "01 Jul 2026", therapist: "Lic. C. Mendoza",     pkg: "Sesión individual 60 min", amount: 50,  status: "cancelado",  method: "📱"  },
  { id: "ASH-2019", date: "24 Jun 2026", therapist: "Dra. Ana Ruiz",       pkg: "Paquete 2 horas",          amount: 80,  status: "pendiente",  method: "🏦"  },
];

// Checkout wizard: summary → method → form → processing → confirmation
export function AshaPayCheckout({ go }: { go: (v: View) => void }) {
  const [step, setStep]           = useState<"summary" | "method" | "form" | "processing" | "done">("summary");
  const [method, setMethod]       = useState("card");
  const [promo, setPromo]         = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [saveCard, setSaveCard]   = useState(false);
  const [cardNum, setCardNum]     = useState("");
  const [cardName, setCardName]   = useState("");
  const [expiry, setExpiry]       = useState("");
  const [cvv, setCvv]             = useState("");
  const [email, setEmail]         = useState("laura@email.com");
  const [yapePhone, setYapePhone] = useState("");
  const [payFormSubmitted, setPayFormSubmitted] = useState(false);
  const pkg = ASHA_PAY_PACKAGE;

  const discount  = promoApplied ? 9 : 0;
  const tax       = 4.05;
  const commission = method === "paypal" ? 1.5 : 0;
  const total     = pkg.price - discount + tax + commission;

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === method)!;

  const STEPS = ["Reserva", "Pago", "Detalle", "Confirmar"];
  const stepIdx = { summary: 0, method: 1, form: 2, processing: 2, done: 3 };

  const isFormValid = (): boolean => {
    if (method === "card") return !!(cardName.trim() && cardNum.replace(/\s/g,"").length === 16 && expiry.length >= 5 && cvv.length >= 3);
    if (method === "yape" || method === "plin") return yapePhone.replace(/\D/g,"").length >= 9;
    if (method === "paypal") return !!email.trim() && email.includes("@");
    return true;
  };

  // Processing auto-advance
  const handlePay = () => {
    setPayFormSubmitted(true);
    if (!isFormValid()) return;
    setStep("processing");
    setTimeout(() => setStep("done"), 2200);
  };

  if (step === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${B.violetDeep} 0%, #4C1D95 100%)`, fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="text-center px-6">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-violet-300/30 animate-spin border-t-violet-300" />
            <div className="absolute inset-3 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <span className="text-3xl">💙</span>
            </div>
          </div>
          <p className="text-white font-black text-2xl mb-2">Procesando pago</p>
          <p className="text-violet-200 text-sm font-medium">Por favor esperá unos segundos…</p>
          <div className="flex justify-center gap-2 mt-5">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${B.violetDeep} 0%, #4C1D95 50%, #0D9488 100%)`, fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <Confetti />
        <div className="relative z-10 max-w-sm w-full">
          <div className="text-5xl mb-2 animate-bounce">🎉</div>
          <div className="mb-4"><Ashi size={110} mood="celebrate" /></div>
          <div className="rounded-3xl p-6 mb-6 text-left" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle size={22} className="text-emerald-400" />
              <p className="font-black text-white text-xl">¡Tu sesión está confirmada!</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["🔖", "Reserva",   "#ASH-2025"],
                ["📅", "Fecha",     pkg.date],
                ["⏰", "Hora",      pkg.time],
                ["👩‍⚕️","Terapeuta", pkg.therapist],
                ["💙", "Total",     `S/ ${total.toFixed(2)}`],
                ["✅", "Estado",    "Confirmada"],
              ].map(([icon, label, val]) => (
                <div key={label} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <p className="text-xs text-violet-300 font-bold mb-0.5">{icon} {label}</p>
                  <p className="text-sm font-extrabold text-white">{val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2.5 w-full">
            <button onClick={() => go("padre/agenda")}
              className="w-full py-3.5 rounded-2xl font-extrabold text-white text-sm transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
              📅 Ver cita en mi agenda
            </button>
            <button onClick={() => go("mundo-asha")}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm border-2 border-white/20 hover:bg-white/10 transition-all">
              🌈 Explorar Mundo ASHA
            </button>
          </div>
          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-violet-300 font-medium">
            <button className="hover:text-white transition-colors flex items-center gap-1"><Download size={12} /> Descargar PDF</button>
            <button className="hover:text-white transition-colors flex items-center gap-1"><Mail size={12} /> Enviar por correo</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.teal})` }}>
              💙
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1C1135]">ASHA Pay</h1>
              <p className="text-xs text-[#9E95B7] font-medium">Pago seguro y protegido</p>
            </div>
          </div>
          {/* Stepper */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const idx = stepIdx[step];
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all
                    ${i === idx ? "bg-violet-700 text-white" : i < idx ? "bg-emerald-100 text-emerald-700" : "bg-[#F5F3FF] text-[#9E95B7]"}`}>
                    {i < idx ? <Check size={11} strokeWidth={3} /> : null}
                    {s}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-4 h-px bg-[#E8E5F4]" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main column */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* ── STEP: SUMMARY ─────────────────────── */}
            {step === "summary" && (
              <>
                <Crd className="overflow-hidden">
                  <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${B.violet}, ${B.teal})` }} />
                  <div className="p-6">
                    <p className="text-xs font-black text-[#9E95B7] uppercase tracking-widest mb-5">Detalle de la reserva</p>
                    <div className="flex items-start gap-5">
                      <div className="relative flex-shrink-0">
                        <Av initials={pkg.av} color={pkg.color} size="xl" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-black text-[#1C1135]">{pkg.therapist}</p>
                        <p className="text-sm text-[#7C6F9A] font-medium mb-4">{pkg.specialty}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { icon: "💻", label: "Modalidad",  val: pkg.modality },
                            { icon: "📅", label: "Fecha",      val: pkg.date     },
                            { icon: "⏰", label: "Hora",       val: pkg.time     },
                            { icon: "⏱️", label: "Duración",   val: pkg.duration },
                            { icon: "💰", label: "Precio",     val: `S/ ${pkg.price}.00` },
                          ].map(item => (
                            <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: B.violetLight }}>
                              <div className="text-lg mb-1">{item.icon}</div>
                              <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{item.label}</p>
                              <p className="text-sm font-extrabold text-[#1C1135]">{item.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Crd>

                <Btn size="lg" variant="cta" className="w-full justify-center" onClick={() => setStep("method")}>
                  Continuar al pago <ArrowRight size={18} />
                </Btn>
              </>
            )}

            {/* ── STEP: PAYMENT METHOD ──────────────── */}
            {step === "method" && (
              <>
                <Crd className="p-5">
                  <h3 className="font-extrabold text-[#1C1135] mb-4">Elegí tu método de pago</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map(m => (
                      <button key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`flex items-center gap-3 rounded-2xl p-4 border-2 text-left transition-all duration-150 ${method === m.id ? "border-violet-500 shadow-sm shadow-violet-100" : "border-[#E8E5F4] hover:border-violet-300"}`}
                        style={{ background: method === m.id ? m.bg : "white" }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-[#E8E5F4] bg-white shadow-sm">
                          {m.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-sm text-[#1C1135] truncate">{m.label}</p>
                          <p className="text-xs text-[#9E95B7] font-medium truncate">{m.sub}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${method === m.id ? "border-violet-600" : "border-[#C4B5FD]"}`}
                          style={{ background: method === m.id ? B.violet : "transparent" }}>
                          {method === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </Crd>

                {/* Wallet balance highlight */}
                {method === "wallet" && (
                  <div className="rounded-3xl p-5 border-2 border-violet-300" style={{ background: B.violetLight }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-violet-500 uppercase tracking-wider mb-1">💙 Wallet ASHA</p>
                        <p className="font-black text-2xl text-violet-800">S/ 120.00</p>
                        <p className="text-xs text-violet-500 font-medium">Saldo disponible</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-violet-500 font-medium mb-1">Después del pago</p>
                        <p className="font-black text-xl text-violet-700">S/ {(120 - total).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Btn variant="outline" onClick={() => setStep("summary")} className="flex-shrink-0">
                    <ChevronLeft size={15} /> Volver
                  </Btn>
                  <button onClick={() => setStep(method === "card" ? "form" : "form")}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-white text-sm hover:brightness-110 transition-all"
                    style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
                    Continuar <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {/* ── STEP: FORM ───────────────────────── */}
            {step === "form" && (
              <>
                {method === "card" ? (
                  <Crd className="p-6">
                    {/* Card preview */}
                    <div className="rounded-3xl p-5 mb-6 relative overflow-hidden text-white"
                      style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #5B21B6 80%, ${B.teal} 100%)`, minHeight: 140 }}>
                      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
                      <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full bg-white/5" />
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-violet-300 font-bold mb-0.5">Titular</p>
                            <p className="font-extrabold text-sm">{cardName || "NOMBRE DEL TITULAR"}</p>
                          </div>
                          <span className="text-2xl">💙</span>
                        </div>
                        <div className="mt-4">
                          <p className="font-black text-lg tracking-[0.2em] mb-2">{cardNum || "•••• •••• •••• ••••"}</p>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-violet-300 font-bold">Vence</p>
                              <p className="font-bold text-sm">{expiry || "MM/AA"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-violet-300 font-bold">CVV</p>
                              <p className="font-bold text-sm">{cvv ? "•••" : "•••"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <Inp label="Nombre del titular" placeholder="Como figura en la tarjeta" value={cardName} onChange={setCardName} icon={<User size={14} />} />
                        {payFormSubmitted && !cardName.trim() && <p className="text-xs text-red-500 font-bold mt-1">El nombre del titular es requerido</p>}
                      </div>
                      <div>
                        <label className="text-sm font-bold text-[#1C1135] block mb-1.5">Número de tarjeta</label>
                        <div className="relative">
                          <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))}
                            placeholder="0000 0000 0000 0000" maxLength={19}
                            className={`w-full rounded-2xl border bg-[#F5F3FF] px-4 py-3 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 ${payFormSubmitted && cardNum.replace(/\s/g,"").length < 16 ? "border-red-400" : "border-[#E8E5F4]"}`} />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex gap-1 text-lg opacity-50">💳</div>
                        </div>
                        {payFormSubmitted && cardNum.replace(/\s/g,"").length < 16 && <p className="text-xs text-red-500 font-bold mt-1">Ingresa los 16 dígitos de tu tarjeta</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold text-[#1C1135] block mb-1.5">Vencimiento</label>
                          <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM / AA" maxLength={5}
                            className={`w-full rounded-2xl border bg-[#F5F3FF] px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 ${payFormSubmitted && expiry.length < 5 ? "border-red-400" : "border-[#E8E5F4]"}`} />
                          {payFormSubmitted && expiry.length < 5 && <p className="text-xs text-red-500 font-bold mt-1">Requerido</p>}
                        </div>
                        <div>
                          <label className="text-sm font-bold text-[#1C1135] block mb-1.5">CVV</label>
                          <input value={cvv} onChange={e => setCvv(e.target.value.slice(0, 4))} placeholder="•••" type="password" maxLength={4}
                            className={`w-full rounded-2xl border bg-[#F5F3FF] px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 ${payFormSubmitted && cvv.length < 3 ? "border-red-400" : "border-[#E8E5F4]"}`} />
                          {payFormSubmitted && cvv.length < 3 && <p className="text-xs text-red-500 font-bold mt-1">Requerido</p>}
                        </div>
                      </div>
                      <Inp label="Correo para comprobante" type="email" placeholder="correo@ejemplo.com" value={email} onChange={setEmail} icon={<Mail size={14} />} />
                      <label className="flex items-center gap-3 cursor-pointer rounded-2xl p-3.5 border border-[#E8E5F4] hover:bg-violet-50 transition-colors">
                        <div onClick={() => setSaveCard(s => !s)}
                          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${saveCard ? "border-violet-600 bg-violet-600" : "border-[#C4B5FD]"}`}>
                          {saveCard && <Check size={11} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-bold text-[#1C1135]">Guardar tarjeta para pagos futuros</span>
                      </label>
                    </div>
                  </Crd>
                ) : (
                  <Crd className="p-6 text-center">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 border-2"
                      style={{ background: selectedMethod.bg, borderColor: selectedMethod.border }}>
                      {selectedMethod.icon}
                    </div>
                    <h3 className="font-extrabold text-[#1C1135] text-xl mb-2">Pagar con {selectedMethod.label}</h3>
                    <p className="text-sm text-[#7C6F9A] font-medium mb-6">{selectedMethod.sub}</p>
                    {(method === "yape" || method === "plin") && (
                      <div className="text-left mb-5">
                        <label className="text-sm font-bold text-[#1C1135] block mb-1.5">Número de celular</label>
                        <input value={yapePhone} onChange={e => setYapePhone(e.target.value.replace(/\D/g,"").slice(0,9))}
                          placeholder="9XX XXX XXX" maxLength={9}
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-bold bg-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 ${payFormSubmitted && yapePhone.length < 9 ? "border-red-400" : "border-[#E8E5F4]"}`} />
                        {payFormSubmitted && yapePhone.length < 9 && <p className="text-xs text-red-500 font-bold mt-1">Ingresa tu número de celular (9 dígitos)</p>}
                        <div className="mt-5 p-5 rounded-2xl border-2 border-dashed" style={{ borderColor: selectedMethod.border, background: selectedMethod.bg }}>
                          <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: selectedMethod.color }}>Código QR</p>
                          <div className="w-28 h-28 mx-auto rounded-2xl flex items-center justify-center text-4xl bg-white border border-[#E8E5F4]">QR</div>
                          <p className="text-xs font-medium mt-2" style={{ color: selectedMethod.color }}>Escaneá desde tu app</p>
                        </div>
                      </div>
                    )}
                    {method === "paypal" && (
                      <div className="text-left mb-5">
                        <Inp label="Correo PayPal" type="email" value={email} onChange={setEmail} icon={<Mail size={14} />} />
                        {payFormSubmitted && (!email.trim() || !email.includes("@")) && <p className="text-xs text-red-500 font-bold mt-1">Ingresa un correo válido</p>}
                      </div>
                    )}
                    {method === "transfer" && (
                      <div className="mt-2 mb-5 text-left rounded-2xl p-4 border border-[#E8E5F4]" style={{ background: B.tealLight }}>
                        <p className="text-xs font-black text-teal-700 uppercase tracking-wider mb-3">Datos bancarios</p>
                        {[["Banco", "BCP"], ["Cuenta", "000-123456789-0-12"], ["CCI", "00200000123456789012"], ["Titular", "ASHAKids S.A.C."]].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1.5 border-b border-teal-200 last:border-0">
                            <span className="text-xs text-teal-700 font-bold">{k}</span>
                            <span className="text-xs font-extrabold text-teal-900 font-mono">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Inp label="Correo para comprobante" type="email" value={email} onChange={setEmail} icon={<Mail size={14} />} />
                  </Crd>
                )}

                {payFormSubmitted && !isFormValid() && (
                  <p className="text-sm text-red-500 font-bold text-center -mt-1">Completa todos los campos requeridos para continuar.</p>
                )}
                <div className="flex gap-3">
                  <Btn variant="outline" onClick={() => setStep("method")} className="flex-shrink-0">
                    <ChevronLeft size={15} /> Volver
                  </Btn>
                  <button onClick={handlePay}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-white text-sm hover:brightness-110 transition-all shadow-md shadow-violet-200"
                    style={{ background: `linear-gradient(135deg, ${B.orange} 0%, #EA580C 100%)` }}>
                    🔒 Pagar S/ {total.toFixed(2)}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar order summary */}
          <div className="flex flex-col gap-4">
            {/* Order summary */}
            <Crd className="overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${B.violet}, ${B.teal})` }} />
              <div className="p-5">
                <h3 className="font-extrabold text-[#1C1135] mb-4">Resumen del pago</h3>
                <div className="flex flex-col gap-2.5 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7C6F9A] font-medium">Sesión 45 min</span>
                    <span className="font-bold text-[#1C1135]">S/ {pkg.price}.00</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 font-bold flex items-center gap-1"><span>🎁</span> Descuento</span>
                      <span className="font-extrabold text-emerald-600">−S/ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7C6F9A] font-medium">IGV (18%)</span>
                    <span className="font-bold text-[#1C1135]">S/ {tax.toFixed(2)}</span>
                  </div>
                  {commission > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7C6F9A] font-medium">Comisión PayPal</span>
                      <span className="font-bold text-[#1C1135]">S/ {commission.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-[#F5F3FF] pt-3 flex justify-between">
                  <span className="font-extrabold text-[#1C1135]">Total</span>
                  <span className="font-black text-xl text-[#1C1135]">S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </Crd>

            <Crd className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-100 text-xl">✓</div>
                <div>
                  <p className="text-sm font-extrabold text-[#1C1135]">Pago protegido</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">Revisa el detalle antes de confirmar tu pago.</p>
                </div>
              </div>
            </Crd>

            {/* Payment method used */}
            {(step === "method" || step === "form") && (
              <Crd className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-[#E8E5F4] bg-white flex-shrink-0">
                  {selectedMethod.icon}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#1C1135]">{selectedMethod.label}</p>
                  <p className="text-xs text-[#9E95B7] font-medium">{selectedMethod.sub}</p>
                </div>
              </Crd>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Payment History
export function AshaPayHistory({ go }: { go: (v: View) => void }) {
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const statusColor: Record<string, "green" | "orange" | "red" | "gray"> = { pagado: "green", pendiente: "orange", cancelado: "red", reembolsado: "gray" };
  const filtered = TRANSACTIONS.filter(t =>
    (filter === "todos" || t.status === filter) &&
    (t.therapist.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search.toUpperCase()))
  );
  const totalPaid = TRANSACTIONS.filter(t => t.status === "pagado").reduce((a, t) => a + t.amount, 0);

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#1C1135]">Historial de Pagos</h1>
            <p className="text-sm text-[#7C6F9A] font-medium">Todos tus movimientos en ASHA Pay</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" size="sm"><Download size={13} /> Exportar</Btn>
            <Btn variant="cta" size="sm" onClick={() => go("pay")}>+ Nueva sesión</Btn>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: "💳", val: `S/ ${totalPaid}`, label: "Total pagado",    bg: B.violetLight, color: B.violet  },
            { icon: "✅", val: String(TRANSACTIONS.filter(t => t.status === "pagado").length),     label: "Sesiones pagas",  bg: "#DCFCE7",     color: "#16A34A" },
            { icon: "⏳", val: String(TRANSACTIONS.filter(t => t.status === "pendiente").length),   label: "Pendientes",      bg: "#FEF3C7",     color: "#B45309" },
            { icon: "↩️", val: String(TRANSACTIONS.filter(t => t.status === "reembolsado").length), label: "Reembolsos",      bg: "#F1F5F9",     color: "#64748B" },
          ].map(s => (
            <Crd key={s.label} className="p-4 text-center">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl mx-auto mb-2" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <p className="font-black text-lg text-[#1C1135]">{s.val}</p>
              <p className="text-xs text-[#9E95B7] font-medium">{s.label}</p>
            </Crd>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
            <input placeholder="Buscar por terapeuta o código…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["todos", "pagado", "pendiente", "cancelado", "reembolsado"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-extrabold capitalize transition-all ${filter === f ? "bg-violet-700 text-white" : "bg-white border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <Crd>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F5F3FF]">
                  {["ID", "Fecha", "Terapeuta", "Servicio", "Método", "Monto", "Estado", ""].map(h => (
                    <th key={h} className="text-left text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} className="border-b border-[#FAFAF9] hover:bg-[#F5F3FF] transition-colors">
                    <td className="px-5 py-4 text-xs font-black text-violet-600 font-mono">#{tx.id}</td>
                    <td className="px-5 py-4 text-sm text-[#7C6F9A] font-medium">{tx.date}</td>
                    <td className="px-5 py-4 text-sm font-extrabold text-[#1C1135]">{tx.therapist}</td>
                    <td className="px-5 py-4 text-sm text-[#7C6F9A] font-medium">{tx.pkg}</td>
                    <td className="px-5 py-4 text-xl">{tx.method}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#1C1135]">S/ {tx.amount.toFixed(2)}</td>
                    <td className="px-5 py-4"><Bdg color={statusColor[tx.status] || "gray"}>{tx.status}</Bdg></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-violet-50 rounded-xl text-[#9E95B7] hover:text-violet-600 transition-colors" title="Descargar PDF"><Download size={13} /></button>
                        <button className="p-1.5 hover:bg-violet-50 rounded-xl text-[#9E95B7] hover:text-violet-600 transition-colors" title="Enviar correo"><Mail size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-14 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm font-bold text-[#9E95B7]">No se encontraron transacciones</p>
              </div>
            )}
          </div>
        </Crd>
      </div>
    </div>
  );
}

// ASHA Wallet + Rewards
export function AshaPayWallet({ go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<"wallet" | "rewards">("wallet");
  const movements = [
    { icon: "💳", desc: "Sesión Dra. Ana Ruiz",      date: "29 Jul",  amount: -45,   type: "pago"       },
    { icon: "💎", desc: "Bonificación mensual",       date: "25 Jul",  amount: +20,   type: "bono"       },
    { icon: "↩️", desc: "Reembolso sesión cancelada", date: "20 Jul",  amount: +55,   type: "reembolso"  },
    { icon: "💳", desc: "Sesión Lic. C. Mendoza",    date: "15 Jul",  amount: -50,   type: "pago"       },
    { icon: "🔄", desc: "Recarga manual",             date: "10 Jul",  amount: +100,  type: "recarga"    },
    { icon: "💳", desc: "Sesión Dra. Ana Ruiz",      date: "06 Jul",  amount: -45,   type: "pago"       },
  ];
  const rewards = [
    { icon: "⭐", name: "Sesión completada",     pts: 135, date: "29 Jul", redeemable: false },
    { icon: "🏅", name: "Racha 7 días",          pts: 70,  date: "29 Jul", redeemable: false },
    { icon: "🎁", name: "Código ASHA20",         pts: -90, date: "22 Jul", redeemable: false },
    { icon: "⭐", name: "Sesión completada",     pts: 150, date: "22 Jul", redeemable: false },
    { icon: "💎", name: "Bono nuevos usuarios",  pts: 500, date: "01 Jun", redeemable: false },
  ];
  const totalPts = rewards.reduce((a, r) => a + r.pts, 0);

  const redeemOptions = [
    { icon: "💰", name: "S/ 10 de descuento",    pts: 500, bg: "#DCFCE7", color: "#16A34A" },
    { icon: "🎓", name: "Sesión gratis 45 min",  pts: 1500, bg: B.violetLight, color: B.violet  },
    { icon: "📚", name: "Material educativo",    pts: 300, bg: "#FEF3C7",  color: "#B45309" },
    { icon: "🎮", name: "Actividad Premium",     pts: 200, bg: B.tealLight, color: B.teal   },
  ];

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        <h1 className="text-2xl font-black text-[#1C1135] mb-6">💙 Wallet ASHA</h1>

        {/* Balance hero card */}
        <div className="rounded-3xl overflow-hidden mb-6 shadow-lg" style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 50%, ${B.teal} 100%)` }}>
          <div className="p-7 sm:p-9">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Saldo disponible</p>
                <p className="text-5xl font-black text-white mb-1">S/ 120.00</p>
                <p className="text-violet-200 text-sm font-medium">Actualizado hace 2 min</p>
                <div className="flex gap-3 mt-5">
                  <button className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2.5 rounded-2xl transition-all border border-white/20">
                    ⬆️ Recargar
                  </button>
                  <button onClick={() => go("pay/history")}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2.5 rounded-2xl transition-all border border-white/20">
                    📋 Historial
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Puntos ASHA</p>
                <p className="text-4xl font-black text-amber-300">{totalPts}</p>
                <p className="text-violet-200 text-xs font-medium">pts canjeables</p>
              </div>
            </div>
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-3 divide-x" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", divideColor: "rgba(255,255,255,0.1)" }}>
            {[["💸","Gastado","S/ 140"],["💎","Bonos","S/ 75"],["↩️","Reembolsos","S/ 55"]].map(([icon,label,val]) => (
              <div key={label} className="py-4 text-center">
                <div className="text-xl mb-0.5">{icon}</div>
                <p className="text-xs text-violet-300 font-medium">{label}</p>
                <p className="text-sm font-extrabold text-white">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(["wallet", "rewards"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all capitalize ${tab === t ? "bg-violet-700 text-white" : "bg-white border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50"}`}>
              {t === "wallet" ? "💙 Movimientos" : "⭐ Recompensas"}
            </button>
          ))}
        </div>

        {tab === "wallet" && (
          <Crd>
            <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between">
              <h3 className="font-extrabold text-[#1C1135]">Últimos movimientos</h3>
              <Btn size="sm" variant="ghost"><Download size={13} /> Exportar</Btn>
            </div>
            <div className="divide-y divide-[#FAFAF9]">
              {movements.map((m, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F5F3FF] transition-colors">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: m.amount > 0 ? "#DCFCE7" : B.violetLight }}>
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#1C1135]">{m.desc}</p>
                    <p className="text-xs text-[#9E95B7] font-medium">{m.date} · {m.type}</p>
                  </div>
                  <p className={`font-black text-base ${m.amount > 0 ? "text-emerald-600" : "text-[#1C1135]"}`}>
                    {m.amount > 0 ? "+" : ""}S/ {Math.abs(m.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Crd>
        )}

        {tab === "rewards" && (
          <>
            {/* Points balance */}
            <div className="rounded-3xl p-5 mb-5 border-2 border-amber-200" style={{ background: "#FEF9EE" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">🌟 Tus puntos</p>
                  <p className="font-black text-4xl text-amber-600">{totalPts}</p>
                  <p className="text-xs text-amber-600 font-medium">puntos disponibles</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-600 font-medium">Equivalen a</p>
                  <p className="font-black text-xl text-amber-700">S/ {(totalPts / 100).toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ background: "#FDE68A" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min((totalPts / 2000) * 100, 100)}%`, background: "#F59E0B" }} />
              </div>
              <p className="text-xs text-amber-600 font-medium mt-1">{2000 - totalPts} pts para el siguiente nivel</p>
            </div>

            {/* Redeem options */}
            <h3 className="font-extrabold text-[#1C1135] mb-4">Canjear puntos</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {redeemOptions.map(opt => (
                <div key={opt.name} className="rounded-3xl p-5 border-2" style={{ background: opt.bg, borderColor: opt.color + "40" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{opt.icon}</div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: opt.color, color: "white" }}>
                      {opt.pts} pts
                    </span>
                  </div>
                  <p className="font-extrabold text-sm text-[#1C1135] mb-3">{opt.name}</p>
                  <button
                    disabled={totalPts < opt.pts}
                    className={`w-full py-2 rounded-xl text-sm font-extrabold transition-all ${totalPts >= opt.pts ? "hover:opacity-90 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                    style={totalPts >= opt.pts ? { background: opt.color } : {}}>
                    {totalPts >= opt.pts ? "Canjear" : `Faltan ${opt.pts - totalPts} pts`}
                  </button>
                </div>
              ))}
            </div>

            {/* Points history */}
            <h3 className="font-extrabold text-[#1C1135] mb-3">Historial de puntos</h3>
            <Crd>
              <div className="divide-y divide-[#FAFAF9]">
                {rewards.map((r, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "#FEF3C7" }}>{r.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-[#1C1135]">{r.name}</p>
                      <p className="text-xs text-[#9E95B7] font-medium">{r.date}</p>
                    </div>
                    <p className={`font-black text-sm ${r.pts > 0 ? "text-amber-600" : "text-[#7C6F9A]"}`}>
                      {r.pts > 0 ? "+" : ""}{r.pts} pts
                    </p>
                  </div>
                ))}
              </div>
            </Crd>
          </>
        )}
      </div>
    </div>
  );
}

