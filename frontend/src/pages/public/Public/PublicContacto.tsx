import { useState } from "react";
import { Phone, Mail, Globe, MapPin, Clock, Send } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicContacto({ go }: { go: (v: View) => void }) {
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/contacto" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Contáctanos</h1>
          <p className="text-lg text-[#7C6F9A] font-medium">Estamos aquí para ayudarte. Intentamos responder en menos de 24 horas hábiles.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Crd className="p-6">
            <h3 className="font-extrabold text-[#1C1135] mb-5">Envíanos un mensaje</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Nombre completo</label>
                <input className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                  placeholder="Tu nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Correo electrónico</label>
                <input className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                  placeholder="tu@correo.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Mensaje</label>
                <textarea className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400 resize-none"
                  rows={4} placeholder="¿En qué podemos ayudarte?" value={form.msg} onChange={e => setForm(f => ({ ...f, msg: e.target.value }))} />
              </div>
              <Btn variant="cta" onClick={() => {}} className="justify-center"><Send size={14} /> Enviar mensaje</Btn>
            </div>
          </Crd>
          {/* Info */}
          <div className="flex flex-col gap-4">
            {[
              { icon: <Mail size={20} />,    label: "Email",     val: "hola@ashakids.com",   color: B.violet },
              { icon: <Phone size={20} />,   label: "WhatsApp",  val: "+1 (555) 123-4567",   color: "#25D366" },
              { icon: <Globe size={20} />,   label: "Sitio web", val: "www.ashakids.com",     color: B.teal   },
              { icon: <Clock size={20} />,   label: "Horario",   val: "Lun–Vie 9:00–18:00",  color: B.orange  },
              { icon: <MapPin size={20} />,  label: "Ubicación", val: "Ciudad de México, MX", color: "#EC4899" },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl p-4 border border-[#E8E5F4] flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${c.color}15`, color: c.color }}>{c.icon}</div>
                <div>
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider">{c.label}</p>
                  <p className="font-bold text-[#1C1135] text-sm">{c.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}
