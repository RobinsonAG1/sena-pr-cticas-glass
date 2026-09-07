import React, { useState } from 'react';
import { X, Plus, Calendar, Users, CheckCircle2 } from 'lucide-react';
import type { Ficha } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichas: Ficha[];
  onTaskCreated: (task: { title: string; ficha: string; deadline: string }) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  fichas,
  onTaskCreated,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [ficha, setFicha] = useState(fichas[0]?.code || 'ADSO 2673890');
  const [deadline, setDeadline] = useState('2023-11-15');
  const [instructions, setInstructions] = useState('');
  const [created, setCreated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTaskCreated({ title, ficha, deadline });
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      onClose();
      setTitle('');
      setInstructions('');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Nueva Tarea Formativa</h2>
            <p className="text-xs text-slate-400">
              Asigna una entrega o requerimiento a las fichas en etapa productiva.
            </p>
          </div>
        </div>

        {created ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-white">¡Tarea asignada exitosamente!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Título de la Asignación
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Entrega Bitácora #5 y Certificado ARL"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ficha Destino
                </label>
                <select
                  value={ficha}
                  onChange={(e) => setFicha(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {fichas.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.code}
                    </option>
                  ))}
                  <option value="TODAS">Todas las Fichas</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Instrucciones Adicionales
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Indica formato requerido, criterios de aceptación o firmas necesarias..."
                className="w-full p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                Crear Asignación
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
