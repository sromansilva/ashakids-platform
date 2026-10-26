import { useState } from 'react';
import { Plus, Search, BookOpen, Music, FileText, LayoutGrid, Layers, CheckCircle2, Eye, Pencil, Send, Clock, Globe } from 'lucide-react';

type TabType = 'TODOS' | 'CUENTOS' | 'CANCIONES' | 'RECURSOS';

interface ContentItem {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: 'Cuento' | 'Canción' | 'Recurso educativo';
  categoria: 'CUENTOS' | 'CANCIONES' | 'RECURSOS';
  mundo: string;
  estado: 'Publicado' | 'Borrador';
  imagen: string;
}

const demoContent: ContentItem[] = [
  {
    id: 1,
    titulo: 'El bosque de las palabras',
    descripcion: 'Un cuento interactivo para explorar el poder de las palabras y la comunicación.',
    tipo: 'Cuento',
    categoria: 'CUENTOS',
    mundo: 'La Isla de las Palabras',
    estado: 'Publicado',
    imagen: '/illustrations/family-storybook-v88.png',
  },
  {
    id: 2,
    titulo: 'Jugamos con los sonidos',
    descripcion: 'Una canción divertida para reconocer sonidos, ritmos y mejorar la conciencia fonológica.',
    tipo: 'Canción',
    categoria: 'CANCIONES',
    mundo: 'Taller de los Sonidos',
    estado: 'Publicado',
    imagen: '/illustrations/therapy-play-v54.png',
  },
  {
    id: 3,
    titulo: 'Tarjetas para descubrir',
    descripcion: 'Tarjetas interactivas para ampliar vocabulario y reforzar la asociación imagen-palabra.',
    tipo: 'Recurso educativo',
    categoria: 'RECURSOS',
    mundo: 'La Isla de las Palabras',
    estado: 'Borrador',
    imagen: '/illustrations/family-play-v54.png',
  },
];

