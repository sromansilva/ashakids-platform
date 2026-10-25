import { useState } from "react";
import { Loader2, Save, UserPlus } from "lucide-react";
import { RemoteFeedback } from "@/shared/presentation/components/common/RemoteFeedback";
import { useWrite } from "@/shared/application/hooks/useRemoteData";
import { usersService } from "@/modules/clinica/infrastructure/clinicalService";
import type { Account, AccountCreate } from "@/modules/clinica/domain/clinical";
import { AdminFormDialog, adminFormInputClass, adminFormLabelClass } from "../AdminFormDialog";

export function UserEditor({ user, close }: { user?: Account; close: () => void }) {
  const [form, setForm] = useState<AccountCreate>({ nombres: user?.nombres ?? "", apellidos: user?.apellidos ?? "", email: user?.email ?? "", codigo_usuario: user?.codigo_usuario ?? "", password: "", rol: user?.roles[0] ?? "PADRE" });
  const save = useWrite(() => user ? usersService.edit(user.id_usuario, { nombres: form.nombres, apellidos: form.apellidos, email: form.email, ...(form.password ? { password: form.password } : {}) }) : usersService.create(form), close);
  const invalidPassword = form.password.length > 128 || (!!user && !!form.password && form.password.length < 12);
  const disabled = save.isPending || !form.nombres.trim() || !form.apellidos.trim() || !form.email || invalidPassword;

  return (
    <AdminFormDialog
      ariaLabelledBy="user-editor-title"
      eyebrow={user ? "Usuarios · Edición" : "Usuarios · Nueva cuenta"}
      title={user ? "Editar usuario" : "Crear usuario"}
      subtitle={user ? "Actualiza los datos generales y, si corresponde, la contraseña." : "Registra los datos de acceso y el rol del nuevo usuario."}
      icon={UserPlus}
      onClose={close}
      footer={<>
        <button type="button" onClick={close} disabled={save.isPending} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DDD6FE] px-5 text-sm font-black text-violet-700 transition hover:bg-[#F5F3FF] disabled:opacity-50">Cancelar</button>
        <button form="user-editor-form" type="submit" disabled={disabled} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 text-sm font-black text-white shadow-md transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50">{save.isPending ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}Guardar usuario</button>
      </>}
    >
      <form id="user-editor-form" onSubmit={event => { event.preventDefault(); void save.submit(undefined); }} className="space-y-5">
        <div><h3 className="text-xl font-black text-[#1C1135]">Datos del usuario</h3><p className="mt-1 text-sm font-medium text-[#6B5E8A]">Completa los campos obligatorios para continuar.</p></div>
        <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <label className={adminFormLabelClass}>Nombres *<input required maxLength={60} value={form.nombres} onChange={event => setForm({ ...form, nombres: event.target.value })} className={adminFormInputClass} /></label>
            <label className={adminFormLabelClass}>Apellidos *<input required maxLength={80} value={form.apellidos} onChange={event => setForm({ ...form, apellidos: event.target.value })} className={adminFormInputClass} /></label>
            <label className={`${adminFormLabelClass} sm:col-span-2`}>Correo electrónico *<input required type="email" maxLength={150} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className={adminFormInputClass} /></label>
            {!user && <>
              <label className={adminFormLabelClass}>Código de usuario *<input required minLength={6} maxLength={6} value={form.codigo_usuario} onChange={event => setForm({ ...form, codigo_usuario: event.target.value })} className={adminFormInputClass} /><span className="mt-1.5 block text-xs font-medium text-[#6B5E8A]">6 letras o números.</span></label>
              <label className={adminFormLabelClass}>Rol *<select required value={form.rol} onChange={event => setForm({ ...form, rol: event.target.value as AccountCreate["rol"] })} className={adminFormInputClass}><option value="PADRE">Padre</option><option value="TERAPEUTA">Terapeuta</option><option value="ADMIN">Administrador</option></select></label>
            </>}
            {user && <label className={`${adminFormLabelClass} sm:col-span-2`}>Nueva contraseña (opcional)<input type="password" minLength={12} maxLength={128} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} className={adminFormInputClass} /><span className="mt-1.5 block text-xs font-medium text-[#6B5E8A]">12–128 caracteres. El cambio revoca las sesiones activas.</span></label>}
          </div>
          {!user && <p className="mt-4 text-sm font-medium text-[#6B5E8A]">El usuario recibirá un enlace para crear su contraseña.</p>}
        </div>
        <RemoteFeedback error={save.error} />
      </form>
    </AdminFormDialog>
  );
}
