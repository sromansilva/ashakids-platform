import { Star } from 'lucide-react';

export function AdminContenido() {
  return <section className="p-4 sm:p-6 max-w-4xl mx-auto text-[#1C1135]">
    <h1 className="text-2xl font-black mb-6">Contenido de ASHAKids</h1>
    <div className="admin-empty-card bg-white rounded-2xl p-8">
      <Star size={32} aria-hidden="true" className="text-violet-700 mb-4" />
      <h2 className="text-xl font-extrabold mb-3">Próximamente</h2>
      <p className="text-sm text-[#625779] max-w-prose">La gestión administrativa de cuentos, canciones y recursos educativos está en preparación. Este módulo todavía no permite crear, editar ni publicar contenido.</p>
    </div>
  </section>;
}
