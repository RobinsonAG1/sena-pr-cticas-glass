import React from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Download, Clock, UserCheck, Calendar } from 'lucide-react';
import type { Evidence } from '../types';

interface EvidenceDetailModalProps {
  evidence: Evidence | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  evidence,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10 relative text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{evidence.title}</h2>
            <p className="text-xs text-slate-400">
              {evidence.type} • {evidence.ficha_code}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Estado Oficial</span>
              {evidence.status === 'Aprobado' ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
                </span>
              ) : evidence.status === 'Observaciones' ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Observaciones
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> En revisión
                </span>
              )}
            </div>

            {evidence.description && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Descripción
                </span>
                <p className="text-xs text-slate-200">{evidence.description}</p>
              </div>
            )}

            {evidence.feedback && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-indigo-500/30">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Retroalimentación del Instructor ({evidence.evaluated_by || 'Carlos Restrepo'})
                </span>
                <p className="text-xs text-slate-200 italic">"{evidence.feedback}"</p>
                {evidence.evaluated_at && (
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Calificado el {evidence.evaluated_at}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-white/[0.06]">
              <div>
                <span className="text-slate-400 block text-[11px]">Horas Computadas:</span>
                <strong className="text-white text-sm">{evidence.hours} horas</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Fecha de Radicación:</span>
                <strong className="text-white text-sm">{evidence.upload_date}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">{evidence.file_name}</span>
                <span className="text-slate-400">{evidence.file_size || '2.1 MB'}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Descargando copia de respaldo: ${evidence.file_name}`)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
