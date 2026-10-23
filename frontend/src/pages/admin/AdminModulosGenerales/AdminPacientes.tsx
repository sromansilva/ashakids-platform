import { useState } from "react";
import { Eye, Search } from "lucide-react";
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
    accountStatus: p.activo ? 'activo' : 'inactivo',
  }));
  const filtered = perfiles.filter(p =>
    p.id.toLowerCase().includes(search.toLowerCase()) || p.initials.toLowerCase().includes(search.toLowerCase()) ||
    p.parent.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="admin-patients p-4 sm:p-6 max-w-6xl mx-auto">
      <RemoteFeedback pending={query.isPending} error={query.error || parents.error} retry={() => { void query.refetch(); void parents.refetch(); }}/>
      {editing && <PatientEditor patient={editing === 'new' ? undefined : editing} close={() => setEditing(null)}/>}
      <div className="admin-page-heading flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black text-[#1C1135] mb-1">Pacientes</h1>
          <p className="text-sm text-[#7C6F9A] font-medium">{perfiles.length} pacientes registrados</p>
        </div>
        <div className="admin-patient-actions flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input className="pl-9 pr-4 py-2 rounded-2xl border border-[#E8E5F4] text-sm bg-white focus:outline-none focus:border-violet-400 font-medium w-56"
            aria-label="Buscar pacientes por nombre, ID o tutor" placeholder="Buscar paciente o tutor…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Btn size="sm" onClick={() => setEditing('new')}>Registrar paciente</Btn>
        </div>
      </div>
      <Crd>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5F3FF]">
                {["Paciente", "Representante", "Estado", ""].map(h => (
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
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: p.accountStatus === "activo" ? "#D1FAE5" : p.accountStatus === "nuevo" ? B.orangeLight : B.tealLight, color: p.accountStatus === "activo" ? "#059669" : p.accountStatus === "nuevo" ? B.orange : B.teal }}>
                      {p.accountStatus}
                    </span>
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

    </div>
  );
}
