import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  TrendingUp,
  FileText,
  Users,
  BarChart3,
  Building2,
  Clock,
  LogOut,
  FolderOpen,
  CheckSquare,
  CalendarPlus,
  BookOpen,
  Database,
  ShieldCheck,
  GraduationCap,
  Bell,
  Briefcase,
  History,
  FileCheck,
} from 'lucide-react';
import { SenaLogo } from './SenaLogo';
import type { UserProfile, UserRole } from '../types';

export interface SidebarProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  currentUser?: UserProfile | null;
  currentRole?: UserRole;
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onLogout: () => void;
  onOpenUploadModal?: () => void;
  onOpenFormatsModal?: () => void;
  onOpenNewTaskModal?: () => void;
  onOpenAlertModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  setActiveTab,
  currentUser,
  currentRole,
  userRole,
  onRoleChange,
  onLogout,
  onOpenUploadModal,
  onOpenFormatsModal,
  onOpenNewTaskModal,
  onOpenAlertModal,
}) => {
  const effectiveRole: UserRole = currentRole || userRole || currentUser?.role || 'aprendiz';
  const isRealAdmin = currentUser?.role === 'admin';

  const handleTabClick = (tabKey: string) => {
    if (onTabChange) {
      onTabChange(tabKey);
    } else if (setActiveTab) {
      setActiveTab(tabKey);
    }
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    if (isRealAdmin && onRoleChange) {
      onRoleChange(newRole);
    }
  };

  const userName = currentUser?.full_name || 'Usuario SENA';
  const userEmail = currentUser?.email || 'usuario@sena.edu.co';
  const userInitials =
    userName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('') || 'US';

  // Role details config
  const roleConfig = {
    aprendiz: {
      badge: 'APRENDIZ',
      title: 'Etapa Productiva (864h)',
      subtitle: currentUser?.ficha_code || 'ADSO 2673890',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: GraduationCap,
      accentColor: 'indigo',
    },
    instructor: {
      badge: 'INSTRUCTOR',
      title: 'Seguimiento Técnico',
      subtitle: currentUser?.regional || 'Regional Antioquia',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: Users,
      accentColor: 'emerald',
    },
    admin: {
      badge: 'ADMINISTRADOR',
      title: 'Coordinación Académica',
      subtitle: 'Gestión Global de Centro',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: ShieldCheck,
      accentColor: 'amber',
    },
  }[effectiveRole];

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[#070e1e] border-r border-white/[0.08] flex flex-col justify-between select-none z-40 text-left">
      {/* Top Header & Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-white/[0.06] bg-[#091124]">
          <SenaLogo size="sm" showText={true} />
        </div>

        {/* Active Role Indicator Banner */}
        <div className="p-3 m-3 rounded-2xl bg-slate-900/90 border border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleConfig.badgeClass}`}
            >
              <roleConfig.icon className="w-3 h-3" />
              <span>{roleConfig.badge}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Modo Activo</span>
          </div>
          <p className="text-xs font-semibold text-white truncate">{roleConfig.title}</p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{roleConfig.subtitle}</p>
        </div>

        {/* Separated Navigation Links strictly by role */}
        <div className="px-3 py-2 space-y-4 flex-1">
          {/* APRENDIZ MENU */}
          {effectiveRole === 'aprendiz' && (
            <div>
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                <span>Menú Aprendiz</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300">F023</span>
              </div>
              <nav className="space-y-1">
                <button
                  id="sidebar-nav-aprendiz-dashboard"
                  onClick={() => handleTabClick('dashboard')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'dashboard' || activeTab === 'aprendiz-dashboard'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Mi Dashboard</span>
                </button>

                <button
                  id="sidebar-nav-aprendiz-subir"
                  onClick={() => {
                    handleTabClick('dashboard');
                    onOpenUploadModal?.();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-emerald-500/10 group"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Radicar Evidencia</span>
                </button>

                <button
                  id="sidebar-nav-aprendiz-evidencias"
                  onClick={() => handleTabClick('evidencias')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'evidencias' || activeTab === 'aprendiz-evidencias'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Mis Evidencias</span>
                </button>

                <button
                  id="sidebar-nav-aprendiz-progreso"
                  onClick={() => handleTabClick('progreso')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'progreso' || activeTab === 'aprendiz-progreso'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Mi Progreso (864h)</span>
                </button>

                <button
                  id="sidebar-nav-aprendiz-formatos"
                  onClick={() => onOpenFormatsModal ? onOpenFormatsModal() : handleTabClick('formatos')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-white/[0.04]"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Formatos Oficiales</span>
                </button>
              </nav>
            </div>
          )}

          {/* INSTRUCTOR MENU */}
          {effectiveRole === 'instructor' && (
            <div>
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>Menú Instructor</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300">Seguimiento</span>
              </div>
              <nav className="space-y-1">
                <button
                  id="sidebar-nav-instructor-dashboard"
                  onClick={() => handleTabClick('dashboard')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'dashboard' || activeTab === 'instructor-dashboard'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Instructor</span>
                </button>

                <button
                  id="sidebar-nav-instructor-fichas"
                  onClick={() => handleTabClick('fichas')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'fichas'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Mis Fichas / Cursos</span>
                </button>

                <button
                  id="sidebar-nav-instructor-aprendices"
                  onClick={() => handleTabClick('aprendices')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'aprendices' || activeTab === 'instructor-aprendices'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Mis Aprendices & Horas</span>
                </button>

                <button
                  id="sidebar-nav-instructor-tarea"
                  onClick={() => onOpenNewTaskModal?.()}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-emerald-500/10 group"
                >
                  <CalendarPlus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Programar Visita</span>
                </button>

                <button
                  id="sidebar-nav-instructor-alertas"
                  onClick={() => (onOpenAlertModal ? onOpenAlertModal() : handleTabClick('alertas'))}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'alertas'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Bell className="w-4 h-4 text-yellow-400" />
                  <span>Enviar Alerta</span>
                </button>

                <button
                  id="sidebar-nav-instructor-reportes"
                  onClick={() => handleTabClick('reportes')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'reportes' || activeTab === 'instructor-reportes'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Reportes & Exportación</span>
                </button>

                <button
                  id="sidebar-nav-instructor-formatos"
                  onClick={() => (onOpenFormatsModal ? onOpenFormatsModal() : handleTabClick('formatos'))}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-white/[0.04]"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Plantillas Oficiales</span>
                </button>
              </nav>
            </div>
          )}

          {/* ADMINISTRADOR MENU (Superusuario) */}
          {effectiveRole === 'admin' && (
            <div>
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                <span>Administración Global</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300">Control Total</span>
              </div>
              <nav className="space-y-1">
                <button
                  id="sidebar-nav-admin-dashboard"
                  onClick={() => handleTabClick('dashboard')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'dashboard' || activeTab === 'admin-overview' || activeTab === 'admin'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 border border-amber-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Panel General</span>
                </button>

                <button
                  id="sidebar-nav-admin-fichas"
                  onClick={() => handleTabClick('fichas')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'fichas'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 border border-amber-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Fichas / Cursos</span>
                </button>

                <button
                  id="sidebar-nav-admin-usuarios"
                  onClick={() => handleTabClick('usuarios')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'usuarios' || activeTab === 'admin-usuarios'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 border border-amber-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Directorio de Usuarios</span>
                </button>

                <button
                  id="sidebar-nav-admin-instructores"
                  onClick={() => handleTabClick('instructores')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'instructores'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 border border-amber-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>Instructores</span>
                </button>

                <button
                  id="sidebar-nav-admin-empresas"
                  onClick={() => handleTabClick('empresas')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'empresas'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 border border-amber-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-orange-400" />
                  <span>Empresas Convenio</span>
                </button>

                <button
                  id="sidebar-nav-admin-historial"
                  onClick={() => handleTabClick('historial')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'historial'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 border border-amber-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <History className="w-4 h-4 text-purple-400" />
                  <span>Historial de Auditoría</span>
                </button>

                <button
                  id="sidebar-nav-admin-database"
                  onClick={() => handleTabClick('database')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'database'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 border border-amber-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Database className="w-4 h-4 text-teal-400" />
                  <span>Base de Datos & Backup</span>
                </button>
              </nav>
            </div>
          )}

          {/* Quick Role Switcher section inside Sidebar - ONLY VISIBLE IF CURRENT USER IS ADMIN */}
          {isRealAdmin && (
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Vista Supervisor (Admin):
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Override
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 px-1">
                <button
                  id="sidebar-switch-aprendiz"
                  onClick={() => handleRoleSwitch('aprendiz')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    effectiveRole === 'aprendiz'
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Supervisar Vista de Aprendiz"
                >
                  <span>🎓</span>
                  <span className="text-[10px]">Aprendiz</span>
                </button>

                <button
                  id="sidebar-switch-instructor"
                  onClick={() => handleRoleSwitch('instructor')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    effectiveRole === 'instructor'
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Supervisar Vista de Instructor"
                >
                  <span>👨‍🏫</span>
                  <span className="text-[10px]">Instructor</span>
                </button>

                <button
                  id="sidebar-switch-admin"
                  onClick={() => handleRoleSwitch('admin')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    effectiveRole === 'admin'
                      ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Panel Completo Administrador"
                >
                  <span>🛡️</span>
                  <span className="text-[10px]">Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Card Bottom */}
      <div className="p-3 border-t border-white/[0.08] bg-[#070e1e]/90">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-white/10 transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center shrink-0 font-bold text-xs text-indigo-300">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {userName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            id="user-logout-btn"
            onClick={onLogout}
            title="Cerrar sesión"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

