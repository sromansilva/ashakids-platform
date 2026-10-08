import { useState } from "react";
import { ChevronLeft, Download, Mail, Check, User, ArrowRight, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Av } from "@/components/common/Av";
import { Inp } from "@/components/common/Inp";
import { Confetti } from "@/components/illustrations/Confetti";
import { Ashi } from "@/components/illustrations/Ashi";

// ─── ASHA Pay ──────────────────────────────────────────────────────────────────
import { ASHA_PAY_PACKAGE } from "@/pages/padre/AshaPay/ASHA_PAY_PACKAGE";
import { PAYMENT_METHODS } from "@/pages/padre/AshaPay/PAYMENT_METHODS";

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
