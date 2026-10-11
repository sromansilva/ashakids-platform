import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { B } from "@/theme/brand/B";
import { publicAssets } from "@/components/illustrations/publicAssets";
import type { CrearPadrePayload, CrearTerapeutaPayload, RegistroHijo } from "@/types/auth";
import { TabRole } from "./AdminCuentas";
import { emptyChild, FamilyChildrenFields } from "./FamilyChildrenFields";

interface AdminCuentasCrearModalProps {
  isOpen: boolean;
  tab: TabRole;
  errorBanner: string | null;
  formPadre: CrearPadrePayload;
  formTerapeuta: CrearTerapeutaPayload;
  setFormPadre: React.Dispatch<React.SetStateAction<CrearPadrePayload>>;
  setFormTerapeuta: React.Dispatch<React.SetStateAction<CrearTerapeutaPayload>>;
  hijoEnEdicion: RegistroHijo;
  setHijoEnEdicion: React.Dispatch<React.SetStateAction<RegistroHijo>>;
  submitting: boolean;
  onClose: () => void;
  onCrear: () => void;
}

const inputClass =
  "w-full min-h-11 rounded-xl border border-[#E8E5F4] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1C1135] outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:text-[#7C6F9A]";
const labelClass = "block text-sm font-extrabold text-[#1C1135]";
const helpClass = "mt-1.5 text-xs leading-5 text-[#6B5E8A]";
const illustration = publicAssets["/illustrations/family-v1.png"];

