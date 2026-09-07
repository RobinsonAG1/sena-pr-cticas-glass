import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, FileText, Download, User, MessageSquare } from 'lucide-react';
import type { Evidence, EvidenceStatus } from '../types';

interface EvaluateModalProps {
  evidence: Evidence | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveEvaluation: (evidenceId: string, status: EvidenceStatus, feedback: string) => void;
}

export const EvaluateModal: React.FC<EvaluateModalProps> = ({
  evidence,
  isOpen,
  onClose,
  onSaveEvaluation,
}) => {
  if (!isOpen || !evidence) return null;

  const [status, setStatus] = useState<EvidenceStatus>(
    evidence.status === 'En revisión' ? 'Aprobado' : evidence.status,
  );
  const [feedback, setFeedback] = useState(evidence.feedback || '');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSaveEvaluation(evidence.id, status, feedback);
      setSaving(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Evaluación de Evidencia
            </h2>
            <p className="text-xs text-slate-400">
              {evidence.ficha_code} • Aprendiz: {evidence.student_name}
            </p>
          </div>
        </div>

        {/* Evidence Card Overview */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] mb-5 space-y-2.5">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-sm text-slate-100">{evidence.title}</h4>
              <span className="text-xs text-slate-400">{evidence.type}</span>
            </div>
            <button
              onClick={() => alert(`Descargando archivo para revisión: ${evidence.file_name}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-white/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar</span>
            </button>
          </div>

          {evidence.description && (
            <p className="text-xs text-slate-300 italic border-l-2 border-indigo-500/40 pl-2 py-0.5">
              "{evidence.description}"
            </p>
          )}

          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span>Archivo: <strong className="text-slate-200">{evidence.file_name}</strong></span>
            {evidence.hours > 0 && <span>Horas: <strong className="text-indigo-300">{evidence.hours} hrs</strong></span>}
            <span>Fecha: <strong className="text-slate-300">{evidence.upload_date}</strong></span>
          </div>
        </div>

        {/* Grading Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Dictamen de Evaluación
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('Aprobado')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                  status === 'Aprobado'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Aprobar Evidencia</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Observaciones')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                  status === 'Observaciones'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/20'
                    : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Con Observaciones</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Retroalimentación para el Aprendiz
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Indica comentarios formativos, felicitaciones o correcciones puntuales requeridas..."
              className="w-full p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              {saving ? 'Guardando...' : 'Guardar Calificación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
