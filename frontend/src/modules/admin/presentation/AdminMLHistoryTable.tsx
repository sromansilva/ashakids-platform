import { Clock, FileText } from 'lucide-react';

interface HistoryItem {
  id: number;
  archivo: string;
  fecha: string;
}

interface AdminMLHistoryTableProps {
  history: HistoryItem[];
}

export function AdminMLHistoryTable({ history }: AdminMLHistoryTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-[#E8E5F4] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1C1135]">Archivos procesados en esta vista</h2>
            <p className="text-xs text-[#615274]">Lista temporal del navegador; no es un historial clínico guardado.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#F8F7FD] border-b border-[#E8E5F4] text-xs font-extrabold text-[#615274]">
              <th className="py-4 px-6">Archivo de audio</th>
              <th className="py-4 px-6">Procesado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E5F4] text-sm">
            {history.map(item => (
              <tr key={item.id} className="hover:bg-[#F9F8FD] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-[#8C82A8]" />
                    <span className="font-extrabold text-[#1C1135]">{item.archivo}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-[#615274] font-medium">{item.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && <p className="p-6 text-sm text-[#615274]">Todavía no se procesó ningún archivo en esta página.</p>}
      </div>
    </div>
  );
}

