import { usePadreConfig } from "./usePadreConfig";
import { useAuth } from "@/modules/auth/application/useAuth";
import { useRoleProfile } from "@/shared/application/hooks/useRoleProfile";
import { PadreConfigHijos } from "./PadreConfigHijos";
import { PadreConfigShowAddChildModal } from "./PadreConfigShowAddChildModal";
import { PadreConfigEditChild } from "./PadreConfigEditChild";
import { PadreConfigDeleteChild } from "./PadreConfigDeleteChild";
import { RemoteFeedback } from "@/shared/presentation/components/common/RemoteFeedback";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { PadreConfigSeguridad } from "./PadreConfigSeguridad";
import { PadreConfigShow2FA } from "./PadreConfigShow2FA";
import { PadreConfigShowDeleteAccount } from "./PadreConfigShowDeleteAccount";
import { User, Mail, Contact, Info } from "lucide-react";

export function PadreConfig(props: Parameters<typeof usePadreConfig>[0]) {
  const state = usePadreConfig(props);
  const profile = useRoleProfile();
  const { tab, setTab, toast, childList, setShowAddChildModal, setEditChild, setDeleteChild, editChild, deleteChild } = state;

  const { user: authUser } = useAuth();
  const userData = profile.data?.user || authUser;
  const fullName = userData ? `${userData.nombres} ${userData.apellidos || ''}`.trim() : (profile.isPending ? 'Cargando...' : '');
  const email = userData?.email || '';
  const codigo = userData?.codigo_usuario || '';
  const initials = fullName && fullName !== 'Cargando...'
    ? fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('')
    : (authUser ? `${authUser.nombres?.[0] || ''}${authUser.apellidos?.[0] || ''}`.toUpperCase() : '..');

  return (
    <section className="p-4 sm:p-8 max-w-5xl text-[#1C1135]">
      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[#1C1135] tracking-tight">Configuración</h1>
        <p className="text-sm font-medium text-[#6B5E8A] mt-1">
          Consulta tu cuenta y gestiona los perfiles de tus hijos.
        </p>
      </div>

      {toast && (
        <p role="status" className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl p-4 mb-5 font-bold text-sm">
          {toast}
        </p>
      )}

      {/* Tabs */}
      <nav aria-label="Secciones de configuración" className="flex flex-wrap gap-2.5 mb-7">
        {state.tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={active}
              className={`px-5 py-2.5 rounded-2xl font-extrabold text-sm transition-all duration-150 ${
                active
                  ? "bg-[#6B46FE] text-white shadow-md shadow-[#6B46FE]/25"
                  : "bg-white border border-[#E8E5F4] text-[#5C5378] hover:bg-slate-50 hover:text-[#6B46FE]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Tab Panels */}
      {tab === "cuenta" && (
        <div className="bg-white border border-[#E8E5F4] rounded-3xl p-6 sm:p-8 shadow-xs">
          <RemoteFeedback pending={profile.isPending} error={profile.error} retry={() => void profile.refetch()} />
          
          {/* Card Top: Initials avatar + Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#E0D7FE] text-[#6B46FE] flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#1C1135]">Datos de la cuenta</h2>
              <p className="text-sm text-[#8C82A8] font-medium mt-0.5">
                Esta es la información de tu cuenta en AshaKids.
              </p>
            </div>
          </div>

          {/* Card Middle: Fields on left, Ashi illustration on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
            <div className="space-y-4">
              {/* Field 1: Nombre */}
              <div className="flex items-center gap-4 p-2 rounded-2xl transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F7FF] border border-[#EBE7FA] flex items-center justify-center text-[#6B46FE] shrink-0">
                  <User size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#8C82A8]">Nombre</p>
                  <p className="text-base font-extrabold text-[#1C1135]">{fullName}</p>
                </div>
              </div>

              {/* Field 2: Correo */}
              <div className="flex items-center gap-4 p-2 rounded-2xl transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F7FF] border border-[#EBE7FA] flex items-center justify-center text-[#6B46FE] shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#8C82A8]">Correo</p>
                  <p className="text-base font-extrabold text-[#1C1135] break-all">{email}</p>
                </div>
              </div>

              {/* Field 3: Código de usuario */}
              <div className="flex items-center gap-4 p-2 rounded-2xl transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F7FF] border border-[#EBE7FA] flex items-center justify-center text-[#6B46FE] shrink-0">
                  <Contact size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#8C82A8]">Código de usuario</p>
                  <p className="text-base font-extrabold text-[#1C1135] uppercase">{codigo}</p>
                </div>
              </div>
            </div>

            {/* Right: Ashi 3D illustration */}
            <div className="relative flex justify-center items-center py-4">
              <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#FFF3E8] to-[#F1EDFE] -z-0 blur-xl opacity-90" />
              <img
                src="/illustrations/optimized/family-ashi-wave-v88-640-7b2299d9a4.webp"
                alt="Ashi Robot"
                className="relative z-10 w-52 sm:w-60 h-auto object-contain drop-shadow-md select-none"
              />
            </div>
          </div>

          {/* Card Bottom: Admin info pill */}
          <div className="rounded-2xl bg-[#F5F2FE] border border-[#EBE7FA] p-4 flex items-center gap-3 text-sm text-[#6B46FE] font-medium">
            <div className="w-6 h-6 rounded-full border-2 border-[#6B46FE] flex items-center justify-center font-bold text-xs shrink-0">
              <Info size={14} className="text-[#6B46FE]" />
            </div>
            <span>Para cambiar tus datos de cuenta, contacta a administración.</span>
          </div>
        </div>
      )}

      {tab === "hijos" && (
        <div className="bg-white border border-[#E8E5F4] rounded-3xl p-6 sm:p-8 shadow-xs">
          <PadreConfigHijos
            padrePlan="familia"
            childList={childList}
            setShowPlanUpgradeModal={state.setShowPlanUpgradeModal}
            setShowAddChildModal={setShowAddChildModal}
            setEditChild={setEditChild}
            setDeleteChild={setDeleteChild}
          />
        </div>
      )}

      {tab === "notificaciones" && (
        <div className="bg-white border border-[#E8E5F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-extrabold mb-2 text-[#1C1135]">Notificaciones</h2>
          <p className="text-sm text-[#6B5E8A] leading-relaxed max-w-2xl">
            Las preferencias y el envío de avisos automáticos se sincronizan con tu terapeuta. Consulta tu agenda y los reportes para conocer los registros actuales.
          </p>
          <Btn className="mt-2" onClick={() => props.go?.("padre/agenda")}>
            Consultar agenda
          </Btn>
        </div>
      )}

      {tab === "privacidad" && (
        <div className="bg-white border border-[#E8E5F4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-extrabold mb-2 text-[#1C1135]">Privacidad y Consentimientos</h2>
          <p className="text-sm text-[#6B5E8A] leading-relaxed max-w-2xl">
            Toda la información clínica, grabaciones autorizadas y ejercicios de tus hijos están encriptados y protegidos según los estándares ASHA de confidencialidad.
          </p>
          <Btn className="mt-2" onClick={() => props.go?.("padre/consentimiento")}>
            Consultar estado de consentimientos
          </Btn>
        </div>
      )}

      {tab === "seguridad" && (
        <div className="bg-white border border-[#E8E5F4] rounded-3xl p-6 sm:p-8 shadow-xs">
          <PadreConfigSeguridad
            pwCurrent={state.pwCurrent}
            setPwCurrent={state.setPwCurrent}
            pwNew={state.pwNew}
            setPwNew={state.setPwNew}
            pwConfirm={state.pwConfirm}
            setPwConfirm={state.setPwConfirm}
            setShow2FA={state.setShow2FA}
            setShowDeleteAccount={state.setShowDeleteAccount}
            showToast={state.showToast}
            pwSaving={state.pwSaving}
            handleSavePassword={state.handleSavePassword}
          />
        </div>
      )}

      {/* Modals */}
      {state.showAddChildModal && (
        <PadreConfigShowAddChildModal
          setShowAddChildModal={setShowAddChildModal}
          setNewCN={state.setNewCN}
          setNewCA={state.setNewCA}
          newCA={state.newCA}
          setNewBirth={state.setNewBirth}
          setNewAvatar={state.setNewAvatar}
          newAvatar={state.newAvatar}
          avatarOptions={state.avatarOptions}
          newCN={state.newCN}
          newBirth={state.newBirth}
          setChildList={state.setChildList}
          showToast={state.showToast}
        />
      )}
      {editChild && (
        <PadreConfigEditChild
          editChild={editChild}
          setEditChild={setEditChild}
          setChildList={state.setChildList}
          showToast={state.showToast}
        />
      )}
      {deleteChild && (
        <PadreConfigDeleteChild
          deleteChild={deleteChild}
          setDeleteChild={setDeleteChild}
          setChildList={state.setChildList}
          showToast={state.showToast}
        />
      )}
      {state.show2FA && (
        <PadreConfigShow2FA
          setShow2FA={state.setShow2FA}
          setTwoFADone={state.setTwoFADone}
          twoFADone={state.twoFADone}
          showToast={state.showToast}
        />
      )}
      {state.showDeleteAccount && (
        <PadreConfigShowDeleteAccount
          setShowDeleteAccount={state.setShowDeleteAccount}
          setDeleteConfirm={state.setDeleteConfirm}
          deleteConfirm={state.deleteConfirm}
          showToast={state.showToast}
        />
      )}
    </section>
  );
}
