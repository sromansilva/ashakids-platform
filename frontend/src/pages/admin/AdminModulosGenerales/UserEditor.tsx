import { useState } from "react";
import { Btn } from "@/components/common/Btn";
import { Inp } from "@/components/common/Inp";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { useWrite } from "@/hooks/useRemoteData";
import { usersService } from "@/services/clinicalService";
import type { Account, AccountCreate } from "@/types/clinical";
export function UserEditor({ user, close }: { user?: Account; close: () => void }) {
  const [form, setForm] = useState<AccountCreate>({ nombres: user?.nombres ?? "", apellidos: user?.apellidos ?? "", email: user?.email ?? "", codigo_usuario: user?.codigo_usuario ?? "", password: "", rol: user?.roles[0] ?? "PADRE" });
  const save = useWrite(() => user ? usersService.edit(user.id_usuario, { nombres: form.nombres, apellidos: form.apellidos, email: form.email, ...(form.password ? { password: form.password } : {}) }) : usersService.create(form), close);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
    <form className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-4" onSubmit={e => { e.preventDefault(); void save.submit(undefined); }}>
      <h2 className="font-extrabold text-[#1C1135] text-lg">{user ? "Editar usuario" : "Crear usuario"}</h2>
      {([['nombres', 'Nombres'], ['apellidos', 'Apellidos'], ['email', 'Correo electrónico']] as const).map(([key, label]) => <Inp key={key} label={label} type={key === 'email' ? 'email' : 'text'} value={form[key]} onChange={value => setForm({ ...form, [key]: value })} />)}
      {!user && <><Inp label="Código (6 letras o números)" value={form.codigo_usuario} onChange={value => setForm({ ...form, codigo_usuario: value })} />
        <label className="text-sm font-bold">Rol<select className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF]" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value as AccountCreate['rol'] })}><option>PADRE</option><option>TERAPEUTA</option><option>ADMIN</option></select></label></>}
      <Inp label={user ? "Nueva contraseña (opcional)" : "Contraseña"} type="password" value={form.password} onChange={password => setForm({ ...form, password })} hint="Mínimo 12 caracteres. El cambio revoca sesiones; no envía correos." />
      <RemoteFeedback error={save.error} /><div className="flex gap-3"><Btn variant="secondary" disabled={save.isPending} onClick={close}>Cancelar</Btn><Btn type="submit" disabled={save.isPending || !form.nombres.trim() || !form.apellidos.trim() || !form.email || (!user && form.password.length < 12)}>Guardar</Btn></div>
    </form></div>;
}
