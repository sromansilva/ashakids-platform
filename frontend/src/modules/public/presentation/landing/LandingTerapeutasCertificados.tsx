import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Briefcase, ChevronLeft, ChevronRight, Globe, Video } from "lucide-react";
import { PublicIllustration } from "@/shared/presentation/components/illustrations/PublicIllustration";
import { RemoteFeedback } from "@/shared/presentation/components/common/RemoteFeedback";
import { terapeutasService, type PublicTherapistItem } from "@/modules/public/infrastructure/terapeutasService";
import { ACCOUNT_REQUEST_WHATSAPP_URL } from "@/shared/domain/contact";
import { PublicDialog } from "./PublicDialog";

const PAGE_SIZE = 3;

function getInitials(nombres: string, apellidos: string): string {
  const first = nombres.trim().charAt(0);
  const last = apellidos.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "AS";
}

function formatFullName(t: PublicTherapistItem): string {
  return `${t.nombres} ${t.apellidos}`.trim();
}

function formatExperience(years?: number | null): string | null {
  if (typeof years !== "number" || years <= 0) return null;
  return years === 1 ? "1 año de experiencia" : `${years} años de experiencia`;
}

export function LandingTerapeutasCertificados() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PublicTherapistItem | null>(null);

  const directory = useQuery({
    queryKey: ["public-therapists-directory"],
    queryFn: ({ signal }) => terapeutasService.getPublicDirectory(signal),
    staleTime: 60_000,
  });

  const therapists = useMemo(
    () => (Array.isArray(directory.data) ? directory.data : []),
    [directory.data]
  );

  const slides = useMemo(() => {
    const chunks: PublicTherapistItem[][] = [];
    for (let i = 0; i < therapists.length; i += PAGE_SIZE) {
      chunks.push(therapists.slice(i, i + PAGE_SIZE));
    }
    return chunks;
  }, [therapists]);

  const totalPages = slides.length;
  const safePage = totalPages > 0 ? Math.min(page, totalPages - 1) : 0;

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <section id="landing-specialists" className="landing-section landing-team">
      <div className="landing-container">
        <div className="landing-heading-row">
          <div className="landing-section-heading landing-team-heading">
            <PublicIllustration
              src="/illustrations/team-care-v54.png"
              alt=""
              loading="lazy"
              width={180}
              height={160}
            />
            <h2>
              Terapeutas certificados
              <br />
              <span>y comprometidos</span>
            </h2>
          </div>

          {totalPages > 0 && (
            <div className="landing-team-controls" role="group" aria-label="Controles del carrusel de terapeutas">
              <button
                type="button"
                className="asha-btn asha-btn--outline asha-btn--icon landing-carousel-btn"
                onClick={handlePrev}
                disabled={safePage === 0}
                aria-label="Ver terapeutas anteriores"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="landing-carousel-counter" aria-live="polite">
                {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="asha-btn asha-btn--outline asha-btn--icon landing-carousel-btn"
                onClick={handleNext}
                disabled={safePage >= totalPages - 1}
                aria-label="Ver siguientes terapeutas"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <RemoteFeedback
          pending={directory.isPending}
          error={directory.error}
          retry={() => void directory.refetch()}
        />

        {!directory.isPending && !directory.error && therapists.length === 0 && (
          <div className="asha-card text-center py-10">
            <p className="font-extrabold text-[#1C1135]">Aún no hay especialistas disponibles en el directorio público.</p>
            <p className="text-sm text-[#615274] mt-1">Vuelve pronto o escríbenos para conocer nuestro equipo clínico.</p>
          </div>
        )}

        {slides.length > 0 && (
          <>
            <div className="landing-team-viewport" aria-roledescription="carrusel" aria-label="Especialistas de ASHAKids">
              <div
                className="landing-team-track"
                style={{ transform: `translate3d(-${safePage * 100}%, 0, 0)` }}
              >
                {slides.map((group, slideIdx) => (
                  <div key={slideIdx} className="landing-team-slide">
                    <div className="landing-team-grid">
                      {group.map((t, idx) => {
                        const fullName = formatFullName(t);
                        const specialty = t.especialidad || "Terapia del Lenguaje";
                        const expLabel = formatExperience(t.anios_experiencia);
                        const idiomas = t.idiomas || "Español";
                        const toneIdx = (slideIdx * PAGE_SIZE + idx) % 3;

                        return (
                          <button
                            key={t.id_terapeuta}
                            type="button"
                            onClick={() => setSelected(t)}
                            className={`asha-card asha-glass landing-glass landing-therapist landing-therapist-btn landing-therapist-${toneIdx}`}
                            aria-label={`Ver información profesional de ${fullName}`}
                          >
                            <div className="landing-therapist-portrait" aria-hidden="true">
                              {t.foto_perfil_url ? (
                                <img
                                  src={t.foto_perfil_url}
                                  alt=""
                                  className="landing-therapist-photo"
                                  loading="lazy"
                                />
                              ) : (
                                <span>{getInitials(t.nombres, t.apellidos)}</span>
                              )}
                              <div className="landing-portrait-orbit" />
                            </div>

                            <div className="landing-therapist-info">
                              <h3>{fullName}</h3>
                              <p className="landing-therapist-specialty">{specialty}</p>
                              <ul className="landing-tags">
                                <li>{idiomas}</li>
                                {expLabel && <li>{expLabel}</li>}
                              </ul>
                              <span className="landing-therapist-cta">
                                Ver perfil profesional <ArrowRight size={15} aria-hidden="true" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="landing-carousel-dots" role="tablist" aria-label="Páginas de especialistas">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={safePage === idx}
                    aria-label={`Ir al grupo ${idx + 1} de especialistas`}
                    className={`landing-carousel-dot ${safePage === idx ? "is-active" : ""}`}
                    onClick={() => setPage(idx)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {selected && (
          <PublicDialog title={formatFullName(selected)} onClose={() => setSelected(null)}>
            <div className="landing-therapist-modal">
              <div className="landing-therapist-modal-header">
                <div className="landing-therapist-modal-avatar" aria-hidden="true">
                  {selected.foto_perfil_url ? (
                    <img src={selected.foto_perfil_url} alt="" />
                  ) : (
                    <span>{getInitials(selected.nombres, selected.apellidos)}</span>
                  )}
                </div>
                <div>
                  <span className="landing-therapist-modal-badge">
                    {selected.especialidad || "Terapia del Lenguaje"}
                  </span>
                  <div className="landing-therapist-modal-meta">
                    {formatExperience(selected.anios_experiencia) && (
                      <span>
                        <Briefcase size={14} aria-hidden="true" />
                        {formatExperience(selected.anios_experiencia)}
                      </span>
                    )}
                    <span>
                      <Globe size={14} aria-hidden="true" />
                      {selected.idiomas || "Español"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="landing-therapist-modal-bio">
                {selected.descripcion_profesional ||
                  "Especialista en fonoaudiología y comunicación infantil, comprometido con acompañar el desarrollo del lenguaje de cada niño."}
              </p>

              <div className="landing-therapist-modal-note">
                <Video size={18} aria-hidden="true" />
                <span>Atención virtual en sesiones personalizadas de 40 minutos vía Google Meet.</span>
              </div>

              <div className="landing-dialog-actions">
                <a
                  href={ACCOUNT_REQUEST_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="asha-btn"
                >
                  Solicitar cuenta familiar <ArrowRight size={18} />
                </a>
                <button
                  type="button"
                  className="landing-context-link"
                  onClick={() => setSelected(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </PublicDialog>
        )}
      </div>
    </section>
  );
}
