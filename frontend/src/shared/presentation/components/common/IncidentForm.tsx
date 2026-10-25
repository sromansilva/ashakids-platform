import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { incidenciasService, tiposIncidencia } from '@/modules/comunicacion/infrastructure/incidenciasService';
import { Btn } from '@/shared/presentation/components/common/Btn';

export function IncidentForm() {
  const [tipo, setTipo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [envio, setEnvio] = useState(() => crypto.randomUUID());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fields = 'block w-full rounded-2xl border border-[#E8E5F4] bg-white px-4 py-3 text-sm text-[#1C1135] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 disabled:opacity-60';
  const changed = () => { setEnvio(crypto.randomUUID()); setError(''); };
  return <section className="max-w-xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-black text-[#1C1135] mb-2">Reportar incidencia</h1>
    <p className="text-sm text-[#625779] mb-6">Cuéntanos qué problema encontraste. El administrador recibirá tu reporte.</p>
    {sent !== null ? <div role="status" className="rounded-2xl bg-green-50 p-5 text-green-800">
      <CheckCircle size={24} aria-hidden="true" className="mb-2" />
      <h2 className="font-extrabold">Reporte #{sent} enviado</h2>
      <p className="text-sm mt-2">Tu incidencia se guardó y está disponible para administración.</p>
      <button type="button" className="mt-4 font-bold underline focus-visible:outline-2" onClick={() => {
        setSent(null); setTipo(''); setTitulo(''); setDescripcion(''); changed();
      }}>Enviar otro reporte</button>
    </div> : <form className="space-y-5" onSubmit={async e => {
      e.preventDefault();
      if (sending || !tipo || !titulo.trim() || !descripcion.trim()) return;
      setSending(true); setError('');
      try {
        const result = await incidenciasService.crear({ envio_id: envio, tipo, titulo: titulo.trim(), descripcion: descripcion.trim() });
        setSent(result.id_incidencia);
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo enviar el reporte. Intenta nuevamente.'); }
      finally { setSending(false); }
    }}>
      <div>
        <label htmlFor="incident-type" className="block text-sm font-bold text-[#1C1135] mb-2">Tipo de incidencia</label>
        <select id="incident-type" required disabled={sending} value={tipo} className={fields} onChange={e => { setTipo(e.target.value); changed(); }}>
          <option value="" disabled>Selecciona el tipo de problema</option>
          {tiposIncidencia.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="incident-title" className="block text-sm font-bold text-[#1C1135] mb-2">Título</label>
        <input id="incident-title" required maxLength={120} disabled={sending} value={titulo} className={fields}
          placeholder="Ej.: El botón de guardar no responde" onChange={e => { setTitulo(e.target.value); changed(); }} />
      </div>
      <div>
        <label htmlFor="incident-description" className="block text-sm font-bold text-[#1C1135] mb-2">Descripción breve</label>
        <textarea id="incident-description" required maxLength={600} rows={4} disabled={sending} value={descripcion}
          className={`${fields} resize-y`} aria-describedby="incident-help"
          placeholder="Indica la sección, qué ocurrió y qué esperabas." onChange={e => { setDescripcion(e.target.value); changed(); }} />
        <p id="incident-help" className="mt-2 text-xs text-[#625779]">Hasta 600 caracteres. Evita incluir contraseñas o información clínica.</p>
      </div>
      {error && <p role="alert" className="text-sm text-red-800 bg-red-50 p-3 rounded-xl">{error} Tu borrador se conserva.</p>}
      <Btn type="submit" disabled={sending || !tipo || !titulo.trim() || !descripcion.trim()}>{sending ? 'Enviando…' : 'Enviar a administración'}</Btn>
    </form>}
  </section>;
}
