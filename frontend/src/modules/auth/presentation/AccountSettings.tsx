import { useEffect, useState } from 'react';
import { authService } from '@/modules/auth/infrastructure/authService';
import { useAuth } from '@/modules/auth/application/useAuth';
import type { TwoFactorSetupData } from '@/modules/auth/domain/auth';

const field = 'w-full rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] p-3 text-sm text-[#1C1135] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B46FE]';
const button = 'rounded-2xl bg-[#6B46FE] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#5833EA] disabled:opacity-50';

export function AccountSettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<TwoFactorSetupData | null>(null);
  const [code, setCode] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securityNotice, setSecurityNotice] = useState('');

  useEffect(() => {
    let active = true;
    authService.get2faStatus().then((status) => {
      if (active) setTwoFactorEnabled(status.totp_activado);
    }).catch((error: unknown) => {
      if (active) setSecurityError(error instanceof Error ? error.message : 'No se pudo consultar el segundo factor.');
    });
    return () => { active = false; };
  }, []);

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError('');
    setPasswordNotice('');
    if (newPassword.length < 12 || newPassword.length > 128) return setPasswordError('La nueva contraseña debe tener entre 12 y 128 caracteres.');
    if (newPassword !== confirmPassword) return setPasswordError('Las contraseñas nuevas no coinciden.');
    setPasswordBusy(true);
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      setPasswordNotice(result.message || 'Contraseña actualizada.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.');
    } finally { setPasswordBusy(false); }
  }

  async function startTwoFactor() {
    setBusy(true); setSecurityError(''); setSecurityNotice('');
    try { setSetup(await authService.setup2fa({ password: setupPassword, current_code: currentCode || undefined })); }
    catch (error) { setSecurityError(error instanceof Error ? error.message : 'No se pudo iniciar la configuración 2FA.'); }
    finally { setBusy(false); }
  }

  async function confirmTwoFactor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setSecurityError('');
    try {
      await authService.confirm2faSetup(code);
      setTwoFactorEnabled(true); setSetup(null); setCode(''); setSetupPassword(''); setCurrentCode('');
      setSecurityNotice('Autenticación en dos pasos activada.');
    } catch (error) { setSecurityError(error instanceof Error ? error.message : 'El código no es válido.'); }
    finally { setBusy(false); }
  }

  async function disableTwoFactor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setSecurityError(''); setSecurityNotice('');
    try {
      await authService.disable2fa({ password: disablePassword });
      setTwoFactorEnabled(false); setDisablePassword('');
      setSecurityNotice('Autenticación en dos pasos desactivada.');
    } catch (error) { setSecurityError(error instanceof Error ? error.message : 'No se pudo desactivar 2FA.'); }
    finally { setBusy(false); }
  }

  const fullName = [user?.nombres, user?.apellidos].filter(Boolean).join(' ');
  return <div className="grid gap-6 xl:grid-cols-2">
    <section className="rounded-3xl border border-[#E8E5F4] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="account-profile-title">
      <h2 id="account-profile-title" className="text-xl font-black text-[#1C1135]">Mi perfil</h2>
      <p className="mt-1 text-sm text-[#615274]">Información de la cuenta autenticada.</p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {[['Nombre', fullName], ['Correo', user?.email], ['Usuario', user?.codigo_usuario], ['Rol', user?.rol], ['Estado', user?.activo ? 'Activo' : 'Inactivo']].map(([label, value]) => <div key={label}>
          <dt className="mb-1 text-xs font-bold text-[#615274]">{label}</dt>
          <dd className="break-words rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] px-3 py-2.5 text-sm font-bold text-[#1C1135]">{value || '—'}</dd>
        </div>)}
      </dl>
      <p className="mt-4 text-xs text-[#615274]">{user?.rol === 'ADMIN'
        ? 'Para corregir tu nombre o correo, contacta al titular del sistema o a otro administrador autorizado. Estos datos identifican tu cuenta en los registros.'
        : 'Para corregir tu nombre o correo, solicita el cambio a Administración. Estos datos identifican tu cuenta en los registros del sistema.'}</p>
    </section>

    <section className="space-y-6 rounded-3xl border border-[#E8E5F4] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="account-security-title">
      <div><h2 id="account-security-title" className="text-xl font-black text-[#1C1135]">Seguridad</h2><p className="mt-1 text-sm text-[#615274]">Actualiza tu contraseña y protege el acceso con un segundo factor.</p></div>
      <form className="space-y-3" onSubmit={submitPassword}>
        <h3 className="font-extrabold">Cambiar contraseña</h3>
        <label className="block text-xs font-bold text-[#615274]">Contraseña actual<input className={field} type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></label>
        <label className="block text-xs font-bold text-[#615274]">Nueva contraseña<input className={field} type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>
        <label className="block text-xs font-bold text-[#615274]">Confirmar contraseña<input className={field} type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
        <p className="text-xs text-[#615274]">Al guardarla se cerrarán las demás sesiones activas.</p>
        {passwordError && <p role="alert" className="text-sm font-bold text-red-700">{passwordError}</p>}
        {passwordNotice && <p role="status" className="text-sm font-bold text-emerald-700">{passwordNotice}</p>}
        <button className={button} type="submit" disabled={passwordBusy}>{passwordBusy ? 'Guardando…' : 'Actualizar contraseña'}</button>
      </form>

      <div className="border-t border-[#E8E5F4] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-extrabold">Autenticación en dos pasos</h3><p className="text-xs text-[#615274]">Estado: {twoFactorEnabled === null ? 'consultando…' : twoFactorEnabled ? 'activada' : 'desactivada'}</p></div>
        </div>
        {twoFactorEnabled !== null && !setup && <div className="mt-4 space-y-3">
          <label className="block text-xs font-bold text-[#615274]">Contraseña para confirmar el 2FA<input className={field} type="password" autoComplete="current-password" value={setupPassword} onChange={(e) => setSetupPassword(e.target.value)} /></label>
          {twoFactorEnabled && <label className="block text-xs font-bold text-[#615274]">Código 2FA actual<input className={field} inputMode="numeric" maxLength={6} value={currentCode} onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, ''))} /></label>}
          <button className={button} type="button" disabled={busy || (twoFactorEnabled === true && currentCode.length !== 6)} onClick={() => void startTwoFactor()}>{busy ? 'Preparando…' : twoFactorEnabled ? 'Reemplazar 2FA' : 'Activar 2FA'}</button>
        </div>}
        {setup && <form onSubmit={confirmTwoFactor} className="mt-4 space-y-3">
          <p className="text-sm text-[#615274]">Escanea este QR con tu aplicación autenticadora. Guarda el secreto de recuperación en un lugar seguro.</p>
          <img src={setup.qr_code} alt="Código QR para configurar autenticación en dos pasos" className="mx-auto h-48 w-48 rounded-xl border border-[#E8E5F4] p-2" />
          <p className="break-all rounded-xl bg-[#F8F7FC] p-3 text-center font-mono text-sm">{setup.manual_code}</p>
          <label className="block text-xs font-bold text-[#615274]">Código de 6 dígitos<input className={field} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} /></label>
          <div className="flex flex-wrap gap-3"><button className={button} type="submit" disabled={busy || code.length !== 6}>Confirmar y activar</button><button className="rounded-2xl border border-[#E8E5F4] px-4 py-3 text-sm font-bold" type="button" disabled={busy} onClick={() => { setSetup(null); setCode(''); }}>Cancelar</button></div>
        </form>}
        {twoFactorEnabled && <form onSubmit={disableTwoFactor} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="min-w-[220px] flex-1 text-xs font-bold text-[#615274]">Confirma con tu contraseña<input className={field} type="password" autoComplete="current-password" required value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} /></label>
          <button className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50" disabled={busy}>Desactivar 2FA</button>
        </form>}
        {securityError && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{securityError}</p>}
        {securityNotice && <p role="status" className="mt-3 text-sm font-bold text-emerald-700">{securityNotice}</p>}
      </div>
    </section>
  </div>;
}
