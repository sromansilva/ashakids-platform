import { useState } from 'react';
import { Eye, EyeOff, UserRound, CalendarDays, Bell, ShieldCheck } from 'lucide-react';
import { Btn } from '@/components/common/Btn';
import { AvailabilityEditor } from '@/components/common/AvailabilityEditor';
import { NotificationPreferences } from '@/components/common/NotificationPreferences';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { useRoleProfile } from '@/hooks/useRoleProfile';
import { useAuth } from '@/hooks/useAuth';
import { useWrite } from '@/hooks/useRemoteData';
import { usersService } from '@/services/clinicalService';
export { TerapeutaIncidencias } from './TerapeutaIncidencias';

export function TerapeutaConfig() {
  const [tab, setTab] = useState('perfil');
  const { user } = useAuth();
  const profile = useRoleProfile();
  const data = profile.error ? undefined : profile.data;
  const account = data?.user;
  const therapist = data && 'perfil_terapeuta' in data ? data.perfil_terapeuta : null;
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [validation, setValidation] = useState('');
  const change = useWrite(() => usersService.edit(user!.id_usuario, { current_password: passwords.current, password: passwords.next }), () => setPasswords({ current: '', next: '', confirm: '' }));
  const tabs = [{ key: 'perfil', label: 'Perfil', icon: UserRound }, { key: 'disponibilidad', label: 'Disponibilidad', icon: CalendarDays }, { key: 'notificaciones', label: 'Notificaciones', icon: Bell }, { key: 'seguridad', label: 'Seguridad', icon: ShieldCheck }];
  const fields = [
    ['Nombre completo', account ? `${account.nombres} ${account.apellidos}` : ''],
    ['Correo electrónico', account?.email ?? ''],
    ['Especialidad principal', therapist?.especialidad ?? 'Sin registrar'],
    ['Años de experiencia', therapist?.anios_experiencia?.toString() ?? 'Sin registrar'],
    ['Idiomas', therapist?.idiomas ?? 'Sin registrar'],
  ];
  return <div className="p-4 sm:p-6 max-w-6xl mx-auto">
    <header className="mb-6"><h1 className="text-2xl font-black text-[#1C1135]">Configuración</h1><p className="text-base text-[#4B4264] mt-2">Gestiona tu disponibilidad, notificaciones y seguridad.</p></header>
    <div className="professional-config-layout grid lg:grid-cols-[190px_minmax(0,1fr)] gap-6">
      <nav aria-label="Configuración" className="professional-config-nav flex lg:flex-col gap-2 flex-wrap self-start">{tabs.map(({ key, label, icon: Icon }) => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-left ${tab === key ? 'bg-violet-700 text-white' : 'bg-white text-[#4B4264] hover:bg-violet-50'}`}><Icon size={18} aria-hidden="true"/>{label}</button>)}</nav>
      <section className="bg-white border border-[#E8E5F4] rounded-2xl p-4 sm:p-6 min-w-0">
        {tab === 'perfil' && <div className="space-y-5">
          <h2 className="font-extrabold text-lg text-[#1C1135]">Información del perfil</h2>
          <RemoteFeedback pending={profile.isPending} error={profile.error} retry={() => void profile.refetch()}/>
          {profile.isSuccess && !profile.error && <><div className="flex gap-4 items-center"><div aria-hidden="true" className="w-14 h-14 bg-violet-100 text-violet-800 rounded-2xl flex items-center justify-center font-black text-xl">{account?.nombres[0]}{account?.apellidos[0]}</div><p className="font-bold text-[#1C1135]">{account?.nombres} {account?.apellidos}</p></div>
            <div className="grid sm:grid-cols-2 gap-4">{fields.map(([label, value], index) => <label key={label} htmlFor={`therapist-profile-${index}`} className="text-sm font-bold text-[#4B4264]">{label}<input id={`therapist-profile-${index}`} readOnly value={value} className="mt-2 block w-full rounded-xl border border-[#E8E5F4] p-3 bg-[#FAF9FD] text-[#1C1135]"/></label>)}</div>
            <div><h3 className="text-sm font-bold text-[#4B4264]">Sobre mí</h3><p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere] text-base text-[#1C1135]">{therapist?.descripcion_profesional ?? 'Sin registrar'}</p></div>
            <p className="text-sm text-[#4B4264]">Para corregir los datos registrados, contacta con la administración del centro.</p>
          </>}
          <dl className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-[#E8E5F4]">{['Foto de perfil', 'Teléfono', 'Cédula profesional'].map(label => <div key={label}><dt className="font-bold text-sm text-[#4B4264]">{label}</dt><dd className="mt-1 text-sm text-[#4B4264]">Próximamente</dd></div>)}</dl>
        </div>}
        {tab === 'disponibilidad' && <AvailabilityEditor/>}
        {tab === 'notificaciones' && <NotificationPreferences/>}
        {tab === 'seguridad' && <form className="space-y-5" onSubmit={event => {
          event.preventDefault(); setValidation('');
          if (!passwords.current) { setValidation('Ingresa tu contraseña actual.'); return; }
          if (passwords.next.length < 12 || passwords.next.length > 128) { setValidation('La contraseña debe tener entre 12 y 128 caracteres.'); return; }
          if (passwords.next !== passwords.confirm) { setValidation('Las contraseñas no coinciden.'); return; }
          if (user) void change.submit(undefined);
        }}>
          <h2 className="text-lg font-extrabold text-[#1C1135]">Seguridad de la cuenta</h2>
          {(['current', 'next', 'confirm'] as const).map((key, index) => <div key={key}><label htmlFor={`password-${key}`} className="block text-sm font-bold mb-2 text-[#4B4264]">{['Contraseña actual', 'Nueva contraseña', 'Confirmar contraseña'][index]}</label><div className="relative"><input id={`password-${key}`} type={visible[key] ? 'text' : 'password'} autoComplete={key === 'current' ? 'current-password' : 'new-password'} value={passwords[key]} onChange={event => { setPasswords(p => ({ ...p, [key]: event.target.value })); setValidation(''); }} disabled={change.isPending} maxLength={128} className="w-full rounded-xl border border-[#C8C2DC] p-3 pr-14 text-base"/><button type="button" aria-label={`${visible[key] ? 'Ocultar' : 'Mostrar'} ${['contraseña actual', 'nueva contraseña', 'confirmación de contraseña'][index]}`} onClick={() => setVisible(v => ({ ...v, [key]: !v[key] }))} className="absolute right-1 top-1 min-h-11 min-w-11 grid place-items-center text-[#4B4264]">{visible[key] ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>)}
          {validation && <p role="alert" className="text-red-800 text-sm">{validation}</p>}
          <RemoteFeedback error={change.error}/>
          {change.isSuccess && !Object.values(passwords).some(Boolean) && <p role="status" className="text-emerald-800 text-sm">Contraseña actualizada.</p>}
          <Btn type="submit" disabled={change.isPending || !user}>{change.isPending ? 'Guardando…' : 'Cambiar contraseña'}</Btn>
        </form>}
      </section>
    </div>
  </div>;
}
