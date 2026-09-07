import React, { useState } from 'react';
import {
  Users,
  Calendar,
  AlertTriangle,
  Download,
  Plus,
  FileCheck2,
  Clock,
  MessageSquare,
  HelpCircle,
  FolderDown,
  ArrowUpRight,
  Filter,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import type { Evidence, Ficha, UserProfile } from '../types';

interface InstructorDashboardProps {
  instructor?: UserProfile | null;
  fichas: Ficha[];
  evidences: Evidence[];
  onEvaluateEvidence: (evidence: Evidence) => void;
  onOpenNewTaskModal: () => void;
  onOpenFormatsModal: () => void;
  onOpenMessagesModal: () => void;
  onViewAllEvidences?: () => void;
  onNavigateToAprendices?: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  instructor,
  fichas,
  evidences,
  onEvaluateEvidence,
  onOpenNewTaskModal,
  onOpenFormatsModal,
  onOpenMessagesModal,
  onViewAllEvidences,
  onNavigateToAprendices,
}) => {
  const [exported, setExported] = useState(false);

  // Filter pending review evidences
  const pendingEvidences = evidences.filter((e) => e.status === 'En revisión');
  const totalAssignedStudents = fichas.reduce((acc, f) => acc + f.total_students, 0);

  const instructorName = instructor?.full_name || 'Instructor SENA';
  const instructorEmail = instructor?.email || 'instructor@sena.edu.co';

  const handleExportReport = () => {
    setExported(true);
    // Simulate generating report
    const reportData = `REPORTE CONSOLIDADO ETAPA PRODUCTIVA SENA
Regional: Antioquia - Centro de Comercio
Instructor: ${instructorName} (${instructorEmail})
Fecha de emisión: ${new Date().toLocaleDateString('es-CO')}
Fichas asignadas: ${fichas.map((f) => `${f.code} (${f.name})`).join(', ')}
Total aprendices: ${totalAssignedStudents}
Evidencias pendientes de revisión: ${pendingEvidences.length}

EVIDENCIAS RECIENTES:
${evidences
  .map(
    (e, idx) =>
      `${idx + 1}. [${e.status.toUpperCase()}] ${e.student_name} (${e.ficha_code}) - ${e.title} - ${e.upload_date}`,
  )
  .join('\n')}
`;

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Instructor_${instructorName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header with Breadcrumb & Action buttons (Image 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            Panel Principal
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Dashboard del Instructor
          </h1>
        </div>

        {/* Top Action Buttons (Image 6) */}
        <div className="flex items-center gap-3">
          <button
            id="instructor-export-report-btn"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 text-slate-200 text-xs font-semibold shadow-md transition-all hover:border-white/20"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>{exported ? '¡Reporte Generado!' : 'Exportar Reporte'}</span>
          </button>

          <button
            id="instructor-new-task-btn"
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards (Image 6) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Aprendices Asignados */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-indigo-300 border border-white/10">
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" /> 12%
            </span>
          </div>

          <div className="my-4">
            <span className="text-5xl font-black tracking-tight text-white">
              {totalAssignedStudents || 45}
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Aprendices Asignados
          </div>
        </div>

        {/* Metric 2: Evidencias Por Revisar */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Urgent
            </span>
          </div>

          <div className="my-4">
            <span className="text-5xl font-black tracking-tight text-white">
              {pendingEvidences.length > 0 ? pendingEvidences.length : 18}
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Evidencias Por Revisar
          </div>
        </div>

        {/* Metric 3: Alertas de Inactividad */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <span className="text-5xl font-black tracking-tight text-rose-500">
              4
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Alertas de Inactividad
          </div>
        </div>
      </div>

      {/* Main Grid: Left Evidencias Recientes, Right Accesos Rápidos & Fichas Asignadas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Evidencias Recientes (Image 6) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-bold text-white">
              Evidencias Recientes
            </h2>
            <button
              onClick={() => {
                if (onViewAllEvidences) {
                  onViewAllEvidences();
                } else {
                  alert('Visualizando todo el archivo de evidencias.');
                }
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          {/* Table (Image 6) */}
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Aprendiz</th>
                  <th className="py-3 px-3">Evidencia</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {evidences.slice(0, 5).map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Aprendiz column with round initials badge */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                          {ev.student_initials ||
                            ev.student_name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200 group-hover:text-white transition-colors block">
                            {ev.student_name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {ev.ficha_code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Evidencia title */}
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-200 text-sm">
                        {ev.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {ev.type}
                      </p>
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-3 text-xs text-slate-400 whitespace-nowrap">
                      {ev.upload_date}
                    </td>

                    {/* Acción: [ Evaluar ] */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        id={`evaluate-btn-${ev.id}`}
                        onClick={() => onEvaluateEvidence(ev)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
                      >
                        Evaluar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Accesos Rápidos & Fichas Asignadas (Image 6) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Accesos Rápidos (2x2 Grid) */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">
              Accesos Rápidos
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Cronograma */}
              <button
                onClick={() =>
                  alert('Cronograma de visitas y entregas SENA 2024-2025 cargado.')
                }
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.06] hover:border-white/20 transition-all text-center group cursor-pointer"
              >
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-200">
                  Cronograma
                </span>
              </button>

              {/* Formatos */}
              <button
                id="quick-access-formatos-btn"
                onClick={onOpenFormatsModal}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.06] hover:border-white/20 transition-all text-center group cursor-pointer"
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                  <FolderDown className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-200">
                  Formatos
                </span>
              </button>

              {/* Mensajes */}
              <button
                id="quick-access-mensajes-btn"
                onClick={onOpenMessagesModal}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.06] hover:border-white/20 transition-all text-center group cursor-pointer"
              >
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-200">
                  Mensajes
                </span>
              </button>

              {/* Soporte */}
              <button
                onClick={() =>
                  alert('Mesa de Ayuda SENA: soporte@sena.edu.co o línea gratuita nacional 018000910270.')
                }
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.06] hover:border-white/20 transition-all text-center group cursor-pointer"
              >
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-200">
                  Soporte
                </span>
              </button>
            </div>
          </div>

          {/* Fichas Asignadas (Image 6) */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">
              Fichas Asignadas
            </h3>

            <div className="space-y-4">
              {fichas.map((ficha) => (
                <div
                  key={ficha.code}
                  onClick={() => onNavigateToAprendices && onNavigateToAprendices()}
                  className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all space-y-3 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {ficha.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {ficha.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium line-clamp-1">
                    {ficha.name}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Users className="w-3.5 h-3.5" />
                        {ficha.total_students} Aprendices
                      </span>
                      <span className="text-emerald-400 font-semibold text-[11px]">
                        Progreso: {ficha.progress_percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${ficha.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
