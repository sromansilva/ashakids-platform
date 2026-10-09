import type { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";

export function PadreConsentimiento({ go }: { go: (view: View) => void }) {
  return <section className="p-4 sm:p-6 max-w-3xl mx-auto text-[#1C1135]">
    <h1 className="text-2xl font-black mb-4">Preferencias y consentimientos</h1>
    <p className="text-base leading-relaxed text-[#4B4264] mb-6">El registro de consentimientos está pendiente de implementación. Esta pantalla no solicita aceptaciones ni guarda autorizaciones.</p>
    <div className="bg-white border border-[#E8E5F4] rounded-2xl p-5 mb-6">
      <h2 className="text-lg font-extrabold mb-3">Qué está disponible</h2>
      <p className="text-base leading-relaxed">Puedes gestionar los perfiles de tus hijos y consultar sus citas, tratamientos y reportes. Los permisos de acceso corresponden a tu cuenta y a las asignaciones del sistema.</p>
      <h2 className="text-lg font-extrabold mt-6 mb-3">Antes de habilitar autorizaciones</h2>
      <p className="text-base leading-relaxed">El equipo debe definir los textos y el registro por hijo, versión, fecha y representante. Los permisos de cámara o micrófono del navegador se solicitan por separado cuando una actividad los utiliza.</p>
    </div>
    <div className="flex flex-wrap gap-3"><Btn onClick={() => go("padre/config")}>Gestionar hijos</Btn><Btn variant="outline" onClick={() => go("padre/camino")}>Consultar Mi Camino ASHA</Btn></div>
  </section>;
}
