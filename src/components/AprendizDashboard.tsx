import React, { useState } from 'react';
import {
  Clock,
  CheckCircle,
  RefreshCw,
  FileText,
  MoreVertical,
  ChevronRight,
  Send,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Eye,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Evidence, UserProfile, EvidenceStatus } from '../types';

interface AprendizDashboardProps {
  user?: UserProfile | null;
  evidences: Evidence[];
  onOpenUploadModal: () => void;
  onOpenMessageModal: () => void;
  onViewEvidenceDetail: (evidence: Evidence) => void;
  onViewAllEvidences?: () => void;
}

export const AprendizDashboard: React.FC<AprendizDashboardProps> = ({
  user,
  evidences,
  onOpenUploadModal,
  onOpenMessageModal,
  onViewEvidenceDetail,
  onViewAllEvidences,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const safeUser = user || {
    total_hours: 480,
    required_hours: 864,
    approved_evidences_count: 12,
    practice_status: 'En Proceso',
    days_remaining: 48,
    end_date: '15 Dic, 2023',
    progress_percentage: 55,
    assigned_instructor_name: 'Carlos Arturo Restrepo',
    assigned_instructor_email: 'carlos.restrepo@sena.edu.co',
    assigned_instructor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  // Status badge styling helper
  const renderStatusBadge = (status: EvidenceStatus) => {
    switch (status) {
      case 'Aprobado':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Aprobado
          </span>
        );
      case 'En revisión':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            En revisión
          </span>
        );
      case 'Observaciones':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Observaciones
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumbs & Header (Image 4) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>SENA Prácticas</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span>Aprendiz</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200">Dashboard</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Panel Principal del Aprendiz
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Resumen general de tu etapa productiva.
            </p>
          </div>

          <button
            id="upload-evidence-cta-btn"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer self-start sm:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Subir Nueva Evidencia</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards (Image 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Horas Registradas */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-sm font-semibold text-slate-200">
              Total Horas Registradas
            </span>
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="my-4">
            <span className="text-5xl font-black tracking-tight text-white">
              {safeUser.total_hours}
            </span>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(100, ((safeUser.total_hours || 0) / (safeUser.required_hours || 864)) * 100)}%`,
                }}
              />
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {safeUser.total_hours} / {safeUser.required_hours} HRS
            </div>
          </div>
        </div>

        {/* Metric 2: Evidencias Aprobadas */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-sm font-semibold text-slate-200">
              Evidencias Aprobadas
            </span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="my-4">
            <span className="text-5xl font-black tracking-tight text-white">
              {safeUser.approved_evidences_count}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
              Bitácoras
            </span>
            <span>revisadas y confirmadas.</span>
          </div>
        </div>

        {/* Metric 3: Estado de Práctica */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-sm font-semibold text-slate-200">
              Estado de Práctica
            </span>
            <RefreshCw className="w-5 h-5 text-amber-400" />
          </div>

          <div className="my-4">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-400">
              {safeUser.practice_status}
            </span>
          </div>

          <div className="text-xs text-slate-400 pt-2">
            Mantén el ritmo, estás al día con tus entregas.
          </div>
        </div>
      </div>

      {/* Main Grid: Left Evidencias Table, Right Resumen & Instructor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Últimas Evidencias Subidas (Image 4) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-bold text-white">
              Últimas Evidencias Subidas
            </h2>
            <button
              onClick={() => {
                if (onViewAllEvidences) {
                  onViewAllEvidences();
                } else {
                  alert('Mostrando todas las evidencias del periodo.');
                }
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Tipo de Evidencia</th>
                  <th className="py-3 px-3">Fecha de Subida</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {evidences.slice(0, 5).map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-indigo-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {ev.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {ev.file_name} • {ev.hours > 0 ? `${ev.hours} hrs reportadas` : 'Documento oficial'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-400 whitespace-nowrap">
                      {ev.upload_date}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {renderStatusBadge(ev.status)}
                    </td>
                    <td className="py-3.5 px-3 text-right relative">
                      <button
                        id={`evidence-action-menu-${ev.id}`}
                        onClick={() =>
                          setActiveMenuId(activeMenuId === ev.id ? null : ev.id)
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === ev.id && (
                        <div className="absolute right-0 top-10 w-44 rounded-xl glass-panel p-1.5 shadow-xl border border-white/10 z-20 text-xs text-left">
                          <button
                            onClick={() => {
                              onViewEvidenceDetail(ev);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-200 hover:bg-white/10 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Ver detalles</span>
                          </button>
                          <button
                            onClick={() => {
                              alert(`Descargando archivo institucional: ${ev.file_name}`);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-200 hover:bg-white/10 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Descargar copia</span>
                          </button>
                          {ev.feedback && (
                            <div className="px-2.5 py-2 border-t border-white/10 text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-200 block mb-0.5">Observación:</span>
                              <span className="italic">{ev.feedback}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Resumen de Progreso & Instructor (Image 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Resumen de Progreso */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            {/* Background circular graphic decorative element matching Image 4 */}
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full border border-white/[0.05] pointer-events-none flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-white/[0.06] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-white/[0.08]" />
              </div>
            </div>

            <h3 className="text-base font-bold text-white mb-4 relative z-10">
              Resumen de Progreso
            </h3>

            {/* Avance Total Bar */}
            <div className="space-y-2 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Avance Total</span>
                <span className="text-indigo-400 font-bold text-sm">
                  {safeUser.progress_percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-800/90 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${safeUser.progress_percentage}%` }}
                />
              </div>
            </div>

            {/* Days remaining and end date */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/[0.08] relative z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Días Restantes
                </span>
                <span className="text-3xl font-extrabold text-white mt-1 block">
                  {safeUser.days_remaining}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Fecha de Fin
                </span>
                <span className="text-sm font-semibold text-slate-200 mt-2 block">
                  {safeUser.end_date}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Instructor Asignado (Image 4) */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">
              Instructor Asignado
            </h3>

            <div className="flex items-center gap-3.5 mb-5">
              <img
                src={
                  safeUser.assigned_instructor_avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={safeUser.assigned_instructor_name || 'Instructor'}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-100 truncate">
                  {safeUser.assigned_instructor_name}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {safeUser.assigned_instructor_email}
                </p>
                <span className="inline-block mt-1 text-[10px] text-emerald-400 font-medium">
                  ● Instructor de Seguimiento
                </span>
              </div>
            </div>

            <button
              id="send-message-instructor-btn"
              onClick={onOpenMessageModal}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-indigo-500/40"
            >
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enviar Mensaje</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
