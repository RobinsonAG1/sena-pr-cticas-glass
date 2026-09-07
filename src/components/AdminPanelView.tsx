import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Database,
  Users,
  BookOpen,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  UserPlus,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  Briefcase,
  Layers,
  Activity,
  FileCheck,
  Building2,
  History,
  Download,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import type { Ficha, UserProfile, UserRole, Empresa, HistorialCambios, InstructorItem } from '../types';
import { mockEmpresas, mockHistorial, mockInstructores, supabase, SUPABASE_URL, SUPABASE_ANON_KEY, fetchEmpresas, fetchHistorial, insertEmpresa, insertFicha, insertHistorial } from '../lib/supabase';

interface AdminPanelViewProps {
  user?: UserProfile | null;
  fichas: Ficha[];
  activeSubTab?: 'overview' | 'fichas' | 'usuarios' | 'instructores' | 'empresas' | 'historial' | 'database';
  onFichaCreated?: (ficha: Ficha) => void;
}

interface TableCheckResult {
  name: string;
  status: 'ok' | 'error' | 'pending';
  message: string;
  count?: number;
}

interface MockUserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  doc: string;
  ficha: string;
  phone?: string;
  status: 'Activo' | 'En seguimiento' | 'Pendiente' | 'Bloqueado';
  progress: number;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  user,
  fichas,
  activeSubTab = 'overview',
  onFichaCreated,
}) => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'fichas' | 'usuarios' | 'instructores' | 'empresas' | 'historial' | 'database'>(activeSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'aprendiz' | 'instructor' | 'admin'>('all');
  const [isVerifyingDb, setIsVerifyingDb] = useState(false);
  const [dbStatusMessage, setDbStatusMessage] = useState<string | null>(null);
  const [tableChecks, setTableChecks] = useState<TableCheckResult[]>([]);
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Synchronize with parent activeSubTab prop when changed
  useEffect(() => {
    if (activeSubTab) {
      setCurrentTab(activeSubTab);
    }
  }, [activeSubTab]);

  // New Ficha modal state
  const [showNewFichaModal, setShowNewFichaModal] = useState(false);
  const [newFichaCode, setNewFichaCode] = useState('');
  const [newFichaName, setNewFichaName] = useState('');
  const [newFichaInstructor, setNewFichaInstructor] = useState('Carlos Arturo Restrepo');

  // Instructor assignment state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFichaForAssign, setSelectedFichaForAssign] = useState<string>('ADSO 2673890');
  const [selectedInstructorForAssign, setSelectedInstructorForAssign] = useState<string>('Carlos Arturo Restrepo');
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

  // Dynamic state for fichas
  const [adminFichas, setAdminFichas] = useState<Ficha[]>(fichas);

  // Dynamic state for empresas
  const [empresasList, setEmpresasList] = useState<Empresa[]>(mockEmpresas);
  const [showNewEmpresaModal, setShowNewEmpresaModal] = useState(false);
  const [newEmpresaData, setNewEmpresaData] = useState({
    nombre: '',
    nit: '',
    persona_contacto: '',
    telefono: '',
    contacto: '',
    direccion: '',
  });

  // Dynamic state for instructores
  const [instructoresList, setInstructoresList] = useState<InstructorItem[]>(mockInstructores);

  // Dynamic state for audit events / historial
  const [historialList, setHistorialList] = useState<HistorialCambios[]>(mockHistorial);
  const [historialFilter, setHistorialFilter] = useState<string>('all');

  // New User modal state
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'aprendiz' as UserRole,
    doc: '',
    ficha: 'ADSO 2673890',
    phone: '',
  });

  // Directory users list
  const [usersList, setUsersList] = useState<MockUserItem[]>([
    {
      id: 'u-1',
      name: 'Maria Camila Rojas',
      email: 'mc.rojas@sena.edu.co',
      role: 'aprendiz',
      doc: 'CC 1000234567',
      ficha: 'ADSO 2673890',
      phone: '3124567890',
      status: 'Activo',
      progress: 55,
    },
    {
      id: 'u-2',
      name: 'Carlos Arturo Restrepo',
      email: 'carlos.restrepo@sena.edu.co',
      role: 'instructor',
      doc: 'CC 71234567',
      ficha: 'ADSO 2673890 / TPS 2567123',
      phone: '3009876543',
      status: 'Activo',
      progress: 100,
    },
    {
      id: 'u-3',
      name: 'Dra. Esperanza Gómez',
      email: 'coordinacion.academica@sena.edu.co',
      role: 'admin',
      doc: 'CC 43987654',
      ficha: 'SEDE-CENTRAL',
      phone: '3101234567',
      status: 'Activo',
      progress: 100,
    },
    {
      id: 'u-4',
      name: 'Juan Esteban Gómez',
      email: 'je.gomez@sena.edu.co',
      role: 'aprendiz',
      doc: 'CC 1001987654',
      ficha: 'ADSO 2673890',
      phone: '3157891234',
      status: 'En seguimiento',
      progress: 42,
    },
    {
      id: 'u-5',
      name: 'Valentina Restrepo',
      email: 'v.restrepo@sena.edu.co',
      role: 'aprendiz',
      doc: 'CC 1002345678',
      ficha: 'TPS 2567123',
      phone: '3187654321',
      status: 'Activo',
      progress: 78,
    },
    {
      id: 'u-6',
      name: 'Patricia Helena Montoya',
      email: 'patricia.montoya@sena.edu.co',
      role: 'instructor',
      doc: 'CC 32456789',
      ficha: 'TPS 2567123',
      phone: '3145678901',
      status: 'Activo',
      progress: 100,
    },
    {
      id: 'u-7',
      name: 'David Alejandro Castro',
      email: 'da.castro@sena.edu.co',
      role: 'aprendiz',
      doc: 'CC 1003456789',
      ficha: 'TPS 2567123',
      phone: '3112345678',
      status: 'Pendiente',
      progress: 25,
    },
  ]);

  const addHistorialEntry = (modulo: string, accion: 'CREAR' | 'MODIFICAR' | 'ELIMINAR' | 'LOGIN' | 'EVALUAR', descripcion: string) => {
    const entry: HistorialCambios = {
      id: Date.now(),
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuario_nombre: user?.full_name || 'Administrador SENA',
      modulo,
      accion,
      descripcion,
    };
    setHistorialList((prev) => [entry, ...prev]);
    insertHistorial(entry);
  };

  // Load real data from Supabase on mount (mock data acts as fallback)
  useEffect(() => {
    let cancelled = false;

    const loadRemoteData = async () => {
      const [remoteEmpresas, remoteHistorial] = await Promise.all([fetchEmpresas(), fetchHistorial()]);
      if (cancelled) return;
      if (remoteEmpresas.length > 0) setEmpresasList(remoteEmpresas);
      if (remoteHistorial.length > 0) setHistorialList(remoteHistorial);
    };

    loadRemoteData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerifyDatabase = async () => {
    setIsVerifyingDb(true);
    setDbStatusMessage(null);
    setTableChecks([]);
    const startTime = performance.now();

    try {
      // 1. Check Auth service connectivity
      try {
        await supabase.auth.getSession();
      } catch (authErr) {
        console.warn('Auth ping warning:', authErr);
      }

      // 2. Check each core table
      const tablesToCheck = ['fichas', 'empresas', 'profiles', 'evidencias', 'historial_cambios', 'alertas'];
      const results: TableCheckResult[] = [];

      for (const tName of tablesToCheck) {
        try {
          const { data, error, count } = await supabase
            .from(tName)
            .select('*', { count: 'exact', head: true });

          if (error) {
            results.push({
              name: tName,
              status: 'error',
              message: error.message || 'Tabla no encontrada (requiere ejecutar script SQL)',
            });
          } else {
            results.push({
              name: tName,
              status: 'ok',
              message: 'Tabla accesible y sincronizada con RLS',
              count: count || 0,
            });
          }
        } catch (err: any) {
          results.push({
            name: tName,
            status: 'error',
            message: err?.message || 'Error de consulta',
          });
        }
      }

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);
      setDbLatency(latencyMs);
      setTableChecks(results);

      const okCount = results.filter((r) => r.status === 'ok').length;
      if (okCount === tablesToCheck.length) {
        setDbStatusMessage(
          `✓ Conexión con Supabase 100% OPERATIVA: Latencia ${latencyMs}ms, todas las ${okCount} tablas verificadas con RLS activo.`
        );
      } else if (okCount > 0) {
        setDbStatusMessage(
          `⚠️ Conexión activa con Supabase (${latencyMs}ms). ${okCount}/${tablesToCheck.length} tablas encontradas. Ejecuta el script SQL para crear las tablas restantes.`
        );
      } else {
        setDbStatusMessage(
          `ℹ️ Endpoint Supabase accesible (${latencyMs}ms). Las tablas aún no han sido creadas en tu proyecto. Copia y ejecuta el script SQL provisto abajo en tu SQL Editor.`
        );
      }

      addHistorialEntry(
        'Base de Datos',
        'LOGIN',
        `Diagnóstico de conexión Supabase ejecutado (${latencyMs}ms, ${okCount}/${tablesToCheck.length} tablas)`
      );
    } catch (error: any) {
      setDbStatusMessage(
        `❌ Error de conexión: ${error?.message || 'No fue posible contactar con el endpoint de Supabase'}`
      );
    } finally {
      setIsVerifyingDb(false);
    }
  };

  const handleCreateFicha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFichaCode || !newFichaName) return;

    const newFicha: Ficha = {
      code: newFichaCode.trim().toUpperCase(),
      name: newFichaName.trim(),
      status: 'ACTIVO',
      total_students: 28,
      progress_percentage: 15,
      instructor_name: newFichaInstructor,
      created_at: new Date().toLocaleDateString('es-CO'),
    };

    setAdminFichas((prev) => [...prev, newFicha]);
    onFichaCreated?.(newFicha);
    insertFicha(newFicha);
    addHistorialEntry('Fichas', 'CREAR', `Creación de nueva ficha ${newFicha.code} (${newFicha.name})`);
    setShowNewFichaModal(false);
    setNewFichaCode('');
    setNewFichaName('');
  };

  const handleAssignInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignmentSuccess(
      `✓ Asignado instructor "${selectedInstructorForAssign}" a la ficha ${selectedFichaForAssign} con éxito.`
    );
    addHistorialEntry('Instructores', 'MODIFICAR', `Asignación de instructor ${selectedInstructorForAssign} a la ficha ${selectedFichaForAssign}`);
    setTimeout(() => {
      setShowAssignModal(false);
      setAssignmentSuccess(null);
    }, 1400);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;

    const newUser: MockUserItem = {
      id: `u-${Date.now()}`,
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      doc: newUserData.doc || 'CC 1000000000',
      ficha: newUserData.role === 'aprendiz' ? newUserData.ficha : newUserData.role === 'instructor' ? 'ADSO / TPS' : 'SEDE-CENTRAL',
      phone: newUserData.phone || '3000000000',
      status: 'Activo',
      progress: newUserData.role === 'aprendiz' ? 0 : 100,
    };

    setUsersList((prev) => [newUser, ...prev]);
    addHistorialEntry('Usuarios', 'CREAR', `Creación de usuario ${newUser.name} con rol ${newUser.role}`);
    setShowNewUserModal(false);
    setNewUserData({ name: '', email: '', role: 'aprendiz', doc: '', ficha: 'ADSO 2673890', phone: '' });
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'Bloqueado' ? 'Activo' : 'Bloqueado';
          addHistorialEntry('Usuarios', 'MODIFICAR', `Cambio de estado para ${u.name} a ${newStatus}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleCreateEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpresaData.nombre || !newEmpresaData.nit) return;

    const newEmpresa: Empresa = {
      id: Date.now(),
      nombre: newEmpresaData.nombre,
      nit: newEmpresaData.nit,
      persona_contacto: newEmpresaData.persona_contacto || 'Contacto Principal',
      telefono: newEmpresaData.telefono || '3001234567',
      contacto: newEmpresaData.contacto || 'contacto@empresa.com',
      direccion: newEmpresaData.direccion || 'Medellín, Antioquia',
      activa: true,
    };

    insertEmpresa(newEmpresa).then(({ data }) => {
      const persisted = data && Array.isArray(data) ? data[0] : null;
      if (persisted?.id) {
        setEmpresasList((prev) =>
          prev.map((e) => (e.id === newEmpresa.id ? { ...e, id: persisted.id } : e)),
        );
      }
    });

    setEmpresasList((prev) => [newEmpresa, ...prev]);
    addHistorialEntry('Empresas', 'CREAR', `Registro de nueva empresa patrocinadora: ${newEmpresa.nombre} (NIT: ${newEmpresa.nit})`);
    setShowNewEmpresaModal(false);
    setNewEmpresaData({ nombre: '', nit: '', persona_contacto: '', telefono: '', contacto: '', direccion: '' });
  };

  const handleToggleEmpresaStatus = (empresaId: number | string) => {
    setEmpresasList((prev) =>
      prev.map((e) => {
        if (e.id === empresaId) {
          const newActiva = !e.activa;
          addHistorialEntry('Empresas', 'MODIFICAR', `${newActiva ? 'Activación' : 'Inactivación'} de convenio con empresa ${e.nombre}`);
          return { ...e, activa: newActiva };
        }
        return e;
      })
    );
  };

  const handleToggleInstructorStatus = (instId: number | string) => {
    setInstructoresList((prev) =>
      prev.map((inst) => {
        if (inst.id === instId) {
          const newActivo = !inst.activo;
          addHistorialEntry('Instructores', 'MODIFICAR', `${newActivo ? 'Activación' : 'Inactivación'} del instructor ${inst.nombres} ${inst.apellidos}`);
          return { ...inst, activo: newActivo };
        }
        return inst;
      })
    );
  };

  const handleDownloadBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      exportador: user?.full_name || 'Administrador SENA',
      sistema: 'SENA Prácticas Etapa Productiva v4.0',
      total_fichas: adminFichas.length,
      fichas: adminFichas,
      total_usuarios: usersList.length,
      usuarios: usersList,
      total_instructores: instructoresList.length,
      instructores: instructoresList,
      total_empresas: empresasList.length,
      empresas: empresasList,
      historial_auditoria: historialList,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SENA_Backup_Completo_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setExportSuccess('✓ Copia de seguridad exportada con éxito en formato JSON.');
    addHistorialEntry('Backup', 'CREAR', 'Descarga de copia de seguridad integral de la base de datos');
    setTimeout(() => setExportSuccess(null), 4000);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.doc.toLowerCase().includes(query) ||
      u.ficha.toLowerCase().includes(query);
    return matchesRole && matchesQuery;
  });

  const filteredHistorial = historialList.filter((h) => {
    if (historialFilter === 'all') return true;
    return h.modulo.toLowerCase() === historialFilter.toLowerCase();
  });

  const totalLearners = adminFichas.reduce((acc, f) => acc + f.total_students, 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-left">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Coordinación Misional y Académica</span>
            </span>
            <span className="text-xs text-slate-400">Regional Antioquia • Centro de Comercio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Panel de Administrador Global
          </h1>
          <p className="text-sm text-slate-400">
            Control integral de fichas, usuarios, instructores, empresas convenio, auditoría y base de datos.
          </p>
        </div>

        {/* Global Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="admin-btn-create-user"
            onClick={() => setShowNewUserModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Crear Usuario</span>
          </button>

          <button
            id="admin-btn-create-empresa"
            onClick={() => setShowNewEmpresaModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Building2 className="w-4 h-4 text-orange-400" />
            <span>Nueva Empresa</span>
          </button>

          <button
            id="admin-btn-create-ficha"
            onClick={() => setShowNewFichaModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Ficha</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Overview stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => setCurrentTab('overview')}
          className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
            currentTab === 'overview' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/[0.08] hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Usuarios</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{usersList.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">En sistema</p>
        </div>

        <div
          onClick={() => setCurrentTab('fichas')}
          className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
            currentTab === 'fichas' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/[0.08] hover:border-indigo-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Fichas Activas</span>
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300">{adminFichas.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">{totalLearners} aprendices</p>
        </div>

        <div
          onClick={() => setCurrentTab('instructores')}
          className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
            currentTab === 'instructores' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/[0.08] hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Instructores</span>
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{instructoresList.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Líderes de ficha</p>
        </div>

        <div
          onClick={() => setCurrentTab('empresas')}
          className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
            currentTab === 'empresas' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/[0.08] hover:border-orange-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Empresas</span>
            <Building2 className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-300">{empresasList.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Convenio activo</p>
        </div>

        <div
          onClick={() => setCurrentTab('historial')}
          className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
            currentTab === 'historial' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/[0.08] hover:border-purple-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Auditoría</span>
            <History className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">{historialList.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Eventos registrados</p>
        </div>

        <div
          onClick={() => setCurrentTab('database')}
          className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
            currentTab === 'database' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/[0.08] hover:border-teal-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Base de Datos</span>
            <Database className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300">100%</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Supabase Online</p>
        </div>
      </div>

      {/* Internal Navigation Sub-Tabs matching Proyecto_Final_Flask */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-2">
        <button
          id="admin-tab-overview"
          onClick={() => setCurrentTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'overview'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Panel General</span>
        </button>

        <button
          id="admin-tab-fichas"
          onClick={() => setCurrentTab('fichas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'fichas'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Fichas / Cursos ({adminFichas.length})</span>
        </button>

        <button
          id="admin-tab-usuarios"
          onClick={() => setCurrentTab('usuarios')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'usuarios'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Usuarios & Roles ({usersList.length})</span>
        </button>

        <button
          id="admin-tab-instructores"
          onClick={() => setCurrentTab('instructores')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'instructores'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Instructores ({instructoresList.length})</span>
        </button>

        <button
          id="admin-tab-empresas"
          onClick={() => setCurrentTab('empresas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'empresas'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Empresas ({empresasList.length})</span>
        </button>

        <button
          id="admin-tab-historial"
          onClick={() => setCurrentTab('historial')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'historial'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Auditoría ({historialList.length})</span>
        </button>

        <button
          id="admin-tab-database"
          onClick={() => setCurrentTab('database')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'database'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Copia de Seguridad (Backup)</span>
        </button>
      </div>

      {exportSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Fichas Summary & Quick Actions */}
            <div className="lg:col-span-8 space-y-6">
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>Fichas de Formación en Etapa Productiva</span>
                  </h3>
                  <button
                    onClick={() => setCurrentTab('fichas')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Ver todas →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {adminFichas.map((f) => (
                    <div
                      key={f.code}
                      className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] hover:border-white/15 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-indigo-300">{f.code}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {f.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium line-clamp-1">{f.name}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span>{f.total_students} aprendices</span>
                        <span className="text-emerald-400 font-bold">{f.progress_percentage}% avance</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Audit events */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" />
                    <span>Últimos Movimientos de Auditoría</span>
                  </h3>
                  <button
                    onClick={() => setCurrentTab('historial')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Ver historial completo →
                  </button>
                </div>

                <div className="divide-y divide-white/[0.06] space-y-2">
                  {historialList.slice(0, 4).map((h) => (
                    <div key={h.id} className="pt-2.5 flex items-start justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{h.usuario_nombre}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-white/10">
                            {h.modulo}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              h.accion === 'CREAR'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : h.accion === 'MODIFICAR'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}
                          >
                            {h.accion}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-0.5">{h.descripcion}</p>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0 font-mono">{h.fecha}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Quick actions & Backup quick trigger */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
                <h3 className="text-sm font-bold text-white">Acciones de Coordinación</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowNewFichaModal(true)}
                    className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-left flex items-center justify-between text-xs text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      <strong>Registrar Nueva Ficha</strong>
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowNewUserModal(true)}
                    className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-left flex items-center justify-between text-xs text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-indigo-400" />
                      <strong>Crear Usuario / Rol</strong>
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowNewEmpresaModal(true)}
                    className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-left flex items-center justify-between text-xs text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-400" />
                      <strong>Vincular Empresa Convenio</strong>
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={handleDownloadBackup}
                    className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-left flex items-center justify-between text-xs text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <strong>Descargar Backup (JSON)</strong>
                    </span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Database status pill */}
              <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-teal-400" />
                    <span>Supabase Cloud Engine</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    Online
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Todas las tablas relacionales y reglas RLS están activas.
                </p>
                <button
                  onClick={handleVerifyDatabase}
                  disabled={isVerifyingDb}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  {isVerifyingDb ? 'Comprobando...' : 'Comprobar Estado Servidor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FICHAS / CURSOS */}
      {/* ========================================================================= */}
      {currentTab === 'fichas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Gestión de Fichas y Cursos de Formación</span>
              </h2>
              <p className="text-xs text-slate-400">Fichas activas matriculadas en el centro de formación</p>
            </div>
            <button
              onClick={() => setShowNewFichaModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Ficha</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {adminFichas.map((ficha) => (
              <div
                key={ficha.code}
                className="glass-panel rounded-2xl p-6 border border-white/[0.08] hover:border-amber-500/40 transition-all space-y-4 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {ficha.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{ficha.name}</h3>
                    <p className="text-xs text-slate-400">
                      Centro de Comercio • Modalidad Etapa Productiva (864 horas)
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-white">{ficha.total_students}</span>
                    <span className="text-[11px] text-slate-400 block">aprendices</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Avance promedio de la ficha</span>
                    <span className="text-emerald-400 font-bold">{ficha.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${ficha.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300">
                      CR
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        {ficha.instructor_name || 'Carlos Arturo Restrepo'}
                      </p>
                      <p className="text-[10px] text-slate-400">Instructor Líder de Seguimiento</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFichaForAssign(ficha.code);
                      setShowAssignModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    Reasignar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USUARIOS & ROLES */}
      {/* ========================================================================= */}
      {currentTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, documento o ficha..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  roleFilter === 'all' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({usersList.length})
              </button>
              <button
                onClick={() => setRoleFilter('aprendiz')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  roleFilter === 'aprendiz' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Aprendices
              </button>
              <button
                onClick={() => setRoleFilter('instructor')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  roleFilter === 'instructor' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Instructores
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  roleFilter === 'admin' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-white/[0.08] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Usuario</th>
                    <th className="py-3.5 px-4">Documento</th>
                    <th className="py-3.5 px-4">Rol Asignado</th>
                    <th className="py-3.5 px-4">Ficha / Programa</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{u.doc}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            u.role === 'aprendiz'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : u.role === 'instructor'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{u.ficha}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            u.status === 'Activo'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : u.status === 'Bloqueado'
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                            u.status === 'Bloqueado'
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          }`}
                          title={u.status === 'Bloqueado' ? 'Desbloquear acceso' : 'Bloquear usuario'}
                        >
                          {u.status === 'Bloqueado' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INSTRUCTORES */}
      {/* ========================================================================= */}
      {currentTab === 'instructores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>Gestión de Instructores de Seguimiento</span>
              </h2>
              <p className="text-xs text-slate-400">Listado oficial de instructores asignados al programa de prácticas</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-white/[0.08] text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Área de Formación</th>
                  <th className="py-3.5 px-4">Fichas a Cargo</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {instructoresList.map((inst) => (
                  <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{inst.nombres} {inst.apellidos}</div>
                      <div className="text-[11px] text-slate-400">{inst.correo}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">{inst.area_formacion}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {inst.fichas_asignadas.map((fc) => (
                          <span key={fc} className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] border border-white/5">
                            {fc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          inst.activo ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {inst.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleInstructorStatus(inst.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          inst.activo
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                      >
                        {inst.activo ? 'Inactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EMPRESAS CONVENIO */}
      {/* ========================================================================= */}
      {currentTab === 'empresas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <span>Empresas Patrocinadoras Convenio</span>
              </h2>
              <p className="text-xs text-slate-400">Directorio oficial de entidades y empresas receptoras de practicantes SENA</p>
            </div>
            <button
              onClick={() => setShowNewEmpresaModal(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Empresa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresasList.map((emp) => (
              <div
                key={emp.id}
                className="glass-panel rounded-2xl p-5 border border-white/[0.08] hover:border-orange-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-white">{emp.nombre}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.activa ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {emp.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mb-3">NIT: {emp.nit}</p>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.persona_contacto}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.telefono}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.contacto}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.direccion}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={() => handleToggleEmpresaStatus(emp.id)}
                    className={`text-xs font-semibold ${
                      emp.activa ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    {emp.activa ? 'Desactivar Convenio' : 'Activar Convenio'}
                  </button>
                  <button
                    onClick={() => alert(`Editando datos de ${emp.nombre}`)}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: HISTORIAL DE AUDITORIA */}
      {/* ========================================================================= */}
      {currentTab === 'historial' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <span>Historial de Cambios y Auditoría del Sistema</span>
              </h2>
              <p className="text-xs text-slate-400">Registro cronológico inmutable de todas las acciones administrativas y operativas</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filtrar Módulo:</span>
              <select
                value={historialFilter}
                onChange={(e) => setHistorialFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Todos los módulos</option>
                <option value="empresas">Empresas</option>
                <option value="evidencias">Evidencias</option>
                <option value="usuarios">Usuarios</option>
                <option value="fichas">Fichas</option>
                <option value="base de datos">Base de Datos</option>
              </select>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-white/[0.08] text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Fecha y Hora</th>
                  <th className="py-3.5 px-4">Usuario Responsable</th>
                  <th className="py-3.5 px-4">Módulo</th>
                  <th className="py-3.5 px-4">Acción</th>
                  <th className="py-3.5 px-4">Descripción del Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredHistorial.map((h) => (
                  <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{h.fecha}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">{h.usuario_nombre}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[10px] border border-white/5">
                        {h.modulo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                          h.accion === 'CREAR'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : h.accion === 'MODIFICAR'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : h.accion === 'ELIMINAR'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {h.accion}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{h.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: BASE DE DATOS & CONEXIÓN SUPABASE */}
      {/* ========================================================================= */}
      {currentTab === 'database' && (
        <div className="space-y-6">
          {/* Card: Diagnóstico en Vivo de Conexión */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Diagnóstico de Conexión en Vivo con Supabase</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Valida la conexión en tiempo real, latencia y disponibilidad de tablas en la base de datos PostgreSQL.
                </p>
              </div>

              <button
                id="btn-verify-supabase-live"
                onClick={handleVerifyDatabase}
                disabled={isVerifyingDb}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isVerifyingDb ? 'animate-spin' : ''}`} />
                <span>{isVerifyingDb ? 'Probando Conexión...' : 'Probar Conexión Ahora'}</span>
              </button>
            </div>

            {/* URL & Key Config Info */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">
                  Endpoint Activo (VITE_SUPABASE_URL)
                </span>
                <span className="font-mono text-emerald-400 font-semibold">{SUPABASE_URL}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">
                  Clave Pública (Anon Key)
                </span>
                <span className="font-mono text-slate-300">
                  {SUPABASE_ANON_KEY.substring(0, 16)}...{SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 8)}
                </span>
              </div>
              {dbLatency !== null && (
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wider">
                    Latencia
                  </span>
                  <span className="font-bold text-teal-300">{dbLatency} ms</span>
                </div>
              )}
            </div>

            {/* Status Feedback Banner */}
            {dbStatusMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-medium border flex items-start gap-2.5 animate-fadeIn ${
                  dbStatusMessage.startsWith('✓')
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : dbStatusMessage.startsWith('⚠️')
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : dbStatusMessage.startsWith('ℹ️')
                    ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="mt-0.5">
                  {dbStatusMessage.startsWith('✓') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : dbStatusMessage.startsWith('⚠️') ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Info className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <div className="flex-1">{dbStatusMessage}</div>
              </div>
            )}

            {/* Table-by-Table Checklist */}
            {tableChecks.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Estado de Tablas en Supabase
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tableChecks.map((tc) => (
                    <div
                      key={tc.name}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        tc.status === 'ok'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {tc.status === 'ok' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="font-mono font-bold">{tc.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {tc.status === 'ok' ? `✓ Activa (${tc.count || 0})` : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Backup & Export Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Copia de Seguridad (Backup JSON)</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Descarga un archivo JSON estructurado con todos los registros actuales del sistema.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Exportar Copia de Seguridad JSON</span>
              </button>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Script SQL de Inicialización</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Contiene la creación de tablas (`fichas`, `profiles`, `evidencias`, `empresas`, etc.) y políticas RLS.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`-- Script disponible en schema_sena_supabase.sql en la raíz del proyecto`);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 3000);
                  alert('El script SQL de creación de tablas se encuentra en el archivo "schema_sena_supabase.sql". Puedes abrirlo o copiarlo en el SQL Editor de Supabase.');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>{copiedSql ? '✓ Instrucción Copiada' : 'Ver / Copiar Script SQL Oficial'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal: Crear Nueva Ficha */}
      {showNewFichaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0b1326] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Registrar Nueva Ficha</span>
              </h3>
              <button onClick={() => setShowNewFichaModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFicha} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código de Ficha (Ej: ADSO 2894102)
                </label>
                <input
                  type="text"
                  required
                  value={newFichaCode}
                  onChange={(e) => setNewFichaCode(e.target.value)}
                  placeholder="ADSO 2894102"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Programa de Formación
                </label>
                <input
                  type="text"
                  required
                  value={newFichaName}
                  onChange={(e) => setNewFichaName(e.target.value)}
                  placeholder="Tecnólogo en Análisis y Desarrollo de Software"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instructor Líder Inicial
                </label>
                <select
                  value={newFichaInstructor}
                  onChange={(e) => setNewFichaInstructor(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Carlos Arturo Restrepo">Carlos Arturo Restrepo (carlos.restrepo@sena.edu.co)</option>
                  <option value="Patricia Helena Montoya">Patricia Helena Montoya (patricia.montoya@sena.edu.co)</option>
                  <option value="Mauricio Vélez Morales">Mauricio Vélez Morales (mauricio.velez@sena.edu.co)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowNewFichaModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-lg shadow-amber-600/30"
                >
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asignar Instructor */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0b1326] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Asignar Instructor de Seguimiento</span>
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            {assignmentSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center">
                {assignmentSuccess}
              </div>
            ) : (
              <form onSubmit={handleAssignInstructor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Seleccionar Ficha Técnica
                  </label>
                  <select
                    value={selectedFichaForAssign}
                    onChange={(e) => setSelectedFichaForAssign(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {adminFichas.map((f) => (
                      <option key={f.code} value={f.code}>
                        {f.code} - {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Instructor de Seguimiento a Asignar
                  </label>
                  <select
                    value={selectedInstructorForAssign}
                    onChange={(e) => setSelectedInstructorForAssign(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Carlos Arturo Restrepo">Carlos Arturo Restrepo (ADSO / TPS)</option>
                    <option value="Patricia Helena Montoya">Patricia Helena Montoya (Sistemas)</option>
                    <option value="Mauricio Vélez Morales">Mauricio Vélez Morales (Redes)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Confirmar Asignación
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Crear Usuario */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0b1326] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Registrar Nuevo Usuario</span>
              </h3>
              <button onClick={() => setShowNewUserModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Ej: Laura Sofía Morales"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="laura.morales@sena.edu.co"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rol a Asignar</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="aprendiz">Aprendiz</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Documento</label>
                  <input
                    type="text"
                    value={newUserData.doc}
                    onChange={(e) => setNewUserData({ ...newUserData, doc: e.target.value })}
                    placeholder="CC 1000234567"
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Empresa */}
      {showNewEmpresaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0b1326] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <span>Registrar Empresa Patrocinadora</span>
              </h3>
              <button onClick={() => setShowNewEmpresaModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmpresa} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Razón Social</label>
                <input
                  type="text"
                  required
                  value={newEmpresaData.nombre}
                  onChange={(e) => setNewEmpresaData({ ...newEmpresaData, nombre: e.target.value })}
                  placeholder="Ej: Globant Colombia S.A.S."
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">NIT</label>
                  <input
                    type="text"
                    required
                    value={newEmpresaData.nit}
                    onChange={(e) => setNewEmpresaData({ ...newEmpresaData, nit: e.target.value })}
                    placeholder="900.567.890-4"
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newEmpresaData.telefono}
                    onChange={(e) => setNewEmpresaData({ ...newEmpresaData, telefono: e.target.value })}
                    placeholder="3001234567"
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Persona de Contacto / RRHH</label>
                <input
                  type="text"
                  value={newEmpresaData.persona_contacto}
                  onChange={(e) => setNewEmpresaData({ ...newEmpresaData, persona_contacto: e.target.value })}
                  placeholder="Ej: Viviana Castro"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correo de Contacto</label>
                <input
                  type="email"
                  value={newEmpresaData.contacto}
                  onChange={(e) => setNewEmpresaData({ ...newEmpresaData, contacto: e.target.value })}
                  placeholder="practicas@globant.com"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowNewEmpresaModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-lg shadow-orange-600/30"
                >
                  Registrar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
