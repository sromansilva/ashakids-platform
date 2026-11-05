import { Route, Routes, Navigate, useSearchParams } from "react-router-dom";
import { CreatePassword } from "@/modules/auth/presentation/Auth/CreatePassword";
import { RouteAccess } from "@/core/router/RouteAccess";
import { PageFrame } from "@/core/layouts/PageFrame";
import { PageBoundary } from "@/core/router/PageBoundary";
import { NotFoundPage } from "@/modules/public/presentation/NotFoundPage";
import { SoporteIncidencias, SoporteDetalle } from './lazyPages';
import { useDemoWorkflow } from "@/shared/application/hooks/useDemoWorkflow";
import { RegisterSelector, RegisterPadre, RegisterVerify, RegisterTerapeuta, TerapeutaLanding, RegisterTerapeutaSuccess, AdminUsuarios, AdminPacientes, AdminCitas, AdminSesiones, AdminSolicitudes, ScheduledSessionLaunchGate } from "./lazyPages";
import { Landing, LoginPage, Onboarding, ForgotPassword, SpecialistsPage, PublicEspecialidades, ResourcesPage, PublicAshi, PublicHistorias, AboutUsPage, PublicPlanes, PublicAyuda, PublicContacto, PublicTrabaja, PadreHome, PadreWelcome, PadreAyuda, PadreRecorrido, PadreConsentimiento, PadreSeguimiento, EvaluacionInicial, PadreReportes, PadreConfig, PadrePsicologos, PadreAgenda, PadreMensajes, MundoAshaHome, PadreIncidencias, MundoASHAPage, MundoAshaCuentos, MundoAshaCanciones, MundoAshaTrabalenguas, MundoAshaAdivinanzas, MundoAshaJuegos, MundoAshaLaberinto, MundoAshaAcademia, MundoAshaRetos, MundoAshaInsignias, MundoAshaPerfil, TerapeutaDashboardPage, TerapeutaAgenda, ActiveClinicalSessionPage, TerapeutaPacientes, TerapeutaMensajes, TerapeutaReportes, TerapeutaAnaliticas, TerapeutaValoraciones, TerapeutaConfig, TerapeutaDatosActividad, TerapeutaIncidencias, AdminDashboardPage, AdminCuentas, AdminOperacion, AdminContenido, AdminML, AdminAuditoria, AdminConfig } from "@/core/router/lazyPages";

function RedirectToJourney() {
  const [searchParams] = useSearchParams();
  const searchStr = searchParams.toString();
  return <Navigate to={searchStr ? `/padre?section=journey&${searchStr}` : "/padre?section=journey"} replace />;
}

