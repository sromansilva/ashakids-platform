import { useState } from "react";
import { ChevronRight, Check, Download, CreditCard, Calendar, Share2 } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";


// ─── Shared micro components ──────────────────────────────────────────────────
import { Toast } from "@/pages/padre/Padre/Toast";
import { Modal } from "@/pages/padre/Padre/Modal";
import { Apt } from "@/pages/padre/Padre/Apt";
import { Purchase } from "@/pages/padre/Padre/Purchase";
import { PURCHASES } from "@/pages/padre/Padre/PURCHASES";

export function PadreCompras({ go, appointments, onAppointmentsChange }: { go: (v: View) => void; appointments: Apt[]; onAppointmentsChange: React.Dispatch<React.SetStateAction<Apt[]>> }) {
  const [toast, setToast]       = useState("");
  const [receipt, setReceipt]   = useState<Purchase | null>(null);
  const [cart, setCart]         = useState<number | null>(null);
  const [coupon, setCoupon]     = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [openPayments, setOpenPayments] = useState<number[]>([]);
  const confirmedSessions = appointments.filter(apt => apt.status === "confirmada");
  const pendingPayments = confirmedSessions.filter(apt => apt.paymentStatus !== "pagada");
  const paidSessions = confirmedSessions.filter(apt => apt.paymentStatus === "pagada");

  const pkgs = [
    { id: 1, hours: 2,  price: "—", label: "Paquete Inicial",  popular: false, bg: B.violetLight, border: "#C4B5FD", discount: null },
    { id: 2, hours: 6,  price: "—", label: "Paquete Familiar", popular: true,  bg: "#EDE9FE",     border: B.violet,  discount: null },
    { id: 3, hours: 10, price: "—", label: "Paquete Completo", popular: false, bg: B.tealLight,   border: "#99F6E4", discount: null },
  ];

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "ASHA20") { setCouponApplied(true); setToast("Cupón ASHA20 aplicado: 20% de descuento"); }
    else setToast("Cupón no válido. Prueba con ASHA20");
  };

  const exportHistory = () => {
    setToast("Historial exportado como CSV");
  };

  const downloadPDF = (p: Purchase) => {
    setReceipt(p);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      {/* Receipt modal */}
      {receipt && (
        <Modal title="Comprobante de pago" onClose={() => setReceipt(null)}>
          <div className="p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3" style={{ background: B.successLight }}>✅</div>
              <p className="font-black text-[#1C1135] text-lg">Pago confirmado</p>
              <p className="text-xs text-[#9E95B7] font-medium">Ref: ASHA-{receipt.id.toString().padStart(6,"0")}</p>
            </div>
            <div className="rounded-2xl border border-[#E8E5F4] overflow-hidden mb-5">
              {[
                { l: "Fecha", v: receipt.date },
                { l: "Paquete", v: receipt.pkg },
                { l: "Terapeuta", v: receipt.therapist },
                { l: "Total pagado", v: receipt.amount },
                { l: "Método de pago", v: "Plataforma" },
                { l: "Estado", v: "Completado" },
              ].map(r => (
                <div key={r.l} className="flex justify-between px-4 py-3 border-b border-[#F5F3FF] last:border-0">
                  <span className="text-sm font-bold text-[#9E95B7]">{r.l}</span>
                  <span className="text-sm font-extrabold text-[#1C1135]">{r.v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="outline" className="flex-1 justify-center" onClick={() => { setReceipt(null); setToast("PDF descargado"); }}>
                <Download size={14} /> Descargar PDF
              </Btn>
              <Btn variant="ghost" className="flex-1 justify-center" onClick={() => { setReceipt(null); setToast("Comprobante compartido"); }}>
                <Share2 size={14} /> Compartir
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Cart / checkout modal */}
      {cart !== null && (
        <Modal title="Finalizar compra" onClose={() => setCart(null)}>
          <div className="p-6">
            {(() => {
              const pkg = pkgs.find(p => p.id === cart)!;
              const finalPrice = "—";
              return (
                <>
                  <div className="rounded-2xl p-4 border border-[#E8E5F4] mb-5">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-extrabold text-[#1C1135]">{pkg.label}</p>
                      <Bdg color="violet">{pkg.hours}h</Bdg>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#7C6F9A] font-medium">Subtotal</span>
                        <span className="font-bold">—</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-[#1C1135] border-t border-[#E8E5F4] pt-2">
                        <span>Total</span>
                        <span>—</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-5">
                    <p className="text-sm font-extrabold text-[#1C1135] mb-3">Método de pago</p>
                    {[
                      { icon: "💳", label: "Pago por plataforma", sub: "Recomendado" },
                      { icon: "💰", label: "Tarjeta de crédito/débito", sub: "Visa · Mastercard" },
                    ].map((m, i) => (
                      <button key={i} className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 mb-2 text-left transition-all"
                        style={{ borderColor: i === 0 ? B.violet : B.border, background: i === 0 ? B.violetLight : "white" }}>
                        <span className="text-2xl">{m.icon}</span>
                        <div>
                          <p className="font-extrabold text-sm text-[#1C1135]">{m.label}</p>
                          <p className="text-xs text-[#9E95B7] font-medium">{m.sub}</p>
                        </div>
                        {i === 0 && <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: B.violet }}><Check size={10} color="white" /></div>}
                      </button>
                    ))}
                  </div>
                  <Btn variant="cta" className="w-full justify-center" onClick={() => { setCart(null); setToast(`¡${pkg.label} adquirido exitosamente!`); go("pay"); }}>
                    <CreditCard size={14} /> Confirmar pago
                  </Btn>
                </>
              );
            })()}
          </div>
        </Modal>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Compras & Facturación</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Adquirí paquetes de horas para las terapias de tus hijos</p>
      </div>

      <Crd className="mb-7 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F3FF]"><h3 className="font-extrabold text-[#1C1135]">Detalle de la reserva</h3><p className="text-xs text-[#7C6F9A] font-medium mt-1">Datos simulados · Solo aparecen sesiones confirmadas.</p></div>
        <div className="p-4 sm:p-5 space-y-3">
          {pendingPayments.length === 0 ? (
            <div className="py-8 text-center"><p className="text-3xl mb-2">✓</p><p className="font-extrabold text-[#1C1135]">No tienes sesiones pendientes de pago</p></div>
          ) : pendingPayments.map((apt, index) => {
            const open = openPayments.includes(apt.id);
            const contentId = `payment-detail-${apt.id}`;
            return (
              <article key={apt.id} className="w-full min-h-[76px] rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden transition-shadow hover:shadow-sm">
                <button type="button" aria-expanded={open} aria-controls={contentId} onClick={() => setOpenPayments((current) => current.includes(apt.id) ? current.filter((id) => id !== apt.id) : [...current, apt.id])} className="w-full min-h-[76px] px-4 py-3 flex items-center gap-3 text-left hover:bg-[#F8F6FF] focus-visible:ring-2 focus-visible:ring-violet-500">
                  <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center" style={{ background: B.violetLight }}><Calendar size={17} className="text-violet-600" /></div>
                  <div className="min-w-0 flex-1"><p className="font-extrabold text-sm text-[#1C1135]">Sesión reservada {String(index + 1).padStart(2, "0")}</p></div>
                  <span className="text-xs font-bold text-emerald-600">Confirmada</span><ChevronRight size={17} className={`shrink-0 text-[#7C6F9A] transition-transform ${open ? "rotate-90" : ""}`} />
                </button>
                {open && <div id={contentId} className="px-4 pb-4 pt-3 border-t border-[#F5F3FF] text-sm text-[#7C6F9A] font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2 py-1"><p><span className="font-bold text-[#1C1135]">Terapeuta:</span> {apt.therapist}</p><p><span className="font-bold text-[#1C1135]">Niño:</span> {apt.child}</p><p><span className="font-bold text-[#1C1135]">Fecha:</span> {apt.date}</p><p><span className="font-bold text-[#1C1135]">Hora y duración:</span> {apt.time} · 45 min</p><p><span className="font-bold text-[#1C1135]">Modalidad:</span> {apt.type === "presencial" ? "Presencial" : "Virtual"}</p><p><span className="font-bold text-[#1C1135]">Referencia:</span> ASHA-{String(apt.id).slice(-6)}</p><p><span className="font-bold text-[#1C1135]">Confirmación:</span> Confirmada por terapeuta</p></div>
                  {apt.type === "presencial" && <div className="mt-2 rounded-xl p-2.5 flex items-center gap-2 border border-teal-100 text-xs" style={{background:"#F0FDFA"}}><span>📍</span><span className="font-medium text-[#0D9488]">Jr. Ricardo Treneman 252, Chorrillos 15064 · <a href="https://maps.google.com/?q=Jr.+Ricardo+Treneman+252,+Chorrillos+15064" target="_blank" rel="noopener noreferrer" className="underline">Ver mapa</a></span></div>}
                  <div className="mt-4 flex justify-end"><Btn size="sm" variant="cta" onClick={() => { onAppointmentsChange((current) => current.map((item) => item.id === apt.id ? { ...item, paymentStatus: "pagada" } : item)); setToast("Pago simulado registrado."); }}><CreditCard size={13} /> Pagar</Btn></div>
                </div>}
              </article>
            );
          })}
        </div>
        {paidSessions.length > 0 && <div className="px-5 py-4 border-t border-[#F5F3FF]"><p className="text-xs font-extrabold uppercase tracking-wider text-[#9E95B7] mb-2">Pagadas</p>{paidSessions.map(apt => <div key={apt.id} className="text-sm flex justify-between gap-3 py-1.5 text-[#7C6F9A]"><span>{apt.date} · {apt.therapist}</span><span className="font-bold text-emerald-600">Pagada</span></div>)}</div>}
      </Crd>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {pkgs.map(pkg => (
          <div key={pkg.id} className="rounded-3xl p-7 border-2 relative hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: pkg.bg, borderColor: pkg.popular ? B.violet : pkg.border }}
            onClick={() => setCart(pkg.id)}>
            {pkg.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap" style={{ background: B.violet }}>
                Más popular
              </div>
            )}
            {pkg.discount && (
              <div className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full" style={{ background: B.orangeLight, color: B.orange }}>
                {pkg.discount}
              </div>
            )}
            <p className="font-extrabold text-[#1C1135] mb-1">{pkg.label}</p>
            <p className="text-4xl font-black text-[#1C1135] mb-0.5">{pkg.price}</p>
            <p className="text-sm text-[#7C6F9A] font-medium mb-5">{pkg.hours} horas de terapia</p>
            <ul className="text-sm text-[#7C6F9A] flex flex-col gap-2.5 mb-6 font-medium">
              {["Válido por 6 meses", "Factura PDF incluida", "Cualquier terapeuta"].map(f => (
                <li key={f} className="flex items-center gap-2"><Check size={14} className="text-emerald-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Btn variant={pkg.popular ? "cta" : "outline"} className="w-full justify-center" onClick={e => { e.stopPropagation(); setCart(pkg.id); }}>
              <CreditCard size={14} /> Seleccionar paquete
            </Btn>
          </div>
        ))}
      </div>

      <Crd>
        <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-extrabold text-[#1C1135]">Historial de compras</h3>
          <div className="flex gap-2">
            <Btn size="sm" variant="ghost" onClick={exportHistory}><Download size={13} /> Exportar CSV</Btn>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5F3FF]">
                {["Fecha", "Paquete", "Terapeuta", "Monto", "Estado", ""].map(h => (
                  <th key={h} className="text-left text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PURCHASES.map(row => (
                <tr key={row.id} className="border-b border-[#FAFAF9] hover:bg-[#F5F3FF] transition-colors">
                  <td className="px-5 py-3.5 text-sm text-[#7C6F9A] font-medium">{row.date}</td>
                  <td className="px-5 py-3.5 text-sm font-extrabold text-[#1C1135]">{row.pkg}</td>
                  <td className="px-5 py-3.5 text-sm text-[#7C6F9A] font-medium">{row.therapist}</td>
                  <td className="px-5 py-3.5 text-sm font-black text-[#1C1135]">{row.amount}</td>
                  <td className="px-5 py-3.5"><Bdg color="green">{row.status}</Bdg></td>
                  <td className="px-5 py-3.5">
                    <Btn size="sm" variant="ghost" onClick={() => downloadPDF(row)}>
                      <Download size={12} /> PDF
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Crd>
    </div>
  );
}
