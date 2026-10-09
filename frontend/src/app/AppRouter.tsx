import { Route, Routes } from "react-router-dom";
import { RouteAccess } from "@/app/RouteAccess";
import { PageFrame } from "@/app/layouts/PageFrame";
import { PageBoundary } from "@/app/PageBoundary";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { useDemoWorkflow } from "@/app/hooks/useDemoWorkflow";
import { RegisterSelector, RegisterPadre, RegisterVerify, RegisterTerapeuta, TerapeutaLanding, RegisterTerapeutaSuccess, AdminReportes, AdminUsuarios, AdminPacientes, AdminCitas, AdminSesiones, AdminAnaliticas, AdminMensajes, AdminModeracion, AdminSolicitudes, AshaCore } from "./lazyPages";
import { Landing, LoginPage, Onboarding, ForgotPassword, SpecialistsPage, PublicEspecialidades, ResourcesPage, PublicAshi, PublicHistorias, AboutUsPage, PublicPlanes, PublicAyuda, PublicContacto, PublicTrabaja, AshaSessionWaiting, AshaSessionActive, AshaSessionEnd, PadreHome, MiCaminoAsha, PadreAyuda, PadreRecorrido, PadreConsentimiento, PadreSeguimiento, EvaluacionInicial, PadreReportes, PadreConfig, PadrePsicologos, PadreAgenda, PadreMensajes, PadreCompras, MundoAshaHome, PadreIncidencias, MundoASHAPage, MundoAshaCuentos, MundoAshaCanciones, MundoAshaTrabalenguas, MundoAshaAdivinanzas, MundoAshaJuegos, MundoAshaLaberinto, MundoAshaIsla, MundoAshaAcademia, MundoAshaRetos, MundoAshaInsignias, MundoAshaPerfil, TerapeutaDashboardPage, TerapeutaAgenda, TerapeutaPacientes, TerapeutaMensajes, TerapeutaReportes, TerapeutaAnaliticas, TerapeutaIngresos, TerapeutaValoraciones, TerapeutaConfig, TerapeutaDatosActividad, TerapeutaIncidencias, AshaPayCheckout, AshaPayHistory, AshaPayWallet, AshaSessionHome, AshaSessionPrep, AshaSessionSummary, AdminDashboardPage, AdminCuentas, AdminTerapeutas, AdminOperacion, AdminPagos, AdminContenido, AdminML, AdminAuditoria, AdminConfig } from "@/app/lazyPages";

