import { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { PadreConfigPrivacidad } from "@/pages/padre/settings/PadreConfigPrivacidad";
import { PadreConfigShowAddChildModal } from "@/pages/padre/settings/PadreConfigShowAddChildModal";
import { PadreConfigSeguridad } from "@/pages/padre/settings/PadreConfigSeguridad";
import { PadreConfigShow2FA } from "@/pages/padre/settings/PadreConfigShow2FA";
import { PadreConfigNotificaciones } from "@/pages/padre/settings/PadreConfigNotificaciones";
import { PadreConfigCuenta } from "@/pages/padre/settings/PadreConfigCuenta";
import { PadreConfigEditChild } from "@/pages/padre/settings/PadreConfigEditChild";
import { PadreConfigHijos } from "@/pages/padre/settings/PadreConfigHijos";
import { PadreConfigShowDownloadModal } from "@/pages/padre/settings/PadreConfigShowDownloadModal";
import { PadreConfigShowDeleteAccount } from "@/pages/padre/settings/PadreConfigShowDeleteAccount";
import { PadreConfigShowPwConfirmModal } from "@/pages/padre/settings/PadreConfigShowPwConfirmModal";
import { PadreConfigShowPhotoModal } from "@/pages/padre/settings/PadreConfigShowPhotoModal";
import { PadreConfigDeleteChild } from "@/pages/padre/settings/PadreConfigDeleteChild";
import { X, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

export function PadreConfig(props: Parameters<typeof usePadreConfig>[0]) {
const { onNameChange, configGo, padrePlan, tab, setTab, toast, setToast, showToast, nombre, setNombre, email, setEmail, tel, setTel, ciudad, setCiudad, showPhotoModal, setShowPhotoModal, selectedAvatar, setSelectedAvatar, userAvatarOptions, showPwConfirmModal, setShowPwConfirmModal, pwConfirmInput, setPwConfirmInput, childList, setChildList, showAddChildModal, setShowAddChildModal, showPlanUpgradeModal, setShowPlanUpgradeModal, editChild, setEditChild, deleteChild, setDeleteChild, newCN, setNewCN, newCA, setNewCA, newCS, setNewCS, newBirth, setNewBirth, newAvatar, setNewAvatar, avatarOptions, notifs, setNotifs, toggleN, consentsPriv, setConsentsPriv, toggleConsentsPriv, showRevokeOptional, setShowRevokeOptional, showDownloadModal, setShowDownloadModal, downloadSent, setDownloadSent, accountStatus, setAccountStatus, showDeactivateConfirm, setShowDeactivateConfirm, showReactivateFlow, setShowReactivateFlow, reactivateCode, setReactivateCode, pwCurrent, setPwCurrent, pwNew, setPwNew, pwConfirm, setPwConfirm, pwSaving, handleSavePassword, show2FA, setShow2FA, twoFADone, setTwoFADone, showDeleteAccount, setShowDeleteAccount, deleteConfirm, setDeleteConfirm, tabs } = usePadreConfig(props);
return (
    <div
      className="p-4 sm:p-6 max-w-4xl"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg,#059669,#0D9488)",
          }}
        >
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Avatar picker modal */}
      {showPhotoModal && (
        <PadreConfigShowPhotoModal setShowPhotoModal={setShowPhotoModal} selectedAvatar={selectedAvatar} userAvatarOptions={userAvatarOptions} setSelectedAvatar={setSelectedAvatar} showToast={showToast} />
      )}

      {/* Password confirmation modal */}
      {showPwConfirmModal && (
        <PadreConfigShowPwConfirmModal setShowPwConfirmModal={setShowPwConfirmModal} setPwConfirmInput={setPwConfirmInput} pwConfirmInput={pwConfirmInput} onNameChange={onNameChange} nombre={nombre} showToast={showToast} />
      )}

      {/* Plan upgrade modal */}
      {showPlanUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPlanUpgradeModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135]">Añade más perfiles con el Plan Familia</h2>
              <button onClick={() => setShowPlanUpgradeModal(false)} className="p-2 rounded-xl hover:bg-violet-50"><X size={18} /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#7C6F9A] font-medium mb-5 leading-relaxed">
                Tu Plan Exploración permite administrar un perfil infantil. Con el Plan Familia puedes añadir hijos ilimitados y acceder a más herramientas de acompañamiento.
              </p>
              <div className="rounded-2xl p-4 mb-5" style={{ background: B.violetLight }}>
                <p className="text-xs font-extrabold text-violet-700 mb-3">✨ Plan Familia incluye:</p>
                {["Hijos ilimitados", "Mundo ASHA completo", "Reportes completos", "Prioridad en agenda", "Todas las funcionalidades familiares disponibles"].map(f => (
                  <div key={f} className="flex items-center gap-2 mb-2">
                    <CheckCircle size={13} style={{ color: B.violet }} />
                    <span className="text-xs font-medium text-[#7C6F9A]">{f}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center font-medium mb-4" style={{ color: B.textMuted }}>Datos simulados para demostración · Precios: Por definir</p>
              <Btn variant="cta" className="w-full justify-center" onClick={() => { setShowPlanUpgradeModal(false); if (configGo) configGo("public/planes"); }}>
                Conocer Plan Familia
              </Btn>
              <button onClick={() => setShowPlanUpgradeModal(false)} className="w-full mt-2 text-xs font-bold text-[#9E95B7] py-2 hover:text-[#7C6F9A] transition-colors">
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add child modal */}
      {showAddChildModal && (
        <PadreConfigShowAddChildModal setShowAddChildModal={setShowAddChildModal} setNewCN={setNewCN} setNewBirth={setNewBirth} setNewAvatar={setNewAvatar} newAvatar={newAvatar} avatarOptions={avatarOptions} newCN={newCN} newBirth={newBirth} setNewCA={setNewCA} newCA={newCA} setChildList={setChildList} showToast={showToast} />
      )}

      {/* Edit child modal */}
      {editChild && (
        <PadreConfigEditChild setEditChild={setEditChild} editChild={editChild} setChildList={setChildList} showToast={showToast} />
      )}

      {/* Delete child confirm */}
      {deleteChild && (
        <PadreConfigDeleteChild setDeleteChild={setDeleteChild} deleteChild={deleteChild} setChildList={setChildList} showToast={showToast} />
      )}

      {/* Download data modal */}
      {showDownloadModal && (
        <PadreConfigShowDownloadModal setShowDownloadModal={setShowDownloadModal} setDownloadSent={setDownloadSent} downloadSent={downloadSent} />
      )}

      {/* 2FA modal */}
      {show2FA && (
        <PadreConfigShow2FA setShow2FA={setShow2FA} setTwoFADone={setTwoFADone} twoFADone={twoFADone} showToast={showToast} />
      )}

      {/* Delete account confirm */}
      {showDeleteAccount && (
        <PadreConfigShowDeleteAccount setShowDeleteAccount={setShowDeleteAccount} setDeleteConfirm={setDeleteConfirm} deleteConfirm={deleteConfirm} showToast={showToast} />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C1135]">
          Configuración
        </h1>
        <p className="text-sm text-[#7C6F9A] font-medium">
          Gestiona tu cuenta y preferencias.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="flex lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all text-left"
              style={{
                background: tab === t.key ? B.violet : "white",
                color: tab === t.key ? "white" : B.textMid,
                border: `1.5px solid ${tab === t.key ? B.violet : B.border}`,
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <Crd className="p-6">
            {/* ── Cuenta ── */}
            {tab === "cuenta" && (
              <PadreConfigCuenta setShowPhotoModal={setShowPhotoModal} selectedAvatar={selectedAvatar} nombre={nombre} setNombre={setNombre} email={email} setEmail={setEmail} tel={tel} setTel={setTel} ciudad={ciudad} setCiudad={setCiudad} showToast={showToast} setShowPwConfirmModal={setShowPwConfirmModal} />
            )}

            {/* ── Hijos ── */}
            {tab === "hijos" && (
              <PadreConfigHijos padrePlan={padrePlan} childList={childList} setShowPlanUpgradeModal={setShowPlanUpgradeModal} setShowAddChildModal={setShowAddChildModal} setEditChild={setEditChild} setDeleteChild={setDeleteChild} />
            )}

            {/* ── Notificaciones ── */}
            {tab === "notificaciones" && (
              <PadreConfigNotificaciones notifs={notifs} toggleN={toggleN} showToast={showToast} />
            )}

            {/* ── Privacidad ── */}
            {tab === "privacidad" && (
              <PadreConfigPrivacidad toggleConsentsPriv={toggleConsentsPriv} showToast={showToast} consentsPriv={consentsPriv} setConsentsPriv={setConsentsPriv} accountStatus={accountStatus} setShowDeactivateConfirm={setShowDeactivateConfirm} setShowReactivateFlow={setShowReactivateFlow} setShowDownloadModal={setShowDownloadModal} showDeactivateConfirm={showDeactivateConfirm} setAccountStatus={setAccountStatus} showReactivateFlow={showReactivateFlow} reactivateCode={reactivateCode} setReactivateCode={setReactivateCode} />
            )}

            {/* ── Seguridad ── */}
            {tab === "seguridad" && (
              <PadreConfigSeguridad pwCurrent={pwCurrent} setPwCurrent={setPwCurrent} pwNew={pwNew} setPwNew={setPwNew} pwConfirm={pwConfirm} setPwConfirm={setPwConfirm} setShow2FA={setShow2FA} setShowDeleteAccount={setShowDeleteAccount} showToast={showToast} handleSavePassword={handleSavePassword} pwSaving={pwSaving} />
            )}
          </Crd>
        </div>
      </div>
    </div>
  );

}
