import { Plus, Eye, Send } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

export function AdminMensajes() {
  const campaigns = [
    { title: "Bienvenida nuevos usuarios",   type: "Email",        sent: 42, opened: 38, date: "28 Jul 2026", status: "enviado"   },
    { title: "Recordatorio de sesión",       type: "Notificación", sent: 89, opened: 82, date: "29 Jul 2026", status: "enviado"   },
    { title: "Nuevas actividades Mundo ASHA",type: "Push",         sent: 0,  opened: 0,  date: "01 Ago 2026", status: "pendiente" },
    { title: "Informe mensual terapeutas",   type: "Email",        sent: 48, opened: 41, date: "01 Jul 2026", status: "enviado"   },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Centro de Mensajes</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Anuncios, campañas y comunicaciones masivas</p>
        </div>
        <Btn variant="primary" size="sm"><Plus size={13} /> Nueva campaña</Btn>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Emails enviados", val: "342",   color: B.violet  },
          { label: "Tasa de apertura",val: "89%",   color: "#059669" },
          { label: "Push activos",    val: "1,248", color: B.teal    },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: `${s.color}15` }}>
            <p className="font-black text-2xl text-[#1C1135]">{s.val}</p>
            <p className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <Crd>
        <div className="p-5 border-b" style={{ borderColor: B.border }}>
          <h4 className="font-extrabold text-[#1C1135]">Campañas recientes</h4>
        </div>
        <div className="divide-y" style={{ borderColor: B.border }}>
          {campaigns.map((c, i) => (
            <div key={i} className="p-4 flex items-center gap-4 flex-wrap hover:bg-[#F5F3FF] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{c.title}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{c.type} · {c.date}</p>
              </div>
              {c.status === "enviado" && <div className="text-xs text-[#7C6F9A] font-medium">{c.sent} enviados · {c.opened} abiertos</div>}
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: c.status === "enviado" ? "#D1FAE5" : B.orangeLight, color: c.status === "enviado" ? "#059669" : B.orange }}>
                {c.status}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-600 hover:bg-violet-50 transition-colors"><Eye size={13} /></button>
                {c.status === "pendiente" && <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-green-600 hover:bg-green-50 transition-colors"><Send size={13} /></button>}
              </div>
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
}
