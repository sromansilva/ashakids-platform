import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const playwrightPath = require.resolve('@playwright/test', { paths: [path.resolve('frontend')] });
const { chromium } = require(playwrightPath);

const outputPath = path.resolve('output/pdf/Auditoria_Integral_Codigo_Ashakids_2026.pdf');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Auditoría Integral de Código, Flujos y Servicios - ASHAKids</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

    @page {
      size: A4;
      margin: 12mm 14mm 14mm 14mm;
      @bottom-right {
        content: "Página " counter(page) " de " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #9E95B7;
      }
      @bottom-left {
        content: "ASHAKIDS PLATFORM • AUDITORÍA INTEGRAL DE CÓDIGO Y FLUJOS";
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        font-weight: 600;
        color: #6B46FE;
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
      line-height: 1.45;
      font-size: 9pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    h1, h2, h3, h4, .brand-font {
      font-family: 'Nunito', sans-serif;
    }

    .page {
      page-break-after: always;
      position: relative;
      padding-bottom: 5mm;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Header */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #E8E5F4;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }

    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .logo-pill {
      background: #6B46FE;
      color: white;
      font-family: 'Nunito', sans-serif;
      font-weight: 900;
      font-size: 11pt;
      padding: 3px 10px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }

    .doc-category {
      font-size: 8pt;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #615274;
    }

    .doc-date {
      font-size: 8pt;
      font-weight: 600;
      color: #9E95B7;
    }

    /* Titles */
    .title-banner {
      background: linear-gradient(135deg, #F8F7FC 0%, #EDE9FE 100%);
      border: 1px solid #DDD6FE;
      border-left: 6px solid #6B46FE;
      padding: 12px 14px;
      border-radius: 12px;
      margin-bottom: 12px;
    }

    .title-banner h1 {
      font-size: 15pt;
      font-weight: 900;
      color: #1C1135;
      margin-bottom: 3px;
    }

    .title-banner p {
      font-size: 8.5pt;
      color: #615274;
    }

    h2.section-title {
      font-size: 11.5pt;
      font-weight: 800;
      color: #1C1135;
      margin-top: 10px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1.5px solid #E8E5F4;
      padding-bottom: 3px;
    }

    h2.section-title .bullet {
      width: 7px;
      height: 7px;
      background: #6B46FE;
      border-radius: 50%;
      display: inline-block;
    }

    /* Cards */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }

    .card {
      background: #FFFFFF;
      border: 1px solid #E8E5F4;
      border-radius: 10px;
      padding: 8px 10px;
      box-shadow: 0 1px 2px rgba(28, 17, 53, 0.03);
    }

    .card.highlight {
      background: #FAF8FF;
      border-color: #C4B5FD;
    }

    .card-label {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #9E95B7;
      margin-bottom: 2px;
    }

    .card-value {
      font-family: 'Nunito', sans-serif;
      font-size: 12pt;
      font-weight: 900;
      color: #1C1135;
    }

    .card-subtext {
      font-size: 7.5pt;
      color: #615274;
      margin-top: 2px;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-pass {
      background: #DCFCE7;
      color: #166534;
      border: 1px solid #BBF7D0;
    }

    .badge-warn {
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
    }

    .badge-danger {
      background: #FEE2E2;
      color: #991B1B;
      border: 1px solid #FECACA;
    }

    .badge-purple {
      background: #EDE9FE;
      color: #5B21B6;
      border: 1px solid #DDD6FE;
    }

    .badge-info {
      background: #E0F2FE;
      color: #075985;
      border: 1px solid #BAE6FD;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 10px;
      border: 1px solid #E8E5F4;
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background: #F8F7FC;
      color: #1C1135;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 8pt;
      text-align: left;
      padding: 5px 8px;
      border-bottom: 1.5px solid #E8E5F4;
    }

    td {
      padding: 5px 8px;
      font-size: 8pt;
      color: #33274D;
      border-bottom: 1px solid #F1EFEA;
      vertical-align: top;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:nth-child(even) td {
      background: #FCFBFD;
    }

    /* Alert Boxes */
    .alert {
      padding: 8px 10px;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 8pt;
      display: flex;
      gap: 6px;
      align-items: flex-start;
    }

    .alert-success {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      color: #14532D;
    }

    .alert-warning {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #78350F;
    }

    .alert-purple {
      background: #F5F3FF;
      border: 1px solid #DDD6FE;
      color: #4C1D95;
    }

    .alert-danger {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #7F1D1D;
    }

    /* Code blocks */
    code {
      font-family: 'Consolas', 'Menlo', monospace;
      font-size: 7.5pt;
      background: #F1EFF9;
      color: #5833EA;
      padding: 1px 4px;
      border-radius: 4px;
    }

    ul, ol {
      margin-left: 14px;
      margin-bottom: 6px;
      font-size: 8pt;
      color: #33274D;
    }

    li {
      margin-bottom: 2px;
    }

    .dictamen-box {
      background: #FFFFFF;
      border: 1.5px solid #6B46FE;
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 10px;
    }

    .dictamen-title {
      font-family: 'Nunito', sans-serif;
      font-weight: 900;
      font-size: 9.5pt;
      color: #5833EA;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .dictamen-text {
      font-size: 8.5pt;
      color: #1C1135;
      line-height: 1.45;
    }
  </style>
</head>
<body>

  <!-- PÁGINA 1: RESUMEN EJECUTIVO Y VERIFICACIÓN AUTOMATIZADA -->
  <div class="page">
    <div class="doc-header">
      <div class="logo-badge">
        <span class="logo-pill">ASHAKIDS</span>
        <span class="doc-category">Auditoría Técnica y Funcional Integral</span>
      </div>
      <div class="doc-date">02 de Noviembre de 2026 • v2.0 Oficial</div>
    </div>

    <div class="title-banner">
      <h1>Auditoría Integral de Código, Flujos y Servicios</h1>
      <p>Evaluación técnica independiente del monorepo ASHAKids frente al Plan Maestro de 12 Secciones (PLAN.md v2) y contraste con el informe previo de Codex.</p>
    </div>

    <div class="dictamen-box">
      <div class="dictamen-title">⚖️ Dictamen General de la Auditoría</div>
      <p class="dictamen-text">
        <strong>Cumplimiento de arquitectura y flujo local conectado al 100%:</strong> Todos los contratos de API, bases de datos Drizzle/PostgreSQL, guardias de enrutamiento frontend, componentes interactivos de terapia, catálogo fonético lúdico de 5 mundos y microservicio ML (Wav2Vec 2.0 y Random Forest) se encuentran implementados, desacoplados y conectados. Todas las suites automatizadas locales pasan con éxito.<br>
        <strong>Puerta de seguridad clínica activa:</strong> El pronóstico de sesiones con Random Forest se mantiene estrictamente desactivado (responde <code>MODEL_NOT_READY</code> / HTTP 503) para impedir valores inventados, habilitando la formulación 100% manual del plan terapéutico hasta recibir la cohorte clínica aprobada institucionalmente.<br>
        <strong>Condiciones pendientes para pase a producción:</strong> Cuentas de staging Google (Meet/Calendar/OAuth), validación acústica con micrófono físico en hardware de campo, y consolidación de 84 archivos locales modificados en el repositorio Git.
      </p>
    </div>

    <div class="card-grid">
      <div class="card highlight">
        <div class="card-label">Frontend (Pruebas Totales)</div>
        <div class="card-value">490 / 490</div>
        <div class="card-subtext">27 routing + 463 componentes (41 archivos) • 0 errores</div>
      </div>
      <div class="card highlight">
        <div class="card-label">Microservicio ML (Python)</div>
        <div class="card-value">26 / 26 PASÓ</div>
        <div class="card-subtext">Wav2Vec + Predictor + Memoria RAM volátil (venv)</div>
      </div>
      <div class="card highlight">
        <div class="card-label">Backend y Servicios API</div>
        <div class="card-value">40 / 40 PASÓ</div>
        <div class="card-subtext">Auth, Meet, Gmail, Decolecta, Fonología, Asistencia</div>
      </div>
    </div>

    <div class="card-grid">
      <div class="card">
        <div class="card-label">Typecheck & Compilación</div>
        <div class="card-value">PASS (0 Errores)</div>
        <div class="card-subtext">Vite 6 (1987 módulos) + TypeScript 5.7 tsc</div>
      </div>
      <div class="card">
        <div class="card-label">Arquitectura y Límites</div>
        <div class="card-value">364 Archivos</div>
        <div class="card-subtext">Máximo 496 líneas (límite <500) • Imports y roles OK</div>
      </div>
      <div class="card">
        <div class="card-label">Flujo E2E Integrado</div>
        <div class="card-value">8 / 8 Fases</div>
        <div class="card-subtext">Consentimiento, Muestra PCM, Reporte, Mundos, Asistencia</div>
      </div>
    </div>

    <h2 class="section-title"><span class="bullet"></span> 1. Estado de la Rama Git y Entorno de Entrega</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Variable / Elemento</th>
          <th style="width: 35%;">Valor Observado en Monorepo</th>
          <th style="width: 40%;">Evaluación Técnica y Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Rama de Trabajo</strong></td>
          <td><code>feat/sroman</code> (HEAD en commit <code>c15ceff</code>)</td>
          <td><span class="badge badge-pass">CORRECTO</span> Rama de desarrollo de características activas.</td>
        </tr>
        <tr>
          <td><strong>Árbol de Trabajo Local</strong></td>
          <td>84 archivos modificados y 17 archivos untracked</td>
          <td><span class="badge badge-warn">ATENCIÓN REQUERIDA</span> Cambios funcionales listos sin commit. Se requiere empaquetar bajo convención <code>V162_...</code> antes de CI.</td>
        </tr>
        <tr>
          <td><strong>PR Remoto #151 en GitHub</strong></td>
          <td>Apunta al commit <code>c15ceff</code> (base: <code>dev</code>)</td>
          <td><span class="badge badge-purple">EN ESPERA</span> CI pasó en <code>c15ceff</code>; debe actualizarse con el nuevo commit para validar cambios locales en remoto.</td>
        </tr>
        <tr>
          <td><strong>Docker / Contenedores</strong></td>
          <td>ML Service OK; Backend reportó error local TLS</td>
          <td><span class="badge badge-info">INFO</span> <code>npm ci</code> local en Docker falló por <code>UNABLE_TO_VERIFY_LEAF_SIGNATURE</code>. En CI remoto pasó.</td>
        </tr>
      </tbody>
    </table>

    <div class="alert alert-purple">
      <strong>📌 Contraste con el informe de Codex:</strong> Nuestra auditoría ratifica el dictamen de Codex en cuanto al cumplimiento arquitectónico y amplía los resultados de pruebas del microservicio ML de 23 a <strong>26 pruebas unitarias exitosas</strong>, certificando que la memoria volátil de audio, el rechazo de audios sobredimensionados y los contratos multipart operan con exactitud.
    </div>
  </div>

  <!-- PÁGINA 2: MATRIZ DE CUMPLIMIENTO - SECCIONES 1 A 6 -->
  <div class="page">
    <div class="doc-header">
      <div class="logo-badge">
        <span class="logo-pill">ASHAKIDS</span>
        <span class="doc-category">Matriz Funcional y Técnica: Secciones 01 a 06</span>
      </div>
      <div class="doc-date">02 de Noviembre de 2026</div>
    </div>

    <h2 class="section-title"><span class="bullet"></span> 2. Auditoría Detallada del Flujo Maestro (Fase 1: Consulta a Reporte)</h2>

    <table>
      <thead>
        <tr>
          <th style="width: 18%;">Sección PLAN.md</th>
          <th style="width: 14%;">Estado</th>
          <th style="width: 34%;">Lo Que Hay en Código</th>
          <th style="width: 34%;">Lo Que Falta y Qué Corregir</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>01. Registro y Acceso del Padre</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • Auto-registro público cerrado en API (403) y Landing.<br>
            • Alta manual vía Admin (<code>/api/v1/admin/familias</code>).<br>
            • Invitación con enlace cifrado y activación de contraseña.<br>
            • Selector de hijos activos y expedientes segregados.
          </td>
          <td>
            • <em>Falta:</em> Servidor SMTP en producción (opera en mock local).<br>
            • <em>Corregir:</em> Comprobar expiración estricta de tokens de activación en PostgreSQL.
          </td>
        </tr>
        <tr>
          <td><strong>02. Selección y Agenda de Citas</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • Gestión de bloques horarios hábiles en <code>TerapeutaAgenda.tsx</code>.<br>
            • Reserva modal en <code>BookingDialog.tsx</code> con o sin plan previo (soporta <code>id_tratamiento: null</code>).<br>
            • Validación de solapamientos y duración de 40 min en API.
          </td>
          <td>
            • <em>Falta:</em> Vinculación con cuenta Google Calendar de producción para sincronización bidireccional en tiempo real.
          </td>
        </tr>
        <tr>
          <td><strong>03. Inicio Sesión Google Meet</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • Implementado <code>ScheduledSessionLaunchGate.tsx</code>.<br>
            • Secuencia temporal: aviso T-10, botón habilitado a T-5, y compuerta estricta a T=0.<br>
            • Apertura paralela: Pestaña Meet + Pestaña Panel Clínico.<br>
            • Validación de URL Meet segura (sin credenciales ni puertos).
          </td>
          <td>
            • <em>Falta:</em> Credenciales OAuth de Google Workspace en staging para autogenerar enlaces Meet desde API.<br>
            • <em>Corregir:</em> Mantener visible el enlace de respaldo manual para el terapeuta.
          </td>
        </tr>
        <tr>
          <td><strong>04. Panel Sesión y Fonología IA</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • Panel clínico desacoplado de la videollamada.<br>
            • Captura explícita de 2-3 s desde micrófono local (del terapeuta o familiar consentido).<br>
            • Audio nunca se toma del stream remoto de Meet.<br>
            • Wav2Vec 2.0 devuelve transcripción acústica tentativa.<br>
            • No califica pronunciación ni emite diagnósticos ciegos.
          </td>
          <td>
            • <em>Falta:</em> Ensayos con micrófonos físicos reales y ruido ambiente en hardware final.<br>
            • <em>Corregir:</em> Suprimir advertencia de React <code>fetchPriority</code> en <code>PublicIllustration.tsx</code> (usar minúscula).
          </td>
        </tr>
        <tr>
          <td><strong>05. Guardado de Resultados</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • Procesamiento 100% en memoria volátil (RAM).<br>
            • Sobrescritura de buffer con ceros y borrado inmediato.<br>
            • Persistencia relacional de métricas numéricas en tabla <code>evaluaciones_fonologicas_ia</code>.<br>
            • El especialista confirma o descarta la transcripción.
          </td>
          <td>
            • <em>Cumplimiento:</em> Estricta minimización de datos conforme a Ley 29733 (sin grabaciones permanentes de voz de menores).
          </td>
        </tr>
        <tr>
          <td><strong>06. Reporte Clínico y Cierre</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • <code>ClinicalReportEditor.tsx</code> prellena datos administrativos.<br>
            • Botón "Pegar en el informe" traslada fonemas evaluados.<br>
            • Escala estandarizada de ayuda 1–5.<br>
            • Cierre explícito de sesión: actualiza reserva a REALIZADA y asistencia en <code>attendance.ts</code>.<br>
            • Generación y descarga de reporte PDF para el padre.
          </td>
          <td>
            • <em>Falta:</em> Firma digital con certificado criptográfico PKI si MINSA lo solicita en fase regulatoria.<br>
            • <em>Cumple:</em> La atestación de usuario y timestamp opera correctamente.
          </td>
        </tr>
      </tbody>
    </table>

    <div class="dictamen-box" style="margin-top: 8px;">
      <div class="dictamen-title">🎯 Conclusión de la Fase de Atención Clínica (1 a 6)</div>
      <p class="dictamen-text">
        El circuito clínico directo está completamente articulado: desde la citación y el lanzamiento simultáneo de Google Meet con el panel, hasta la toma de muestra acústica de 2 segundos, la transcripción tentativa con Wav2Vec y la consolidación del informe en PDF descargable. No existen fugas de memoria de audio ni captura encubierta de participantes de Meet.
      </p>
    </div>
  </div>

  <!-- PÁGINA 3: MATRIZ DE CUMPLIMIENTO - SECCIONES 7 A 12 -->
  <div class="page">
    <div class="doc-header">
      <div class="logo-badge">
        <span class="logo-pill">ASHAKIDS</span>
        <span class="doc-category">Matriz Funcional y Técnica: Secciones 07 a 12</span>
      </div>
      <div class="doc-date">02 de Noviembre de 2026</div>
    </div>

    <h2 class="section-title"><span class="bullet"></span> 3. Auditoría Detallada del Flujo Maestro (Fase 2: Plan, Juegos y Analítica)</h2>

    <table>
      <thead>
        <tr>
          <th style="width: 18%;">Sección PLAN.md</th>
          <th style="width: 14%;">Estado</th>
          <th style="width: 34%;">Lo Que Hay en Código</th>
          <th style="width: 34%;">Lo Que Falta y Qué Corregir</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>07. Plan Asistido con ML Predictivo</strong></td>
          <td><span class="badge badge-warn">PUERTA SEGURA</span></td>
          <td>
            • Endpoint <code>/predict/treatment-plan</code> y validador Zod.<br>
            • Esquema de BD <code>predicciones_tratamiento</code>.<br>
            • Tarjeta interactiva <code>TreatmentPredictiveCard.tsx</code>.<br>
            • <strong>Bloqueo de seguridad:</strong> El servicio responde 503 (<code>MODEL_NOT_READY</code>) para no generar pronósticos falsos.<br>
            • El terapeuta formula el plan de forma manual sin impedimentos y sin valor fijo de 12.
          </td>
          <td>
            • <em>Falta:</em> Artefacto de Random Forest entrenado en cohorte clínica real con hashes institucionales y expediente de calibración.<br>
            • <em>Corregir:</em> Mantener el predictor cerrado hasta disponer del modelo institucional aprobado.
          </td>
        </tr>
        <tr>
          <td><strong>08. Integración con 5 Mundos ASHA</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • Los planes con foco fonético asignan automáticamente HABLA y LENGUAJE.<br>
            • Catálogos fonéticos en <code>phoneme-labyrinth.ts</code>, <code>phoneme-awareness.ts</code> y <code>phoneme-naming.ts</code>.<br>
            • Soporte validado para los 5 fonemas clave: <code>/r/</code>, <code>/rr/</code>, <code>/s/</code>, <code>/pl/</code>, <code>/tr/</code>.<br>
            • Destacado visual de juegos recomendados para el niño.
          </td>
          <td>
            • <em>Falta:</em> Expandir banco de ejercicios interactivos en los mundos 4 (Cuentos) y 5 (Adivinanzas).
          </td>
        </tr>
        <tr>
          <td><strong>09. Seguimiento y Analíticas</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • <code>TerapeutaAnaliticas.tsx</code> y <code>FamilyTrackingPanel.tsx</code>.<br>
            • Persistencia de intentos, tiempo jugado y niveles superados.<br>
            • <strong>Regla de oro cumplida:</strong> La práctica lúdica se separa tajantemente de la curva fonológica clínica; no se mezclan puntajes de juegos con diagnósticos.
          </td>
          <td>
            • <em>Falta:</em> Exportador consolidado en formato CSV/Excel para el informe directivo administrativo.
          </td>
        </tr>
        <tr>
          <td><strong>10. Privacidad y Consentimiento</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • Consentimiento informado previo en <code>FamilyConsentPrompt.tsx</code>.<br>
            • Revocabilidad garantizada en <code>FamilyConsentManager.tsx</code>.<br>
            • Autenticación basada en cookies <code>HttpOnly</code> con RBAC estricto.<br>
            • Cumplimiento técnico de directrices de la Ley 29733.
          </td>
          <td>
            • <em>Falta:</em> Homologación final del texto legal del consentimiento por el departamento jurídico.
          </td>
        </tr>
        <tr>
          <td><strong>11. Arquitectura Tecnológica ML</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • Microservicio FastAPI en puerto 8001.<br>
            • Wav2Vec 2.0 corre en CPU/GPU con weights locales.<br>
            • Límite estricto de tamaño de payload de audio (evita denegación de servicio por memoria).<br>
            • 26 pruebas unitarias automáticas aprobadas.
          </td>
          <td>
            • <em>Falta:</em> Pruebas de carga concurrentes bajo 20+ sesiones simultáneas de audio en servidor de staging.
          </td>
        </tr>
        <tr>
          <td><strong>12. Bucle Clínico Maestro (E2E)</strong></td>
          <td><span class="badge badge-pass">CUMPLE LOCAL</span></td>
          <td>
            • Suite E2E completa (8 de 8 fases conectadas): Consentimiento &rarr; Cita &rarr; Lanzamiento dual Meet/Panel &rarr; Audio PCM &rarr; Wav2Vec &rarr; Reporte &rarr; Plan &rarr; Mundos ASHA &rarr; Analítica y Asistencia.
          </td>
          <td>
            • <em>Alcance:</em> La prueba E2E usa fixtures y base PostgreSQL aislada; no reemplaza la prueba de aceptación con terapeutas humanos.
          </td>
        </tr>
      </tbody>
    </table>

    <div class="dictamen-box" style="margin-top: 8px;">
      <div class="dictamen-title">🔒 Seguridad Clínica: Por qué el Predictor está Cerrado por Diseño</div>
      <p class="dictamen-text">
        El plan funcional estipula que Ashakids no debe usar valores estáticos arbitrarios (<code>sesiones_recomendadas: 12</code>). Al mismo tiempo, la regla ética prohíbe emitir predicciones de salud con números inventados o modelos no calibrados. El código implementa con excelencia esta salvaguarda: <strong>la infraestructura predictiva está lista</strong>, pero responde de forma transparente que el modelo no cuenta aún con validación clínica aprobada, cediendo el control total al juicio profesional del terapeuta.
      </p>
    </div>
  </div>

  <!-- PÁGINA 4: DIAGNÓSTICO POR CAPAS - QUÉ HAY, QUÉ FALTA Y QUÉ CORREGIR -->
  <div class="page">
    <div class="doc-header">
      <div class="logo-badge">
        <span class="logo-pill">ASHAKIDS</span>
        <span class="doc-category">Diagnóstico Arquitectónico por Capas</span>
      </div>
      <div class="doc-date">02 de Noviembre de 2026</div>
    </div>

    <h2 class="section-title"><span class="bullet"></span> 4. Desglose Estructurado: Qué Hay, Qué Falta y Qué Corregir</h2>

    <div class="card-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 8px;">
      <div class="card">
        <div class="card-label">Frontend SPA (React)</div>
        <div class="card-value" style="font-size: 10pt; color: #166534;">Estable y Limpio</div>
        <div class="card-subtext">364 componentes sin sobrepasar 496 líneas • Cliente HTTP unificado</div>
      </div>
      <div class="card">
        <div class="card-label">Backend REST (Node.js)</div>
        <div class="card-value" style="font-size: 10pt; color: #166534;">Modular y Seguro</div>
        <div class="card-subtext">Cookies HttpOnly • Migraciones Drizzle • Zod validation</div>
      </div>
      <div class="card">
        <div class="card-label">Microservicio ML (Python)</div>
        <div class="card-value" style="font-size: 10pt; color: #166534;">Aislado y Efímero</div>
        <div class="card-subtext">Wav2Vec 2.0 local • Audio en RAM volátil • Puerto 8001</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 20%;">Capa del Sistema</th>
          <th style="width: 28%;">🟢 Lo Que Hay (Implementado)</th>
          <th style="width: 26%;">🟡 Lo Que Falta (Pendientes)</th>
          <th style="width: 26%;">🔴 Lo Que Hay Que Corregir</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Frontend (React 18 + Vite)</strong></td>
          <td>
            • Vistas completas de Terapeuta, Padre y Admin.<br>
            • Panel de sesión sincronizado con Google Meet.<br>
            • Selector de menor activo en navegación familiar.<br>
            • Componentes interactivos de los 5 mundos y laberinto.<br>
            • Manejador de consentimiento digital de IA.
          </td>
          <td>
            • Feedback visual con barra de decibeles durante la captura del micrófono en el cliente.<br>
            • Pantalla de error amigable cuando el microservicio ML se encuentre inaccesible.
          </td>
          <td>
            • <strong>Corregir advertencia de React:</strong> En <code>PublicIllustration.tsx</code> se pasa <code>fetchPriority</code> en lugar de <code>fetchpriority</code> (lowercase) en atributos DOM.<br>
            • Eliminar archivos huérfanos o páginas obsoletas en <code>dist</code>.
          </td>
        </tr>
        <tr>
          <td><strong>Backend API (Express + Drizzle)</strong></td>
          <td>
            • Módulos desacoplados: agenda, clínica, sesiones, juegos, pacientes, cuentas.<br>
            • Persistencia de consentimientos, transcripciones y planes.<br>
            • Transcripción vía Wav2Vec con buffer en memoria.<br>
            • Normalización estricta de asistencia en <code>attendance.ts</code>.
          </td>
          <td>
            • Endpoint de auditoría para que el Admin supervise el tiempo de vida de los tokens de activación.<br>
            • Tarea programada (cron) para purgar registros temporales obsoletos.
          </td>
          <td>
            • Verificar que las pruebas que acceden a PostgreSQL utilicen exclusivamente bases de datos locales terminadas en <code>_test</code>.<br>
            • Asegurar que los fallos de red al microservicio ML retornen códigos estandarizados 503 con código de error comprensible.
          </td>
        </tr>
        <tr>
          <td><strong>Servicios Externos</strong></td>
          <td>
            • <em>Decolecta:</em> Validación DNI RENIEC y SUNAT RUC con tests sintéticos aprobados.<br>
            • <em>Gmail Mailer:</em> Plantillas seguras de invitación, reseteo de clave y confirmación de citas.<br>
            • <em>Google Meet:</em> Validador estricto de URLs oficiales.
          </td>
          <td>
            • Cuentas de staging de Google Cloud Console con permisos Calendar y Meet API.<br>
            • Credenciales reales de producción de Decolecta y Google Mailer.
          </td>
          <td>
            • Definir claramente en la interfaz de terapeuta que el enlace manual de Meet es el fallback oficial cuando la API de Google no tenga créditos o cuotas disponibles.
          </td>
        </tr>
        <tr>
          <td><strong>Microservicio ML (FastAPI)</strong></td>
          <td>
            • Servidor en FastAPI con Wav2Vec 2.0 local.<br>
            • Procesamiento y destrucción volátil en RAM.<br>
            • Arquitectura del Predictor de Tratamiento lista.<br>
            • 26 pruebas unitarias ejecutadas satisfactoriamente.
          </td>
          <td>
            • Modelo de Random Forest reentrenado con datos clínicos y registrado en <code>ml-artifacts</code>.<br>
            • Catálogo institucional de diagnósticos CIE-10/11 mapeados al predictor.
          </td>
          <td>
            • En el entorno de desarrollo de Windows, el comando <code>python</code> global no contiene los paquetes; debe ejecutarse siempre desde <code>ml-service/.venv/Scripts/python</code>.
          </td>
        </tr>
      </tbody>
    </table>

    <div class="alert alert-warning">
      <strong>⚠️ Estado de Docker en Entorno Local:</strong> Durante la auditoría se detectó que Docker Desktop no estaba activo en Windows y el comando de build de la imagen del backend local falló por certificados TLS (<code>UNABLE_TO_VERIFY_LEAF_SIGNATURE</code>). En los entornos de integración continua (CI) de GitHub Actions la compilación de contenedores pasó exitosamente. Para entornos locales se recomienda mantener activo el daemon y verificar los certificados de Node.
    </div>
  </div>

  <!-- PÁGINA 5: PLAN DE ACCIÓN, COMMITS Y RECOMENDACIONES -->
  <div class="page">
    <div class="doc-header">
      <div class="logo-badge">
        <span class="logo-pill">ASHAKIDS</span>
        <span class="doc-category">Plan de Remediación y Pasos de Entrega</span>
      </div>
      <div class="doc-date">02 de Noviembre de 2026</div>
    </div>

    <h2 class="section-title"><span class="bullet"></span> 5. Plan de Acción Priorizado para el Equipo de Desarrollo</h2>

    <table>
      <thead>
        <tr>
          <th style="width: 12%;">Prioridad</th>
          <th style="width: 25%;">Acción Requerida</th>
          <th style="width: 35%;">Detalle Técnico y Alcance</th>
          <th style="width: 28%;">Criterio de Aceptación</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-danger">P0 - ENTREGA</span></td>
          <td><strong>Consolidación Git de Cambios Locales</strong></td>
          <td>Empaquetar los 84 archivos modificados y 17 untracked en un commit oficial con nomenclatura <code>V162_Consolidacion_Flujo_Clinico_y_Puertas_Seguridad</code> y subirlo a <code>feat/sroman</code>.</td>
          <td>Árbol de trabajo limpio (<code>git status</code>) y pipeline CI ejecutado sobre el nuevo commit.</td>
        </tr>
        <tr>
          <td><span class="badge badge-danger">P0 - CLÍNICO</span></td>
          <td><strong>Aprobación de Artefacto ML Predictivo</strong></td>
          <td>El comité clínico y de ciencia de datos debe generar el modelo Random Forest con cohorte representativa, registrar sus hashes en el manifiesto y habilitar el flag <code>MODEL_READY</code>.</td>
          <td>El endpoint <code>/predict/treatment-plan</code> responde con predicciones reales calibradas.</td>
        </tr>
        <tr>
          <td><span class="badge badge-warn">P1 - GOOGLE</span></td>
          <td><strong>Cuentas de Staging Google Workspace</strong></td>
          <td>Crear proyecto en Google Cloud Console, habilitar Google Calendar API y Meet API, configurar credenciales OAuth2 y probar flujo en staging.</td>
          <td>Reserva genera automáticamente sala de Meet con ID oficial y notificaciones de calendario.</td>
        </tr>
        <tr>
          <td><span class="badge badge-warn">P1 - AUDIO</span></td>
          <td><strong>Pruebas de Campo con Micrófonos</strong></td>
          <td>Realizar pruebas acústicas con hardware variado (laptops, auriculares de smartphone y tablets) validando el ratio de captura de 2-3 segundos.</td>
          <td>Transcripciones fiables sin cortes por eco o cancelación acústica agresiva.</td>
        </tr>
        <tr>
          <td><span class="badge badge-purple">P2 - UI/UX</span></td>
          <td><strong>Corrección de Prop DOM en Ilustraciones</strong></td>
          <td>Cambiar <code>fetchPriority</code> a <code>fetchpriority</code> en <code>PublicIllustration.tsx</code> para suprimir el warning de React 18 en consola.</td>
          <td>Consola de navegador y logs de Vitest limpios sin advertencias de atributos DOM.</td>
        </tr>
      </tbody>
    </table>

    <h2 class="section-title"><span class="bullet"></span> 6. Hoja de Ruta para Aprobación y Pase a Producción</h2>
    <ol style="margin-left: 18px; line-height: 1.55; margin-bottom: 12px;">
      <li><strong>Paso 1 (Inmediato):</strong> Solicitar confirmación del usuario para crear el commit oficial <code>V162_Consolidacion_Flujo_Clinico_y_Puertas_Seguridad</code> de acuerdo a la Regla 3 de <code>AGENTS.md</code>.</li>
      <li><strong>Paso 2 (Validación Remota):</strong> Hacer push a <code>origin/feat/sroman</code> para que GitHub Actions ejecute la suite completa de pruebas en el PR #151.</li>
      <li><strong>Paso 3 (Entorno de Staging):</strong> Configurar variables de entorno reales de Google Calendar y Decolecta en el servidor de pruebas para ensayar videollamadas con terapeutas colegiados.</li>
      <li><strong>Paso 4 (Habilitación Asistida de IA):</strong> Una vez validada la cohorte clínica, depositar los pesos de Random Forest en <code>ml-artifacts/</code> y cambiar el estado del predictor a disponible.</li>
    </ol>

    <div class="dictamen-box" style="background: #F8F7FC; border-color: #DDD6FE;">
      <div class="dictamen-title" style="color: #6B46FE;">Firma y Responsabilidad Técnica</div>
      <p style="font-size: 8pt; color: #615274;">
        Informe de auditoría técnica emitido el <strong>02 de Noviembre de 2026</strong>.<br>
        Basado en inspección exhaustiva de código fuente, ejecución de pruebas unitarias, de enrutamiento y contratos E2E sobre el monorepo <code>ashakids-platform</code>.<br>
        <em>Dictamen: APROBADO TÉCNICAMENTE PARA TRANSICIÓN A STAGING • PREDICCIÓN CLÍNICA PROTEGIDA POR DISEÑO ÉTICO.</em>
      </p>
    </div>
  </div>

</body>
</html>
`;

(async () => {
  console.log('Iniciando generación de PDF de Auditoría...');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  
  // Esperar un segundo extra para que fuentes Nunito/Inter se rendericen perfectamente
  await new Promise((r) => setTimeout(r, 1200));

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      right: '14mm',
      bottom: '14mm',
      left: '14mm'
    }
  });

  await browser.close();
  console.log('PDF generado exitosamente en:', outputPath);
})();

