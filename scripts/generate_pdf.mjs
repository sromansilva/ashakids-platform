import { chromium } from '../frontend/node_modules/@playwright/test/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ASHAKids - Flujo Funcional de la Plataforma</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1f2937;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 20mm 22mm 16mm 22mm;
      position: relative;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      background: #ffffff;
    }

    /* Top colored bar on the very top of each page */
    .top-accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #6d28d9 0%, #8b5cf6 50%, #a78bfa 100%);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }

    .header-logo {
      font-size: 13px;
      font-weight: 800;
      color: #5b21b6;
      letter-spacing: -0.2px;
    }

    .header-doc {
      font-size: 9.5px;
      font-weight: 600;
      color: #6b7280;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    .section-badge {
      color: #7c3aed;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    h1.page-title {
      font-size: 24px;
      font-weight: 800;
      color: #111827;
      line-height: 1.2;
      margin-bottom: 8px;
      letter-spacing: -0.4px;
    }

    .lead-text {
      font-size: 12.5px;
      color: #4b5563;
      line-height: 1.45;
      margin-bottom: 14px;
    }

    .paragraph {
      font-size: 11px;
      color: #374151;
      line-height: 1.55;
      margin-bottom: 14px;
    }

    h2.subheading {
      font-size: 13px;
      font-weight: 700;
      color: #4c1d95;
      margin-top: 14px;
      margin-bottom: 8px;
    }

    /* Table & List styling */
    .role-grid {
      display: flex;
      flex-direction: column;
      gap: 9px;
      margin-bottom: 14px;
    }

    .role-item {
      display: grid;
      grid-template-columns: 145px 1fr;
      gap: 12px;
      font-size: 10.5px;
      line-height: 1.45;
    }

    .role-title {
      font-weight: 700;
      color: #5b21b6;
    }

    .role-desc {
      color: #374151;
    }

    .flow-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 14px;
    }

    .flow-table tr {
      border-bottom: 1px solid #f3f4f6;
    }

    .flow-table tr:last-child {
      border-bottom: none;
    }

    .flow-table td {
      padding: 6.5px 4px;
      font-size: 10.5px;
    }

    .flow-num {
      width: 22px;
      font-weight: 700;
      color: #7c3aed;
    }

    .flow-step {
      font-weight: 600;
      color: #1f2937;
    }

    .flow-actor {
      text-align: right;
      color: #6b7280;
      font-size: 10px;
    }

    /* Callout styling */
    .callout-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #7c3aed;
      border-radius: 6px;
      padding: 10px 13px;
      margin: 12px 0;
    }

    .callout-box.highlight {
      background: #faf5ff;
      border-color: #e9d5ff;
      border-left-color: #8b5cf6;
    }

    .callout-title {
      font-size: 11px;
      font-weight: 700;
      color: #5b21b6;
      margin-bottom: 4px;
    }

    .callout-content {
      font-size: 10px;
      color: #374151;
      line-height: 1.45;
    }

    /* Subsections */
    .num-section {
      margin-bottom: 13px;
    }

    .num-title {
      font-size: 12px;
      font-weight: 700;
      color: #4c1d95;
      margin-bottom: 5px;
    }

    .num-p {
      font-size: 10.5px;
      color: #374151;
      line-height: 1.5;
      margin-bottom: 6px;
    }

    .catalog-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px 0;
    }

    .catalog-table tr {
      border-bottom: 1px solid #f3f4f6;
    }

    .catalog-table td {
      padding: 5px 4px;
      font-size: 10px;
    }

    .catalog-area {
      width: 100px;
      font-weight: 700;
      color: #7c3aed;
    }

    .catalog-world {
      color: #1f2937;
      font-weight: 600;
    }

    .catalog-focus {
      color: #4b5563;
      font-size: 9.5px;
    }

    /* Tech badge grid */
    .tech-pill-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin: 10px 0;
    }

    .tech-card {
      background: #fdf4ff;
      border: 1px solid #f0abfc;
      border-radius: 6px;
      padding: 7px 10px;
    }

    .tech-card-title {
      font-size: 10px;
      font-weight: 700;
      color: #86198f;
      margin-bottom: 2px;
    }

    .tech-card-desc {
      font-size: 9px;
      color: #4a044e;
      line-height: 1.35;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #9ca3af;
    }

    .footer-meta {
      display: flex;
      gap: 16px;
    }
  </style>
