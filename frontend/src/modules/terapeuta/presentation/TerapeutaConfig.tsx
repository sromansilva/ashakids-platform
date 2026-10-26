import { useState } from 'react';
import {
  UserRound,
  CalendarDays,
  Bell,
  ShieldCheck,
  Mail,
  GraduationCap,
  Globe,
  Sliders,
  FileText,
  Info,
  ExternalLink,
  Camera,
  Phone,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Btn } from '@/shared/presentation/components/common/Btn';
import { AvailabilityEditor } from '@/shared/presentation/components/common/AvailabilityEditor';
import { NotificationPreferences } from '@/shared/presentation/components/common/NotificationPreferences';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { useRoleProfile } from '@/shared/application/hooks/useRoleProfile';
import { useAuth } from '@/modules/auth/application/useAuth';
import { useWrite } from '@/shared/application/hooks/useRemoteData';
import { usersService } from '@/modules/clinica/infrastructure/clinicalService';
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
  const change = useWrite(
    () =>
      usersService.edit(user!.id_usuario, {
        current_password: passwords.current,
        password: passwords.next,
      }),
    () => setPasswords({ current: '', next: '', confirm: '' })
  );

  const tabs = [
    { key: 'perfil', label: 'Perfil', icon: UserRound },
    { key: 'disponibilidad', label: 'Disponibilidad', icon: CalendarDays },
    { key: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { key: 'seguridad', label: 'Seguridad', icon: ShieldCheck },
  ];

  const fullName = account ? `${account.nombres} ${account.apellidos}` : (user?.nombres ? `${user.nombres} ${user.apellidos || ''}` : 'PieroT Anticona');
  const email = account?.email || user?.email || 'piero1@gmail.com';
  const specialty = therapist?.especialidad || 'Terapia de lenguaje';
  const experience = therapist?.anios_experiencia?.toString() || '3';
  const languages = therapist?.idiomas || 'Español';
  const bio = therapist?.descripcion_profesional || 'Sin registrar';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'PA';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] tracking-tight">Configuración</h1>
          <p className="text-sm font-bold text-[#615274] mt-1.5">
            Gestiona tu disponibilidad, notificaciones y seguridad.
          </p>

          {/* Horizontal Pill Tabs */}
          <nav aria-label="Configuración" className="flex items-center gap-2 mt-6 flex-wrap">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  tab === key
                    ? 'bg-[#6B46FE] text-white shadow-sm'
                    : 'bg-[#F8F7FC] border border-[#E8E5F4] text-[#615274] hover:bg-violet-50'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden md:block w-56 lg:w-64 shrink-0 z-10">
          <img
            src="/illustrations/ashi-hero-v1.png"
            alt="Robot Ashi Config"
            className="w-full h-auto object-contain max-h-44 drop-shadow-md"
          />
        </div>
      </div>

      {/* Main Tab Content */}
      <section className="bg-white border border-[#E8E5F4] rounded-3xl p-6 sm:p-8 shadow-sm">
        {tab === 'perfil' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-[#1C1135]">Información del perfil</h2>

            <RemoteFeedback pending={profile.isPending} error={profile.error} retry={() => void profile.refetch()} />

            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-4 pb-2">
              <div className="w-16 h-16 rounded-full bg-[#EDE9FE] text-[#6B46FE] font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                {initials}
              </div>
              <div>
                <p className="text-lg font-black text-[#1C1135]">{fullName}</p>
                <p className="text-xs font-bold text-[#615274] mt-0.5">{specialty}</p>
              </div>
            </div>

            {/* 2-Column Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#615274] mb-1.5">Nombre completo</label>
                <div className="relative">
                  <UserRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
                  <input
                    readOnly
                    value={fullName}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] text-xs font-extrabold text-[#1C1135] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#615274] mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
                  <input
                    readOnly
                    value={email}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] text-xs font-extrabold text-[#1C1135] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#615274] mb-1.5">Especialidad principal</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
                  <input
                    readOnly
                    value={specialty}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] text-xs font-extrabold text-[#1C1135] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#615274] mb-1.5">Años de experiencia</label>
                <div className="relative">
                  <Sliders size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
                  <input
                    readOnly
                    value={experience}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] text-xs font-extrabold text-[#1C1135] focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#615274] mb-1.5">Idiomas</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
                  <input
                    readOnly
                    value={languages}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] text-xs font-extrabold text-[#1C1135] focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#615274] mb-1.5">Sobre mí</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
                  <input
                    readOnly
                    value={bio}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] text-xs font-extrabold text-[#1C1135] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Admin Notice Banner */}
            <div className="rounded-2xl bg-[#EDE9FE] border border-violet-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Info size={17} className="text-[#6B46FE] shrink-0" />
                <p className="text-xs font-bold text-[#4C1D95]">
                  Para corregir los datos registrados, contacta con la administración del centro.
                </p>
              </div>
              <a
                href="mailto:soporte@ashakids.com"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#6B46FE] hover:underline shrink-0"
              >
                Solicitar actualización <ExternalLink size={13} />
              </a>
            </div>

            {/* Bottom 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-[#E8E5F4]">
              {/* Photo */}
              <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
                <p className="text-xs font-extrabold text-[#1C1135] mb-3">Foto de perfil</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#EDE9FE] text-[#6B46FE] font-black text-sm flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#6B46FE] hover:bg-violet-50 transition-colors cursor-pointer"
                    >
                      <Camera size={13} />
                      Cambiar foto
                    </button>
                    <p className="text-[10px] text-[#9E95B7] mt-1">Formatos: JPG, PNG. Máx. 2 MB.</p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
                <p className="text-xs font-extrabold text-[#1C1135] mb-3">Teléfono</p>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#C8C2DC] bg-white text-xs text-[#9E95B7]">
                  <Phone size={14} />
                  <span>Sin registrar</span>
                </div>
              </div>

              {/* Credential */}
              <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
                <p className="text-xs font-extrabold text-[#1C1135] mb-3">Cédula profesional</p>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#C8C2DC] bg-white text-xs text-[#9E95B7]">
                  <CreditCard size={14} />
                  <span>Sin registrar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'disponibilidad' && <AvailabilityEditor />}
        {tab === 'notificaciones' && <NotificationPreferences />}

        {tab === 'seguridad' && (
          <form
            className="space-y-5 max-w-lg"
            onSubmit={(event) => {
              event.preventDefault();
              setValidation('');
              if (!passwords.current) {
                setValidation('Ingresa tu contraseña actual.');
                return;
              }
              if (passwords.next.length < 12 || passwords.next.length > 128) {
                setValidation('La contraseña debe tener entre 12 y 128 caracteres.');
                return;
              }
              if (passwords.next !== passwords.confirm) {
                setValidation('Las contraseñas no coinciden.');
                return;
              }
              if (user) void change.submit(undefined);
            }}
          >
            <h2 className="text-lg font-black text-[#1C1135]">Seguridad de la cuenta</h2>
            {(['current', 'next', 'confirm'] as const).map((key, index) => (
              <div key={key}>
                <label htmlFor={`password-${key}`} className="block text-xs font-bold mb-1.5 text-[#615274]">
                  {['Contraseña actual', 'Nueva contraseña', 'Confirmar contraseña'][index]}
                </label>
                <div className="relative">
                  <input
                    id={`password-${key}`}
                    type={visible[key] ? 'text' : 'password'}
                    autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                    value={passwords[key]}
                    onChange={(event) => {
                      setPasswords((p) => ({ ...p, [key]: event.target.value }));
                      setValidation('');
                    }}
                    disabled={change.isPending}
                    maxLength={128}
                    className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] p-3 pr-12 text-xs font-bold text-[#1C1135] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B46FE]"
                  />
                  <button
                    type="button"
                    aria-label={`${visible[key] ? 'Ocultar' : 'Mostrar'} ${
                      ['contraseña actual', 'nueva contraseña', 'confirmación de contraseña'][index]
                    }`}
                    onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E95B7] hover:text-[#1C1135] cursor-pointer"
                  >
                    {visible[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            {validation && <p role="alert" className="text-red-700 text-xs font-bold">{validation}</p>}
            <RemoteFeedback error={change.error} />
            {change.isSuccess && !Object.values(passwords).some(Boolean) && (
              <p role="status" className="text-[#16A34A] text-xs font-bold">
                ✓ Contraseña actualizada correctamente.
              </p>
            )}
            <Btn type="submit" disabled={change.isPending || !user}>
              {change.isPending ? 'Guardando…' : 'Cambiar contraseña'}
            </Btn>
          </form>
        )}
      </section>
    </div>
  );
}
