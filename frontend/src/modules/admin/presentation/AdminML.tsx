import { Cpu } from 'lucide-react';
import { View } from "@/shared/domain/types/navigation";
export function AdminML({ go: _go }: { go: (v: View) => void }) {
  return <section className="p-4 sm:p-6 max-w-4xl mx-auto text-[#1C1135]">
    <h1 className="text-2xl font-black mb-6">Machine Learning</h1>
    <div className="admin-empty-card bg-white rounded-2xl p-8">
      <Cpu size={32} aria-hidden="true" className="text-violet-700 mb-4" />
      <h2 className="text-xl font-extrabold mb-3">Próximamente</h2>
      <p className="text-sm text-[#625779] max-w-prose">El módulo de aprendizaje automático está en preparación. Aún no hay un modelo entrenado ni un conjunto de datos validado para realizar inferencias o evaluaciones clínicas.</p>
    </div>
  </section>;
}
