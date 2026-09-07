import React from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, AlertTriangle, Download, PieChart, FileText } from 'lucide-react';
import type { Ficha } from '../types';

interface InstructorReportesViewProps {
  fichas: Ficha[];
}

export const InstructorReportesView: React.FC<InstructorReportesViewProps> = ({ fichas }) => {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Métricas de Desempeño
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Reportes y Estadísticas de Seguimiento
          </h1>
        </div>

        <button
          onClick={() => alert('Generando informe ejecutivo consolidado en formato PDF...')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Descargar Consolidado Fichas</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tasa de Certificación</span>
          <div className="text-3xl font-black text-emerald-400 mt-2">88.5%</div>
          <p className="text-[11px] text-slate-500 mt-1">Cumplimiento en tiempo regular</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Bitácoras Revisadas</span>
          <div className="text-3xl font-black text-white mt-2">142</div>
          <p className="text-[11px] text-slate-500 mt-1">Durante el trimestre actual</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Visitas Ejecutadas</span>
          <div className="text-3xl font-black text-indigo-400 mt-2">38 / 45</div>
          <p className="text-[11px] text-slate-500 mt-1">84% de cobertura completada</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Planes de Mejora</span>
          <div className="text-3xl font-black text-rose-400 mt-2">4</div>
          <p className="text-[11px] text-slate-500 mt-1">En acompañamiento activo</p>
        </div>
      </div>

      {/* Fichas Progress Comparison */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-white">Progreso por Ficha de Formación</h3>

        <div className="space-y-4">
          {fichas.map((f) => (
            <div key={f.code} className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="font-bold text-white text-sm">{f.code} - {f.name}</h4>
                  <p className="text-xs text-slate-400">{f.total_students} aprendices vinculados con contrato de aprendizaje</p>
                </div>
                <span className="text-emerald-400 font-extrabold text-sm">{f.progress_percentage}% completado</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                  style={{ width: `${f.progress_percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
