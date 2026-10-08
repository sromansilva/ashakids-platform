
import { ChevronRight } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Crd } from "@/components/common/Crd";

export function AdminConfig() {
  const sections = [
    { title: "Parámetros del sistema",  icon: "⚙️", items: ["Logo y marca", "Colores corporativos", "Nombre de la plataforma"] },
    { title: "Integraciones",           icon: "🔗", items: ["Zoom / videoconferencia", "Email (SendGrid)"] },
    { title: "Seguridad",               icon: "🛡️", items: ["Autenticación 2FA", "Políticas de contraseñas", "Logs de acceso"] },
    { title: "Roles y permisos",        icon: "👤", items: ["Definir roles", "Asignar permisos", "Auditoría de accesos"] },
    { title: "Respaldos y datos",       icon: "💾", items: ["Backup automático", "Exportar datos", "Restaurar versión"] },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Configuración del sistema</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Parámetros globales de ASHAKids</p>
      </div>
      <div className="flex flex-col gap-4">
        {sections.map(s => (
          <Crd key={s.title} className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{s.icon}</span>
              <h4 className="font-extrabold text-[#1C1135]">{s.title}</h4>
            </div>
            <div className="flex flex-col gap-1">
              {s.items.map(item => (
                <div key={item} className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-[#F5F3FF] transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-[#1C1135]">{item}</p>
                  <ChevronRight size={16} style={{ color: B.textMuted }} />
                </div>
              ))}
            </div>
          </Crd>
        ))}
      </div>
    </div>
  );
}
