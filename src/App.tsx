import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LoginScreen } from './components/LoginScreen';
import { AprendizDashboard } from './components/AprendizDashboard';
import { InstructorDashboard } from './components/InstructorDashboard';
import { AprendizProgresoView } from './components/AprendizProgresoView';
import { AprendizEvidenciasView } from './components/AprendizEvidenciasView';
import { InstructorAprendicesView } from './components/InstructorAprendicesView';
import { InstructorReportesView } from './components/InstructorReportesView';
import { AdminPanelView } from './components/AdminPanelView';

// Modals
import { UploadEvidenceModal } from './components/UploadEvidenceModal';
import { EvaluateModal } from './components/EvaluateModal';
import { SendMessageModal } from './components/SendMessageModal';
import { FormatsModal } from './components/FormatsModal';
import { NewTaskModal } from './components/NewTaskModal';
import { EvidenceDetailModal } from './components/EvidenceDetailModal';
import { SendBroadcastAlertModal } from './components/SendBroadcastAlertModal';

import {
  mockAprendiz,
  mockInstructor,
  mockAdmin,
  mockEvidences,
  mockFichas,
  mockNotifications,
  mockEmpresas,
  mockHistorial,
  supabase,
  seedDatabase,
  fetchEvidencias,
  fetchFichas,
  fetchEmpresas,
  insertAlerta,
  insertHistorial,
  updateEvidencia,
  fetchProfileById,
  buildUserProfileFromRow,
} from './lib/supabase';
import type { UserProfile, UserRole, Evidence, Ficha, EvidenceStatus, NotificationItem, Empresa, HistorialCambios } from './types';

