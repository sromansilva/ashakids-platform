import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const playwrightPath = require.resolve('@playwright/test', { paths: [path.resolve('frontend')] });
const { chromium } = require(playwrightPath);

const outputDir = path.resolve('output/pdf');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.resolve(outputDir, 'Plan_Automatizacion_Evaluacion_Fonologica_ML_ASHAKids.pdf');
const rootOutputPath = path.resolve('Plan_Automatizacion_Evaluacion_Fonologica_ML_ASHAKids.pdf');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ashakids | Plan de Automatización, Evaluación Fonológica con IA y Pronóstico Terapéutico</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

    @page {
      size: A4;
      margin: 16mm 18mm 18mm 18mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 8.5pt;
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
      font-size: 9.8pt;
    }

    h1, h2, h3, h4, .brand-font {
      font-family: 'Nunito', sans-serif;
    }

    .page {
      page-break-after: always;
      position: relative;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Header */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 20px;
      border-bottom: 1.5px solid #E8E5F4;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-badge {
      width: 34px;
      height: 34px;
      background: #6B46FE;
      color: #FFFFFF;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 14pt;
      font-family: 'Nunito', sans-serif;
    }

    .logo-text {
      font-size: 15pt;
      font-weight: 900;
      color: #1C1135;
      letter-spacing: -0.5px;
    }

    .logo-tag {
      font-size: 7.5pt;
      font-weight: 800;
      color: #6B46FE;
      background: #EDE9FE;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .header-meta {
      text-align: right;
      font-size: 8pt;
      color: #615274;
    }

    /* Cover Styling */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 820px;
      padding: 40px 0;
    }

    .cover-tag {
      display: inline-block;
      align-self: flex-start;
      background: #EDE9FE;
      color: #6B46FE;
      font-weight: 800;
      font-size: 9pt;
      padding: 6px 14px;
      border-radius: 9999px;
      margin-bottom: 24px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .cover-title {
      font-size: 28pt;
      font-weight: 900;
      line-height: 1.15;
      color: #1C1135;
      margin-bottom: 16px;
      letter-spacing: -0.8px;
    }

    .cover-subtitle {
      font-size: 13pt;
      line-height: 1.5;
      color: #615274;
      margin-bottom: 32px;
      max-width: 620px;
    }

    .cover-card {
      background: #F8F7FC;
      border: 1px solid #E8E5F4;
      border-left: 5px solid #6B46FE;
      border-radius: 16px;
      padding: 22px 26px;
      margin-bottom: 40px;
    }

    .cover-card-title {
      font-size: 11pt;
      font-weight: 800;
      color: #1C1135;
      margin-bottom: 8px;
    }

    .cover-card-desc {
      font-size: 9pt;
      color: #615274;
      line-height: 1.6;
    }

    .cover-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #E8E5F4;
      padding-top: 16px;
      font-size: 8.5pt;
      color: #8E84A6;
    }

    /* Headings */
    h2.section-title {
      font-size: 15pt;
      font-weight: 900;
      color: #1C1135;
      margin-top: 24px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #E8E5F4;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-num {
      background: #6B46FE;
      color: #FFFFFF;
      font-size: 9pt;
      font-weight: 800;
      padding: 3px 9px;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
    }

    h3 {
      font-size: 11.5pt;
      font-weight: 800;
      color: #1C1135;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    p {
      margin-bottom: 10px;
      color: #4A3E60;
      text-align: justify;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
      color: #4A3E60;
    }

    li {
      margin-bottom: 5px;
    }

    /* Cards and boxes */
    .card {
      background: #FFFFFF;
      border: 1px solid #E8E5F4;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 14px;
      box-shadow: 0 2px 6px rgba(28, 17, 53, 0.02);
    }

    .card-purple {
      background: #F9F7FE;
      border: 1px solid #D6CCFE;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 14px;
    }

    .callout {
      border-radius: 12px;
      padding: 12px 16px;
      margin: 14px 0;
      font-size: 9pt;
      line-height: 1.5;
    }

    .callout-info {
      background: #EDE9FE;
      border-left: 4px solid #6B46FE;
      color: #38248A;
    }

    .callout-success {
      background: #ECFDF5;
      border-left: 4px solid #10B981;
      color: #065F46;
    }

    .callout-warning {
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
      color: #92400E;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 8.8pt;
    }

    th {
      background: #F8F7FC;
      color: #1C1135;
      font-weight: 800;
      text-align: left;
      padding: 9px 12px;
      border-bottom: 2px solid #E8E5F4;
      font-family: 'Nunito', sans-serif;
    }

    td {
      padding: 9px 12px;
      border-bottom: 1px solid #E8E5F4;
      color: #4A3E60;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #FAFAFD;
    }

    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-primary { background: #EDE9FE; color: #6B46FE; }
    .badge-success { background: #D1FAE5; color: #065F46; }
    .badge-warning { background: #FEF3C7; color: #92400E; }

    /* Schema Box */
    .schema-box {
      background: #1C1135;
      color: #EDE9FE;
      font-family: 'Courier New', Courier, monospace;
      font-size: 7.8pt;
      line-height: 1.45;
      padding: 16px;
      border-radius: 12px;
      margin: 14px 0;
      white-space: pre;
      overflow-x: auto;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }

    .kpi-card {
      background: #FFFFFF;
      border: 1px solid #E8E5F4;
      border-radius: 12px;
      padding: 14px;
      text-align: center;
    }

    .kpi-val {
      font-size: 16pt;
      font-weight: 900;
      color: #6B46FE;
      font-family: 'Nunito', sans-serif;
    }

    .kpi-lbl {
      font-size: 8pt;
      font-weight: 700;
      color: #615274;
      margin-top: 4px;
    }
  </style>
</head>
<body>

  <!-- PORTADA -->
  <div class="page cover">
    <div class="doc-header">
      <div class="logo-container">
        <div class="logo-badge">A</div>
        <div class="logo-text">Ashakids</div>
        <div class="logo-tag">Propuesta Oficial</div>
      </div>
      <div class="header-meta">
        <div>Documento: <strong>PRO-FUNC-V2.0</strong></div>
        <div>Fecha: 2 de noviembre de 2026</div>
      </div>
    </div>

    <div class="cover-tag">Plan Integral de Automatización e Inteligencia Artificial</div>
    <h1 class="cover-title">Plan de Automatización, Evaluación Fonológica con IA y Pronóstico Terapéutico</h1>
    <div class="cover-subtitle">
      Un flujo integrado para la atención clínica en Google Meet, inferencia acústica con Deep Learning (Wav2Vec 2.0), pronóstico analítico de sesiones (Scikit-Learn) y conexión con los cinco mundos educativos.
    </div>

    <div class="cover-card">
      <div class="cover-card-title">Alcance Funcional y Arquitectónico (12 Secciones)</div>
      <div class="cover-card-desc">
        Este documento consolida la arquitectura operativa completa de la plataforma: registro autónomo con validación de identidad (RENIEC / SUNAT), agenda clínica, inicio automatizado de videollamadas con Google Meet, panel de evaluación acústica en tiempo real, emisión de reportes clínicos estructurados, formulación asistida del plan terapéutico con Machine Learning supervisado y estimulación lúdica personalizada en el hogar.
      </div>
    </div>

    <div class="grid-2">
      <div class="kpi-card">
        <div class="kpi-val">Wav2Vec 2.0</div>
        <div class="kpi-lbl">Inferencia Acústica Local (Deep Learning)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-val">Random Forest</div>
        <div class="kpi-lbl">Pronóstico Predictivo de Sesiones (ML Tabular)</div>
      </div>
    </div>

    <div class="cover-footer">
      <div>Ashakids Platform • Telerehabilitación y Habla Infantil</div>
      <div>Confidencial • Uso Interno y Auditoría Académica</div>
    </div>
  </div>

  <!-- PÁGINA 2: CONTENIDO Y SECCIONES 1 Y 2 -->
  <div class="page">
    <div class="doc-header">
      <div class="logo-container">
        <div class="logo-badge">A</div>
        <div class="logo-text">Ashakids</div>
      </div>
      <div class="header-meta">Página 2 • Flujo de Acceso y Reserva</div>
    </div>

    <h2 class="section-title"><span class="section-num">01</span> Registro y Acceso del Padre de Familia</h2>
    <p>
      El proceso comienza cuando un padre de familia visita la landing page oficial de Ashakids, explora los servicios de fonoaudiología y estimulación del lenguaje, y solicita información inicial o registro asistido.
    </p>
    <ul>
      <li><strong>Validación de Identidad y Alta Administrativa:</strong> El personal autorizado registra al tutor en la plataforma mediante la integración con Decolecta (consulta de DNI en RENIEC y validación fiscal SUNAT).</li>
      <li><strong>Activación con Credenciales Seguras:</strong> El sistema despacha automáticamente un correo de bienvenida mediante Gmail API con un enlace seguro y token efímero para crear contraseña.</li>
      <li><strong>Gestión de Expedientes Infantiles:</strong> El padre puede dar de alta a uno o varios hijos. Cada menor cuenta con un expediente clínico independiente, identificador único, selector activo en la barra superior del portal y seguimiento diferenciado.</li>
    </ul>

    <h2 class="section-title"><span class="section-num">02</span> Selección de Terapeuta y Programación</h2>
    <p>
      Todo menor que ingresa a Ashakids debe participar inicialmente en una <strong>Consulta Introductoria de Evaluación</strong> antes de comenzar cualquier ciclo de intervención regular.
    </p>
    <ul>
      <li><strong>Configuración de Disponibilidad:</strong> Los terapeutas configuran sus franjas semanales de atención (lunes a sábado de 08:00 a 17:00) desde su panel clínico.</li>
      <li><strong>Reserva en Línea y Verificación de Cupos:</strong> El padre consulta la agenda del especialista de su preferencia y reserva una fecha/hora disponible mediante el modal de reservas. El sistema previene colisiones de horario en tiempo real.</li>
      <li><strong>Vínculo Relacional en Base de Datos:</strong> La cita queda registrada en la tabla relacional <code>reservas</code>, asociando al paciente, al tutor responsable y al terapeuta asignado con estado <em>CONFIRMADA</em>.</li>
    </ul>

    <div class="callout callout-info">
      <strong>Regla de Dominio:</strong> La sesión introductoria establece la línea base diagnóstica. En ella se extraen las variables clínicas y fonéticas iniciales que posteriormente alimentarán tanto el reporte como el modelo predictivo de tratamiento.
    </div>

    <h2 class="section-title"><span class="section-num">03</span> Inicio de Sesiones mediante Google Meet</h2>
    <p>
      Ashakids utiliza <strong>Google Meet</strong> como herramienta oficial de videoconferencia en tiempo real, garantizando máxima estabilidad y sin requerir descargas de software invasivo.
    </p>
    <ul>
      <li><strong>Duración Estándar:</strong> Bloques programados de 40 minutos enlazados al calendario clínico.</li>
      <li><strong>Notificación Anticipada (T - 10 min):</strong> El terapeuta recibe una alerta visual en el encabezado de la plataforma sobre su sesión próxima.</li>
      <li><strong>Habilitación del Botón (T - 5 min):</strong> Se habilita el acceso <em>"Iniciar reunión"</em> tanto para el terapeuta como para la familia.</li>
      <li><strong>Apertura Dual Sincronizada:</strong> Al pulsar el botón, el navegador abre Google Meet en una pestaña para la interacción audiovisual y, en paralelo, abre el <strong>Panel de Sesión Activa</strong> en Ashakids.</li>
    </ul>
  </div>

  <!-- PÁGINA 3: PANEL DE SESIÓN Y PRUEBAS FONOLÓGICAS (WAV2VEC 2.0) -->
  <div class="page">
    <div class="doc-header">
      <div class="logo-container">
        <div class="logo-badge">A</div>
        <div class="logo-text">Ashakids</div>
      </div>
      <div class="header-meta">Página 3 • Inteligencia Artificial Acústica</div>
    </div>

    <h2 class="section-title"><span class="section-num">04</span> Panel de Sesión y Pruebas Fonológicas (Wav2Vec 2.0)</h2>
    <p>
      Este módulo opera en paralelo a la videollamada de Google Meet y constituye el primer punto de aplicación de Inteligencia Artificial en tiempo real. El terapeuta interactúa con el niño mientras evalúa objetivamente emisiones sonoras específicas.
    </p>

    <div class="card-purple">
      <h3>Arquitectura de la Evaluación Fonológica en Vivo</h3>
      <p style="margin-bottom: 6px;">
        1. <strong>Selección de Fonema Objetivo:</strong> El terapeuta selecciona el fonema a testear (ej. /rr/, /r/, /s/, /pl/, /tr/) y la palabra asociada (<em>"carro"</em>, <em>"ratón"</em>, <em>"plato"</em>).
      </p>
      <p style="margin-bottom: 6px;">
        2. <strong>Captura Acústica Breve:</strong> El terapeuta le indica al menor repetir la palabra y presiona <em>"Grabar fonema en vivo"</em>. Se graba una ventana sonora limpia de 2 a 3 segundos del micrófono.
      </p>
      <p style="margin-bottom: 6px;">
        3. <strong>Procesamiento en Microservicio ML (Puerto 8001):</strong> La señal de audio se envía en formato WAV mono 16 kHz al motor <strong>Wav2Vec 2.0</strong> en FastAPI + PyTorch.
      </p>
      <p>
        4. <strong>Métricas Entregadas al Terapeuta:</strong>
      </p>
      <ul>
        <li><strong>Transcripción acústica real:</strong> (ej. <em>"calo"</em> frente a objetivo <em>"carro"</em>).</li>
        <li><strong>Porcentaje de similitud fonética espectral:</strong> (ej. 75% de coincidencia).</li>
        <li><strong>Diagnóstico de apoyo:</strong> Lambdacismo (sustitución de vibrante múltiple por lateral /l/).</li>
      </ul>
    </div>

    <div class="callout callout-warning">
      <strong>Garantía Ética:</strong> Los indicadores de Wav2Vec 2.0 son herramientas de soporte diagnóstico cuantitativo; nunca sustituyen el criterio clínico ni emiten juicios diagnósticos irrevocables de manera automática.
    </div>

    <h2 class="section-title"><span class="section-num">05</span> Almacenamiento Automático de Resultados</h2>
    <p>
      Cada evaluación fonológica completada se indexa de inmediato en la base de datos de Ashakids, vinculada a la sesión, al paciente y al fonema evaluado. El terapeuta no necesita transcribir manualmente los valores cuando elabore el informe clínico.
    </p>
    <ul>
      <li><strong>Destrucción de Audio Efímero:</strong> Por privacidad y seguridad del menor, el audio grabado se descarta de la memoria volátil del servidor inmediatamente tras la inferencia; únicamente se guardan las métricas estructuradas.</li>
      <li><strong>Bitácora de Notas Rápidas:</strong> Campo de anotaciones clínicas en tiempo real con guardado automático durante la sesión.</li>
    </ul>

    <h2 class="section-title"><span class="section-num">06</span> Finalización y Generación del Reporte Clínico</h2>
    <p>
      Al concluir la atención, el terapeuta presiona <em>"Finalizar sesión"</em> en Ashakids. El sistema actualiza el estado a <em>REALIZADA</em> y da paso al editor clínico estructurado:
    </p>
    <ul>
      <li><strong>Prellenado Automático:</strong> Datos de la sesión, fecha, paciente y especialista.</li>
      <li><strong>Inserción de Fonemas con 1 Clic:</strong> El botón <em>"Pegar en el informe"</em> traslada la transcripción y el diagnóstico biomédico directamente a las observaciones.</li>
      <li><strong>Nivel de Ayuda Estandarizado:</strong> Registro del soporte brindado (Nivel 1 al 5).</li>
      <li><strong>Firma y Descarga:</strong> Emisión en PDF con firma del especialista para la familia.</li>
    </ul>
  </div>

  <!-- PÁGINA 4: PLAN TERAPÉUTICO Y MODELO PREDICTIVO (RANDOM FOREST) -->
  <div class="page">
    <div class="doc-header">
      <div class="logo-container">
        <div class="logo-badge">A</div>
        <div class="logo-text">Ashakids</div>
      </div>
      <div class="header-meta">Página 4 • Machine Learning Predictivo Clínico</div>
    </div>

    <h2 class="section-title"><span class="section-num">07</span> Plan Asistido por Machine Learning Predictivo</h2>
    <p>
      En la consulta introductoria de evaluación, Ashakids reemplaza la asignación arbitraria y estática de sesiones (<code>sesiones_recomendadas: 12</code>) por un <strong>Modelo Predictivo Supervisado de Regresión y Clasificación (Random Forest / Scikit-Learn)</strong>.
    </p>

    <div class="card">
      <h3>Sinergia entre Deep Learning Acústico y Machine Learning Tabular</h3>
      <p>
        El modelo predictivo no trabaja con datos aislados; se alimenta directamente de los resultados objetivos extraídos por el módulo acústico Wav2Vec 2.0 y el reporte de la primera sesión:
      </p>

      <table>
        <thead>
          <tr>
            <th>Variable de Entrada (Feature)</th>
            <th>Origen del Dato en Ashakids</th>
            <th>Impacto en la Predicción</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Edad Cronológica</strong></td>
            <td>Perfil del niño en el Centro Familiar (meses/años)</td>
            <td>Pronóstico según etapa de desarrollo articulatorio</td>
          </tr>
          <tr>
            <td><strong>Diagnóstico Preliminar</strong></td>
            <td>Clasificación inicial (Dislalia, TEL, Deglución)</td>
            <td>Complejidad del cuadro clínico base</td>
          </tr>
          <tr>
            <td><strong>Fonemas Afectados</strong></td>
            <td><strong>Pruebas acústicas Wav2Vec 2.0 (Sección 04)</strong></td>
            <td>Carga terapéutica y número de puntos a rehabilitar</td>
          </tr>
          <tr>
            <td><strong>Nivel de Colaboración</strong></td>
            <td>Escala de ayuda y conducta (1 a 5) en el reporte</td>
            <td>Velocidad de asimilación del tratamiento</td>
          </tr>
          <tr>
            <td><strong>Frecuencia Semanal</strong></td>
            <td>Propuesta terapéutica (1 o 2 sesiones/semana)</td>
            <td>Intensidad del plan terapéutico</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="schema-box">
[ENTRADAS CLÍNICAS: Edad, Fonemas Wav2Vec, Colaboración, Diagnóstico]
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  MODELO ML PREDICTIVO ASHAKIDS (Random Forest Regressor)    │
│  Entrenado con métricas fonoaudiológicas y adherencia       │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
[TARGET 1: N° Sesiones Recomendadas]      [TARGET 2: Riesgo de Deserción]
Ejemplo: 14 sesiones (± 2 sesiones)        Ejemplo: Riesgo BAJO (88% confianza)
    </div>

    <h3>Supervisión y Control Profesional</h3>
    <p>
      El terapeuta visualiza la tarjeta de pronóstico inteligente en la pantalla de formulación del plan (<code>SessionPlan.tsx</code>):
    </p>
    <ul>
      <li>El especialista puede <strong>aprobar la recomendación con un solo clic</strong>, adoptando el número óptimo de sesiones calculado.</li>
      <li>Puede <strong>ajustar manualmente los valores</strong> si detecta factores contextuales cualitativos no capturados por el algoritmo (ej. bilingüismo o dinámica familiar).</li>
      <li>La decisión final permanece siempre bajo el criterio del profesional de la salud.</li>
    </ul>
  </div>

  <!-- PÁGINA 5: CINCO MUNDOS, PROGRESO Y OBJETIVO FINAL -->
  <div class="page">
    <div class="doc-header">
      <div class="logo-container">
        <div class="logo-badge">A</div>
        <div class="logo-text">Ashakids</div>
      </div>
      <div class="header-meta">Página 5 • 5 Mundos, Seguridad y Arquitectura</div>
    </div>

    <h2 class="section-title"><span class="section-num">08</span> Integración con los Cinco Mundos</h2>
    <p>
      El plan terapéutico se conecta de forma directa con los <strong>Cinco Mundos Educativos de Ashakids</strong>. Cada mundo refuerza habilidades específicas definidas por el plan:
    </p>
    <ul>
      <li><strong>Isla Mágica:</strong> Discriminación auditiva y conciencia fonológica de fonemas en tratamiento.</li>
      <li><strong>Laberinto de Palabras:</strong> Praxias articulatorias, repetición y fijación de vocabulario específico.</li>
      <li><strong>Canciones y Rimas:</strong> Coordinación fono-respiratoria, prosodia y fluidez verbal.</li>
      <li><strong>Cuentos Interactivos:</strong> Morfosintaxis, estructuración de enunciados y comprensión auditiva.</li>
      <li><strong>Adivinanzas:</strong> Campo semántico, categorización léxica y denominación rápida.</li>
    </ul>
    <p>
      En el portal del padre se destacan las actividades recomendadas por el especialista, registrando duración, aciertos y participación del menor en el hogar.
    </p>

    <h2 class="section-title"><span class="section-num">09</span> Seguimiento y Adherencia Terapéutica</h2>
    <p>
      El sistema presenta dos líneas de analítica claramente diferenciadas para evitar falsas correlaciones:
    </p>
    <ul>
      <li><strong>Analítica Clínica:</strong> Curva de superación fonológica (porcentaje de acierto en las pruebas acústicas periódicas) y avance respecto al número de sesiones estimadas (ej. <em>Sesión 6 de 14 proyectadas</em>).</li>
      <li><strong>Analítica Lúdica:</strong> Horas de práctica en el hogar y constancia en los mundos interactivos.</li>
    </ul>

    <h2 class="section-title"><span class="section-num">10</span> Privacidad y Seguridad de Menores</h2>
    <ul>
      <li><strong>Consentimiento Informado:</strong> Autorización digital expresa de los padres para el procesamiento de voz mediante IA.</li>
      <li><strong>Inferencia Efímera:</strong> Cero almacenamiento de grabaciones completas; el audio se procesa en RAM y se descarta tras obtener la predicción acústica.</li>
      <li><strong>Meet Desacoplado:</strong> Google Meet maneja la videoconferencia sin grabación invasiva; Ashakids solo toma muestras breves voluntarias.</li>
    </ul>

    <h2 class="section-title"><span class="section-num">11</span> Arquitectura del Sistema Dual de IA</h2>
    <table>
      <thead>
        <tr>
          <th>Componente de IA</th>
          <th>Tipo de Algoritmo</th>
          <th>Función en Ashakids</th>
          <th>Tiempo Inferencia</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>IA 1: Acústica Fonética</strong></td>
          <td>Deep Learning (Wav2Vec 2.0 PyTorch)</td>
          <td>Evaluación de formantes y habla en vivo en sesión</td>
          <td>~ 1.2 segundos</td>
        </tr>
        <tr>
          <td><strong>IA 2: Predictiva Tabular</strong></td>
          <td>Machine Learning (Random Forest / XGBoost)</td>
          <td>Pronóstico de sesiones y riesgo de deserción en plan</td>
          <td>&lt; 10 milisegundos</td>
        </tr>
      </tbody>
    </table>

    <h2 class="section-title"><span class="section-num">12</span> Flujo Maestro y Objetivo Final</h2>
    <div class="callout callout-success">
      <strong>Ciclo Integral Ashakids:</strong><br>
      <code>Consulta Introductoria</code> $\rightarrow$ <code>Prueba Fonológica (Wav2Vec 2.0)</code> $\rightarrow$ <code>Reporte Clínico</code> $\rightarrow$ <code>Plan con Pronóstico Asistido (Random Forest)</code> $\rightarrow$ <code>Ejercitación en 5 Mundos</code> $\rightarrow$ <code>Seguimiento y Alta Terapéutica</code>.
    </div>

    <p style="font-size: 8.5pt; color: #8E84A6; margin-top: 14px; text-align: center;">
      Ashakids Platform © 2026 • Plataforma de Telerehabilitación Infantil con Inteligencia Artificial Dual
    </p>
  </div>

</body>
</html>
`;

async function generatePDF() {
  console.log('Generando PDF oficial del Plan de Automatización y ML con Playwright y Edge...');
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

  // Copiar también a la raíz para fácil acceso del usuario
  fs.copyFileSync(outputPath, rootOutputPath);

  await browser.close();
  const stats = fs.statSync(outputPath);
  console.log('PDF generado exitosamente en:');
  console.log('1.', outputPath);
  console.log('2.', rootOutputPath);
  console.log('Tamaño del archivo:', (stats.size / 1024).toFixed(1), 'KB');
}

generatePDF().catch(err => {
  console.error('Error al generar PDF:', err);
  process.exit(1);
});