export function AdminCuentasCrearModal({
  isOpen,
  tab,
  errorBanner,
  formPadre,
  formTerapeuta,
  setFormPadre,
  setFormTerapeuta,
  hijoEnEdicion,
  setHijoEnEdicion,
  submitting,
  onClose,
  onCrear,
}: AdminCuentasCrearModalProps) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(submitting);
  const [step, setStep] = useState(0);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [childError, setChildError] = useState<string | null>(null);
  const parent = tab === "PADRE";
  const steps = parent
    ? ["Identificación", "Contacto y dirección", "Hijos"]
    : ["Identificación", "Perfil profesional", "Revisión"];
  const lastStep = steps.length - 1;

  closeRef.current = onClose;
  busyRef.current = submitting;

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setLocationState("idle");
      setChildError(null);
    }
  }, [isOpen, tab]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusFirst = () => {
      dialog.current
        ?.querySelector<HTMLElement>(
          "input:not([disabled]), select:not([disabled]), button:not([disabled])",
        )
        ?.focus();
    };
    const timer = window.setTimeout(focusFirst, 0);

    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
      if (event.key !== "Tab") return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled)",
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", keyboard);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", keyboard);
      previous?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      dialog.current
        ?.querySelector<HTMLElement>("input:not([disabled]), select:not([disabled])")
        ?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [step, isOpen]);

  if (!isOpen) return null;

  function validateStep() {
    return dialog.current?.querySelector<HTMLFormElement>("form")?.reportValidity() ?? false;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !validateStep()) return;
    if (step < lastStep) {
      setStep((current) => current + 1);
      return;
    }
    if (parent && !(formPadre.hijos?.length)) {
      setChildError("Guarda al menos un niño antes de crear la cuenta.");
      return;
    }
    onCrear();
  }

  function validateChildDraft() {
    const draft = hijoEnEdicion;
    if (!draft.nombres_paciente.trim() || !draft.apellidos_paciente.trim() || !draft.fecha_nacimiento || !draft.sexo) {
      setChildError("Completa nombres, apellidos, fecha de nacimiento, edad y sexo.");
      return false;
    }
    if (draft.edad == null || draft.edad < 3 || draft.edad > 12) {
      setChildError("La edad permitida para cada niño es de 3 a 12 años.");
      return false;
    }
    const birth = new Date(`${draft.fecha_nacimiento}T00:00:00`);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear() - (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) ? 1 : 0
    );
    if (!Number.isFinite(age) || age < 3 || age > 12 || age !== draft.edad) {
      setChildError("La edad indicada debe coincidir con la fecha de nacimiento y estar entre 3 y 12 años.");
      return false;
    }
    return true;
  }

  function saveChild() {
    if (!validateChildDraft()) return;
    setFormPadre((form) => ({ ...form, hijos: [...(form.hijos ?? []), hijoEnEdicion] }));
    setHijoEnEdicion(emptyChild());
    setChildError(null);
  }

  function editChild(index: number) {
    const selected = formPadre.hijos?.[index];
    if (!selected) return;
    setHijoEnEdicion(selected);
    setFormPadre((form) => ({ ...form, hijos: (form.hijos ?? []).filter((_, itemIndex) => itemIndex !== index) }));
    setChildError(null);
  }

  function removeChild(index: number) {
    setFormPadre((form) => ({ ...form, hijos: (form.hijos ?? []).filter((_, itemIndex) => itemIndex !== index) }));
    setChildError(null);
  }

  function goBack() {
    if (!submitting) setStep((current) => Math.max(0, current - 1));
  }

  function requestCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationState("error");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
        setFormPadre((form) => ({
          ...form,
          direccion: form.direccion?.trim()
            ? `${form.direccion.trim()} · Coordenadas: ${coordinates}`.slice(0, 200)
            : `Ubicación actual: ${coordinates}`,
        }));
        setLocationState("ready");
      },
      () => setLocationState("error"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  const progress = ((step + 1) / steps.length) * 100;
  const documentValue = formPadre.numero_documento || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1135]/45 p-3 backdrop-blur-md sm:p-6">
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-account-title"
        className="flex max-h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(45,27,105,0.24)]"
      >
        <header className="flex items-start justify-between border-b border-[#E8E5F4] px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-violet-700 sm:h-16 sm:w-16">
              {parent ? <UsersRound size={28} strokeWidth={2.4} /> : <UserRound size={27} strokeWidth={2.4} />}
            </span>
            <div>
              <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-violet-600">
                Nueva cuenta · Paso {step + 1} de {steps.length}
              </p>
              <h2 id="create-account-title" className="text-xl font-black tracking-tight text-[#1C1135] sm:text-2xl">
                {parent ? "Nueva cuenta de Padre / Familia" : "Nueva cuenta de Terapeuta"}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-[#6B5E8A]">
                {parent
                  ? "Crea una cuenta para acompañar el progreso terapéutico de tu hijo o hijos."
                  : "Crea una cuenta para el profesional que acompañará a las familias."}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar formulario"
            disabled={submitting}
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[#F5F3FF] text-[#6B5E8A] transition hover:bg-[#EDE9FE] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <div className="border-b border-[#E8E5F4] px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-start gap-2 sm:gap-3" role="list" aria-label="Progreso del formulario">
            {steps.map((title, index) => (
              <React.Fragment key={title}>
                <div role="listitem" className="min-w-0 flex-1 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      aria-current={index === step ? "step" : undefined}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black transition sm:h-11 sm:w-11 sm:text-base ${
                        index < step
                          ? "bg-emerald-500 text-white"
                          : index === step
                            ? "bg-violet-600 text-white ring-4 ring-violet-100"
                            : "bg-[#EDE9FE] text-[#6B5E8A]"
                      }`}
                    >
                      {index < step ? <Check size={18} strokeWidth={3} /> : index + 1}
                    </span>
                  </div>
                  <span className={`mt-2 block truncate text-[11px] font-extrabold sm:text-sm ${index === step ? "text-violet-700" : "text-[#6B5E8A]"}`}>
                    {title}
                  </span>
                </div>
                {index < lastStep && <span className={`mt-5 h-0.5 flex-1 rounded-full sm:mt-6 ${index < step ? "bg-emerald-300" : "bg-[#E8E5F4]"}`} />}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EDE9FE]" aria-hidden="true">
            <div className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-right text-xs font-extrabold text-[#6B5E8A]" aria-live="polite">Paso {step + 1} de {steps.length}</p>
        </div>

        <form autoComplete="off" onSubmit={handleSubmit} className="min-h-0 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          {errorBanner && (
            <div role="alert" aria-live="assertive" className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">
              <AlertTriangle size={15} className="shrink-0 text-red-600" />
              <span>{errorBanner}</span>
            </div>
          )}

          {step === 0 && parent && (
            <section aria-labelledby="account-step-identification" className="rounded-[24px] bg-[#F7F4FF] p-4 sm:p-5">
              <div className="mb-4">
                <h3 id="account-step-identification" className="text-2xl font-black tracking-tight text-[#1C1135]">Paso 1: Identificación</h3>
                <p className="mt-1 text-base text-[#6B5E8A]">Ingresa el número de documento para completar tus datos.</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_auto] sm:items-end">
                    <label htmlFor="account-document-type" className={labelClass}>
                      Tipo de documento
                      <span className="relative mt-1.5 block">
                        <IdCard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9E95B7]" size={18} />
                        <select id="account-document-type" required disabled value="DNI" className={`${inputClass} appearance-none pl-10`}>
                          <option value="DNI">DNI</option>
                        </select>
                      </span>
                    </label>
                    <label htmlFor="account-document-number" className={labelClass}>
                      Número de DNI *
                      <input id="account-document-number" required minLength={8} maxLength={8} pattern="[0-9]{8}" inputMode="numeric" disabled={submitting} value={documentValue} onChange={(event) => setFormPadre((form) => ({ ...form, tipo_documento: "DNI", numero_documento: event.target.value.replace(/\D/g, "") }))} placeholder="12345678" className={`${inputClass} text-base`} />
                    </label>
                    <button type="button" disabled aria-disabled="true" title="Consultar RENIEC estará disponible en el próximo avance" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#EDE9FE] px-4 text-sm font-black text-violet-700 opacity-60 shadow-sm disabled:cursor-not-allowed sm:mb-0">
                      <Search size={18} />
                      <span>Consultar RENIEC</span>
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label htmlFor="account-names" className={labelClass}>Nombres *<input id="account-names" autoComplete="given-name" required maxLength={60} disabled={submitting} value={formPadre.nombres} onChange={(event) => setFormPadre((form) => ({ ...form, nombres: event.target.value }))} placeholder="Ej. Juan" className={`${inputClass} mt-1.5`} /></label>
                    <label htmlFor="account-surnames" className={labelClass}>Apellidos *<input id="account-surnames" autoComplete="family-name" required maxLength={80} disabled={submitting} value={formPadre.apellidos} onChange={(event) => setFormPadre((form) => ({ ...form, apellidos: event.target.value }))} placeholder="Ej. Pérez" className={`${inputClass} mt-1.5`} /></label>
                  </div>
                  <label htmlFor="account-email" className={`${labelClass} mt-4`}>Correo electrónico *<span className="relative mt-1.5 block"><Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9E95B7]" size={18} /><input id="account-email" autoComplete="email" required maxLength={150} disabled={submitting} type="email" value={formPadre.email} onChange={(event) => setFormPadre((form) => ({ ...form, email: event.target.value }))} placeholder="correo@ejemplo.com" className={`${inputClass} pl-10`} /></span></label>
                  <p className={helpClass}>Se enviará un enlace para crear la contraseña. Vence en 24 horas.</p>
                </div>

                <aside className="hidden flex-col items-center justify-center rounded-[20px] bg-[#F5F3FF] p-4 text-center lg:flex">
                  <img src={illustration?.src} srcSet={illustration?.srcSet} alt="Familia acompañándose" className="h-44 w-44 object-contain" />
                  <div className="rounded-2xl bg-white/75 p-3 text-left">
                    <div className="flex items-center gap-2 text-sm font-black text-violet-700"><ShieldCheck size={17} />Tus datos están seguros</div>
                  </div>
                </aside>
              </div>
            </section>
          )}

          {step === 0 && !parent && (
            <section aria-labelledby="therapist-step-identification" className="space-y-4 rounded-[24px] bg-[#F7F4FF] p-4 sm:p-5">
              <div><h3 id="therapist-step-identification" className="text-2xl font-black tracking-tight text-[#1C1135]">Paso 1: Identificación</h3><p className="mt-1 text-base text-[#6B5E8A]">Registra los datos básicos del profesional.</p></div>
              <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2"><label htmlFor="therapist-names" className={labelClass}>Nombres *<input id="therapist-names" required maxLength={60} disabled={submitting} value={formTerapeuta.nombres} onChange={(event) => setFormTerapeuta((form) => ({ ...form, nombres: event.target.value }))} placeholder="Ej. Ana" className={`${inputClass} mt-1.5`} /></label><label htmlFor="therapist-surnames" className={labelClass}>Apellidos *<input id="therapist-surnames" required maxLength={80} disabled={submitting} value={formTerapeuta.apellidos} onChange={(event) => setFormTerapeuta((form) => ({ ...form, apellidos: event.target.value }))} placeholder="Ej. Ruiz" className={`${inputClass} mt-1.5`} /></label></div>
                <label htmlFor="therapist-email" className={`${labelClass} mt-4`}>Correo electrónico *<input id="therapist-email" required maxLength={150} type="email" disabled={submitting} value={formTerapeuta.email} onChange={(event) => setFormTerapeuta((form) => ({ ...form, email: event.target.value }))} placeholder="correo@ejemplo.com" className={`${inputClass} mt-1.5`} /></label>
                <p className={helpClass}>Se enviará un enlace para crear la contraseña. Vence en 24 horas.</p>
              </div>
            </section>
          )}

          {step === 1 && parent && (
            <section aria-labelledby="account-step-contact" className="space-y-4 rounded-[24px] bg-[#F7F4FF] p-4 sm:p-5">
              <div><h3 id="account-step-contact" className="text-2xl font-black tracking-tight text-[#1C1135]">Paso 2: Contacto y dirección</h3><p className="mt-1 text-base text-[#6B5E8A]">Agrega los datos de contacto y ubicación de la familia.</p></div>
              <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2"><label htmlFor="account-relationship" className={labelClass}><span className="flex items-center gap-2"><UsersRound size={17} className="text-violet-600" />Parentesco</span><select id="account-relationship" disabled={submitting} value={formPadre.parentesco || "Padre"} onChange={(event) => setFormPadre((form) => ({ ...form, parentesco: event.target.value }))} className={`${inputClass} mt-1.5`}><option value="Padre">Padre</option><option value="Madre">Madre</option><option value="Tutor">Tutor</option></select></label><label htmlFor="account-phone" className={labelClass}><span className="flex items-center gap-2"><Phone size={17} className="text-violet-600" />Teléfono</span><input id="account-phone" autoComplete="tel" maxLength={12} inputMode="tel" disabled={submitting} value={formPadre.telefono || ""} onChange={(event) => setFormPadre((form) => ({ ...form, telefono: event.target.value }))} placeholder="999 999 999" className={`${inputClass} mt-1.5`} /></label></div>
                <div className="mt-5 border-t border-[#E8E5F4] pt-5"><label htmlFor="account-address" className={labelClass}><span className="flex items-center gap-2"><MapPin size={17} className="text-violet-600" />Dirección domiciliaria</span><input id="account-address" autoComplete="street-address" maxLength={200} disabled={submitting} value={formPadre.direccion || ""} onChange={(event) => setFormPadre((form) => ({ ...form, direccion: event.target.value }))} placeholder="Calle / Av. y número" className={`${inputClass} mt-1.5`} /></label>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"><button type="button" onClick={requestCurrentLocation} disabled={submitting || locationState === "loading"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-[#F5F3FF] px-4 text-sm font-black text-violet-700 transition hover:bg-[#EDE9FE] disabled:cursor-not-allowed disabled:opacity-60"><MapPin size={17} />{locationState === "loading" ? "Buscando ubicación…" : "Usar mi ubicación actual"}</button><a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E8E5F4] px-4 text-sm font-black text-[#6B5E8A] transition hover:bg-[#F5F3FF]"><Search size={16} />Abrir mapa para ubicar manualmente</a></div>
                  <p className={helpClass} role="status">{locationState === "idle" && "Puedes escribir la dirección o permitir el acceso a tu ubicación desde el navegador."}{locationState === "loading" && "El navegador solicitará permiso para usar tu ubicación."}{locationState === "ready" && "Ubicación agregada. Puedes editar el texto antes de continuar."}{locationState === "error" && "No pudimos obtener la ubicación. Escribe la dirección o usa el mapa manual."}</p>
                </div>
              </div>
            </section>
          )}

          {step === 1 && !parent && (
            <section aria-labelledby="therapist-step-profile" className="space-y-4 rounded-[24px] bg-[#F7F4FF] p-4 sm:p-5">
              <div><h3 id="therapist-step-profile" className="text-2xl font-black tracking-tight text-[#1C1135]">Paso 2: Perfil profesional</h3><p className="mt-1 text-base text-[#6B5E8A]">Completa la información que verá el equipo administrativo.</p></div>
              <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5"><div className="grid gap-3 sm:grid-cols-2"><label htmlFor="account-specialty" className={labelClass}>Especialidad<input id="account-specialty" maxLength={100} disabled={submitting} value={formTerapeuta.especialidad || ""} onChange={(event) => setFormTerapeuta((form) => ({ ...form, especialidad: event.target.value }))} placeholder="Ej. Terapia de lenguaje" className={`${inputClass} mt-1.5`} /></label><label htmlFor="account-experience" className={labelClass}>Años de experiencia<input id="account-experience" type="number" min="0" max="70" disabled={submitting} value={formTerapeuta.anios_experiencia ?? 0} onChange={(event) => setFormTerapeuta((form) => ({ ...form, anios_experiencia: Number(event.target.value) || 0 }))} className={`${inputClass} mt-1.5`} /></label></div><label htmlFor="account-languages" className={`${labelClass} mt-4`}>Idiomas<input id="account-languages" maxLength={50} disabled={submitting} value={formTerapeuta.idiomas || ""} onChange={(event) => setFormTerapeuta((form) => ({ ...form, idiomas: event.target.value }))} placeholder="Ej. Español, Quechua" className={`${inputClass} mt-1.5`} /></label></div>
            </section>
          )}

          {step === lastStep && (
            <section aria-labelledby="account-step-review" className="space-y-4 rounded-[24px] bg-[#F7F4FF] p-4 sm:p-5">
              <div><h3 id="account-step-review" className="text-2xl font-black tracking-tight text-[#1C1135]">{parent ? "Paso 3: Hijos" : "Paso 3: Revisión"}</h3><p className="mt-1 text-base text-[#6B5E8A]">{parent ? "Registra a los hijos asociados y crea la cuenta." : "Revisa los datos antes de crear la cuenta."}</p></div>
              {parent ? <div className="rounded-2xl bg-white p-4 shadow-sm"><FamilyChildrenFields children={formPadre.hijos ?? []} draft={hijoEnEdicion} onDraftChange={setHijoEnEdicion} onSaveChild={saveChild} onEditChild={editChild} onRemoveChild={removeChild} draftError={childError} disabled={submitting} /></div> : <div className="rounded-2xl bg-white p-4 text-sm text-[#6B5E8A] shadow-sm"><p><span className="font-bold text-[#1C1135]">Especialidad:</span> {formTerapeuta.especialidad || "No especificada"}</p><p className="mt-1"><span className="font-bold text-[#1C1135]">Experiencia:</span> {formTerapeuta.anios_experiencia ?? 0} años</p><p className="mt-1"><span className="font-bold text-[#1C1135]">Idiomas:</span> {formTerapeuta.idiomas || "No especificados"}</p></div>}
            </section>
          )}

          <footer className="mt-6 flex flex-col-reverse gap-2 border-t border-[#E8E5F4] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={step > 0 ? goBack : onClose} disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DDD6FE] px-5 text-sm font-black text-violet-700 transition hover:bg-[#F5F3FF] disabled:opacity-50">{step > 0 && <ChevronLeft size={18} />}{step > 0 ? "Atrás" : "Cancelar"}</button>
            <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>{submitting ? <Loader2 size={17} className="animate-spin" /> : step < lastStep ? <ChevronRight size={18} /> : <Check size={17} strokeWidth={3} />}{step < lastStep ? "Siguiente" : "Crear cuenta"}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
