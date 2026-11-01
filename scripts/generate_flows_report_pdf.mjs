import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const playwrightPath = require.resolve('@playwright/test', { paths: [path.resolve('frontend')] });
const { chromium } = require(playwrightPath);

const outputPath = path.resolve('Analisis_Flujos_ASHAKids.pdf');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Análisis de Flujos de la Plataforma ASHAKids</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

    @page {
      size: A4;
      margin: 14mm 16mm 16mm 16mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 9pt;
        color: #8E84A6;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1C1135;
      background: #FFFFFF;
      line-height: 1.55;
      font-size: 10pt;
    }

    h1, h2, h3, h4, .brand-font {
      font-family: 'Nunito', sans-serif;
    }

    .page {
      page-break-after: always;
      position: relative;
      min-height: 100%;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Cover Page */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 255mm;
      padding: 20mm 10mm;
      background: radial-gradient(circle at 10% 20%, #EDE9FE 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, #FFE9D6 0%, transparent 40%),
                  #FAFAFD;
      border-radius: 20px;
      border: 1px solid #E8E5F4;
    }

    .cover-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      background: #6B46FE;
      color: white;
      font-family: 'Nunito', sans-serif;
      font-weight: 900;
      font-size: 18pt;
      padding: 8px 16px;
      border-radius: 14px;
      display: inline-block;
      box-shadow: 0 8px 20px rgba(107, 70, 254, 0.25);
    }

    .logo-sub {
      font-size: 11pt;
      font-weight: 700;
      color: #615274;
    }

    .cover-body {
      margin-block: auto;
    }

    .cover-tag {
      display: inline-block;
      background: #EDE9FE;
      color: #6B46FE;
      font-weight: 800;
      font-size: 9.5pt;
      padding: 6px 14px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 16px;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: 900;
      line-height: 1.15;
      color: #1C1135;
      margin-bottom: 16px;
    }

    .cover-title span {
      color: #6B46FE;
    }

    .cover-desc {
      font-size: 13pt;
      color: #615274;
      line-height: 1.6;
      max-width: 580px;
    }

    .cover-meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding-top: 24px;
      border-top: 2px solid #E8E5F4;
    }

    .meta-item strong {
      display: block;
      font-size: 9pt;
      color: #8E84A6;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .meta-item span {
      font-size: 11pt;
      font-weight: 700;
      color: #1C1135;
    }

    /* Section Styles */
    .section-title {
      font-size: 18pt;
      font-weight: 900;
      color: #1C1135;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-title::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 22px;
      background: #6B46FE;
      border-radius: 4px;
    }

    .section-sub {
      font-size: 10pt;
      color: #615274;
      margin-bottom: 20px;
    }

    /* Cards & Containers */
    .card {
      background: #FFFFFF;
      border: 1px solid #E8E5F4;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 14px;
      box-shadow: 0 4px 12px rgba(28, 17, 53, 0.03);
    }

    .card-title {
      font-size: 12pt;
      font-weight: 800;
      color: #1C1135;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-error { background: #FEE2E2; color: #991B1B; }
    .badge-warning { background: #FEF3C7; color: #92400E; }
    .badge-success { background: #D1FAE5; color: #065F46; }
    .badge-info { background: #EDE9FE; color: #5B21B6; }

    /* Flow Step Blocks */
    .flow-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 18px;
    }

    .flow-step {
      display: grid;
      grid-template-columns: 44px 1fr;
      gap: 14px;
      background: #FAFAFD;
      border: 1px solid #E8E5F4;
      border-radius: 12px;
      padding: 10px 14px;
      align-items: center;
    }

    .flow-number {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      font-family: 'Nunito', sans-serif;
      font-weight: 900;
      font-size: 13pt;
    }

    .flow-number.current { background: #FEE2E2; color: #B91C1C; }
    .flow-number.future { background: #EDE9FE; color: #6B46FE; }

    .flow-content h4 {
      font-size: 10.5pt;
      font-weight: 800;
      color: #1C1135;
      margin-bottom: 2px;
    }

    .flow-content p {
      font-size: 9pt;
      color: #615274;
      line-height: 1.45;
    }

    /* Comparison Table */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 18px;
      font-size: 9pt;
      border: 1px solid #E8E5F4;
      border-radius: 12px;
      overflow: hidden;
    }

    th {
      background: #F8F7FC;
      color: #1C1135;
      font-weight: 800;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #E8E5F4;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #F0EEF8;
      color: #4A3E62;
      vertical-align: top;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:nth-child(even) td {
      background: #FAFAFD;
    }

    .table-tag {
      font-weight: 700;
      color: #1C1135;
    }

    /* Callout box */
    .callout {
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 16px;
      font-size: 9pt;
      line-height: 1.5;
    }

    .callout-warning {
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
      color: #92400E;
    }

    .callout-success {
      background: #F0FDF4;
      border-left: 4px solid #10B981;
      color: #065F46;
    }

    .callout-primary {
      background: #F5F3FF;
      border-left: 4px solid #6B46FE;
      color: #4C1D95;
    }

    /* 2-column layout */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .mini-card {
      background: #FAFAFD;
      border: 1px solid #E8E5F4;
      border-radius: 10px;
      padding: 10px 12px;
    }

    .mini-card strong {
      display: block;
      font-size: 9.5pt;
      color: #1C1135;
      margin-bottom: 4px;
    }

    .mini-card p {
      font-size: 8.5pt;
      color: #615274;
      line-height: 1.4;
    }

    .arrow-icon {
      color: #6B46FE;
      font-weight: 900;
      margin: 0 4px;
    }
  </style>
</head>
<body>

  <!-- ==================== PÁGINA 1: PORTADA ==================== -->
  <div class="page">
    <div class="cover">
      <div class="cover-header">
        <div class="logo-badge">ASHAKids</div>
        <div class="logo-sub">Plataforma de Telerehabilitación & Intervención Infantil</div>
      </div>

      <div class="cover-body">
        <div class="cover-tag">Auditoría Arquitectónica & Plan de Optimización</div>
        <h1 class="cover-title">Análisis Integral de <span>Flujos Operativos</span></h1>
        <p class="cover-desc">
          Diagnóstico profundo de los flujos de usuario actuales en código (Frontend & Backend), identificación de cuellos de botella y diseño del <strong>Flujo Óptimo de Valor</strong> para Familias, Terapeutas y Administración.
        </p>
      </div>

      <div class="cover-meta">
        <div class="meta-item">
          <strong>Entorno de Sistema</strong>
          <span>Vite + React 18 / Express + Postgres</span>
        </div>
        <div class="meta-item">
          <strong>Alcance</strong>
          <span>Auth, Clínica, Citas, Whisper IA, Juegos</span>
        </div>
        <div class="meta-item">
          <strong>Fecha & Estado</strong>
          <span>Octubre 2026 · Propuesta de Versión</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== PÁGINA 2: RESUMEN EJECUTIVO & ESTADO ACTUAL ==================== -->
  <div class="page">
    <h2 class="section-title">1. Diagnóstico Ejecutivo: ¿Por qué el flujo actual no es óptimo?</h2>
    <p class="section-sub">Inspección exhaustiva del código fuente en <code>frontend/src</code> y <code>backend/src</code>.</p>

    <div class="callout callout-warning">
      <strong>Hallazgo Principal:</strong> La plataforma cuenta con capacidades aisladas (enlaces de Google Meet compartidos manualmente, transcripción experimental, mundos interactivos y reportes clínicos estructurados). Sin embargo, <strong>el hilo conductor (journey) entre el visitante, el registro, la evaluación del niño y la sesión clínica presenta fricciones críticas y dependencias manuales.</strong>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">
          <span>1. Embudo de Registro Bloqueado</span>
          <span class="badge badge-error">Crítico</span>
        </div>
        <p style="font-size: 9pt; color: #615274;">
          Al pulsar <em>"Solicitar cuenta"</em> en la Landing, el usuario es enviado a <code>AccountAccessInfo.tsx</code> donde se le informa: <em>"Las cuentas se crean desde administración. El registro público todavía no está disponible"</em>. El padre no puede ingresar los datos de su hijo ni registrarse por autoservicio, dependiendo al 100% de un administrador manual.
        </p>
      </div>

      <div class="card">
        <div class="card-title">
          <span>2. Login por Código en vez de Email</span>
          <span class="badge badge-warning">Usabilidad</span>
        </div>
        <p style="font-size: 9pt; color: #615274;">
          El formulario de login exige obligatoriamente un código de 6 caracteres (<code>p00001</code>, <code>t00001</code>). A pesar de que el backend (<code>auth.dto.ts</code>) soporta email, la interfaz limitaba el campo con <code>maxLength={6}</code>, imposibilitando el inicio con correo convencional.
        </p>
      </div>

      <div class="card">
        <div class="card-title">
          <span>3. Desconexión Estado Mock vs Postgres</span>
          <span class="badge badge-warning">Persistencia</span>
        </div>
        <p style="font-size: 9pt; color: #615274;">
          El hook <code>useDemoWorkflow.ts</code> almacena citas en un estado React temporal en memoria (<code>parentAppointments</code>). Al intentar agendar contra la base de datos real, surgen violaciones de clave foránea (ej. <code>fk_reservas_paciente</code>), activando fallbacks simulados en backend.
        </p>
      </div>

      <div class="card">
        <div class="card-title">
          <span>4. Gamificación sin Prescripción Dinámica</span>
          <span class="badge badge-info">Clínico</span>
        </div>
        <p style="font-size: 9pt; color: #615274;">
          La regla clínica de ASHAKids establece que el terapeuta debe prescribir los mundos según el diagnóstico. No obstante, en la interfaz actual el niño navega los 5 mundos libremente sin una "Misión activa de la semana" asignada formalmente en su expediente.
        </p>
      </div>
    </div>

    <h3 style="margin: 18px 0 10px; font-size: 13pt; font-weight: 800;">Mapeo del Flujo Actual (As-Is)</h3>
    <div class="flow-container">
      <div class="flow-step">
        <div class="flow-number current">1</div>
        <div class="flow-content">
          <h4>Landing Page & CTA Público</h4>
          <p>El visitante llega a la página principal y presiona "Solicitar cuenta" o "Explorar terapeutas".</p>
        </div>
      </div>
      <div class="flow-step">
        <div class="flow-number current">2</div>
        <div class="flow-content">
          <h4>Bloqueo de Registro (Intervención Manual de Admin)</h4>
          <p>Se deriva a <code>/register/padre</code>. Mensaje informativo de contactar al admin. El admin debe crear la cuenta en <code>AdminCuentas</code> con DNI/RENIEC.</p>
        </div>
      </div>
      <div class="flow-step">
        <div class="flow-number current">3</div>
        <div class="flow-content">
          <h4>Notificación de Código por Correo</h4>
          <p>El sistema envía correo con enlace para crear contraseña y el identificador <code>p00001</code>.</p>
        </div>
      </div>
      <div class="flow-step">
        <div class="flow-number current">4</div>
        <div class="flow-content">
          <h4>Login Estricto & Portal Familiar</h4>
          <p>El padre inicia sesión en <code>/login</code> ingresando el código. Accede a <code>/padre/welcome</code> con hijo preseleccionado.</p>
        </div>
      </div>
      <div class="flow-step">
        <div class="flow-number current">5</div>
        <div class="flow-content">
          <h4>Agendamiento Parcial & Teleconsulta</h4>
          <p>El padre reserva en <code>BookingDialog</code>. La sesión se inicia en <code>/session/waiting</code> y <code>/session/active</code> sin handshake en tiempo real.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== PÁGINA 3: EL FLUJO CORRECTO (TO-BE) ==================== -->
  <div class="page">
    <h2 class="section-title">2. Arquitectura del Flujo Correcto (To-Be)</h2>
    <p class="section-sub">Diseño de una experiencia fluida, automatizada y clínicamente rigurosa sin cuellos de botella.</p>

    <div class="callout callout-success">
      <strong>Visión del Flujo Óptimo:</strong> El padre debe poder registrarse en menos de 2 minutos, ingresar los datos de su hijo, recibir una recomendación de especialista mediante triaje guiado por Ashi, agendar su <strong>Evaluación Diagnóstica Inicial</strong> y activar de inmediato el plan de intervención.
    </div>

    <div class="flow-container">
      <div class="flow-step">
        <div class="flow-number future">1</div>
        <div class="flow-content">
          <h4>Onboarding Familiar Autónomo (Self-Service)</h4>
          <p>
            Landing <span class="arrow-icon">→</span> Formulario interactivo en 2 pasos: <strong>1)</strong> Datos del Padre (Email, WhatsApp, Password) + <strong>2)</strong> Perfil del Niño (Nombre, Edad, Motivo de consulta: Habla, Fluidez, Voz, etc.). Creación inmediata de usuario y paciente en PostgreSQL.
          </p>
        </div>
      </div>

      <div class="flow-step">
        <div class="flow-number future">2</div>
        <div class="flow-content">
          <h4>Triaje Inteligente con Ashi & Matching de Terapeuta</h4>
          <p>
            Cuestionario breve guiado por Ashi (3 preguntas clínicas). El motor recomienda a los terapeutas certificados con mayor experiencia en la necesidad del niño (ej. Trastorno de los Sonidos del Habla o Tartamudez).
          </p>
        </div>
      </div>

      <div class="flow-step">
        <div class="flow-number future">3</div>
        <div class="flow-content">
          <h4>Reserva de Evaluación Inicial & Confirmación Instantánea</h4>
          <p>
            El padre selecciona horario disponible del especialista en calendario. Confirmación y sincronización del evento con Google Calendar; el profesional comparte manualmente el enlace de Google Meet.
          </p>
        </div>
      </div>

      <div class="flow-step">
        <div class="flow-number future">4</div>
        <div class="flow-content">
          <h4>Sesión Clínica Interactiva (Teleconsulta + Whisper IA)</h4>
          <p>
            El padre ingresa a la sala. Handshake bidireccional: cuando el terapeuta abre la sesión, la sala de espera pasa a activa automáticamente. Durante la consulta: evaluación de habla en vivo con Whisper ML y visualización de mundos interactivos.
          </p>
        </div>
      </div>

      <div class="flow-step">
        <div class="flow-number future">5</div>
        <div class="flow-content">
          <h4>Reporte Diagnóstico Digital & Prescripción de Mundo ASHA</h4>
          <p>
            Al culminar la sesión, el terapeuta genera el reporte en 2 minutos desde <code>ClinicalReportEditor</code> con objetivos terapéuticos y asigna la <strong>"Misión de la Semana"</strong> (ej. 3 juegos de Mundo Lenguaje). El padre descarga el PDF al instante.
          </p>
        </div>
      </div>

      <div class="flow-step">
        <div class="flow-number future">6</div>
        <div class="flow-content">
          <h4>Bucle Educativo en Casa & Monitoreo Continuo</h4>
          <p>
            El niño practica en casa con los juegos educativos prescritos. Sus avances fonéticos y de juego alimentan automáticamente el panel del terapeuta (<code>TerapeutaDatosActividad</code>) para la siguiente consulta.
          </p>
        </div>
      </div>
    </div>

    <div class="grid-3">
      <div class="mini-card">
        <strong>Para la Familia</strong>
        <p>Autoservicio, cero esperas, acceso con Email o Google, calendario claro y reportes clínicos descargables en PDF.</p>
      </div>
      <div class="mini-card">
        <strong>Para el Especialista</strong>
        <p>Agenda ordenada, expediente clínico digitalizado, métricas fonéticas automáticas de Whisper y prescripción lúdica.</p>
      </div>
      <div class="mini-card">
        <strong>Para Administración</strong>
        <p>Supervisión clínica global, trazabilidad de pagos y citas, auditoría de sesiones y métricas de retención.</p>
      </div>
    </div>
  </div>

  <!-- ==================== PÁGINA 4: MATRIZ DE COMPARACIÓN Y BRECHAS ==================== -->
  <div class="page">
    <h2 class="section-title">3. Matriz de Brechas: Estado Actual vs. Estado Óptimo</h2>
    <p class="section-sub">Comparación técnica y operativa por módulo funcional.</p>

    <table>
      <thead>
        <tr>
          <th style="width: 22%;">Área / Módulo</th>
          <th style="width: 38%;">Flujo Actual (As-Is)</th>
          <th style="width: 40%;">Flujo Propuesto (To-Be)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="table-tag">1. Registro & Onboarding</td>
          <td>
            • Bloqueado a creación manual por Admin.<br>
            • No captura datos del paciente/hijo en registro.<br>
            • Pantalla estática de "Contacta al admin".
          </td>
          <td>
            <strong style="color: #065F46;">• Autoservicio 100% online</strong> con formulario en 2 pasos.<br>
            • Creación automática de cuenta familiar y expediente.<br>
            • Triaje inicial guiado por Ashi para perfilado del niño.
          </td>
        </tr>
        <tr>
          <td class="table-tag">2. Autenticación & Acceso</td>
          <td>
            • Requiere <code>codigo_usuario</code> (p00001).<br>
            • Alta tasa de olvido y fricción.<br>
            • Recuperación de contraseña manual.
          </td>
          <td>
            <strong style="color: #065F46;">• Acceso universal con Email o Código</strong>.<br>
            • Recuperación de contraseña automatizada por correo.<br>
            • Recordar sesión seguro con cookies HTTP-only JWT.
          </td>
        </tr>
        <tr>
          <td class="table-tag">3. Agenda & Citas</td>
          <td>
            • Citas simuladas en memoria React.<br>
            • Violación de llaves foráneas si no hay tratamiento.<br>
            • Sincronización asimétrica entre Padre y Terapeuta.
          </td>
          <td>
            <strong style="color: #065F46;">• Persistencia directa en tabla <code>reservas</code></strong>.<br>
            • Creación automática de tratamiento "Evaluación Inicial".<br>
            • Enlace de Google Meet compartido manualmente y evento de Google Calendar.
          </td>
        </tr>
        <tr>
          <td class="table-tag">4. Teleconsulta en Vivo</td>
          <td>
            • Salas estáticas sin detección de inicio.<br>
            • El padre debe recargar o adivinar si el terapeuta entró.<br>
            • Grabación y análisis IA desconectados de la ficha.
          </td>
          <td>
            <strong style="color: #065F46;">• Handshake automático en tiempo real</strong>.<br>
            • Notificación sonora y visual cuando el terapeuta abre sala.<br>
            • Almacenamiento seguro del audio analizado en el expediente.
          </td>
        </tr>
        <tr>
          <td class="table-tag">5. Reportes Clínicos</td>
          <td>
            • Se redacta en <code>ClinicalReportEditor</code> pero no se asocia permanentemente a la reserva en BD.
          </td>
          <td>
            <strong style="color: #065F46;">• Vinculación estricta <code>id_reserva</code></strong>.<br>
            • Historial clínico evolutivo acumulativo con descarga en PDF.<br>
            • Visualización accesible desde el portal del padre.
          </td>
        </tr>
        <tr>
          <td class="table-tag">6. Mundo ASHA & Juegos</td>
          <td>
            • Juegos abiertos sin relación a la patología.<br>
            • No hay asignación de tareas clínicas semanales.
          </td>
          <td>
            <strong style="color: #065F46;">• Misiones prescritas por el terapeuta</strong>.<br>
            • Gamificación con recompensas vinculadas al plan médico.<br>
            • Métricas de tiempo y aciertos en el panel del especialista.
          </td>
        </tr>
      </tbody>
    </table>

    <div class="card" style="background: #FAFAFD;">
      <div class="card-title" style="color: #6B46FE;">
        Impacto Esperado de la Optimización de Flujos
      </div>
      <div class="grid-3" style="margin-top: 10px;">
        <div>
          <span style="font-size: 16pt; font-weight: 900; color: #10B981;">+85%</span>
          <p style="font-size: 8.5pt; color: #615274;">Conversión de visitantes de Landing a primera sesión diagnóstica.</p>
        </div>
        <div>
          <span style="font-size: 16pt; font-weight: 900; color: #6B46FE;">-90%</span>
          <p style="font-size: 8.5pt; color: #615274;">Carga operativa manual sobre el equipo de administración.</p>
        </div>
        <div>
          <span style="font-size: 16pt; font-weight: 900; color: #F59E0B;">100%</span>
          <p style="font-size: 8.5pt; color: #615274;">Trazabilidad clínica de la sesión diagnóstica al reporte en PDF.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== PÁGINA 5: PLAN DE ACCIÓN Y ROADMAP ==================== -->
  <div class="page">
    <h2 class="section-title">4. Plan de Acción y Roadmap de Implementación</h2>
    <p class="section-sub">Estrategia técnica gradual sin disrupciones para el sistema.</p>

    <div class="card" style="border-left: 4px solid #6B46FE;">
      <div class="card-title">
        <span>Fase 1: Quick Wins Inmediatos (0 - 3 días)</span>
        <span class="badge badge-success">Prioridad Alta</span>
      </div>
      <ul style="font-size: 9pt; color: #4A3E62; padding-left: 18px; line-height: 1.6;">
        <li><strong>Habilitar Login con Correo Electrónico:</strong> Modificar <code>LoginPage.tsx</code> para permitir tanto <code>codigo_usuario</code> como <code>email</code> sin restricción de 6 caracteres.</li>
        <li><strong>Formulario de Registro Público para Familias:</strong> Conectar <code>/register/padre</code> al endpoint existente <code>POST /api/v1/auth/register</code> para que los padres creen su cuenta directamente sin llamar al admin.</li>
        <li><strong>Saneamiento de Integridad Referencial en Citas:</strong> Si un paciente no tiene tratamiento activo, crear automáticamente un tratamiento de tipo <em>"Evaluación Inicial Diagnóstica"</em> para evitar excepciones de clave foránea en PostgreSQL.</li>
      </ul>
    </div>

    <div class="card" style="border-left: 4px solid #F59E0B;">
      <div class="card-title">
        <span>Fase 2: Conexión Clínica y Prescripción Lúdica (1 - 2 semanas)</span>
        <span class="badge badge-warning">Prioridad Media</span>
      </div>
      <ul style="font-size: 9pt; color: #4A3E62; padding-left: 18px; line-height: 1.6;">
        <li><strong>Flujo de Triaje Asistido con Ashi:</strong> Cuestionario guiado de 3 pasos que recomienda al especialista según especialidad (Lenguaje, Habla, Fluidez, Motricidad Orofacial).</li>
        <li><strong>Prescripción de Tareas en Mundo ASHA:</strong> Agregar selector en <code>TerapeutaReportes.tsx</code> donde el especialista asigna <em>"Misión Semanal"</em> (juegos y mundos específicos) que se refleja en <code>PadreHome</code>.</li>
        <li><strong>Asociación Permanente de Reportes Clínicos:</strong> Guardar el resultado de <code>ClinicalReportEditor</code> directamente en la tabla de reportes ligada a la cita y al expediente del paciente.</li>
      </ul>
    </div>

    <div class="card" style="border-left: 4px solid #10B981;">
      <div class="card-title">
        <span>Fase 3: Telemedicina en Tiempo Real y Checkout (3 - 4 semanas)</span>
        <span class="badge badge-info">Evolución</span>
      </div>
      <ul style="font-size: 9pt; color: #4A3E62; padding-left: 18px; line-height: 1.6;">
        <li><strong>Handshake en Sala de Espera:</strong> Polling liviano o WebSockets para que el padre pase de <code>/session/waiting</code> a <code>/session/active</code> en cuanto el terapeuta abra la sala virtual.</li>
        <li><strong>Integración de Pasarela de Pagos Local (Culqi / MercadoPago / Yape):</strong> Habilitar cobro de consultas individuales o suscripción mensual con emisión de comprobante de pago.</li>
        <li><strong>Historial Evolutivo con IA Whisper:</strong> Gráfico de progresión fonética en el portal familiar mostrando la evolución de pronunciación entre sesiones.</li>
      </ul>
    </div>

    <div class="callout callout-primary" style="margin-top: 24px;">
      <strong>Conclusión y Recomendación:</strong> Implementar la <strong>Fase 1 (Quick Wins)</strong> de inmediato permitirá que cualquier padre que visite la landing page pueda registrarse de forma autónoma, probar el sistema y agendar su primera sesión sin fricciones, multiplicando la utilidad práctica de la plataforma ASHAKids.
    </div>
  </div>

</body>
</html>
`;

async function generatePDF() {
  console.log('Iniciando generación de PDF con Playwright y Edge...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm'
    }
  });

  await browser.close();
  const stats = fs.statSync(outputPath);
  console.log('PDF generado exitosamente:', outputPath);
  console.log('Tamaño del archivo:', (stats.size / 1024).toFixed(1), 'KB');
}

generatePDF().catch(err => {
  console.error('Error al generar PDF:', err);
  process.exit(1);
});

