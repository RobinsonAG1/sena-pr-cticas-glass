import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  ExternalLink,
  Award,
  CheckCircle2,
  Clock,
  Building2,
  Edit,
  Sparkles,
  Save,
  ChevronRight,
} from 'lucide-react';
import type { Ficha, ApprenticeItem, Empresa } from '../types';
import { mockApprentices, mockEmpresas, fetchApprentices, fetchEmpresas } from '../lib/supabase';

interface InstructorAprendicesViewProps {
  fichas: Ficha[];
  empresas?: Empresa[];
}

export const InstructorAprendicesView: React.FC<InstructorAprendicesViewProps> = ({
  fichas,
  empresas = mockEmpresas,
}) => {
  const [selectedFicha, setSelectedFicha] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [apprenticesList, setApprenticesList] = useState<ApprenticeItem[]>(mockApprentices);
  const [empresasList, setEmpresasList] = useState<Empresa[]>(empresas);

  // Load apprentices & empresas from Supabase (mock fallback)
  useEffect(() => {
    let cancelled = false;
    const loadRemote = async () => {
      const [remoteApprentices, remoteEmpresas] = await Promise.all([fetchApprentices(), fetchEmpresas()]);
      if (cancelled) return;
      if (remoteApprentices.length > 0) setApprenticesList(remoteApprentices);
      if (remoteEmpresas.length > 0) setEmpresasList(remoteEmpresas);
    };
    loadRemote();
    return () => {
      cancelled = true;
    };
  }, []);

  // Modal for assigning company
  const [assigningApprentice, setAssigningApprentice] = useState<ApprenticeItem | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | number>(empresasList[0]?.id || 1);

  // Modal for updating hours & status
  const [updatingApprentice, setUpdatingApprentice] = useState<ApprenticeItem | null>(null);
  const [newHours, setNewHours] = useState<number>(0);
  const [newStatus, setNewStatus] = useState<ApprenticeItem['status']>('Al día');
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  const filtered = apprenticesList.filter((a) => {
    const matchesFicha = selectedFicha === 'all' || a.ficha === selectedFicha;
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.company_name && a.company_name.toLowerCase().includes(search.toLowerCase()));
    return matchesFicha && matchesSearch;
  });

  const selectedEmpresas = empresasList.length > 0 ? empresasList : empresas;

  const handleOpenAssignCompany = (app: ApprenticeItem) => {
    setAssigningApprentice(app);
    setSelectedCompanyId(app.company_id || selectedEmpresas[0]?.id || 1);
  };

  const handleSaveCompanyAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningApprentice) return;

    const chosenEmpresa = selectedEmpresas.find((e) => String(e.id) === String(selectedCompanyId));
    const companyName = chosenEmpresa ? chosenEmpresa.nombre : 'Empresa Asignada';

    setApprenticesList((prev) =>
      prev.map((a) =>
        a.id === assigningApprentice.id
          ? { ...a, company_id: selectedCompanyId, company_name: companyName }
          : a
      )
    );

    setNotificationSuccess(`✓ Empresa "${companyName}" asignada a ${assigningApprentice.name}`);
    setAssigningApprentice(null);
    setTimeout(() => setNotificationSuccess(null), 3500);
  };

  const handleOpenUpdateHours = (app: ApprenticeItem) => {
    setUpdatingApprentice(app);
    setNewHours(app.hours);
    setNewStatus(app.status);
  };

  const handleSaveHoursUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingApprentice) return;

    setApprenticesList((prev) =>
      prev.map((a) =>
        a.id === updatingApprentice.id
          ? { ...a, hours: Number(newHours), status: newStatus }
          : a
      )
    );

    setNotificationSuccess(`✓ Horas actualizadas para ${updatingApprentice.name}: ${newHours}h (${newStatus})`);
    setUpdatingApprentice(null);
    setTimeout(() => setNotificationSuccess(null), 3500);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Seguimiento de Aprendices
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Mis Aprendices & Control de Horas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Asigna empresas patrocinadoras y actualiza el cumplimiento de las 864 horas reglamentarias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total asignados:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
            {apprenticesList.length} Aprendices
          </span>
        </div>
      </div>

      {notificationSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notificationSuccess}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aprendiz, correo o empresa patrocinadora..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/60 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedFicha('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFicha === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
            }`}
          >
            Todas las Fichas
          </button>
          {fichas.map((f) => (
            <button
              key={f.code}
              onClick={() => setSelectedFicha(f.code)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFicha === f.code
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
              }`}
            >
              {f.code}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-3">Aprendiz</th>
              <th className="py-3 px-3">Ficha / Programa</th>
              <th className="py-3 px-3">Empresa Patrocinadora</th>
              <th className="py-3 px-3">Horas Cumplidas (864h)</th>
              <th className="py-3 px-3">Estado Práctica</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((app) => {
              const progressPct = Math.min(100, Math.round((app.hours / app.totalHours) * 100));
              return (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {app.initials || app.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-100 block">{app.name}</span>
                        <span className="text-[11px] text-slate-400">{app.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-xs text-slate-300 font-mono">{app.ficha}</td>

                  <td className="py-3.5 px-3">
                    {app.company_name ? (
                      <span className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>{app.company_name}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 italic">Sin empresa asignada</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-white">{app.hours} / {app.totalHours} hrs</span>
                        <span className="text-emerald-400 font-semibold text-[11px]">{progressPct}%</span>
                      </div>
                      <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'Al día'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : app.status === 'Plan de Mejora'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenAssignCompany(app)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-600/30 border border-white/10 hover:border-orange-500/50 text-slate-300 hover:text-orange-300 text-xs font-medium transition-colors"
                        title="Asignar o cambiar empresa"
                      >
                        <Building2 className="w-3.5 h-3.5 inline mr-1" />
                        Empresa
                      </button>

                      <button
                        onClick={() => handleOpenUpdateHours(app)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600/30 border border-white/10 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-xs font-medium transition-colors"
                        title="Actualizar horas y estado"
                      >
                        <Edit className="w-3.5 h-3.5 inline mr-1" />
                        Horas
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Asignar Empresa */}
      {assigningApprentice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0b1326] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <span>Asignar Empresa Patrocinadora</span>
              </h3>
              <button
                onClick={() => setAssigningApprentice(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-[11px] text-slate-400 block">Aprendiz Seleccionado:</span>
              <span className="font-bold text-white text-sm">{assigningApprentice.name}</span>
              <span className="text-xs text-slate-400 block">{assigningApprentice.email} • {assigningApprentice.ficha}</span>
            </div>

            <form onSubmit={handleSaveCompanyAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Empresa Patrocinadora Convenio SENA
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  {selectedEmpresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} (NIT: {emp.nit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setAssigningApprentice(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-lg shadow-orange-600/30"
                >
                  Guardar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Actualizar Horas y Estado */}
      {updatingApprentice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0b1326] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Actualizar Horas & Estado de Práctica</span>
              </h3>
              <button
                onClick={() => setUpdatingApprentice(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-[11px] text-slate-400 block">Aprendiz:</span>
              <span className="font-bold text-white text-sm">{updatingApprentice.name}</span>
              <span className="text-xs text-slate-400 block">Ficha: {updatingApprentice.ficha}</span>
            </div>

            <form onSubmit={handleSaveHoursUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Horas Cumplidas (Máximo 864h)
                </label>
                <input
                  type="number"
                  min="0"
                  max="864"
                  required
                  value={newHours}
                  onChange={(e) => setNewHours(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estado de la Etapa Productiva
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Al día">Al día</option>
                  <option value="En seguimiento">En seguimiento</option>
                  <option value="Plan de Mejora">Plan de Mejora</option>
                  <option value="Finalizada">Finalizada</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setUpdatingApprentice(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
