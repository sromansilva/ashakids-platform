import { usePadreConfig } from "./usePadreConfig";
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

export function PadreConfig(props: Parameters<typeof usePadreConfig>[0]) {
  const state = usePadreConfig(props);
  const profile = useRoleProfile();
  const { tab, setTab, toast, childList, setShowAddChildModal, setEditChild, setDeleteChild, editChild, deleteChild } = state;
  return <section className="p-4 sm:p-6 max-w-4xl text-[#1C1135]">
    <h1 className="text-2xl font-black">Configuración</h1>
    <p className="text-base text-[#4B4264] mt-2 mb-6">Consulta tu cuenta y gestiona los perfiles de tus hijos.</p>
    {toast && <p role="status" className="bg-violet-50 rounded-2xl p-4 mb-4">{toast}</p>}
    <nav aria-label="Secciones de configuración" className="flex flex-wrap gap-2 mb-6">
      {state.tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} aria-pressed={tab === t.key} className="px-4 py-3 rounded-2xl font-bold border focus-visible:outline-violet-700" style={{background: tab === t.key ? "#6D28D9" : "white", color: tab === t.key ? "white" : "#4B4264", borderColor: "#E8E5F4"}}>{t.label}</button>)}
    </nav>
    <div className="bg-white border border-[#E8E5F4] rounded-2xl p-5">
      {tab === "cuenta" && <>
        <h2 className="text-xl font-extrabold mb-4">Datos de la cuenta</h2>
        <RemoteFeedback pending={profile.isPending} error={profile.error} retry={() => void profile.refetch()} />
        {!profile.isPending && !profile.error && profile.data?.user && <dl className="space-y-4">
          <div><dt className="text-sm font-bold text-[#4B4264]">Nombre</dt><dd className="text-base break-words">{profile.data.user.nombres} {profile.data.user.apellidos}</dd></div>
          <div><dt className="text-sm font-bold text-[#4B4264]">Correo</dt><dd className="text-base break-all">{profile.data.user.email}</dd></div>
          <div><dt className="text-sm font-bold text-[#4B4264]">Código de usuario</dt><dd className="text-base break-all">{profile.data.user.codigo_usuario}</dd></div>
        </dl>}
        <p className="text-base mt-5 text-[#4B4264]">Para cambiar tus datos de cuenta, contacta a administración.</p>
      </>}
      {tab === "hijos" && <PadreConfigHijos padrePlan="familia" childList={childList} setShowPlanUpgradeModal={state.setShowPlanUpgradeModal} setShowAddChildModal={setShowAddChildModal} setEditChild={setEditChild} setDeleteChild={setDeleteChild} />}
      {tab === "notificaciones" && <><h2 className="text-xl font-extrabold mb-3">Notificaciones</h2><p className="text-base text-[#4B4264] leading-relaxed">Las preferencias y el envío de avisos todavía no están disponibles. Consulta tu agenda y los reportes para conocer los registros actuales.</p><Btn className="mt-4" onClick={() => props.go?.("padre/agenda")}>Consultar agenda</Btn></>}
      {tab === "privacidad" && <><h2 className="text-xl font-extrabold mb-3">Privacidad</h2><p className="text-base text-[#4B4264] leading-relaxed">No hay consentimientos registrados desde esta interfaz. La descarga de datos personales, eliminación y reactivación de cuentas están pendientes.</p><Btn className="mt-4" onClick={() => props.go?.("padre/consentimiento")}>Consultar estado de consentimientos</Btn></>}
      {tab === "seguridad" && <PadreConfigSeguridad pwCurrent={state.pwCurrent} setPwCurrent={state.setPwCurrent} pwNew={state.pwNew} setPwNew={state.setPwNew} pwConfirm={state.pwConfirm} setPwConfirm={state.setPwConfirm} setShow2FA={state.setShow2FA} setShowDeleteAccount={state.setShowDeleteAccount} showToast={state.showToast} pwSaving={state.pwSaving} handleSavePassword={state.handleSavePassword} />}
    </div>
    {state.showAddChildModal && <PadreConfigShowAddChildModal setShowAddChildModal={setShowAddChildModal} setNewCN={state.setNewCN} setNewCA={state.setNewCA} newCA={state.newCA} setNewBirth={state.setNewBirth} setNewAvatar={state.setNewAvatar} newAvatar={state.newAvatar} avatarOptions={state.avatarOptions} newCN={state.newCN} newBirth={state.newBirth} setChildList={state.setChildList} showToast={state.showToast} />}
    {editChild && <PadreConfigEditChild editChild={editChild} setEditChild={setEditChild} setChildList={state.setChildList} showToast={state.showToast} />}
    {deleteChild && <PadreConfigDeleteChild deleteChild={deleteChild} setDeleteChild={setDeleteChild} setChildList={state.setChildList} showToast={state.showToast} />}
    {state.show2FA && <PadreConfigShow2FA setShow2FA={state.setShow2FA} setTwoFADone={state.setTwoFADone} twoFADone={state.twoFADone} showToast={state.showToast} />}
    {state.showDeleteAccount && <PadreConfigShowDeleteAccount setShowDeleteAccount={state.setShowDeleteAccount} setDeleteConfirm={state.setDeleteConfirm} deleteConfirm={state.deleteConfirm} showToast={state.showToast} />}
  </section>;
}
