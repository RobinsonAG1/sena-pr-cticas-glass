import React, { useState } from 'react';
import { Search, Bell, CheckCircle2, AlertTriangle, Info, X, ShieldCheck } from 'lucide-react';
import type { NotificationItem, UserRole, UserProfile } from '../types';

export interface TopBarProps {
  currentRole?: UserRole;
  userRole?: UserRole;
  currentUser?: UserProfile | null;
  onRoleSwitch?: (role: UserRole) => void;
  onRoleChange?: (role: UserRole) => void;
  onLogout?: () => void;
  notifications?: NotificationItem[];
  onMarkNotificationAsRead?: (id: string) => void;
  onSearch?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRole = 'aprendiz',
  userRole,
  currentUser,
  onRoleSwitch,
  onRoleChange,
  onLogout,
  notifications = [],
  onMarkNotificationAsRead,
  onSearch,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeRole = currentRole || userRole || currentUser?.role || 'aprendiz';
  const handleRoleToggle = onRoleSwitch || onRoleChange || (() => {});
  const safeNotifications = notifications || [];
  const unreadCount = safeNotifications.filter((n) => !n.read).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-white/[0.08] bg-[#0b1326]/80 backdrop-blur-xl px-6 flex items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar en plataforma..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/60 border border-white/[0.08] text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              onSearch?.('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Role Toggle Switcher - ONLY FOR REAL ADMIN */}
        {currentUser?.role === 'admin' ? (
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-amber-500/30 text-xs shadow-inner">
            <span className="text-[10px] uppercase font-bold text-amber-400 px-2 hidden lg:inline">
              Vista:
            </span>
            <button
              id="role-switch-aprendiz"
              onClick={() => handleRoleToggle('aprendiz')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRole === 'aprendiz'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              title="Supervisar como Aprendiz"
            >
              <span>🎓</span>
              <span className="hidden md:inline">Aprendiz</span>
            </button>

            <button
              id="role-switch-instructor"
              onClick={() => handleRoleToggle('instructor')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRole === 'instructor'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              title="Supervisar como Instructor"
            >
              <span>👨‍🏫</span>
              <span className="hidden md:inline">Instructor</span>
            </button>

            <button
              id="role-switch-admin"
              onClick={() => handleRoleToggle('admin')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              title="Panel Administrador"
            >
              <span>🛡️</span>
              <span className="hidden md:inline">Admin</span>
            </button>
          </div>
        ) : (
          /* Static badge for Aprendiz and Instructor */
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08]">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                activeRole === 'instructor' ? 'bg-emerald-400' : 'bg-indigo-400'
              }`}
            />
            <span className="text-xs font-semibold text-slate-200 capitalize">
              {activeRole === 'instructor' ? 'Instructor de Seguimiento' : 'Aprendiz SENA'}
            </span>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.08] text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            aria-label="Ver notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse ring-2 ring-[#0b1326]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-100">Notificaciones</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-white/[0.06] max-h-72 overflow-y-auto mt-2 space-y-1">
                {safeNotifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No tienes notificaciones pendientes.
                  </p>
                ) : (
                  safeNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationAsRead?.(notif.id)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-start gap-3 ${
                        notif.read ? 'opacity-60 hover:opacity-100 hover:bg-white/[0.03]' : 'bg-white/[0.04] hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {notif.type === 'urgent' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                        {notif.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{notif.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Institutional Center Badge */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-bold text-slate-200 tracking-tight flex items-center justify-end gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            Centro de Comercio
          </span>
          <span className="text-[11px] font-normal text-slate-400">
            Regional Antioquia
          </span>
        </div>
      </div>
    </header>
  );
};
