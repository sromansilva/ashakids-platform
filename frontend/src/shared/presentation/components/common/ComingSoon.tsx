import { Clock3 } from 'lucide-react';

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return <section className="coming-soon p-6 sm:p-10 max-w-5xl mx-auto text-[#1C1135]">
    <h1 className="text-2xl font-black">{title}</h1>
    <div className="mt-8 py-12 text-center border border-[#E8E5F4] bg-white rounded-2xl">
      <Clock3 size={32} className="mx-auto text-violet-700 mb-4" aria-hidden="true"/>
      <h2 className="text-lg font-extrabold">Próximamente</h2>
      <p className="text-base text-[#4B4264] mt-2 max-w-md mx-auto px-4">{description ?? 'Este apartado estará disponible en una próxima actualización.'}</p>
    </div>
  </section>;
}