export function App() {
  // Current user state. Starts logged-out: the LoginScreen is shown until the
  // user authenticates and the app routes to the Dashboard of their VERIFIED role.
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [viewingRole, setViewingRole] = useState<UserRole>('aprendiz');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [evidences, setEvidences] = useState<Evidence[]>(mockEvidences);
  const [fichas, setFichas] = useState<Ficha[]>(mockFichas);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [empresas, setEmpresas] = useState<Empresa[]>(mockEmpresas);
  const [historial, setHistorial] = useState<HistorialCambios[]>(mockHistorial);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isFormatsModalOpen, setIsFormatsModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [evaluatingEvidence, setEvaluatingEvidence] = useState<Evidence | null>(null);
  const [detailEvidence, setDetailEvidence] = useState<Evidence | null>(null);

  // Sync viewingRole when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setViewingRole(currentUser.role);
      setActiveTab('dashboard');
    }
  }, [currentUser?.role]);

  // Sync Supabase Auth listener (verifica el rol real en `profiles`)
  useEffect(() => {
    const resolveSessionUser = async (sessionUser: { id: string; email?: string | null; user_metadata?: Record<string, any> }) => {
      const profileRow = await fetchProfileById(sessionUser.id);
      const meta = sessionUser.user_metadata || {};
      const role: UserRole = (profileRow?.role as UserRole) || meta.role || 'aprendiz';
      const baseTemplate =
        role === 'instructor'
          ? mockInstructor
          : role === 'admin'
          ? mockAdmin
          : mockAprendiz;

      const user = buildUserProfileFromRow(profileRow, {
        ...baseTemplate,
        id: sessionUser.id,
        email: sessionUser.email || baseTemplate.email,
        role,
      });
      setCurrentUser(user);
      setViewingRole(role);
    };

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          await resolveSessionUser(data.session.user);
        }
      } catch (e) {
        console.warn('Supabase session check:', e);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await resolveSessionUser(session.user);
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Load persisted data from Supabase (falls back to mock data when empty/unreachable)
  useEffect(() => {
    let cancelled = false;

    const loadFromSupabase = async () => {
      const [dbEvidences, dbFichas, dbEmpresas] = await Promise.all([
        fetchEvidencias(),
        fetchFichas(),
        fetchEmpresas(),
      ]);
      if (cancelled) return;

      if (dbEvidences.length > 0) setEvidences(dbEvidences);
      if (dbFichas.length > 0) setFichas(dbFichas);
      if (dbEmpresas.length > 0) setEmpresas(dbEmpresas);
    };

    seedDatabase()
      .then(() => loadFromSupabase())
      .catch((e) => {
        console.warn('Supabase load skipped:', e);
        return loadFromSupabase();
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Handle switching role - ONLY PERMITTED FOR AUTHENTICATED ADMIN
  const handleRoleChange = (newRole: UserRole) => {
    if (currentUser?.role === 'admin') {
      setViewingRole(newRole);
      setActiveTab('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setCurrentUser(null);
  };

  // Add new evidence from modal
  const handleEvidenceCreated = (newEvidence: Evidence) => {
    setEvidences((prev) => [newEvidence, ...prev]);
    if (currentUser && currentUser.role === 'aprendiz') {
      setCurrentUser({
        ...currentUser,
        total_hours: currentUser.total_hours + (newEvidence.hours || 0),
        progress_percentage: Math.min(
          100,
          Math.round(((currentUser.total_hours + (newEvidence.hours || 0)) / currentUser.required_hours) * 100),
        ),
      });
    }

    // Add audit entry
    setHistorial((prev) => [
      {
        id: Date.now(),
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
        usuario_nombre: currentUser?.full_name || 'Aprendiz SENA',
        modulo: 'Evidencias',
        accion: 'CREAR',
        descripcion: `Subió evidencia "${newEvidence.title}" (${newEvidence.type})`,
      },
      ...prev,
    ]);
  };

  // Evaluate evidence from modal
  const handleSaveEvaluation = (evidenceId: string, status: EvidenceStatus, feedback: string) => {
    const evaluator = currentUser?.full_name || 'Carlos Arturo Restrepo (Instructor)';
    const evaluatedAt = new Date().toLocaleDateString('es-CO');
    setEvidences((prev) =>
      prev.map((e) =>
        e.id === evidenceId
          ? {
              ...e,
              status,
              feedback,
              evaluated_at: evaluatedAt,
              evaluated_by: evaluator,
            }
          : e,
      ),
    );

    if (status === 'Aprobado') {
      mockAprendiz.approved_evidences_count += 1;
    }

    // Persist evaluation to Supabase
    updateEvidencia(evidenceId, {
      status,
      feedback,
      evaluated_by: evaluator,
      evaluated_at: new Date().toISOString(),
    });

    // Add audit entry
    setHistorial((prev) => [
      {
        id: Date.now(),
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
        usuario_nombre: currentUser?.full_name || 'Instructor SENA',
        modulo: 'Evidencias',
        accion: 'EVALUAR',
        descripcion: `Calificó evidencia como ${status}: ${feedback.substring(0, 40)}...`,
      },
      ...prev,
    ]);
    insertHistorial({
      usuario_nombre: currentUser?.full_name || 'Instructor SENA',
      modulo: 'Evidencias',
      accion: 'EVALUAR',
      descripcion: `Calificó evidencia como ${status}: ${feedback.substring(0, 40)}...`,
    });
  };

  // Add task to fichas
  const handleTaskCreated = (task: { title: string; ficha: string; deadline: string }) => {
    alert(`¡Asignación programada!\n"${task.title}" para ficha ${task.ficha}, con fecha límite ${task.deadline}.`);
  };

  // Send broadcast alert
  const handleAlertSent = (alertData: { destino: string; mensaje: string }) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Alerta: ${alertData.destino === 'todos' ? 'Aviso General' : `Ficha ${alertData.destino}`}`,
      message: alertData.mensaje,
      time: 'Hace un momento',
      read: false,
      type: 'warning',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Persist alert to Supabase
    insertAlerta({
      remitente: `${currentUser?.full_name || 'Instructor SENA'}`,
      destino: alertData.destino,
      mensaje: alertData.mensaje,
    });

    // Add audit entry
    setHistorial((prev) => [
      {
        id: Date.now(),
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
        usuario_nombre: currentUser?.full_name || 'Instructor SENA',
        modulo: 'Alertas',
        accion: 'CREAR',
        descripcion: `Envío de comunicado a ${alertData.destino}: ${alertData.mensaje.substring(0, 40)}...`,
      },
      ...prev,
    ]);
    insertHistorial({
      usuario_nombre: currentUser?.full_name || 'Instructor SENA',
      modulo: 'Alertas',
      accion: 'CREAR',
      descripcion: `Envío de comunicado a ${alertData.destino}: ${alertData.mensaje.substring(0, 40)}...`,
    });
  };

  // If user is not logged in, render the Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setViewingRole(user.role);
          setActiveTab('dashboard');
        }}
        aprendizDemo={mockAprendiz}
        instructorDemo={mockInstructor}
        adminDemo={mockAdmin}
      />
    );
  }

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Render appropriate view strictly based on viewingRole and activeTab
  const renderContent = () => {
    // =========================================================================
    // APRENDIZ VIEWS (Strictly isolated)
    // =========================================================================
    if (viewingRole === 'aprendiz') {
      if (activeTab === 'evidencias' || activeTab === 'aprendiz-evidencias') {
        return (
          <AprendizEvidenciasView
            evidences={evidences}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onViewEvidenceDetail={(ev) => setDetailEvidence(ev)}
          />
        );
      }

      if (activeTab === 'progreso' || activeTab === 'aprendiz-progreso') {
        return (
          <AprendizProgresoView
            user={currentUser}
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />
        );
      }

      if (activeTab === 'formatos') {
        return (
          <div className="p-8 max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-8 text-center space-y-4 border border-white/[0.08]">
              <h2 className="text-2xl font-bold text-white">Centro de Formatos Institucionales</h2>
              <p className="text-slate-400 text-sm">
                Plantillas oficiales del Sistema Integrado de Gestión y Autocontrol (SIGA) SENA para la etapa productiva.
              </p>
              <button
                onClick={() => setIsFormatsModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Abrir Catálogo de Formatos Oficiales (F023 / Bitácoras)
              </button>
            </div>
          </div>
        );
      }

      // Default fallback to Aprendiz Dashboard
      return (
        <AprendizDashboard
          user={currentUser}
          evidences={evidences}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenMessageModal={() => setIsMessageModalOpen(true)}
          onViewEvidenceDetail={(ev) => setDetailEvidence(ev)}
          onViewAllEvidences={() => setActiveTab('evidencias')}
        />
      );
    }

    // =========================================================================
    // INSTRUCTOR VIEWS (Strictly isolated)
    // =========================================================================
    if (viewingRole === 'instructor') {
      if (activeTab === 'aprendices' || activeTab === 'instructor-aprendices') {
        return <InstructorAprendicesView fichas={fichas} empresas={empresas} />;
      }

      if (activeTab === 'reportes' || activeTab === 'instructor-reportes') {
        return <InstructorReportesView fichas={fichas} />;
      }

      if (activeTab === 'fichas') {
        return (
          <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Seguimiento Formativo
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Mis Fichas & Cursos Asignados
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fichas.map((f) => (
                <div key={f.code} className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-emerald-400">{f.code}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {f.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{f.name}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
                    <span>{f.total_students} aprendices a cargo</span>
                    <span className="text-emerald-400 font-bold">{f.progress_percentage}% promedio</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('aprendices')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Ver Aprendices de esta Ficha →
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (activeTab === 'formatos') {
        return (
          <div className="p-8 max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-8 text-center space-y-4 border border-white/[0.08]">
              <h2 className="text-2xl font-bold text-white">Plantillas Oficiales de Seguimiento</h2>
              <p className="text-slate-400 text-sm">
                Plantillas de concertación de planes de trabajo y evaluación de desempeño SIGA.
              </p>
              <button
                onClick={() => setIsFormatsModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Descargar Plantillas Oficiales
              </button>
            </div>
          </div>
        );
      }

      // Default fallback to Instructor Dashboard
      return (
        <InstructorDashboard
          instructor={currentUser}
          fichas={fichas}
          evidences={evidences}
          onEvaluateEvidence={(ev) => setEvaluatingEvidence(ev)}
          onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
          onOpenFormatsModal={() => setIsFormatsModalOpen(true)}
          onOpenMessagesModal={() => setIsMessageModalOpen(true)}
          onViewAllEvidences={() => setActiveTab('reportes')}
          onNavigateToAprendices={() => setActiveTab('aprendices')}
        />
      );
    }

    // =========================================================================
    // ADMINISTRADOR VIEWS (Full System Control)
    // =========================================================================
    const adminSubTab =
      activeTab === 'fichas'
        ? 'fichas'
        : activeTab === 'usuarios' || activeTab === 'admin-usuarios'
        ? 'usuarios'
        : activeTab === 'instructores'
        ? 'instructores'
        : activeTab === 'empresas'
        ? 'empresas'
        : activeTab === 'historial'
        ? 'historial'
        : activeTab === 'database'
        ? 'database'
        : 'overview';

    return (
      <AdminPanelView
        user={currentUser}
        fichas={fichas}
        activeSubTab={adminSubTab}
        onFichaCreated={(newFicha) => setFichas((prev) => [...prev, newFicha])}
      />
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b1326] text-slate-100">
      {/* Institutional Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTabChange={(tab) => {
          if (tab === 'aprendiz-dashboard' || tab === 'instructor-dashboard' || tab === 'admin-dashboard') {
            setActiveTab('dashboard');
          } else if (tab === 'aprendiz-evidencias') {
            setActiveTab('evidencias');
          } else if (tab === 'aprendiz-progreso') {
            setActiveTab('progreso');
          } else if (tab === 'instructor-aprendices') {
            setActiveTab('aprendices');
          } else if (tab === 'instructor-reportes') {
            setActiveTab('reportes');
          } else if (tab === 'admin-panel' || tab === 'admin') {
            setActiveTab('dashboard');
          } else if (tab === 'admin-usuarios') {
            setActiveTab('usuarios');
          } else {
            setActiveTab(tab);
          }
        }}
        currentUser={currentUser}
        currentRole={viewingRole}
        userRole={viewingRole}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenFormatsModal={() => setIsFormatsModalOpen(true)}
        onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* TopBar with Role Selector, Search & Profile */}
        <TopBar
          currentUser={currentUser}
          currentRole={viewingRole}
          userRole={viewingRole}
          onRoleChange={handleRoleChange}
          onRoleSwitch={handleRoleChange}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
        />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Active View Component */}
          <div className="relative z-10">{renderContent()}</div>
        </main>
      </div>

      {/* Interactive Modals */}
      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentUser={currentUser}
        onEvidenceCreated={handleEvidenceCreated}
      />

      <EvaluateModal
        evidence={evaluatingEvidence}
        isOpen={!!evaluatingEvidence}
        onClose={() => setEvaluatingEvidence(null)}
        onSaveEvaluation={handleSaveEvaluation}
      />

      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        currentUser={currentUser}
      />

      <FormatsModal
        isOpen={isFormatsModalOpen}
        onClose={() => setIsFormatsModalOpen(false)}
      />

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        fichas={fichas}
        onTaskCreated={handleTaskCreated}
      />

      <SendBroadcastAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        fichas={fichas}
        currentUser={currentUser}
        onAlertSent={handleAlertSent}
      />

      <EvidenceDetailModal
        evidence={detailEvidence}
        isOpen={!!detailEvidence}
        onClose={() => setDetailEvidence(null)}
      />
    </div>
  );
}

export default App;
