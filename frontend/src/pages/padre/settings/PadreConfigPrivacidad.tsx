import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Download, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Inp } from "@/components/common/Inp";

type Props = Pick<ReturnType<typeof usePadreConfig>, "toggleConsentsPriv" | "showToast" | "consentsPriv" | "setConsentsPriv" | "accountStatus" | "setShowDeactivateConfirm" | "setShowReactivateFlow" | "setShowDownloadModal" | "showDeactivateConfirm" | "setAccountStatus" | "showReactivateFlow" | "reactivateCode" | "setReactivateCode">;
export function PadreConfigPrivacidad({ toggleConsentsPriv, showToast, consentsPriv, setConsentsPriv, accountStatus, setShowDeactivateConfirm, setShowReactivateFlow, setShowDownloadModal, showDeactivateConfirm, setAccountStatus, showReactivateFlow, reactivateCode, setReactivateCode }: Props) {
return (<div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">
                  Privacidad y consentimientos
                </h2>

                {/* Consent summary */}
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-extrabold text-sm text-[#1C1135]">Estado de consentimientos</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>
                      Versión 1.0-demo
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 mb-3">
                    {([
                      { key: "dataPerfil" as const, icon: "📋", label: "Tratamiento de datos · Perfil infantil", badge: "OBLIGATORIO", badgeColor: "#DC2626", badgeBg: "#FEF2F2" },
                      { key: "compartirTerapeuta" as const, icon: "🤝", label: "Compartir con terapeuta vinculado", badge: "OBLIGATORIO", badgeColor: "#DC2626", badgeBg: "#FEF2F2" },
                      { key: "camaraSessiones" as const, icon: "🎥", label: "Cámara y micrófono · Sesiones", badge: "CONTEXTUAL", badgeColor: "#D97706", badgeBg: "#FFFBEB" },
                      { key: "vozActividades" as const, icon: "🎤", label: "Voz en actividades de Mundo ASHA", badge: "OPCIONAL", badgeColor: "#059669", badgeBg: "#D1FAE5" },
                      { key: "mlInvestigacion" as const, icon: "🔬", label: "Datos pseudonimizados para modelos de IA · Investigación futura", badge: "OPCIONAL ML", badgeColor: "#7C3AED", badgeBg: "#EDE9FE" },
                    ]).map(c => (
                      <div key={c.key} className="flex items-center gap-3">
                        <span className="text-base flex-shrink-0">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1C1135] leading-snug">{c.label}</p>
                          <span className="text-xs font-black px-1.5 py-0.5 rounded-md" style={{ background: c.badgeBg, color: c.badgeColor }}>{c.badge}</span>
                        </div>
                        {(c.key === "dataPerfil" || c.key === "compartirTerapeuta") ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>Activo · Requerido</span>
                        ) : (
                          <button onClick={() => { toggleConsentsPriv(c.key); showToast("Preferencia actualizada"); }}
                            className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all flex-shrink-0"
                            style={{ background: consentsPriv[c.key] ? B.violet : "#D1D5DB", justifyContent: consentsPriv[c.key] ? "flex-end" : "flex-start" }}>
                            <span className="w-5 h-5 bg-white rounded-full shadow-sm block" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Btn variant="secondary" size="sm" onClick={() => { setConsentsPriv(prev => ({ ...prev, camaraSessiones: false, vozActividades: false, mlInvestigacion: false })); showToast("Consentimientos opcionales revocados"); }}>
                      Revocar opcionales
                    </Btn>
                    <Btn variant="outline" size="sm" onClick={() => showToast("Preferencias guardadas")}>
                      <CheckCircle size={12} /> Guardar preferencias
                    </Btn>
                  </div>
                </div>

                {/* Access log */}
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <p className="font-extrabold text-sm text-[#1C1135] mb-1">Registro de accesos</p>
                  <p className="text-xs text-[#9E95B7] font-medium mb-3">Datos operativos simulados · Sin contenido clínico</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { actor: "Dra. Ana Ruiz · Terapeuta", accion: "Lectura de expediente clínico", fecha: "30 Jul 2026 · 10:14", resultado: "Autorizado", motivo: "Vinculación activa" },
                      { actor: "Laura Gómez · Representante", accion: "Acceso a resumen compartido", fecha: "30 Jul 2026 · 09:45", resultado: "Autorizado", motivo: "Acceso propio" },
                      { actor: "Sistema ASHI", accion: "Lectura de datos de perfil", fecha: "29 Jul 2026 · 08:00", resultado: "Autorizado", motivo: "Contextual · mínimo necesario" },
                      { actor: "Admin plataforma", accion: "Verificación de estado de cuenta", fecha: "27 Jul 2026 · 15:30", resultado: "Autorizado", motivo: "Soporte operativo" },
                    ].map((entry, i) => (
                      <div key={i} className="rounded-xl p-3 text-xs" style={{ background: "#F5F3FF" }}>
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                          <span className="font-extrabold text-[#1C1135]">{entry.actor}</span>
                          <span className="font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>{entry.resultado}</span>
                        </div>
                        <p className="font-medium text-[#4B4869] mb-0.5">{entry.accion}</p>
                        <p className="text-[#9E95B7]">{entry.fecha} · Motivo: {entry.motivo}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account status */}
                <div className="rounded-2xl p-4 border" style={{ borderColor: accountStatus === "activa" ? "#D1FAE5" : "#FEE2E2" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-extrabold text-sm text-[#1C1135]">Estado de cuenta</p>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: accountStatus === "activa" ? "#D1FAE5" : "#FEE2E2", color: accountStatus === "activa" ? "#059669" : "#DC2626" }}>
                      {accountStatus === "activa" ? "✅ Activa" : "⚠️ Desactivada"}
                    </span>
                  </div>
                  {accountStatus === "activa" ? (
                    <>
                      <p className="text-xs text-[#7C6F9A] font-medium mb-3">
                        Cuenta activa. Tras 3 meses sin iniciar sesión se enviará un aviso y la cuenta se desactivará automáticamente sin borrar datos ni historial. Plazos exactos y canales de notificación por definir.
                      </p>
                      <Btn variant="danger" size="sm" onClick={() => setShowDeactivateConfirm(true)}>
                        Desactivar cuenta temporalmente
                      </Btn>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-[#7C6F9A] font-medium mb-3">
                        Cuenta desactivada. Los datos e historial se conservan. Para reactivar debes verificar tu identidad.
                      </p>
                      <Btn variant="primary" size="sm" onClick={() => setShowReactivateFlow(true)}>
                        Reactivar cuenta
                      </Btn>
                    </>
                  )}
                </div>

                {/* Legal notice */}
                <div className="rounded-2xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <p className="text-xs font-bold text-[#92400E]">
                    ⚖️ Política de retención de datos y detalle jurídico: pendiente de aprobación. No se solicitan datos reales en esta demostración.
                  </p>
                </div>

                {/* Download data */}
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <p className="font-extrabold text-sm text-[#1C1135] mb-1">Descargar mis datos</p>
                  <p className="text-xs text-[#7C6F9A] font-medium mb-3">Descarga todos los datos de tu cuenta. Formato y plazos por definir.</p>
                  <Btn variant="secondary" size="sm" onClick={() => setShowDownloadModal(true)}>
                    <Download size={12} /> Solicitar descarga
                  </Btn>
                </div>

                {/* Deactivate confirm modal */}
                {showDeactivateConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeactivateConfirm(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
                      <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">Desactivar cuenta</h3>
                      <p className="text-sm text-[#7C6F9A] font-medium mb-4 leading-relaxed">
                        La cuenta se desactivará temporalmente. Los datos e historial se conservan. Para reactivar necesitarás verificar tu identidad. ¿Confirmas?
                      </p>
                      <div className="flex gap-3">
                        <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setShowDeactivateConfirm(false)}>Cancelar</Btn>
                        <Btn variant="danger" className="flex-1 justify-center" onClick={() => { setAccountStatus("desactivada"); setShowDeactivateConfirm(false); showToast("Cuenta desactivada"); }}>
                          Confirmar desactivación
                        </Btn>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reactivate flow modal */}
                {showReactivateFlow && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReactivateFlow(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
                      <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">Verificar identidad</h3>
                      <p className="text-sm text-[#7C6F9A] font-medium mb-4">Ingresa el código enviado a tu correo para reactivar la cuenta.</p>
                      <Inp label="Código de verificación" placeholder="000000 (demo: cualquier valor)"
                        value={reactivateCode} onChange={setReactivateCode} />
                      <div className="flex gap-3 mt-4">
                        <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setShowReactivateFlow(false)}>Cancelar</Btn>
                        <Btn variant="primary" className="flex-1 justify-center" disabled={!reactivateCode}
                          onClick={() => { setAccountStatus("activa"); setShowReactivateFlow(false); setReactivateCode(""); showToast("Cuenta reactivada exitosamente"); }}>
                          <CheckCircle size={14} /> Reactivar
                        </Btn>
                      </div>
                    </div>
                  </div>
                )}
              </div>);
}
