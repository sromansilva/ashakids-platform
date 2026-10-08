import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, CheckCircle, Mail, Phone, Globe, Upload } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { AshaKidsLogo } from "@/components/illustrations/AshaKidsLogo";

// ─── Shared auth shell ─────────────────────────────────────────────────────────
import { AuthShell } from "@/pages/auth/Auth/AuthShell";
import { FieldRow } from "@/pages/auth/Auth/FieldRow";
import { ProgressBar } from "@/pages/auth/Auth/ProgressBar";
import { T_STEPS } from "@/pages/auth/Auth/T_STEPS";

export function RegisterTerapeuta({ go }: { go: (v: View) => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", tel: "", ciudad: "", linkedin: "",
    especialidades: [] as string[],
    años: "", cedula: "", idiomas: [] as string[], sobre: "",
    dias: [] as string[], desde: "09:00", hasta: "17:00", duracion: "45 min",
    modalidad: [] as string[],
    tarifa: "",
  });

  const set = (k: keyof typeof form) => (v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k: "especialidades" | "idiomas" | "dias" | "modalidad", v: string) =>
    setForm(f => ({ ...f, [k]: (f[k] as string[]).includes(v) ? (f[k] as string[]).filter(x => x !== v) : [...(f[k] as string[]), v] }));

  const next = () => step < T_STEPS.length - 1 ? setStep(s => s + 1) : go("register/terapeuta/success");

  return (
    <AuthShell side={
      <div className="relative z-10 text-white text-center max-w-xs">
        <div className="flex justify-center mb-10">
          <AshaKidsLogo variant="auth" textColor="white" />
        </div>
        <div className="auth-float rounded-3xl p-6 mb-6" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)" }}>
          <div className="text-5xl mb-4">👩‍⚕️</div>
          <h3 className="font-extrabold text-lg mb-2">Únete al equipo de especialistas en lenguaje</h3>
          <p className="text-sm" style={{ color: "rgba(196,181,253,.85)" }}>Flexibilidad, tecnología de punta y familias que necesitan tu experiencia.</p>
        </div>
        {["Horarios flexibles", "ASHI como copiloto profesional", "Seguimiento clínico integrado", "Acompaña a familias que lo necesitan"].map((b, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} style={{ color: "#34D399" }} />
            <span className="text-sm font-medium" style={{ color: "rgba(196,181,253,.9)" }}>{b}</span>
          </div>
        ))}
        {/* Step progress */}
        <div className="mt-6 flex flex-col gap-1.5">
          {T_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                style={{ background: i < step ? "#34D399" : i === step ? "white" : "rgba(255,255,255,.2)", color: i === step ? B.violetDeep : "white" }}>
                {i < step ? <Check size={10} /> : i + 1}
              </div>
              <span className="text-xs font-bold" style={{ color: i <= step ? "white" : "rgba(196,181,253,.6)" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    }>
      <div className="w-full max-w-md">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : go("register")} className="flex items-center gap-1.5 text-sm font-bold text-[#7C6F9A] hover:text-violet-600 mb-5 transition-colors">
          <ArrowLeft size={15} /> {step === 0 ? "Volver" : "Paso anterior"}
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0" style={{ background: B.teal }}>{step + 1}</div>
          <div>
            <h2 className="font-black text-xl text-[#1C1135]">{T_STEPS[step]}</h2>
            <p className="text-xs text-[#9E95B7] font-medium">Paso {step + 1} de {T_STEPS.length}</p>
          </div>
        </div>
        <ProgressBar step={step + 1} total={T_STEPS.length} />

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Nombre" placeholder="Ana" value={form.nombre} onChange={set("nombre")} />
              <FieldRow label="Apellido" placeholder="Ruiz" value={form.apellido} onChange={set("apellido")} />
            </div>
            <FieldRow label="Correo electrónico" type="email" placeholder="ana@email.com" value={form.email} onChange={set("email")} icon={<Mail size={15} />} />
            <FieldRow label="Teléfono" placeholder="+1 (555) 000-0000" value={form.tel} onChange={set("tel")} icon={<Phone size={15} />} />
            <FieldRow label="Ciudad / País" placeholder="Ciudad de México, México" value={form.ciudad} onChange={set("ciudad")} icon={<Globe size={15} />} />
            <FieldRow label="LinkedIn (opcional)" placeholder="linkedin.com/in/anaruiz" value={form.linkedin} onChange={set("linkedin")} />
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Especialidades</p>
              <div className="flex flex-wrap gap-2">
                {["Terapia del Lenguaje", "Articulación y Fonología", "Comprensión del Lenguaje", "Fluidez del Habla", "Pragmática y Habilidades Sociales", "Comunicación Funcional"].map(e => (
                  <button key={e} onClick={() => toggleArr("especialidades", e)}
                    className="px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all"
                    style={{ borderColor: form.especialidades.includes(e) ? B.teal : B.border, background: form.especialidades.includes(e) ? B.tealLight : "white", color: form.especialidades.includes(e) ? B.teal : B.textMid }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Idiomas</p>
              <div className="flex flex-wrap gap-2">
                {["Español", "Inglés", "Portugués", "Francés"].map(l => (
                  <button key={l} onClick={() => toggleArr("idiomas", l)}
                    className="px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all"
                    style={{ borderColor: form.idiomas.includes(l) ? B.teal : B.border, background: form.idiomas.includes(l) ? B.tealLight : "white", color: form.idiomas.includes(l) ? B.teal : B.textMid }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Modalidad</p>
              <div className="flex gap-2">
                {["Virtual", "Presencial", "Ambas"].map(m => (
                  <button key={m} onClick={() => toggleArr("modalidad", m)}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all"
                    style={{ borderColor: form.modalidad.includes(m) ? B.teal : B.border, background: form.modalidad.includes(m) ? B.tealLight : "white", color: form.modalidad.includes(m) ? B.teal : B.textMid }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <FieldRow label="Años de experiencia" placeholder="8 años" value={form.años} onChange={set("años")} />
            <FieldRow label="Número de cédula profesional (opcional)" placeholder="TEL-2018-4821" value={form.cedula} onChange={set("cedula")} />
            <div>
              <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">Sobre mí y mi enfoque terapéutico</label>
              <textarea className="w-full rounded-2xl border border-[#E8E5F4] bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:border-teal-400 resize-none"
                rows={4} placeholder="Describe tu experiencia, metodología y por qué quieres formar parte de ASHAKids…"
                value={form.sobre} onChange={e => set("sobre")(e.target.value)} />
            </div>
            <FieldRow label="Tarifa por sesión (referencial)" placeholder="Ej: 65" value={form.tarifa} onChange={set("tarifa")} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Días disponibles</p>
              <div className="flex gap-2 flex-wrap">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
                  <button key={d} onClick={() => toggleArr("dias", d)}
                    className="w-12 h-12 rounded-2xl text-xs font-bold border-2 transition-all"
                    style={{ borderColor: form.dias.includes(d) ? B.teal : B.border, background: form.dias.includes(d) ? B.tealLight : "white", color: form.dias.includes(d) ? B.teal : B.textMid }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">Hora inicio</label>
                <select className="w-full rounded-2xl border border-[#E8E5F4] bg-white px-4 py-3 text-sm font-medium focus:outline-none" value={form.desde} onChange={e => set("desde")(e.target.value)}>
                  {["07:00","08:00","09:00","10:00","11:00"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">Hora fin</label>
                <select className="w-full rounded-2xl border border-[#E8E5F4] bg-white px-4 py-3 text-sm font-medium focus:outline-none" value={form.hasta} onChange={e => set("hasta")(e.target.value)}>
                  {["16:00","17:00","18:00","19:00","20:00"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-2">Duración de sesión preferida</p>
              <div className="flex gap-2">
                {["30 min", "45 min", "60 min"].map(d => (
                  <button key={d} onClick={() => set("duracion")(d)}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all"
                    style={{ borderColor: form.duracion === d ? B.teal : B.border, background: form.duracion === d ? B.tealLight : "white", color: form.duracion === d ? B.teal : B.textMid }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#7C6F9A] font-medium">Sube los documentos que respaldan tu trayectoria profesional.</p>
            {[
              { label: "Currículum / CV", icon: "📄", hint: "PDF, máx. 5MB" },
              { label: "Título profesional", icon: "🎓", hint: "JPG, PNG o PDF" },
              { label: "Cédula profesional", icon: "🪪", hint: "JPG, PNG o PDF (opcional)" },
              { label: "Carta de referencias", icon: "📝", hint: "PDF (opcional)" },
            ].map(doc => (
              <div key={doc.label} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-[#E8E5F4] bg-white hover:border-teal-300 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: B.tealLight }}>{doc.icon}</div>
                <div className="flex-1">
                  <p className="font-extrabold text-sm text-[#1C1135]">{doc.label}</p>
                  <p className="text-xs text-[#9E95B7] font-medium">{doc.hint}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: B.tealLight, color: B.teal }}>
                  <Upload size={12} /> Subir
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#7C6F9A] font-medium mb-1">Revisa tu solicitud antes de enviarla.</p>
            {[
              { label: "Nombre", val: `${form.nombre} ${form.apellido}` || "—" },
              { label: "Correo", val: form.email || "—" },
              { label: "Especialidades", val: form.especialidades.join(", ") || "—" },
              { label: "Experiencia", val: form.años || "—" },
              { label: "Disponibilidad", val: form.dias.join(", ") || "—" },
              { label: "Tarifa referencial", val: form.tarifa ? `${form.tarifa}/sesión` : "—" },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-[#E8E5F4] last:border-0">
                <span className="text-sm font-extrabold text-[#9E95B7]">{r.label}</span>
                <span className="text-sm font-bold text-[#1C1135] text-right max-w-[60%]">{r.val}</span>
              </div>
            ))}
            <div className="rounded-2xl p-4" style={{ background: B.tealLight }}>
              <p className="text-xs font-extrabold mb-1" style={{ color: B.teal }}>¿Qué pasa después?</p>
              <p className="text-xs font-medium text-[#1C1135]">Nuestro equipo revisará tu solicitud en 2-5 días hábiles. Te notificaremos por correo con la decisión.</p>
            </div>
          </div>
        )}

        <button onClick={next}
          className="w-full mt-6 rounded-2xl py-3.5 font-extrabold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${B.teal}, #0f766e)` }}>
          {step === T_STEPS.length - 1 ? "Enviar solicitud" : "Continuar"} <ArrowRight size={16} />
        </button>
      </div>
    </AuthShell>
  );
}
