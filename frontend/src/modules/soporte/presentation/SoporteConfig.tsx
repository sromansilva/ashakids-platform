import { AccountSettings } from '@/modules/auth/presentation/AccountSettings';

export function SoporteConfig() {
  return <div className="space-y-6">
      <header><h1 className="text-3xl font-black">Configuración</h1><p className="mt-2 text-sm text-[#615274]">Consulta tu perfil y administra la seguridad de tu cuenta de soporte.</p></header>
      <AccountSettings />
  </div>;
}
