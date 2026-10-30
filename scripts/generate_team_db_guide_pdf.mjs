import { chromium } from '../frontend/node_modules/@playwright/test/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ASHAKids - Guía de Conexión a la Base de Datos</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

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
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1C1135;
      background-color: #F8F7FC;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 18mm 20mm 15mm 20mm;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
      box-sizing: border-box;
    }

    .top-accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #6B46FE 0%, #8B5CF6 50%, #C4B5FD 100%);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 2px solid #F1EEF9;
      margin-bottom: 16px;
    }

    .brand-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #6B46FE;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(107, 70, 254, 0.25);
    }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #1C1135;
      letter-spacing: -0.5px;
    }

    .brand-sub {
      font-size: 11px;
      color: #796E8A;
      font-weight: 500;
    }

    .badge-aws {
      background: #EDE9FE;
      color: #5B21B6;
      border: 1px solid #DDD6FE;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .doc-hero {
      background: linear-gradient(135deg, #FAF8FF 0%, #F3EFFF 100%);
      border: 1px solid #E8E2F7;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }

    .doc-hero h1 {
      font-size: 19px;
      font-weight: 800;
      color: #2E1065;
      margin-bottom: 6px;
    }

    .doc-hero p {
      font-size: 12px;
      color: #5B4E75;
      line-height: 1.5;
    }

    .highlight-card {
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      border-radius: 10px;
      padding: 8px 12px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .highlight-card span {
      font-size: 11px;
      font-weight: 600;
      color: #065F46;
    }

    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #1C1135;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-number {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #6B46FE;
      color: white;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .code-block {
      background: #181126;
      color: #F8F7FC;
      border-radius: 12px;
      padding: 12px 14px;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 10.5px;
      line-height: 1.45;
      margin-bottom: 14px;
      border: 1px solid #2D2244;
      white-space: pre;
    }

    .code-highlight {
      color: #A78BFA;
    }

    .code-value {
      color: #6EE7B7;
    }

    .code-comment {
      color: #8C82A2;
      font-style: italic;
    }

    .table-container {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #E8E5F4;
    }

    .table-container th {
      background: #F4F1FA;
      color: #4C3F63;
      font-size: 11px;
      font-weight: 700;
      text-align: left;
      padding: 8px 12px;
    }

    .table-container td {
      padding: 7px 12px;
      font-size: 11px;
      border-top: 1px solid #E8E5F4;
      color: #2D2340;
    }

    .table-container tr:nth-child(even) {
      background: #FCFBFF;
    }

    .callout-box {
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 11.5px;
      line-height: 1.45;
      margin-bottom: 12px;
    }

    .callout-warning {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #92400E;
    }

    .callout-info {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: #1E40AF;
    }

    .footer {
      border-top: 1px solid #E8E5F4;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #8C82A2;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="top-accent-bar"></div>
    
    <div>
      <div class="header">
        <div class="brand-container">
          <div class="brand-logo">A</div>
          <div>
            <div class="brand-title">ASHAKids Platform</div>
            <div class="brand-sub">Equipo de Desarrollo • Configuración de Infraestructura</div>
          </div>
        </div>
        <div class="badge-aws">PostgreSQL Centralizado AWS</div>
      </div>

      <div class="doc-hero">
        <h1>Guía de Conexión a Base de Datos Centralizada</h1>
        <p>A partir de ahora, la base de datos corre centralizada en la nube de AWS. Todos los desarrolladores comparten la misma información de usuarios, terapeutas, pacientes y expedientes en tiempo real.</p>
        <div class="highlight-card">
          <span>⚡ AVISO: Ya no es necesario tener Docker Desktop encendido en tu computadora local.</span>
        </div>
      </div>

      <!-- SECCIÓN 1 -->
      <div class="section-title">
        <div class="section-number">1</div>
        <span>Configuración del Backend Local</span>
      </div>
      <p style="font-size: 11.5px; color: #5B4E75; margin-bottom: 6px;">
        Abre el archivo <code>backend/.env</code> en tu proyecto y reemplaza las variables de conexión por las siguientes:
      </p>

      <div class="code-block"><span class="code-comment"># Conexión centralizada a PostgreSQL en AWS EC2</span>
<span class="code-highlight">DB_HOST</span>=<span class="code-value">3.23.46.209</span>
<span class="code-highlight">DB_PORT</span>=<span class="code-value">5432</span>
<span class="code-highlight">DB_NAME</span>=<span class="code-value">ashakids</span>
<span class="code-highlight">DB_USER</span>=<span class="code-value">postgres</span>
<span class="code-highlight">DB_PASSWORD</span>=<span class="code-value">3e20cb03c3bdb53022af5db884458d5be0d09fc46aaf1edf226b802b0b39f6b3</span>
<span class="code-highlight">DB_SSL_ENABLED</span>=<span class="code-value">false</span>
<span class="code-highlight">DATABASE_URL</span>=<span class="code-value">postgresql://postgres:3e20cb03c3bdb53022af5db884458d5be0d09fc46aaf1edf226b802b0b39f6b3@3.23.46.209:5432/ashakids</span></div>

      <!-- SECCIÓN 2 -->
      <div class="section-title">
        <div class="section-number">2</div>
        <span>Conexión desde la Extensión de PostgreSQL en VS Code</span>
      </div>

      <p style="font-size: 11.5px; color: #5B4E75; margin-bottom: 6px;">
        Para visualizar tablas y datos directamente en VS Code, puedes usar cualquiera de estos dos métodos:
      </p>

      <div class="callout-box callout-info" style="margin-bottom: 8px;">
        <strong>Método A: Vía Connection String (Más rápido):</strong><br/>
        <code style="font-size: 10px; word-break: break-all;">postgresql://postgres:3e20cb03c3bdb53022af5db884458d5be0d09fc46aaf1edf226b802b0b39f6b3@3.23.46.209:5432/ashakids?sslmode=disable</code>
      </div>

      <table class="table-container">
        <thead>
          <tr>
            <th>Parámetro</th>
            <th>Valor a Ingresar</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Server / Host</strong></td>
            <td><code>3.23.46.209</code></td>
            <td>IP pública del servidor EC2</td>
          </tr>
          <tr>
            <td><strong>Port</strong></td>
            <td><code>5432</code></td>
            <td>Puerto oficial PostgreSQL</td>
          </tr>
          <tr>
            <td><strong>Database</strong></td>
            <td><code>ashakids</code></td>
            <td>Base de datos del proyecto</td>
          </tr>
          <tr>
            <td><strong>User</strong></td>
            <td><code>postgres</code></td>
            <td>Usuario administrador</td>
          </tr>
          <tr>
            <td><strong>Password</strong></td>
            <td><code>3e20cb03c3bdb53...</code></td>
            <td>Clave de 64 caracteres de AWS</td>
          </tr>
          <tr>
            <td><strong>SSL Mode</strong></td>
            <td><code>Disable</code></td>
            <td><strong>Obligatorio</strong> (En botón Advanced poner Disable)</td>
          </tr>
        </tbody>
      </table>

      <!-- SECCIÓN 3 -->
      <div class="section-title">
        <div class="section-number">3</div>
        <span>Comandos para Iniciar el Entorno Local</span>
      </div>

      <div class="code-block" style="margin-bottom: 10px;"><span class="code-comment"># Terminal 1: Iniciar API Backend</span>
npm --prefix backend run dev

<span class="code-comment"># Terminal 2: Iniciar Frontend Vite SPA</span>
npm --prefix frontend run dev</div>

      <div class="callout-box callout-warning">
        <strong>⚠️ Nota sobre SSL:</strong> Si al conectar en VS Code ves el mensaje <em>"server does not support SSL, but SSL was required"</em>, significa que olvidaste seleccionar <strong>Disable</strong> en la opción <em>SSL Mode</em> (Advanced).
      </div>
    </div>

    <div class="footer">
      <span>Plataforma ASHAKids • Documento Técnico de Equipo</span>
      <span>Actualizado: Octubre 2026 • Servidor AWS EC2</span>
    </div>
  </div>
</body>
</html>`;

async function buildPdf() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  const outputPath = path.resolve('Guia_Conexion_Base_de_Datos_ASHAKids.pdf');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }
  });

  await browser.close();
  console.log('PDF generado exitosamente en:', outputPath);
}

buildPdf().catch((err) => {
  console.error('Error al generar PDF:', err);
  process.exit(1);
});
