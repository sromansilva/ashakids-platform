export function AdminConfig() {
  const sections = [
    { title: 'Tecnologías', text: 'La interfaz utiliza React y TypeScript, con Vite para desarrollo y compilación, Tailwind CSS para estilos e iconos Lucide. El backend usa Python y FastAPI; SQLAlchemy asíncrono y asyncpg conectan con PostgreSQL.' },
    { title: 'Arquitectura', text: 'La interfaz envía solicitudes HTTP/JSON a FastAPI. La API valida los datos, verifica permisos y ejecuta las operaciones en PostgreSQL. El navegador accede a los datos a través de la API.' },
    { title: 'Despliegue y base de datos', text: 'Render aloja la aplicación y sirve la interfaz y la API bajo el mismo origen HTTPS. PostgreSQL está gestionado en Supabase. Las credenciales se configuran en el backend y las migraciones se aplican de forma explícita.' },
    { title: 'Usuarios y seguridad', text: 'La autenticación propia utiliza sesiones con cookies HttpOnly y permisos para administrador, terapeuta y padre. La API controla el acceso a cada recurso. PostgreSQL usa un rol técnico con permisos limitados y políticas RLS. Las contraseñas se almacenan como hashes.' },
    { title: 'Integraciones', text: 'Gmail API se utiliza desde el backend para el correo de alta y el boletín, según la configuración del servicio. Zoom permite abrir enlaces de videollamada; la creación automática de reuniones depende de su configuración. La entrega de correo y las reuniones requieren disponibilidad de sus proveedores.' },
    { title: 'Herramientas de desarrollo', text: 'Git y GitHub mantienen el código y su historial. Pytest verifica el backend; Vitest y Testing Library comprueban componentes, y TypeScript revisa tipos. Graphify genera un mapa local del código para investigar sus relaciones; se utiliza solo durante el desarrollo.' },
  ];
  return <section className="p-4 sm:p-6 max-w-4xl mx-auto text-[#1C1135]">
    <h1 className="text-2xl font-black mb-2">Configuración del sistema</h1>
    <p className="text-sm text-[#625779] mb-6">Información técnica de ASHAKids: tecnologías, arquitectura y herramientas del proyecto.</p>
    <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-6">
      {sections.map(section => <section key={section.title}>
        <h2 className="font-extrabold text-lg mb-2">{section.title}</h2>
        <p className="text-sm leading-relaxed text-[#625779] max-w-prose">{section.text}</p>
      </section>)}
      <a className="inline-block text-sm text-violet-800 font-bold underline focus-visible:outline-2" href="https://github.com/sromansilva/ashakids-platform" target="_blank" rel="noreferrer">Ver repositorio del proyecto</a>
    </div>
  </section>;
}
