import React, { useState } from 'react';
import { FileText, Search, Filter, Plus, Download, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { Evidence, EvidenceStatus } from '../types';

interface AprendizEvidenciasViewProps {
  evidences: Evidence[];
  onOpenUpload: () => void;
  onViewEvidenceDetail: (evidence: Evidence) => void;
}

export const AprendizEvidenciasView: React.FC<AprendizEvidenciasViewProps> = ({
  evidences,
  onOpenUpload,
  onViewEvidenceDetail,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filtered = evidences.filter((ev) => {
    const matchesStatus = filterStatus === 'all' || ev.status === filterStatus;
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.type.toLowerCase().includes(search.toLowerCase()) ||
      ev.file_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Portafolio de Evidencias
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Mis Evidencias Formativas
          </h1>
        </div>

        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Evidencia</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, tipo o archivo..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/60 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'Aprobado', 'En revisión', 'Observaciones'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
              }`}
            >
              {st === 'all' ? 'Todas' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ev) => (
          <div
            key={ev.id}
            className="glass-panel rounded-2xl p-5 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border" style={{
                  backgroundColor: ev.status === 'Aprobado' ? 'rgba(78, 222, 163, 0.15)' : ev.status === 'Observaciones' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: ev.status === 'Aprobado' ? '#4edea3' : ev.status === 'Observaciones' ? '#ef4444' : '#f59e0b',
                  borderColor: ev.status === 'Aprobado' ? 'rgba(78, 222, 163, 0.3)' : ev.status === 'Observaciones' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                }}>
                  {ev.status}
                </span>
                <span className="text-[11px] text-slate-400">{ev.upload_date}</span>
              </div>

              <h3 className="font-bold text-base text-white">{ev.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{ev.type} • {ev.file_name}</p>

              {ev.description && (
                <p className="text-xs text-slate-300 mt-2 line-clamp-2">{ev.description}</p>
              )}

              {ev.feedback && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300">
                  <span className="font-semibold text-indigo-300 block mb-0.5">Comentario del instructor:</span>
                  <p className="italic">{ev.feedback}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <span className="text-xs text-slate-400">
                {ev.hours > 0 ? <strong>{ev.hours} hrs computadas</strong> : 'Documento administrativo'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewEvidenceDetail(ev)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ver</span>
                </button>
                <button
                  onClick={() => alert(`Descargando archivo: ${ev.file_name}`)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="Descargar"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
