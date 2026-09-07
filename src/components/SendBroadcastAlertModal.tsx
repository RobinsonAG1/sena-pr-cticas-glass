import React, { useState } from 'react';
import { X, Send, Bell, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Ficha, UserProfile } from '../types';

interface SendBroadcastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichas: Ficha[];
  currentUser?: UserProfile | null;
  onAlertSent?: (alert: { destino: string; mensaje: string }) => void;
}

export const SendBroadcastAlertModal: React.FC<SendBroadcastAlertModalProps> = ({
  isOpen,
  onClose,
  fichas,
  currentUser,
  onAlertSent,
}) => {
  if (!isOpen) return null;

  const [destino, setDestino] = useState('todos');
  const [mensaje, setMensaje] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    onAlertSent?.({
      destino,
      mensaje: mensaje.trim(),
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setMensaje('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-panel rounded-2xl shadow-2xl border border-white/10 p-6 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Enviar Alerta a Aprendices</h3>
              <p className="text-[11px] text-slate-400">Notificación masiva o por ficha técnica</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            <span>¡Alerta enviada correctamente a los aprendices!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Destinatarios
              </label>
              <select
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="todos">Todos mis aprendices asignados</option>
                {fichas.map((f) => (
                  <option key={f.code} value={f.code}>
                    Ficha {f.code} ({f.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mensaje de la Alerta / Comunicado <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe el recordatorio o aviso para los aprendices..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!mensaje.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Alerta</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
