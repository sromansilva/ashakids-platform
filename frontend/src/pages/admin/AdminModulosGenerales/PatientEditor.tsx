import { useState } from "react";
import { Baby, Loader2, Save, UserMinus } from "lucide-react";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { useRemote, useWrite } from "@/hooks/useRemoteData";
import { patientsService, usersService, treatmentsService } from "@/services/clinicalService";
import { readAllPages } from "@/services/readAllPages";
import type { Patient, PatientData } from "@/types/clinical";
import { normalizePatientSex } from "@/types/patientSex";
import { AdminFormDialog, adminFormInputClass, adminFormLabelClass } from "../AdminFormDialog";

export function PatientEditor({ patient, close }: { patient?: Patient; close: () => void }) {
  const [form, setForm] = useState<PatientData>({ nombres_paciente: patient?.nombres_paciente ?? "", apellidos_paciente: patient?.apellidos_paciente ?? "", fecha_nacimiento: patient?.fecha_nacimiento ?? "", sexo: patient ? normalizePatientSex(patient.sexo) : "Masculino" });
  const [tutor, setTutor] = useState(patient?.id_tutor ?? 0);
  const parents = useRemote(["tutors"], signal => readAllPages(offset => usersService.list({ rol: "PADRE", activo: true, limit: 100, offset }, signal), signal), !patient);
  const save = useWrite(() => patient ? patientsService.edit(patient.id_paciente, form) : patientsService.create({ ...form, id_tutor: tutor }), close);
  const deactivate = useWrite(() => patientsService.deactivate(patient!.id_paciente), close);
  const busy = save.isPending || deactivate.isPending;
  const disabled = busy || !form.nombres_paciente.trim() || !form.apellidos_paciente.trim() || !form.fecha_nacimiento || !form.sexo || !tutor;

  return (
    <AdminFormDialog
      ariaLabelledBy="patient-editor-title"
      eyebrow={patient ? "Pacientes · Edición" : "Pacientes · Nuevo registro"}
      title={patient ? "Perfil del paciente" : "Registrar paciente"}
      subtitle={patient ? "Actualiza los datos personales y consulta su plan vigente." : "Asocia el nuevo paciente con un representante registrado."}
      icon={Baby}
      onClose={close}
      maxWidth="max-w-4xl"
      footer={<>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button type="button" onClick={close} disabled={busy} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DDD6FE] px-5 text-sm font-black text-violet-700 transition hover:bg-[#F5F3FF] disabled:opacity-50">Cancelar</button>
          {patient?.activo && <button type="button" disabled={busy} onClick={() => { if (window.confirm("¿Dar de baja al paciente conservando su historial?")) void deactivate.submit(undefined); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"><UserMinus size={17} />Dar de baja</button>}
        </div>
        <button form="patient-editor-form" type="submit" disabled={disabled} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 text-sm font-black text-white shadow-md transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50">{save.isPending ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}Guardar paciente</button>
      </>}
    >
      <div className="space-y-5">
        <form id="patient-editor-form" onSubmit={event => { event.preventDefault(); void save.submit(undefined); }} className="space-y-5">
          <div><h3 className="text-xl font-black text-[#1C1135]">Datos del paciente</h3><p className="mt-1 text-sm font-medium text-[#6B5E8A]">Completa los campos obligatorios para continuar.</p></div>
          <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <label className={adminFormLabelClass}>Nombres *<input required maxLength={60} value={form.nombres_paciente} onChange={event => setForm({ ...form, nombres_paciente: event.target.value })} className={adminFormInputClass} /></label>
              <label className={adminFormLabelClass}>Apellidos *<input required maxLength={80} value={form.apellidos_paciente} onChange={event => setForm({ ...form, apellidos_paciente: event.target.value })} className={adminFormInputClass} /></label>
              <label className={adminFormLabelClass}>Fecha de nacimiento *<input required type="date" value={form.fecha_nacimiento} onChange={event => setForm({ ...form, fecha_nacimiento: event.target.value })} className={adminFormInputClass} /></label>
              <label className={adminFormLabelClass}>Sexo *<select aria-label="Sexo" required value={form.sexo} onChange={event => setForm({ ...form, sexo: event.target.value })} className={adminFormInputClass}><option value="">Seleccionar</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></label>
              {!patient && <label className={`${adminFormLabelClass} sm:col-span-2`}>Representante *<select required value={tutor} onChange={event => setTutor(Number(event.target.value))} className={adminFormInputClass}><option value={0}>Seleccionar tutor</option>{parents.data?.map(parent => <option key={parent.id_usuario} value={parent.id_tutor ?? 0}>{parent.nombres} {parent.apellidos} · {parent.codigo_usuario}</option>)}</select></label>}
            </div>
            {!patient && <RemoteFeedback pending={parents.isPending} error={parents.error} retry={() => void parents.refetch()} />}
          </div>
          <RemoteFeedback error={save.error || deactivate.error} />
        </form>
        {patient && <TreatmentAssignments patientId={patient.id_paciente} />}
      </div>
    </AdminFormDialog>
  );
}

function TreatmentAssignments({ patientId }: { patientId: number }) {
  const list = useRemote(["treatments", patientId], signal => readAllPages(offset => treatmentsService.list(patientId, { limit: 100, offset }, signal), signal));
  return <section className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5"><h3 className="text-lg font-black text-[#1C1135]">Planes del profesional</h3><p className="mt-1 text-sm text-[#6B5E8A]">El profesional define el plan desde una atención con reporte.</p><div className="mt-3"><RemoteFeedback pending={list.isPending} error={list.error} retry={() => void list.refetch()} />{list.data?.map(treatment => <p key={treatment.id_tratamiento} className="border-t border-[#E8E5F4] py-3 text-sm font-semibold text-[#4B4264] first:border-t-0">{treatment.nombre_tratamiento} · {treatment.terapeuta_nombre} · {treatment.estado_tratamiento}</p>)}{list.isSuccess && list.data.length === 0 && <p className="text-sm text-[#6B5E8A]">Sin plan publicado. Primero corresponde la consulta introductoria.</p>}</div></section>;
}