export default function AppRouter() {
const { view, role, authRole, go, navigate, handleLogin, handleLogout, padreUserName, padrePlan, parentAppointments, padreExtraNotifs, setPadreExtraNotifs, handleTerapeutaRequestUpdate, setPadreUserName } = useDemoWorkflow();
return <RouteAccess><PageBoundary><Routes>
<Route path="/terapeuta/sesion/espera/:appointmentId/:destination" element={<ScheduledSessionLaunchGate />} />
<Route path="/admin/sesion/espera/:appointmentId/:destination" element={<ScheduledSessionLaunchGate />} />
<Route element={<PageFrame view={view} role={role} go={go} logout={handleLogout} padreUserName={padreUserName} />}>
<Route path="/soporte" element={<SoporteIncidencias />} />
<Route path="/soporte/incidencias" element={<SoporteIncidencias />} />
<Route path="/soporte/incidencias/:id" element={<SoporteDetalle />} />
<Route path="/" element={<Landing go={go} />} />
<Route path="/crear-contrasena" element={<CreatePassword />} />
<Route path="/reset-password" element={<CreatePassword />} />
<Route path="/login" element={<LoginPage onSuccess={handleLogin} onGoHome={() => navigate("/")} onForgotPassword={() => navigate("/forgot-password")} />} />
<Route path="/register" element={<RegisterSelector go={go} />} />
<Route path="/register/padre" element={<RegisterPadre go={go} onNameSet={setPadreUserName} />} />
<Route path="/register/verify" element={<RegisterVerify go={go} />} />
<Route path="/register/terapeuta" element={<RegisterTerapeuta go={go} />} />
<Route path="/register/terapeuta/landing" element={<TerapeutaLanding go={go} />} />
<Route path="/register/terapeuta/success" element={<RegisterTerapeutaSuccess go={go} />} />
<Route path="/onboarding" element={<Onboarding go={go} onComplete={() => navigate("/padre/welcome")} />} />
<Route path="/forgot-password" element={<ForgotPassword go={go} />} />
<Route path="/especialistas" element={<SpecialistsPage go={go} />} />
<Route path="/especialidades" element={<PublicEspecialidades go={go} />} />
<Route path="/recursos" element={<ResourcesPage go={go} />} />
<Route path="/ashi" element={<PublicAshi go={go} />} />
<Route path="/historias" element={<PublicHistorias go={go} />} />
<Route path="/sobre-nosotros" element={<AboutUsPage go={go} />} />
<Route path="/nosotros" element={<AboutUsPage go={go} />} />
<Route path="/planes" element={<PublicPlanes go={go} />} />
<Route path="/ayuda" element={<PublicAyuda go={go} />} />
<Route path="/contacto" element={<PublicContacto go={go} />} />
<Route path="/trabaja" element={<PublicTrabaja go={go} />} />
<Route path="/padre" element={<PadreHome go={go} padreUserName={padreUserName} padrePlan={padrePlan} extraNotifs={padreExtraNotifs} onNotifsRead={()=>setPadreExtraNotifs([])} />} />
<Route path="/padre/welcome" element={<PadreWelcome go={go} />} />
<Route path="/padre/camino" element={<RedirectToJourney />} />
<Route path="/padre/ayuda" element={<PadreAyuda go={go} />} />
<Route path="/padre/recorrido" element={<PadreRecorrido go={go} />} />
<Route path="/padre/consentimiento" element={<PadreConsentimiento go={go} />} />
<Route path="/padre/seguimiento" element={<PadreSeguimiento go={go} />} />
<Route path="/padre/evaluacion" element={<EvaluacionInicial go={go} />} />
<Route path="/padre/hijos" element={<RedirectToJourney />} />
<Route path="/padre/progreso" element={<RedirectToJourney />} />
<Route path="/padre/reportes" element={<PadreReportes />} />
<Route path="/padre/config" element={<PadreConfig onNameChange={setPadreUserName} padrePlan={padrePlan} go={go} />} />
<Route path="/padre/psicologos" element={<PadrePsicologos />} />
<Route path="/padre/agenda" element={<PadreAgenda go={go} />} />
<Route path="/padre/mensajes" element={<PadreMensajes />} />
<Route path="/padre/recompensas" element={<MundoAshaHome go={go} padrePlan={padrePlan} />} />
<Route path="/padre/incidencias" element={<PadreIncidencias go={go} />} />
<Route path="/mundo-asha" element={authRole === "PADRE" ? <MundoAshaHome go={go} padrePlan={padrePlan} /> : <MundoASHAPage go={go} />} />
<Route path="/mundo-asha/cuentos" element={<MundoAshaCuentos go={go} />} />
<Route path="/mundo-asha/canciones" element={<MundoAshaCanciones go={go} />} />
<Route path="/mundo-asha/trabalenguas" element={<MundoAshaTrabalenguas go={go} />} />
<Route path="/mundo-asha/adivinanzas" element={<MundoAshaAdivinanzas go={go} />} />
<Route path="/mundo-asha/juegos" element={<MundoAshaJuegos go={go} />} />
<Route path="/mundo-asha/laberinto" element={<MundoAshaLaberinto go={go} />} />
<Route path="/mundo-asha/isla" element={<Navigate to="/mundo-asha" replace />} />
<Route path="/mundo-asha/academia" element={<MundoAshaAcademia go={go} />} />
<Route path="/mundo-asha/retos" element={<MundoAshaRetos go={go} />} />
<Route path="/mundo-asha/insignias" element={<MundoAshaInsignias go={go} />} />
<Route path="/mundo-asha/perfil" element={<MundoAshaPerfil go={go} />} />
<Route path="/terapeuta" element={<TerapeutaDashboardPage go={go} />} />
<Route path="/terapeuta/sesion/:appointmentId" element={<ActiveClinicalSessionPage />} />
<Route path="/terapeuta/agenda" element={<TerapeutaAgenda go={go} requests={parentAppointments} onRequestUpdate={handleTerapeutaRequestUpdate} />} />
<Route path="/terapeuta/pacientes" element={<TerapeutaPacientes go={go} />} />
<Route path="/terapeuta/mensajes" element={<TerapeutaMensajes />} />
<Route path="/terapeuta/reportes" element={<TerapeutaReportes go={go} />} />
<Route path="/terapeuta/analiticas" element={<TerapeutaAnaliticas />} />
<Route path="/terapeuta/valoraciones" element={<TerapeutaValoraciones />} />
<Route path="/terapeuta/config" element={<TerapeutaConfig />} />
<Route path="/terapeuta/datos-actividad" element={<TerapeutaDatosActividad />} />
<Route path="/terapeuta/incidencias" element={<TerapeutaIncidencias go={go} />} />
<Route path="/admin" element={<AdminDashboardPage go={go} />} />
<Route path="/admin/sesion/:appointmentId" element={<ActiveClinicalSessionPage />} />
<Route path="/admin/usuarios" element={<AdminUsuarios />} />
<Route path="/admin/pacientes" element={<AdminPacientes />} />
<Route path="/admin/citas" element={<AdminCitas />} />
<Route path="/admin/sesiones" element={<AdminSesiones />} />
<Route path="/admin/solicitudes" element={<AdminSolicitudes />} />
<Route path="/admin/dashboard" element={<AdminDashboardPage go={go} />} />
<Route path="/admin/cuentas" element={<AdminCuentas go={go} />} />
<Route path="/admin/operacion" element={<AdminOperacion go={go} />} />
<Route path="/admin/contenido" element={<AdminContenido />} />
<Route path="/admin/ml" element={<AdminML go={go} />} />
<Route path="/admin/auditoria" element={<AdminAuditoria />} />
<Route path="/admin/config" element={<AdminConfig />} />
<Route path="/padre/dashboard" element={<Navigate to="/padre/welcome" replace />} />
<Route path="/padre/pacientes" element={<RedirectToJourney />} />
<Route path="/padre/perfil" element={<PadreConfig onNameChange={setPadreUserName} padrePlan={padrePlan} go={go} />} />
<Route path="/padre/mi-camino" element={<RedirectToJourney />} />
<Route path="*" element={<NotFoundPage />} />
</Route>
</Routes></PageBoundary></RouteAccess>;
}
