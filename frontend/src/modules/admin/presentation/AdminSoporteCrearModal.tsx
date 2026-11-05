import { useEffect, useRef, type FormEvent } from 'react';

interface Identity { nombres: string; apellidos: string; email: string }
interface Props {
  open: boolean;
  value: Identity;
  onChange: (value: Identity) => void;
  onClose: () => void;
  onCreate: () => void;
  busy: boolean;
  error: string | null;
}
export function AdminSoporteCrearModal({ open, value, onChange, onClose, onCreate, busy, error }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!busy) onCreate(); };
  return <dialog ref={dialog} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} aria-labelledby="support-account-title" className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-[#E8E5F4] p-6 text-[#1C1135] shadow-xl backdrop:bg-black/40">
    <form onSubmit={submit} className="space-y-4">
      <h2 id="support-account-title" className="text-xl font-black">Nueva cuenta de Soporte Técnico</h2>
      <p className="text-sm text-[#615274]">Recibirá un enlace temporal para crear su propia contraseña. Su acceso se limita a incidencias técnicas.</p>
      {(['nombres', 'apellidos', 'email'] as const).map((key) => <label key={key} className="block text-sm font-bold">
        {{ nombres: 'Nombres', apellidos: 'Apellidos', email: 'Correo electrónico' }[key]}
        <input autoFocus={key === 'nombres'} required disabled={busy} type={key === 'email' ? 'email' : 'text'} maxLength={key === 'email' ? 150 : key === 'nombres' ? 60 : 80} value={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.value })} className="mt-2 w-full rounded-xl border border-[#E8E5F4] p-3" />
      </label>)}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={busy} onClick={onClose} className="rounded-xl border border-[#E8E5F4] px-4 py-3">Cancelar</button><button disabled={busy} className="rounded-xl bg-[#6B46FE] px-4 py-3 font-bold text-white hover:bg-[#5833EA]">{busy ? 'Creando…' : 'Crear cuenta de soporte'}</button></div>
    </form>
  </dialog>;
}
