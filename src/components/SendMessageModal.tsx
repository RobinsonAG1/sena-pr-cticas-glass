import React, { useState } from 'react';
import { X, Send, User, CheckCheck } from 'lucide-react';
import type { UserProfile } from '../types';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [message, setMessage] = useState('');
  const [messagesList, setMessagesList] = useState<
    Array<{ id: string; sender: string; text: string; time: string; isMe: boolean }>
  >([
    {
      id: '1',
      sender: 'Carlos Arturo Restrepo',
      text: 'Buenas tardes. Recuerda subir la bitácora #4 antes del viernes para consolidar el reporte mensual.',
      time: '10:30 AM',
      isMe: false,
    },
    {
      id: '2',
      sender: currentUser?.full_name || 'Usuario SENA',
      text: 'Buenas tardes instructor Carlos. Ya la tengo lista con la firma de mi jefe, en breve la adjunto.',
      time: '11:15 AM',
      isMe: true,
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessagesList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: currentUser?.full_name || 'Usuario SENA',
        text: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      },
    ]);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-panel rounded-2xl shadow-2xl border border-white/10 flex flex-col h-[520px] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Instructor"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
            />
            <div>
              <h3 className="font-bold text-sm text-white">Carlos Arturo Restrepo</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Instructor En Línea • Regional Antioquia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messagesList.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.isMe
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-white/5'
                }`}
              >
                <p>{msg.text}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1">
                <span>{msg.time}</span>
                {msg.isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-white/[0.08] flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje al instructor..."
            className="flex-1 h-10 px-3.5 rounded-xl bg-slate-800/90 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
