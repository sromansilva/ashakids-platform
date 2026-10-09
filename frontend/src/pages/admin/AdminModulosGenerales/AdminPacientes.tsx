import { useState } from "react";
import { Eye, Search, Shield } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Crd } from "@/components/common/Crd";
import { Btn } from "@/components/common/Btn";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { useRemote } from "@/hooks/useRemoteData";
import { patientsService, usersService } from "@/services/clinicalService";
import { readAllPages } from "@/services/readAllPages";
import type { Patient } from "@/types/clinical";
import { PatientEditor } from "./PatientEditor";
import { Av } from "@/components/common/Av";

export function AdminPacientes() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Patient | 'new' | null>(null);
  const query = useRemote(['admin-patients'], s => readAllPages(offset => patientsService.list({ limit: 100, offset }, s), s));
  const parents = useRemote(['all-tutors'], s => readAllPages(offset => usersService.list({ rol: 'PADRE', limit: 100, offset }, s), s));
  const perfiles = (query.data ?? []).map(p => ({
    raw: p, id: `PAC-${p.id_paciente}`, initials: `${p.nombres_paciente} ${p.apellidos_paciente}`,
    av: `${p.nombres_paciente[0]}${p.apellidos_paciente[0]}`, color: B.violet,
    parent: (() => { const u = parents.data?.find(u => u.id_tutor === p.id_tutor); return u ? `${u.nombres} ${u.apellidos}` : `Tutor #${p.id_tutor}`; })(),
    therapist: 'Consultar detalle', accountStatus: p.activo ? 'activo' : 'inactivo',
    consentimiento: 'Sin API', soporte: 0,
  }));
  const filtered = perfiles.filter(p =>
    p.id.toLowerCase().includes(search.toLowerCase()) || p.initials.toLowerCase().includes(search.toLowerCase()) ||
    p.parent.toLowerCase().includes(search.toLowerCase()) ||
    p.therapist.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <RemoteFeedback pending={query.isPending} error={query.error || parents.error} retry={() => { void query.refetch(); void parents.refetch(); }}/>
      {editing && <PatientEditor patient={editing === 'new' ? undefined : editing} close={() => setEditing(null)}/>}
      <Btn size="sm" onClick={() => setEditing('new')}>Registrar paciente</Btn>
      {/* Restriction notice */}
      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 border" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
        <Shield size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs font-medium text-blue-700">
          <span className="font-extrabold">Acceso administrativo limitado a información operativa.</span> El contenido clínico permanece restringido.
        </p>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Perfiles Vinculados</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">{perfiles.length} perfiles · Estado de cuenta, vinculación y consentimientos</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input className="pl-9 pr-4 py-2 rounded-2xl border border-[#E8E5F4] text-sm bg-white focus:outline-none focus:border-violet-400 font-medium w-56"
            placeholder="Buscar por ID o tutor…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <Crd>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5F3FF]">
                {["ID / Iniciales", "Representante", "Terapeuta vinculado", "Cuenta", "Consentimiento", "Soporte", ""].map(h => (
                  <th key={h} className="text-left text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[#FAFAF9] hover:bg-[#F5F3FF] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Av initials={p.av} color={p.color} size="sm" />
                      <div>
                        <span className="text-sm font-extrabold text-[#1C1135]">{p.initials}</span>
                        <p className="text-xs text-[#9E95B7]">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#7C6F9A] font-medium">{p.parent}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1C1135] font-medium">{p.therapist}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: p.accountStatus === "activo" ? "#D1FAE5" : p.accountStatus === "nuevo" ? B.orangeLight : B.tealLight, color: p.accountStatus === "activo" ? "#059669" : p.accountStatus === "nuevo" ? B.orange : B.teal }}>
                      {p.accountStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: p.consentimiento === "registrado" ? "#D1FAE5" : B.orangeLight, color: p.consentimiento === "registrado" ? "#059669" : B.orange }}>
                      {p.consentimiento}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {p.soporte > 0
                      ? <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: B.orangeLight, color: B.orange }}>{p.soporte} pendiente</span>
                      : <span className="text-xs text-[#9E95B7] font-medium">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setEditing(p.raw)} className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-600 hover:bg-violet-50 transition-colors" title="Ver detalle operativo"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Crd>
      <p className="text-xs text-[#9E95B7] font-medium mt-3 text-center italic">
        Expediente clínico, objetivos terapéuticos y notas de sesión son de acceso exclusivo del terapeuta y representante legal.
      </p>
    </div>
  );
}
