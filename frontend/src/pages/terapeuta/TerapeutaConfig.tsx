import { NotificationPreferences } from '@/components/common/NotificationPreferences';
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Upload, CheckCircle, Check, X, UserRound, CalendarDays, Bell, ShieldCheck } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

import { Inp } from "@/components/common/Inp";
import { useAuth } from "@/hooks/useAuth";
import { usersService } from "@/services/clinicalService";
import { useRoleProfile } from '@/hooks/useRoleProfile';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';

import { AvailabilityEditor } from "@/components/common/AvailabilityEditor";

export function TerapeutaIncidencias({ go: _go }: { go: (v: View) => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Funcional");
  const [sent, setSent] = useState(false);
  const tipos = ["Funcional", "Visual / Diseño", "Carga / Rendimiento", "Error de datos", "Paciente / Agenda", "Otro"];
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="text-xl font-black text-[#1C1135] mb-1">Reportar incidencia</h2>
      <p className="text-sm text-[#7C6F9A] mb-6">Describe el problema que encontraste para que el equipo pueda revisarlo.</p>
      {sent ? (
        <div className="rounded-2xl p-5 flex items-start gap-3" style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7" }}>
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-extrabold text-green-800">Reporte enviado</p>
            <p className="text-sm text-green-700 mt-1">Tu incidencia fue enviada a la administración. Gracias por ayudarnos a mejorar.</p>
            <button onClick={() => { setSent(false); setTitle(""); setDesc(""); setType("Funcional"); }} className="mt-3 text-xs font-bold text-green-700 underline">Enviar otro reporte</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Título del problema</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: No puedo acceder al historial del paciente" className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Descripción del problema</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Describe con detalle qué ocurrió, en qué sección, y qué pasos seguiste antes del error..." className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Tipo de incidencia</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 bg-white">
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button disabled={!title.trim() || !desc.trim()} onClick={() => setSent(true)} className="w-full py-3 rounded-2xl text-sm font-extrabold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#0D9488" }}>
            Enviar a administración
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Terapeuta Config ──────────────────────────────────────────────────────────

export function TerapeutaConfig() {
  const [tab, setTab] = useState<"perfil" | "disponibilidad" | "notificaciones" | "seguridad">("perfil");
  const [saved, setSaved] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [avatarBg, setAvatarBg] = useState(B.teal);
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const [show2faModal, setShow2faModal] = useState(false);
  const [twoFaEmail, setTwoFaEmail] = useState("");
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [securityNotice, setSecurityNotice] = useState("");
  const { user } = useAuth();
  const profile = useRoleProfile();
  const initials = `${user?.nombres[0] ?? ''}${user?.apellidos[0] ?? ''}`;
  const [pwSaving, setPwSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Perfil editable fields
  const [perfilNombre, setPerfilNombre] = useState(`${user?.nombres ?? ''} ${user?.apellidos ?? ''}`.trim());
  const [perfilEmail, setPerfilEmail] = useState(user?.email ?? '');
  const [perfilTel, setPerfilTel] = useState("");
  const [perfilEsp, setPerfilEsp] = useState("");
  const [perfilExp, setPerfilExp] = useState("");
  const [perfilCedula, setPerfilCedula] = useState("");
  const [perfilBio, setPerfilBio] = useState("");
  useEffect(() => {
    const data = profile.data;
    if (!data || !('perfil_terapeuta' in data)) return;
    setPerfilNombre(`${data.user.nombres} ${data.user.apellidos}`);
    setPerfilEmail(data.user.email); setTwoFaEmail(data.user.email);
    setPerfilEsp(data.perfil_terapeuta?.especialidad ?? '');
    setPerfilExp(data.perfil_terapeuta?.anios_experiencia?.toString() ?? '');
    setPerfilBio(data.perfil_terapeuta?.descripcion_profesional ?? '');
  }, [profile.data]);

  // Seguridad editable fields
  const [pwActual, setPwActual] = useState("");
  const [pwNueva, setPwNueva] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPwActual, setShowPwActual] = useState(false);
  const [showPwNueva, setShowPwNueva] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState<{ actual?: string; nueva?: string; confirm?: string }>({});


  const photoPresets = [
    { bg: B.teal,    label: "Esmeralda" },
    { bg: B.violet,  label: "Violeta"   },
    { bg: "#EC4899", label: "Rosa"      },
    { bg: "#059669", label: "Verde"     },
    { bg: B.orange,  label: "Naranja"   },
    { bg: "#2563EB", label: "Azul"      },
    { bg: "#7C3AED", label: "Índigo"    },
    { bg: "#DC2626", label: "Rojo"      },
  ];

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const tabs: { key: typeof tab; label: string; icon: typeof UserRound }[] = [
    { key: "perfil",          label: "Perfil",          icon: UserRound },
    { key: "disponibilidad",  label: "Disponibilidad",  icon: CalendarDays },
    { key: "notificaciones",  label: "Notificaciones",  icon: Bell },
    { key: "seguridad",       label: "Seguridad",       icon: ShieldCheck },
  ];




  return (
    <div className="p-4 sm:p-6 max-w-4xl" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>

      {securityNotice && <div className="fixed right-4 top-5 z-[70] flex max-w-sm items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-xl"><CheckCircle size={18} />{securityNotice}</div>}
      {show2faModal && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setShow2faModal(false)} aria-label="Cerrar" /><div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><button onClick={() => setShow2faModal(false)} className="absolute right-4 top-4 rounded-xl p-2 text-[#7C6F9A] hover:bg-[#F5F3FF]"><X size={18} /></button><div className="mb-5 pr-8"><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Seguridad</p><h3 className="mt-1 text-xl font-black text-[#1C1135]">Activar autenticación en dos pasos</h3><p className="mt-2 text-sm font-medium leading-relaxed text-[#7C6F9A]">Te enviaremos una confirmación al correo indicado antes de activar 2FA.</p></div><Inp label="Correo de confirmación" type="email" value={twoFaEmail} onChange={(e) => setTwoFaEmail(e)} /><div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={() => setShow2faModal(false)}>Cancelar</Btn><Btn variant="cta" onClick={() => { setTwoFaEnabled(true); setShow2faModal(false); setSecurityNotice(`2FA activado. Confirmación enviada a ${twoFaEmail}.`); window.setTimeout(() => setSecurityNotice(""), 3500); }}><Check size={14} /> Confirmar activación</Btn></div></div></div>}
      {confirmDelete && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} aria-label="Cerrar" /><div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"><X size={22} /></div><h3 className="text-xl font-black text-[#1C1135]">¿Eliminar esta cuenta?</h3><p className="mt-2 text-sm font-medium leading-relaxed text-[#7C6F9A]">Esta acción elimina el acceso y no se puede deshacer. Revisa tus reportes y pagos antes de continuar.</p><div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Btn><Btn variant="danger" onClick={() => { setConfirmDelete(false); setSecurityNotice("Solicitud de eliminación recibida. Te contactaremos para verificarla."); window.setTimeout(() => setSecurityNotice(""), 3500); }}>Confirmar eliminación</Btn></div></div></div>}

      {/* ── Modal selector de foto ── */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPhotoModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] max-w-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">Foto de perfil</h2>
              <button onClick={() => setShowPhotoModal(false)} className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              {/* Preview actual */}
              <div className="flex justify-center mb-6">
                {uploadedImg ? (
                  <img src={uploadedImg} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-md transition-all duration-200" style={{ background: avatarBg }}>
                    {initials}
                  </div>
                )}
              </div>
              {/* Avatares predefinidos */}
              <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Avatares predefinidos</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {photoPresets.map(p => (
                  <button key={p.bg} onClick={() => { setAvatarBg(p.bg); setUploadedImg(null); }}
                    className="flex flex-col items-center gap-1.5 group">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm transition-all duration-150 ${avatarBg === p.bg && !uploadedImg ? "ring-2 ring-offset-2 ring-violet-500 scale-105" : "hover:scale-105 hover:shadow-md"}`}
                      style={{ background: p.bg }}>
                      {initials}
                    </div>
                    <span className="text-xs font-bold text-[#9E95B7] leading-none">{p.label}</span>
                  </button>
                ))}
              </div>
              {/* Subir imagen */}
              <div className="border-t border-[#E8E5F4] pt-4 mb-4">
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Subir imagen propia</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedImg(URL.createObjectURL(file));
                }} />
                <button onClick={() => fileRef.current?.click()}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-[#C4B5FD] text-sm font-bold text-violet-600 hover:bg-violet-50 transition-colors flex items-center justify-center gap-2">
                  <Upload size={15} /> Seleccionar archivo de imagen
                </button>
                {uploadedImg && (
                  <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle size={12} /> Imagen cargada correctamente
                  </p>
                )}
              </div>
              <button onClick={() => setShowPhotoModal(false)}
                className="w-full py-3 rounded-2xl font-extrabold text-white text-sm transition-all active:scale-[.97]"
                style={{ background: B.violet }}>
                Guardar foto de perfil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C1135]">Configuración</h1>
        <p className="text-sm text-[#7C6F9A] font-medium">Gestiona tu perfil, disponibilidad y preferencias.</p>
      </div>

      <div className="professional-config-layout grid lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="professional-config-nav flex lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all text-left"
              style={{ background: tab === t.key ? B.violet : "white", color: tab === t.key ? "white" : B.textMid, border: `1.5px solid ${tab === t.key ? B.violet : B.border}` }}>
              <t.icon size={18} aria-hidden="true"/> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="professional-config-content lg:col-span-3">
          <Crd className="p-6">

            {/* ── Perfil ── */}
            {tab === "perfil" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">Información del perfil</h2>
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  {uploadedImg ? (
                    <img src={uploadedImg} alt="Perfil" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-md" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0 transition-all duration-200" style={{ background: avatarBg }}>{initials}</div>
                  )}
                  <div>
                    <p className="font-extrabold text-sm text-[#1C1135]">{perfilNombre}</p>
                    <p className="text-xs text-[#7C6F9A] font-medium mb-2">Foto de perfil</p>
                    <Btn variant="secondary" size="sm" onClick={() => setShowPhotoModal(true)}><Upload size={12} /> Cambiar foto</Btn>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <RemoteFeedback pending={profile.isPending} error={profile.error} retry={() => void profile.refetch()} />
                  <Inp label="Nombre completo" value={perfilNombre} onChange={e => setPerfilNombre(e)} />
                  <Inp label="Correo electrónico" value={perfilEmail} onChange={e => setPerfilEmail(e)} />
                  <Inp label="Teléfono" value={perfilTel} onChange={e => setPerfilTel(e)} />
                  <Inp label="Especialidad principal" value={perfilEsp} onChange={e => setPerfilEsp(e)} />
                  <Inp label="Años de experiencia" value={perfilExp} onChange={e => setPerfilExp(e)} />
                  <Inp label="Cédula profesional" value={perfilCedula} onChange={e => setPerfilCedula(e)} />
                </div>
                <div>
                  <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Sobre mí</label>
                  <textarea className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400 resize-none"
                    rows={3} value={perfilBio} onChange={e => setPerfilBio(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Btn variant="cta" onClick={() => { setSecurityNotice("Solicitud enviada al administrador"); setTimeout(() => setSecurityNotice(""), 3500); }}>
                    {saved ? <><CheckCircle size={14} /> Enviado</> : "Solicitar cambio de datos"}
                  </Btn>
                </div>
              </div>
            )}

            {tab === "disponibilidad" && <AvailabilityEditor />}

            {/* ── Notificaciones ── */}
            {tab === "notificaciones" && <NotificationPreferences/>}

            {/* ── Seguridad ── */}
            {tab === "seguridad" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">Seguridad de la cuenta</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Contraseña actual</label>
                    <div className="relative">
                      <input
                        type={showPwActual ? "text" : "password"}
                        value={pwActual}
                        onChange={e => { setPwActual(e.target.value); setPwErrors(er => ({ ...er, actual: undefined })); }}
                        placeholder="Ingresa tu contraseña actual"
                        className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm font-medium outline-none bg-[#F5F3FF] focus:border-violet-400 ${pwErrors.actual ? "border-red-400" : "border-[#E8E5F4]"}`}
                      />
                      <button type="button" onClick={() => setShowPwActual(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[#7C6F9A] hover:bg-white">
                        {showPwActual ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {pwErrors.actual && <p className="text-xs text-red-500 font-bold mt-1">{pwErrors.actual}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPwNueva ? "text" : "password"}
                        value={pwNueva}
                        onChange={e => { setPwNueva(e.target.value); setPwErrors(er => ({ ...er, nueva: undefined })); }}
                        placeholder="Mínimo 8 caracteres"
                        className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm font-medium outline-none bg-[#F5F3FF] focus:border-violet-400 ${pwErrors.nueva ? "border-red-400" : "border-[#E8E5F4]"}`}
                      />
                      <button type="button" onClick={() => setShowPwNueva(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[#7C6F9A] hover:bg-white">
                        {showPwNueva ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {pwErrors.nueva && <p className="text-xs text-red-500 font-bold mt-1">{pwErrors.nueva}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Confirmar nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPwConfirm ? "text" : "password"}
                        value={pwConfirm}
                        onChange={e => { setPwConfirm(e.target.value); setPwErrors(er => ({ ...er, confirm: undefined })); }}
                        placeholder="Repite la nueva contraseña"
                        className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm font-medium outline-none bg-[#F5F3FF] focus:border-violet-400 ${pwErrors.confirm ? "border-red-400" : "border-[#E8E5F4]"}`}
                      />
                      <button type="button" onClick={() => setShowPwConfirm(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[#7C6F9A] hover:bg-white">
                        {showPwConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {pwErrors.confirm && <p className="text-xs text-red-500 font-bold mt-1">{pwErrors.confirm}</p>}
                  </div>
                </div>
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <p className="font-extrabold text-sm text-[#1C1135] mb-1">Autenticación en dos pasos</p>
                  <p className="text-xs text-[#7C6F9A] font-medium mb-3">Añade una capa extra de seguridad a tu cuenta</p>
                  <Btn variant="secondary" size="sm" onClick={() => setShow2faModal(true)}>{twoFaEnabled ? <><CheckCircle size={14} /> 2FA activado</> : "Activar 2FA"}</Btn>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <p className="font-extrabold text-sm text-red-700 mb-1">Zona de peligro</p>
                  <p className="text-xs text-red-600 font-medium mb-3">Estas acciones son irreversibles.</p>
                  <Btn variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Eliminar cuenta</Btn>
                </div>
                <div className="flex justify-end">
                  <Btn variant="cta" disabled={pwSaving} onClick={() => {
                    const errs: typeof pwErrors = {};
                    if (!pwActual) errs.actual = "Ingresa tu contraseña actual";
                    if (!pwNueva || pwNueva.length < 8) errs.nueva = "La contraseña debe tener al menos 8 caracteres";
                    if (pwNueva !== pwConfirm) errs.confirm = "Las contraseñas no coinciden";
                    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
                    setPwSaving(true);
                    void (async () => {
                      try {
                        if (user?.id_usuario) {
                          await usersService.edit(user.id_usuario, { password: pwNueva });
                        }
                        setPwActual(""); setPwNueva(""); setPwConfirm("");
                        setSecurityNotice("Contraseña actualizada. Ahora tienes el control exclusivo de tu cuenta.");
                        setTimeout(() => setSecurityNotice(""), 3500);
                      } catch {
                        setPwErrors({ confirm: "Error al actualizar la contraseña en el servidor." });
                      } finally {
                        setPwSaving(false);
                      }
                    })();
                    return;


                  }}>
                    {pwSaving ? "Guardando..." : "Cambiar contraseña"}
                  </Btn>
                </div>
              </div>
            )}

          </Crd>
        </div>
      </div>
    </div>
  );
}

