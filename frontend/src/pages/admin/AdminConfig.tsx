const tools = [
  { name: 'React', logo: 'react', area: 'Interfaz', detail: 'Componentes y pantallas' },
  { name: 'TypeScript', logo: 'typescript', area: 'Interfaz', detail: 'Tipos y contratos de datos' },
  { name: 'Vite', logo: 'vitejs', area: 'Interfaz', detail: 'Desarrollo y compilación' },
  { name: 'Tailwind CSS', logo: 'tailwindcss', area: 'Interfaz', detail: 'Estilos de la aplicación' },
  { name: 'Python', logo: 'python', area: 'API', detail: 'Lógica del backend' },
  { name: 'FastAPI', logo: 'fastapi', area: 'API', detail: 'Validación y permisos de acceso' },
  { name: 'PostgreSQL', logo: 'postgresql', area: 'Datos', detail: 'Registros y relaciones' },
  { name: 'Supabase', logo: 'supabase', area: 'Datos', detail: 'Alojamiento de PostgreSQL' },
  { name: 'Render', logo: 'render', area: 'Despliegue', detail: 'Interfaz y API bajo HTTPS' },
  { name: 'Gmail', logo: 'gmail', area: 'Integraciones', detail: 'Correo de alta y boletín', note: 'Según configuración del servicio' },
  { name: 'Zoom', logo: 'zoom', area: 'Integraciones', detail: 'Enlaces de videollamada', note: 'Creación automática según configuración' },
  { name: 'GitHub', logo: 'github', area: 'Desarrollo', detail: 'Código e historial del proyecto' },
];

export function AdminConfig() {
  return <section className="admin-system-config p-4 sm:p-6 max-w-6xl mx-auto text-[#1C1135]">
    <div className="admin-page-heading admin-config-heading">
      <h1 className="text-2xl font-black">Configuración del sistema</h1>
      <a className="admin-config-repository" href="https://github.com/sromansilva/ashakids-platform" target="_blank" rel="noreferrer">Ver repositorio</a>
    </div>
    <div className="admin-tools-grid">
      {tools.map(tool => <article className="admin-tool-card" key={tool.name}>
        <img src={`/technology/${tool.logo}.svg`} alt="" width={48} height={48} />
        <div><span className="admin-tool-area">{tool.area}</span><h2>{tool.name}</h2><p>{tool.detail}</p>{tool.note && <small>{tool.note}</small>}</div>
      </article>)}
    </div>
  </section>;
}