export default function AppRouter() {
const { view, role, authRole, go, navigate, location, handleLogin, handleLogout, padreUserName, padrePlan, parentAppointments, addParentAppointment, setParentAppointments, padreExtraNotifs, setPadreExtraNotifs, handleTerapeutaRequestUpdate, bookedSlots, setPadreUserName } = useDemoWorkflow();
return <RouteAccess><PageBoundary><Routes>
<Route element={<PageFrame view={view} role={role} go={go} logout={handleLogout} padreUserName={padreUserName} padrePlan={padrePlan} />}>
<Route path="/" element={<Landing go={go} />} />
<Route path="/login" element={<LoginPage onSuccess={handleLogin} onGoHome={() => navigate("/")} onForgotPassword={() => navigate("/forgot-password")} />} />
<Route path="/register" element={<RegisterSelector go={go} />} />
<Route path="/register/padre" element={<RegisterPadre go={go} onNameSet={setPadreUserName} />} />
<Route path="/register/verify" element={<RegisterVerify go={go} />} />
<Route path="/register/terapeuta" element={<RegisterTerapeuta go={go} />} />
<Route path="/register/terapeuta/landing" element={<TerapeutaLanding go={go} />} />
<Route path="/register/terapeuta/success" element={<RegisterTerapeutaSuccess go={go} />} />
<Route path="/onboarding" element={<Onboarding go={go} onComplete={() => navigate("/padre")} />} />
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
<Route path="/session/waiting" element={<AshaSessionWaiting go={go} />} />
<Route path="/session/active" element={<AshaSessionActive go={go} />} />
<Route path="/session/end" element={<AshaSessionEnd go={go} />} />
<Route path="/padre" element={<PadreHome go={go} padreUserName={padreUserName} padrePlan={padrePlan} extraNotifs={padreExtraNotifs} onNotifsRead={()=>setPadreExtraNotifs([])} />} />
<Route path="/padre/camino" element={<MiCaminoAsha go={go} padrePlan={padrePlan} />} />
<Route path="/padre/ayuda" element={<PadreAyuda go={go} />} />
<Route path="/padre/recorrido" element={<PadreRecorrido go={go} />} />
<Route path="/padre/consentimiento" element={<PadreConsentimiento go={go} />} />
<Route path="/padre/seguimiento" element={<PadreSeguimiento go={go} />} />
<Route path="/padre/evaluacion" element={<EvaluacionInicial go={go} />} />
<Route path="/padre/hijos" element={<MiCaminoAsha go={go} padrePlan={padrePlan} />} />
<Route path="/padre/progreso" element={<MiCaminoAsha go={go} padrePlan={padrePlan} />} />
<Route path="/padre/reportes" element={<PadreReportes />} />
<Route path="/padre/config" element={<PadreConfig onNameChange={setPadreUserName} padrePlan={padrePlan} go={go} />} />
<Route path="/padre/psicologos" element={<PadrePsicologos go={go} onRequest={addParentAppointment} bookedSlots={bookedSlots} />} />
<Route path="/padre/agenda" element={<PadreAgenda go={go} appointments={parentAppointments} onAppointmentsChange={setParentAppointments} />} />
<Route path="/padre/mensajes" element={<PadreMensajes />} />
<Route path="/padre/compras" element={<PadreCompras go={go} appointments={parentAppointments} onAppointmentsChange={setParentAppointments} />} />
<Route path="/padre/recompensas" element={<MundoAshaHome go={go} padrePlan={padrePlan} />} />
<Route path="/padre/incidencias" element={<PadreIncidencias go={go} />} />
<Route path="/mundo-asha" element={authRole === "PADRE" ? <MundoAshaHome go={go} padrePlan={padrePlan} /> : <MundoASHAPage go={go} />} />
<Route path="/mundo-asha/cuentos" element={<MundoAshaCuentos go={go} />} />
<Route path="/mundo-asha/canciones" element={<MundoAshaCanciones go={go} />} />
<Route path="/mundo-asha/trabalenguas" element={<MundoAshaTrabalenguas go={go} />} />
<Route path="/mundo-asha/adivinanzas" element={<MundoAshaAdivinanzas go={go} />} />
<Route path="/mundo-asha/juegos" element={<MundoAshaJuegos go={go} />} />
<Route path="/mundo-asha/laberinto" element={<MundoAshaLaberinto go={go} />} />
<Route path="/mundo-asha/isla" element={<MundoAshaIsla go={go} />} />
<Route path="/mundo-asha/academia" element={<MundoAshaAcademia go={go} />} />
<Route path="/mundo-asha/retos" element={<MundoAshaRetos go={go} />} />
<Route path="/mundo-asha/insignias" element={<MundoAshaInsignias go={go} />} />
<Route path="/mundo-asha/perfil" element={<MundoAshaPerfil go={go} />} />
<Route path="/terapeuta" element={<TerapeutaDashboardPage go={go} />} />
<Route path="/terapeuta/agenda" element={<TerapeutaAgenda go={go} requests={parentAppointments} onRequestUpdate={handleTerapeutaRequestUpdate} />} />
<Route path="/terapeuta/pacientes" element={<TerapeutaPacientes go={go} />} />
<Route path="/terapeuta/mensajes" element={<TerapeutaMensajes />} />
<Route path="/terapeuta/reportes" element={<TerapeutaReportes go={go} />} />
<Route path="/terapeuta/analiticas" element={<TerapeutaAnaliticas />} />
<Route path="/terapeuta/ingresos" element={<TerapeutaIngresos />} />
<Route path="/terapeuta/valoraciones" element={<TerapeutaValoraciones />} />
<Route path="/terapeuta/config" element={<TerapeutaConfig />} />
<Route path="/terapeuta/datos-actividad" element={<TerapeutaDatosActividad go={go} />} />
<Route path="/terapeuta/incidencias" element={<TerapeutaIncidencias go={go} />} />
<Route path="/pay" element={<AshaPayCheckout go={go} />} />
<Route path="/pay/history" element={<AshaPayHistory go={go} />} />
<Route path="/pay/wallet" element={<AshaPayWallet go={go} />} />
<Route path="/session" element={<AshaSessionHome go={go} />} />
<Route path="/session/prep" element={<AshaSessionPrep go={go} />} />
<Route path="/session/summary" element={<AshaSessionSummary go={go} />} />
<Route path="/session/rating" element={<AshaSessionSummary go={go} />} />
<Route path="/session/rewards" element={<AshaSessionSummary go={go} />} />
<Route path="/admin" element={<AdminDashboardPage go={go} />} />
<Route path="/admin/reportes" element={<AdminReportes />} />
<Route path="/admin/usuarios" element={<AdminUsuarios />} />
<Route path="/admin/pacientes" element={<AdminPacientes />} />
<Route path="/admin/citas" element={<AdminCitas />} />
<Route path="/admin/sesiones" element={<AdminSesiones />} />
<Route path="/admin/analiticas" element={<AdminAnaliticas />} />
<Route path="/admin/mensajes" element={<AdminMensajes />} />
<Route path="/admin/moderacion" element={<AdminModeracion />} />
<Route path="/admin/solicitudes" element={<AdminSolicitudes />} />
<Route path="/admin/core" element={<AshaCore />} />
<Route path="/admin/dashboard" element={<AdminDashboardPage go={go} />} />
<Route path="/admin/cuentas" element={<AdminCuentas go={go} />} />
<Route path="/admin/terapeutas" element={<AdminTerapeutas go={go} />} />
<Route path="/admin/operacion" element={<AdminOperacion go={go} />} />
<Route path="/admin/pagos" element={<AdminPagos />} />
<Route path="/admin/contenido" element={<AdminContenido />} />
<Route path="/admin/ml" element={<AdminML go={go} />} />
<Route path="/admin/auditoria" element={<AdminAuditoria />} />
<Route path="/admin/config" element={<AdminConfig />} />
<Route path="/padre/dashboard" element={<PadreHome go={go} padreUserName={padreUserName} padrePlan={padrePlan} extraNotifs={padreExtraNotifs} onNotifsRead={()=>setPadreExtraNotifs([])} />} />
<Route path="/padre/pacientes" element={<MiCaminoAsha go={go} padrePlan={padrePlan} />} />
<Route path="/padre/perfil" element={<PadreConfig onNameChange={setPadreUserName} padrePlan={padrePlan} go={go} />} />
<Route path="/padre/mi-camino" element={<MiCaminoAsha go={go} padrePlan={padrePlan} />} />
<Route path="*" element={<NotFoundPage />} />
</Route>
</Routes></PageBoundary></RouteAccess>;
}
