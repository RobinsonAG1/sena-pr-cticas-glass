import React from 'react';
import { TrendingUp, Clock, CheckCircle2, AlertCircle, Calendar, Award, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../types';

interface AprendizProgresoViewProps {
  user?: UserProfile | null;
  onOpenUpload: () => void;
}

export const AprendizProgresoView: React.FC<AprendizProgresoViewProps> = ({
  user,
  onOpenUpload,
}) => {
  const safeUser = user || {
    total_hours: 480,
    required_hours: 864,
    progress_percentage: 55,
    days_remaining: 48,
    end_date: '15 Dic, 2023',
  };
  const milestones = [
    {
      title: 'Concertación de Plan de Trabajo (F023)',
      status: 'completado',
      date: '05 Jul, 2023',
      desc: 'Formulario inicial diligenciado con la empresa patrocinadora.',
    },
    {
      title: 'Primera Visita de Seguimiento Virtual',
      status: 'completado',
      date: '15 Ago, 2023',
      desc: 'Entrevista con el instructor Carlos Restrepo y el jefe inmediato.',
    },
    {
      title: 'Corte Intermedio 400 Horas',
      status: 'completado',
      date: '30 Sep, 2023',
      desc: 'Revisión acumulativa de bitácoras 1 a 4 aprobadas.',
    },
    {
      title: 'Segunda Visita Presencial de Seguimiento',
      status: 'en_progreso',
      date: '10 Nov, 2023',
      desc: 'Verificación in situ de las competencias técnicas en desarrollo.',
    },
    {
      title: 'Evaluación Final y Paz y Salvo Etapa Productiva',
      status: 'pendiente',
      date: '15 Dic, 2023',
      desc: 'Firma de formato F023 definitivo y cierre administrativo.',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-left">
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Aprendiz • Seguimiento Horas
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Mi Progreso en Etapa Productiva
        </h1>
        <p className="text-sm text-slate-400">
          Registro detallado de horas lectivas y productivas para certificación SENA.
        </p>
      </div>

      {/* Progress metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between text-slate-300 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Horas Acumuladas</span>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-4xl font-black text-white">{safeUser.total_hours}</div>
          <p className="text-xs text-slate-400 mt-2">de {safeUser.required_hours} horas reglamentarias</p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between text-slate-300 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Porcentaje Global</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-4xl font-black text-emerald-400">{safeUser.progress_percentage}%</div>
          <p className="text-xs text-slate-400 mt-2">Días restantes: {safeUser.days_remaining}</p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between text-slate-300 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Certificación</span>
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">En Curso</div>
          <p className="text-xs text-slate-400 mt-2">Cierre proyectado: {safeUser.end_date}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-6">Hitos y Visitas de Seguimiento</h3>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-white/10">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative flex items-start gap-4 pl-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                m.status === 'completado'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : m.status === 'en_progreso'
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                  : 'bg-slate-800 text-slate-500 border border-white/10'
              }`}>
                {m.status === 'completado' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              <div className="flex-1 p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4 className="font-semibold text-sm text-slate-200">{m.title}</h4>
                  <span className="text-[11px] text-slate-400 font-medium">{m.date}</span>
                </div>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
