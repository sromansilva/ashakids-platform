import { useState } from 'react';
import { Btn } from '@/components/common/Btn';
import { Inp } from '@/components/common/Inp';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { useRemote, useWrite } from '@/hooks/useRemoteData';
import { patientsService, usersService, treatmentsService } from '@/services/clinicalService';
import { readAllPages } from '@/services/readAllPages';
import type { Patient, PatientData } from '@/types/clinical';
import { normalizePatientSex } from '@/types/patientSex';

export function PatientEditor({ patient, close }: { patient?: Patient; close: () => void }) {
  const [form, setForm] = useState<PatientData>({ nombres_paciente: patient?.nombres_paciente ?? '', apellidos_paciente: patient?.apellidos_paciente ?? '', fecha_nacimiento: patient?.fecha_nacimiento ?? '', sexo: patient ? normalizePatientSex(patient.sexo) : 'Masculino' });
  const [tutor, setTutor] = useState(patient?.id_tutor ?? 0);
  const parents = useRemote(['tutors'], s => readAllPages(offset => usersService.list({ rol: 'PADRE', activo: true, limit: 100, offset }, s), s), !patient);
  const save = useWrite(() => patient ? patientsService.edit(patient.id_paciente, form) : patientsService.create({ ...form, id_tutor: tutor }), close);
  const deactivate = useWrite(() => patientsService.deactivate(patient!.id_paciente), close);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
    <h2 className="text-lg font-extrabold text-[#1C1135]">{patient ? 'Perfil del paciente' : 'Registrar paciente'}</h2>
    <form className="space-y-3" onSubmit={e => { e.preventDefault(); void save.submit(undefined); }}>
      <Inp label="Nombres" value={form.nombres_paciente} onChange={v => setForm({ ...form, nombres_paciente: v })}/>
      <Inp label="Apellidos" value={form.apellidos_paciente} onChange={v => setForm({ ...form, apellidos_paciente: v })}/>
      <Inp label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={v => setForm({ ...form, fecha_nacimiento: v })}/>
      <label className="block text-sm font-bold">Sexo<select required className="w-full p-3 rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF]" value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}><option value="">Seleccionar</option><option>Masculino</option><option>Femenino</option><option>Otro</option></select></label>
      {!patient && <><RemoteFeedback pending={parents.isPending} error={parents.error} retry={() => void parents.refetch()}/><label className="block text-sm font-bold">Representante<select className="w-full p-3 rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF]" value={tutor} onChange={e => setTutor(Number(e.target.value))}><option value={0}>Seleccionar tutor</option>{parents.data?.map(p => <option key={p.id_usuario} value={p.id_tutor ?? 0}>{p.nombres} {p.apellidos} · {p.codigo_usuario}</option>)}</select></label></>}
      <RemoteFeedback error={save.error || deactivate.error}/><div className="flex gap-2 flex-wrap"><Btn type="submit" disabled={save.isPending || deactivate.isPending || !form.nombres_paciente.trim() || !form.apellidos_paciente.trim() || !form.fecha_nacimiento || !tutor}>Guardar paciente</Btn>{patient?.activo && <Btn variant="outline" disabled={save.isPending || deactivate.isPending} onClick={() => { if (window.confirm('¿Dar de baja al paciente conservando su historial?')) void deactivate.submit(undefined); }}>Dar de baja</Btn>}</div>
    </form>
    {patient && <TreatmentAssignments patientId={patient.id_paciente}/>}
    <Btn variant="secondary" disabled={save.isPending || deactivate.isPending} onClick={close}>Cerrar</Btn>
  </div></div>;
}

function TreatmentAssignments({ patientId }: { patientId: number }) {
  const list = useRemote(['treatments', patientId], s => readAllPages(offset => treatmentsService.list(patientId, { limit: 100, offset }, s), s));
  return <section className="border-t border-[#E8E5F4] pt-4 space-y-3"><h3 className="font-extrabold">Planes del profesional</h3>
    <p className="text-sm text-[#4B4264]">El asesor registra y orienta. El profesional define el plan desde una atención con reporte; la familia puede elegir cualquier terapeuta disponible.</p>
    <RemoteFeedback pending={list.isPending} error={list.error} retry={() => void list.refetch()}/>
    {list.data?.map(t => <p key={t.id_tratamiento} className="text-sm py-2">{t.nombre_tratamiento} · {t.terapeuta_nombre} · {t.estado_tratamiento}</p>)}
    {list.isSuccess && list.data.length === 0 && <p className="text-sm text-[#4B4264]">Sin plan publicado. Primero corresponde la consulta introductoria.</p>}
  </section>;
}
