import { Monitor, Database, Link as LinkIcon, Github } from 'lucide-react';

interface ToolItem {
  name: string;
  logo: string;
  area: string;
  detail: string;
  note?: string;
}

const uiTools: ToolItem[] = [
  { name: 'React', logo: 'react', area: 'Interfaz', detail: 'Componentes y pantallas' },
  { name: 'TypeScript', logo: 'typescript', area: 'Interfaz', detail: 'Tipos y contratos de datos' },
  { name: 'Vite', logo: 'vitejs', area: 'Interfaz', detail: 'Desarrollo y compilación' },
];

const apiTools: ToolItem[] = [
  { name: 'Tailwind CSS', logo: 'tailwindcss', area: 'Interfaz', detail: 'Estilos de la aplicación' },
  { name: 'Node.js & Express TS', logo: 'typescript', area: 'API', detail: 'Lógica del backend y endpoints modulares' },
  { name: 'TypeScript REST', logo: 'typescript', area: 'API', detail: 'Validación y permisos de acceso' },
  { name: 'PostgreSQL', logo: 'postgresql', area: 'Datos', detail: 'Registros y relaciones' },
  { name: 'PostgreSQL Local', logo: 'postgresql', area: 'Datos', detail: 'Servidor relacional local 127.0.0.1' },
  { name: 'Render', logo: 'render', area: 'Despliegue', detail: 'Interfaz y API bajo HTTPS' },
];

const integrationTools: ToolItem[] = [
  { name: 'Gmail', logo: 'gmail', area: 'Integraciones', detail: 'Correo de alta y boletín', note: 'Según configuración del servicio' },
  { name: 'Google Meet', logo: 'google', area: 'Integraciones', detail: 'Enlaces de videollamada', note: 'Creación automática mediante Google Calendar API' },
  { name: 'GitHub', logo: 'github', area: 'Desarrollo', detail: 'Código e historial del proyecto' },
];

export function AdminConfig() {
  return (
    <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1135] tracking-tight">
            Configuración del sistema
          </h1>
          <p className="text-sm sm:text-base text-[#615274] mt-2 font-medium">
            Tecnologías y servicios que componen la plataforma AshaKids.
          </p>
        </div>

        <div className="flex items-center gap-4 z-10 shrink-0">
          <a
            href="https://github.com/sromansilva/ashakids-platform"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-[#E8E5F4] hover:bg-violet-50 text-sm font-extrabold text-[#1C1135] shadow-sm transition-all"
          >
            <Github size={18} />
            <span>Ver repositorio</span>
          </a>
          <div className="hidden md:block w-36 shrink-0">
            <img
              src="/illustrations/ashi-hero-v1.png"
              alt="Robot configuración"
              className="w-full h-auto object-contain max-h-32 drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Section 1: Interfaz */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
            <Monitor size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1C1135]">Interfaz</h2>
            <p className="text-xs text-[#615274] font-medium">Tecnologías para el desarrollo de la interfaz de usuario.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {uiTools.map(tool => (
            <div
              key={tool.name}
              className="bg-white rounded-3xl p-5 border border-[#E8E5F4] shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F8F7FD] p-2 flex items-center justify-center shrink-0 border border-[#E8E5F4]">
                <img src={`/technology/${tool.logo}.svg`} alt="" className="w-8 h-8 object-contain" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#8C82A8] uppercase tracking-wider block">{tool.area}</span>
                <h3 className="text-base font-extrabold text-[#1C1135] leading-tight truncate">{tool.name}</h3>
                <p className="text-xs text-[#615274] font-medium mt-0.5 truncate">{tool.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: API y datos */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#E6FFFA] text-[#00A389] flex items-center justify-center shrink-0">
            <Database size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1C1135]">API y datos</h2>
            <p className="text-xs text-[#615274] font-medium">Tecnologías para el backend, datos y su almacenamiento.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {apiTools.map(tool => (
            <div
              key={tool.name}
              className="bg-white rounded-3xl p-5 border border-[#E8E5F4] shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F8F7FD] p-2 flex items-center justify-center shrink-0 border border-[#E8E5F4]">
                <img src={`/technology/${tool.logo}.svg`} alt="" className="w-8 h-8 object-contain" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#8C82A8] uppercase tracking-wider block">{tool.area}</span>
                <h3 className="text-base font-extrabold text-[#1C1135] leading-tight truncate">{tool.name}</h3>
                <p className="text-xs text-[#615274] font-medium mt-0.5 truncate">{tool.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Integraciones y desarrollo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#FFF4E5] text-[#FF8A00] flex items-center justify-center shrink-0">
            <LinkIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1C1135]">Integraciones y desarrollo</h2>
            <p className="text-xs text-[#615274] font-medium">Servicios externos e integraciones de la plataforma.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrationTools.map(tool => (
            <div
              key={tool.name}
              className="bg-white rounded-3xl p-5 border border-[#E8E5F4] shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F8F7FD] p-2 flex items-center justify-center shrink-0 border border-[#E8E5F4]">
                <img src={`/technology/${tool.logo}.svg`} alt="" className="w-8 h-8 object-contain" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#8C82A8] uppercase tracking-wider block">{tool.area}</span>
                <h3 className="text-base font-extrabold text-[#1C1135] leading-tight truncate">{tool.name}</h3>
                <p className="text-xs text-[#615274] font-medium mt-0.5 truncate">{tool.detail}</p>
                {tool.note && <span className="text-[10px] text-[#8C82A8] font-medium block mt-0.5">{tool.note}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default AdminConfig;