export function AdminContenido() {
  const [tab, setTab] = useState<TabType>('TODOS');
  const [search, setSearch] = useState('');
  const [selectedMundo, setSelectedMundo] = useState('TODOS');
  const [selectedEstado, setSelectedEstado] = useState('TODOS');
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  const filtered = demoContent.filter(item => {
    if (tab !== 'TODOS' && item.categoria !== tab) return false;
    if (selectedMundo !== 'TODOS' && item.mundo !== selectedMundo) return false;
    if (selectedEstado !== 'TODOS' && item.estado !== selectedEstado) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!item.titulo.toLowerCase().includes(q) && !item.descripcion.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1135] tracking-tight">
            Contenido de ASHAKids
          </h1>
          <p className="text-sm sm:text-base text-[#615274] font-medium mt-1">
            Organiza cuentos, canciones y recursos educativos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-[#6B46FE] text-xs font-bold">
            <Clock size={13} />
            <span>Vista demostrativa · Datos de ejemplo</span>
          </div>
          <button
            onClick={() => alert('Función de nuevo contenido en el próximo sprint.')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white bg-[#6B46FE] hover:bg-[#5833EA] shadow-md shadow-violet-200 transition-all active:scale-[.98] cursor-pointer shrink-0"
          >
            <Plus size={18} /> Nuevo contenido
          </button>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        {/* Type pills */}
        <div className="inline-flex rounded-2xl border border-[#E8E5F4] bg-white p-1 gap-1 shadow-sm shrink-0">
          {[
            { key: 'TODOS', label: 'Todos', icon: LayoutGrid },
            { key: 'CUENTOS', label: 'Cuentos', icon: BookOpen },
            { key: 'CANCIONES', label: 'Canciones', icon: Music },
            { key: 'RECURSOS', label: 'Recursos', icon: FileText },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                tab === t.key
                  ? 'bg-[#6B46FE] text-white shadow-md shadow-violet-200'
                  : 'text-[#615274] hover:bg-violet-50 hover:text-[#6B46FE]'
              }`}
            >
              <t.icon size={15} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-2xl justify-end">
          {/* Search box */}
          <div className="flex-1 w-full flex items-center gap-2 bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 shadow-sm">
            <Search size={17} className="text-[#8C82A8] shrink-0" />
            <input
              aria-label="Buscar contenido"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar contenido..."
              className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder-[#8C82A8] outline-none"
            />
          </div>

          {/* Mundos select */}
          <div className="relative shrink-0 w-full sm:w-auto">
            <select
              aria-label="Filtrar por mundo"
              value={selectedMundo}
              onChange={e => setSelectedMundo(e.target.value)}
              className="w-full appearance-none bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 pr-8 text-sm font-bold text-[#1C1135] shadow-sm cursor-pointer outline-none"
            >
              <option value="TODOS">Todos los mundos</option>
              <option value="La Isla de las Palabras">La Isla de las Palabras</option>
              <option value="Taller de los Sonidos">Taller de los Sonidos</option>
            </select>
          </div>

          {/* Estados select */}
          <div className="relative shrink-0 w-full sm:w-auto">
            <select
              aria-label="Filtrar por estado"
              value={selectedEstado}
              onChange={e => setSelectedEstado(e.target.value)}
              className="w-full appearance-none bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 pr-8 text-sm font-bold text-[#1C1135] shadow-sm cursor-pointer outline-none"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="Publicado">Publicado</option>
              <option value="Borrador">Borrador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Content Cards + Publishing Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content Cards (3 cols) */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Image Cover */}
                <div className="relative h-44 bg-gradient-to-br from-violet-100 to-indigo-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md text-[#6B46FE] flex items-center justify-center shadow-sm">
                    {item.tipo === 'Cuento' ? (
                      <BookOpen size={18} />
                    ) : item.tipo === 'Canción' ? (
                      <Music size={18} />
                    ) : (
                      <FileText size={18} />
                    )}
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-5">
                  <h3 className="text-base font-extrabold text-[#1C1135] mb-1.5 leading-snug">
                    {item.titulo}
                  </h3>
                  <p className="text-xs text-[#615274] line-clamp-2 leading-relaxed mb-4 font-medium">
                    {item.descripcion}
                  </p>

                  <div className="space-y-2 text-xs border-t border-[#E8E5F4] pt-3.5">
                    <div className="flex items-center justify-between text-[#615274]">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={14} className="text-[#8C82A8]" /> Tipo
                      </span>
                      <span className="font-bold text-[#1C1135]">{item.tipo}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#615274]">
                      <span className="flex items-center gap-1.5">
                        <Globe size={14} className="text-[#8C82A8]" /> Mundo
                      </span>
                      <span className="font-bold text-[#1C1135] truncate max-w-[140px] text-right">{item.mundo}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#615274]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#8C82A8]" /> Estado
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          item.estado === 'Publicado'
                            ? 'bg-[#ECFDF5] text-[#059669]'
                            : 'bg-[#FFF4E5] text-[#FF8A00]'
                        }`}
                      >
                        {item.estado}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border border-[#E8E5F4] hover:bg-violet-50 text-xs font-bold text-[#1C1135] transition cursor-pointer"
                >
                  <Eye size={14} className="text-[#6B46FE]" /> Vista previa
                </button>
                <button
                  onClick={() => alert(`Editar ${item.titulo}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  <Pencil size={14} /> Editar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar: Publication Process */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-[#E8E5F4] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
                <Send size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#1C1135]">Publicación</h2>
                <p className="text-xs text-[#615274] leading-snug">
                  Sigue estos pasos para publicar nuevo contenido en ASHAKids.
                </p>
              </div>
            </div>

            <div className="space-y-6 mt-6 relative pl-3">
              {/* Vertical dotted guide line */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 border-l-2 border-dotted border-violet-200" />

              {/* Step 1 */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-7 h-7 rounded-full bg-[#6B46FE] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#1C1135]">Crear contenido</h3>
                  <p className="text-[11px] text-[#615274] leading-relaxed mt-0.5">
                    Selecciona el tipo de recurso y completa la información necesaria.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-7 h-7 rounded-full bg-[#6B46FE] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  2
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#1C1135]">Revisar recurso</h3>
                  <p className="text-[11px] text-[#615274] leading-relaxed mt-0.5">
                    Verifica que el contenido sea adecuado y cumpla con los estándares de la plataforma.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-7 h-7 rounded-full bg-[#6B46FE] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  3
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#1C1135]">Publicar para las familias</h3>
                  <p className="text-[11px] text-[#615274] leading-relaxed mt-0.5">
                    Una vez revisado, publica el contenido para que esté disponible en la aplicación.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <img
              src="/illustrations/ashi-hero-v1.png"
              alt="Mascota AshaKids"
              className="w-36 h-auto object-contain drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#E8E5F4]">
            <img
              src={previewItem.imagen}
              alt={previewItem.titulo}
              className="w-full h-48 object-cover rounded-2xl mb-4"
            />
            <h3 className="text-xl font-extrabold text-[#1C1135] mb-2">{previewItem.titulo}</h3>
            <p className="text-sm text-[#615274] mb-4">{previewItem.descripcion}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-[#1C1135] transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
export default AdminContenido;