</head>
<body>

  <!-- ==================== PÁGINA 1 ==================== -->
  <div class="page">
    <div class="top-accent-bar"></div>
    <div class="content">
      <header class="header">
        <span class="header-logo">ASHAKids</span>
        <span class="header-doc">Flujo Funcional de la Plataforma</span>
      </header>

      <div class="section-badge">01 / EL RECORRIDO</div>
      <h1 class="page-title">Una plataforma, un recorrido compartido</h1>
      <p class="lead-text">
        Del primer contacto con la familia al seguimiento de las habilidades de lenguaje y comunicación del niño, unificado en una arquitectura moderna 100% TypeScript.
      </p>

      <p class="paragraph">
        ASHAKids conecta al centro de atención, los terapeutas y las familias. Organiza las citas, los reportes clínicos de cada sesión, el plan de trabajo y la práctica interactiva en casa con inteligencia artificial Whisper. La atención profesional y las actividades lúdicas se complementan dentro de un mismo recorrido clínico y técnico.
      </p>

      <h2 class="subheading">Quién participa</h2>
      <div class="role-grid">
        <div class="role-item">
          <span class="role-title">Administrador / asesor</span>
          <span class="role-desc">Registra familias y terapeutas, orienta el acceso y supervisa cuentas, auditoría e incidencias del sistema. La decisión clínica corresponde al terapeuta.</span>
        </div>
        <div class="role-item">
          <span class="role-title">Padre, madre o tutor</span>
          <span class="role-desc">Administra a sus hijos, elige al especialista, reserva citas, consulta reportes en tiempo real y acompaña la práctica terapéutica en casa.</span>
        </div>
        <div class="role-item">
          <span class="role-title">Terapeuta</span>
          <span class="role-desc">Publica su disponibilidad semanal, atiende consultas, registra asistencia y reportes clínicos, y define o actualiza el plan de trabajo de cada paciente.</span>
        </div>
      </div>

      <h2 class="subheading">El flujo de principio a fin</h2>
      <table class="flow-table">
        <tbody>
          <tr>
            <td class="flow-num">1</td>
            <td class="flow-step">Contacto y registro de la familia</td>
            <td class="flow-actor">Administrador / asesor</td>
          </tr>
          <tr>
            <td class="flow-num">2</td>
            <td class="flow-step">Activación por correo y selección del niño</td>
            <td class="flow-actor">Tutor</td>
          </tr>
          <tr>
            <td class="flow-num">3</td>
            <td class="flow-step">Elección del terapeuta y reserva introductoria</td>
            <td class="flow-actor">Tutor</td>
          </tr>
          <tr>
            <td class="flow-num">4</td>
            <td class="flow-step">Atención clínica, reporte de sesión y plan de trabajo</td>
            <td class="flow-actor">Terapeuta</td>
          </tr>
          <tr>
            <td class="flow-num">5</td>
            <td class="flow-step">Consulta de reportes en línea y nuevas reservas</td>
            <td class="flow-actor">Tutor</td>
          </tr>
          <tr>
            <td class="flow-num">6</td>
            <td class="flow-step">Práctica interactiva en Mundo ASHA con evaluación de voz Whisper</td>
            <td class="flow-actor">Niño con acompañamiento</td>
          </tr>
          <tr>
            <td class="flow-num">7</td>
            <td class="flow-step">Seguimiento, analítica de progreso y ajuste del plan</td>
            <td class="flow-actor">Terapeuta y familia</td>
          </tr>
        </tbody>
      </table>

      <div class="callout-box highlight">
        <div class="callout-title">Principio rector del modelo clínico</div>
        <div class="callout-content">
          <strong>El niño es el paciente, no una cuenta independiente.</strong> Cada hijo conserva sus propias citas, introducción, plan de trabajo, reportes y resultados en Supabase. La atención de un hermano no habilita ni interfiere con la del otro.
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-meta">
        <span>Síntesis para el equipo | 25 de octubre de 2026</span>
        <span>Versión V132 (100% TypeScript)</span>
      </div>
      <div>1 / 4</div>
    </footer>
  </div>

  <!-- ==================== PÁGINA 2 ==================== -->
  <div class="page">
    <div class="top-accent-bar"></div>
    <div class="content">
      <header class="header">
        <span class="header-logo">ASHAKids</span>
        <span class="header-doc">Flujo Funcional de la Plataforma</span>
      </header>

      <div class="section-badge">02 / LA PRIMERA ATENCIÓN</div>
      <h1 class="page-title">Del registro a la primera atención</h1>
      <p class="lead-text">
        La familia inicia el recorrido; el terapeuta toma las decisiones sobre la atención.
      </p>

      <div class="num-section">
        <div class="num-title">1. Contacto, alta y acceso</div>
        <p class="num-p">
          La familia se comunica con el centro o acude al establecimiento. Un asesor con rol de administrador registra al tutor y a los hijos que estarán a su cargo. En el formulario web actual, el alta familiar incluye al menos un niño; después, el tutor puede añadir otros desde <em>Gestionar familia</em>. La edad se calcula automáticamente a partir de la fecha de nacimiento.
        </p>
        <p class="num-p">
          El administrador también gestiona las cuentas de los terapeutas. Cada titular recibe un código institucional único y credenciales seguras. Los prefijos identifican el rol: <strong>A</strong> para administrador (ej. <code>a00001</code>), <strong>P</strong> para padre o tutor (ej. <code>p00001</code>) y <strong>T</strong> para terapeuta (ej. <code>t00002</code>). Las contraseñas están protegidas con el algoritmo estándar de la industria <strong>Argon2id</strong> (hashes <code>$argon2id$v=19$m=65536,t=3,p=4...</code>) con soporte de sesiones persistidas en la tabla <code>sesiones_autenticacion</code> de Supabase. En entorno de pruebas y desarrollo, la contraseña predeterminada es <code>12345</code>.
        </p>
        <p class="num-p">
          Una vez activada la cuenta, el tutor inicia sesión y selecciona al niño en el Centro Familiar. Esa selección determina qué información clínica y educativa se despliega en pantalla.
        </p>
      </div>

      <div class="num-section">
        <div class="num-title">2. Disponibilidad y reserva introductoria</div>
        <p class="num-p">
          El terapeuta configura y publica sus turnos semanales en la tabla <code>turnos_semanales</code> (definidos por día y hora exacta). La familia elige un profesional activo y disponible, la modalidad (Virtual u Online / Presencial), la fecha y un turno habilitado. Puede escoger a cualquier terapeuta disponible del servicio de lenguaje; el autor de un plan no limita esa elección.
        </p>
        <p class="num-p">
          La primera consulta es <strong>introductoria y obligatoria</strong> por cada niño; se registra en base de datos como <code>tipo_cita = 'INTRODUCTORIA'</code> sin requerir tratamiento previo, dando cumplimiento a la regla de integridad <code>reservas_tipo_plan_ck</code> de PostgreSQL.
        </p>
        <p class="num-p">
          Antes de confirmar, la familia revisa el resumen. Al guardar, la cita queda confirmada de inmediato en la base de datos de Supabase, sin necesidad de aprobación manual posterior. El backend verifica la disponibilidad para evitar reservas duplicadas o solapadas.
        </p>
        <p class="num-p">
          La atención se organiza en turnos con inicio a la hora exacta. La duración de la sesión se calcula automáticamente (referencia de 40 a 45 minutos) y los horarios se presentan siempre en la zona horaria oficial (hora de Lima).
        </p>
      </div>

      <div class="num-section">
        <div class="num-title">3. Realización de la consulta</div>
        <p class="num-p">
          En modalidad presencial se muestra la dirección de la sede clínica (<em>Jr. Ricardo Treneman 252, Chorrillos 15064</em>). En modalidad virtual, la sesión se efectúa mediante Zoom o enlace seguro de teleterapia disponible en el detalle de la cita.
        </p>
        <p class="num-p">
          El terapeuta abre la cita, registra la sesión en <code>sesiones</code> e inicia la atención a la hora prevista. Al concluir, redacta sus observaciones clínicas en <code>reportes_sesion</code>, marca la asistencia y formaliza el cierre en ASHAKids.
        </p>
      </div>

      <div class="callout-box">
        <div class="callout-title">Reserva, sesión y Zoom tienen funciones diferentes</div>
        <div class="callout-content">
          La reserva en <code>reservas</code> separa el cupo horario; la sesión en <code>sesiones</code> y <code>reportes_sesion</code> registra el acto clínico profesional. Entrar o salir de Zoom no registra asistencia ni finaliza la sesión en la plataforma.
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-meta">
        <span>Síntesis para el equipo | 25 de octubre de 2026</span>
        <span>Módulo de Citas y Acceso</span>
      </div>
      <div>2 / 4</div>
    </footer>
  </div>

  <!-- ==================== PÁGINA 3 ==================== -->
  <div class="page">
    <div class="top-accent-bar"></div>
    <div class="content">
      <header class="header">
        <span class="header-logo">ASHAKids</span>
        <span class="header-doc">Flujo Funcional de la Plataforma</span>
      </header>

      <div class="section-badge">03 / CONTINUIDAD Y PRÁCTICA</div>
      <h1 class="page-title">Del plan de trabajo a la práctica en casa</h1>
      <p class="lead-text">
        La continuidad combina nuevas atenciones clínicas, información para la familia y práctica interactiva guiada por voz.
      </p>

      <div class="num-section">
        <div class="num-title">4. Reporte y plan definidos por el terapeuta</div>
        <p class="num-p">
          El reporte clínico reúne observaciones iniciales, objetivos trabajados, nivel de ayuda y próximos pasos. El terapeuta lo guarda en la base de datos de Supabase para que la familia pueda consultarlo de forma permanente y descargar el PDF oficial de la sesión.
        </p>
        <p class="num-p">
          Después de la sesión introductoria, el terapeuta publica un plan de tratamiento en <code>tratamientos</code> indicando el área diagnóstica, cantidad de sesiones recomendadas, mundos de práctica asignados y pautas familiares. Las sesiones recomendadas constituyen una guía profesional, no una cuota obligatoria ni un requisito de pago.
        </p>
      </div>

      <div class="callout-box">
        <div class="callout-title">Qué habilita la continuidad del tratamiento</div>
        <div class="callout-content">
          Para reservar sesiones de terapia regular posterior, el niño debe tener la sesión introductoria finalizada con asistencia registrada, un reporte clínico válido y un plan activo en <code>tratamientos</code>. Una reserva agendada o una sala de Zoom abierta por sí solas no completan este requisito.
        </div>
      </div>

      <div class="num-section">
        <div class="num-title">5. Seguimiento y siguientes sesiones</div>
        <p class="num-p">
          El tutor revisa el plan y los reportes del niño seleccionado desde el Centro Familiar. Luego puede agendar sesiones de terapia sucesivas con cualquier profesional disponible. Cada atención preserva su autoría e historial clínico. Al cambiar de terapeuta, el acceso al historial requiere autorización para resguardar la confidencialidad del menor.
        </p>
        <p class="num-p">
          El ciclo se consolida: reservar, asistir, registrar lo trabajado y seguir las recomendaciones. La familia puede calificar cada atención concluida mediante una escala de 1 a 5 estrellas y comentarios directos.
        </p>
      </div>

      <div class="num-section">
        <div class="num-title">6. Mundo ASHA: actividades interactivas con Whisper Voice AI</div>
        <p class="num-p">
          El niño accede desde la cuenta familiar a los mundos lúdicos asignados por el terapeuta en la tabla <code>mundos</code> de Supabase. El catálogo clínico incluye:
        </p>

        <table class="catalog-table">
          <tbody>
            <tr>
              <td class="catalog-area">Habla</td>
              <td class="catalog-world">Taller de los Sonidos</td>
              <td class="catalog-focus">Articulación de fonemas velares y discriminación auditiva</td>
            </tr>
            <tr>
              <td class="catalog-area">Lenguaje</td>
              <td class="catalog-world">La Isla de las Palabras</td>
              <td class="catalog-focus">Ampliación de vocabulario, semántica y categorización</td>
            </tr>
            <tr>
              <td class="catalog-area">Fluidez</td>
              <td class="catalog-world">Ritmo de las Palabras</td>
              <td class="catalog-focus">Control del tempo respiratorio, sílabas y ritmo vocal</td>
            </tr>
            <tr>
              <td class="catalog-area">Voz</td>
              <td class="catalog-world">El Estudio de la Voz</td>
              <td class="catalog-focus">Higiene vocal, entonación y modulación de intensidad</td>
            </tr>
            <tr>
              <td class="catalog-area">Orofacial</td>
              <td class="catalog-world">Laboratorio de los Gestos</td>
              <td class="catalog-focus">Praxias bucofonatorias y coordinación motriz articulatoria</td>
            </tr>
          </tbody>
        </table>

        <p class="num-p">
          <strong>Evaluación de pronunciación con Whisper AI:</strong> En esta versión se incorpora el servicio <code>WhisperService</code> en TypeScript, permitiendo transcribir el audio del niño y computar una métrica de precisión fonética adaptada al español mediante distancia de Levenshtein. Los resultados (estrellas, errores y tiempos) se persisten en <code>resultados_nivel</code> otorgando XP y medallas al completar desafíos.
        </p>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-meta">
        <span>Síntesis para el equipo | 25 de octubre de 2026</span>
        <span>Continuidad Terapéutica y Práctica</span>
      </div>
      <div>3 / 4</div>
    </footer>
  </div>

  <!-- ==================== PÁGINA 4 ==================== -->
  <div class="page">
    <div class="top-accent-bar"></div>
    <div class="content">
      <header class="header">
        <span class="header-logo">ASHAKids</span>
        <span class="header-doc">Flujo Funcional de la Plataforma</span>
      </header>

      <div class="section-badge">04 / GESTIÓN Y ARQUITECTURA TÉCNICA</div>
      <h1 class="page-title">Comunicación, gestión y alcance del sistema</h1>
      <p class="lead-text">
        Las funciones de apoyo permiten coordinar la atención y resolver incidencias garantizando la estabilidad operativa.
      </p>

      <div class="num-section">
        <div class="num-title">Lo que acompaña a los tres roles</div>
        <p class="num-p">
          <strong>Familia:</strong> Gestiona sus hijos y datos de cuenta, revisa agenda y reportes, y se comunica con terapeutas autorizados mediante mensajería con soporte de adjuntos multimedia (audio, imágenes y documentos).
        </p>
        <p class="num-p">
          <strong>Terapeuta:</strong> Dispone de panel especializado para preparar sesiones, acceder a expedientes asignados, redactar reportes, administrar turnos semanales y comunicarse con las familias.
        </p>
        <p class="num-p">
          <strong>Administrador / asesor:</strong> Gestiona cuentas, audita eventos del sistema en <code>auditoria_cambios</code> y resuelve incidencias operativas sin invadir el secreto profesional ni el historial de chats clínicos privados.
        </p>
      </div>

      <h2 class="subheading" style="margin-top: 10px;">Arquitectura Técnica Actualizada (100% TypeScript)</h2>
      <div class="tech-pill-grid">
        <div class="tech-card">
          <div class="tech-card-title">Backend Modular en TypeScript</div>
          <div class="tech-card-desc">Express 4 + Zod + Drizzle ORM + @node-rs/argon2 dividido limpiamente en capas (<code>dtos</code>, <code>routes</code>, <code>controllers</code>, <code>services</code>). Eliminación de dependencias de Python.</div>
        </div>
        <div class="tech-card">
          <div class="tech-card-title">Infraestructura Supabase PostgreSQL</div>
          <div class="tech-card-desc">Conexión directa vía pooler transaccional SSL (puerto 5432). Validación de credenciales contra datos reales y gestión de sesiones persistidas.</div>
        </div>
        <div class="tech-card">
          <div class="tech-card-title">Whisper Speech AI en TypeScript</div>
          <div class="tech-card-desc">Evaluación fonética automatizada en español integrada nativamente en Node/Express con normalización diacrítica y feedback de articulación.</div>
        </div>
        <div class="tech-card">
          <div class="tech-card-title">Launcher Local start.bat</div>
          <div class="tech-card-desc">Levantamiento coordinado en un clic: Backend (8000), Frontend Vite (5174) y apertura automática de navegador.</div>
        </div>
      </div>

      <div class="num-section" style="margin-top: 8px;">
        <div class="num-title">Qué ocurre si el recorrido se interrumpe</div>
        <p class="num-p">
          <strong>Sin correo de activación:</strong> solicitar nuevo enlace y verificar el servidor SMTP. <strong>Sin horarios disponibles:</strong> verificar publicación de turnos en el perfil del terapeuta. <strong>Inasistencia:</strong> no habilita la continuidad del plan; se requiere reagendar la sesión introductoria. <strong>Sin enlace de teleterapia:</strong> el terapeuta puede generar o ingresar el enlace manualmente antes de la hora acordada.
        </p>
      </div>

      <div class="num-section">
        <div class="num-title">Precisiones vigentes del alcance</div>
        <p class="num-p">
          La contratación y los pagos se gestionan institucionalmente; no se incluyen pasarelas de pago no autorizadas. Los reportes clínicos en PDF corresponden a cada sesión individual. Las actividades lúdicas con reconocimiento de voz Whisper operan como refuerzo educativo complementario a la terapia profesional.
        </p>
      </div>

      <div class="callout-box highlight" style="margin: 8px 0;">
        <div class="callout-title">Base de esta síntesis y verificación técnica</div>
        <div class="callout-content">
          Documento maestro actualizado al <strong>25 de octubre de 2026</strong>. Versión <strong>V132</strong>; rama oficial <code>feat/sroman</code> con Pull Request #115 hacia <code>dev</code>.<br>
          <strong>Batería de Pruebas:</strong> 433 pruebas Vitest pasadas, 25 pruebas de enrutamiento frontend pasadas, 12 pruebas de integración backend pasadas (100% éxito). 0 errores de compilación TypeScript en todo el proyecto.
        </div>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-meta">
        <span>Síntesis para el equipo | 25 de octubre de 2026</span>
        <span>Repositorio: github.com/sromansilva/ashakids-platform</span>
      </div>
      <div>4 / 4</div>
    </footer>
  </div>

</body>
</html>
`;

async function generate() {
  const outputDir = path.resolve('./output/pdf');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath1 = path.join(outputDir, 'Flujo_Funcional_ASHAKids_2026-10-25.pdf');
  const pdfPath2 = path.resolve('./Flujo_Funcional_ASHAKids_2026-10-25.pdf');

  console.log('Iniciando Chromium mediante Playwright...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  console.log('Generando PDF A4 de 4 páginas...');
  await page.pdf({
    path: pdfPath1,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    }
  });

  // Copiar también a la raíz para fácil acceso
  fs.copyFileSync(pdfPath1, pdfPath2);

  await browser.close();
  console.log('PDF generado exitosamente en:');
  console.log(' - ' + pdfPath1);
  console.log(' - ' + pdfPath2);
}

generate().catch(err => {
  console.error('Error al generar PDF:', err);
  process.exit(1);
});

