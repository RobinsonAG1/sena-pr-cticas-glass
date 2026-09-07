import { createClient } from '@supabase/supabase-js';
import type { UserProfile, Evidence, Ficha, Empresa, AlertaItem, HistorialCambios, NotificationItem, UserRole, ApprenticeItem, InstructorItem } from '../types';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jaxuxvekkbhfudwyahty.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_r7Ok0c6nVvSxoIj9eOsDzw_WUoRUhDK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// =============================================================================
// DATA ACCESS LAYER — Lectura y escritura contra el proyecto Supabase
// Todas las funciones degradan con gracia ([] en error) para que el front
// mantenga sus datos mock cuando las tablas aún no existen en el proyecto.
// =============================================================================

type Row = Record<string, any>;

const safeArray = <T>(rows: Row[] | null, mapper: (r: Row) => T): T[] =>
  Array.isArray(rows) ? rows.map(mapper) : [];

const isoNow = (date?: string | null): string => {
  if (!date) return new Date().toISOString();
  return date;
};

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return new Date().toISOString().replace('T', ' ').substring(0, 19);
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const formatUploadDate = (createdAt: string): string => {
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return 'Hace un momento';
  const diffHours = (Date.now() - d.getTime()) / (3600 * 1000);
  if (diffHours < 24) return 'Hace un momento';
  if (diffHours < 48) return 'Ayer';
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const mapEvidenceRow = (r: Row): Evidence => ({
  id: r.id,
  user_id: r.user_id || 'demo-user',
  student_name: r.student_name || 'Aprendiz SENA',
  student_email: r.student_email,
  ficha_code: r.ficha_code || 'ADSO 2673890',
  title: r.title || 'Evidencia Formativa',
  type: r.type || 'Bitácora Quincenal',
  description: r.description,
  hours: Number(r.hours) || 0,
  file_name: r.file_name || 'Documento.pdf',
  file_url: r.file_url,
  file_size: r.file_size,
  upload_date: formatUploadDate(isoNow(r.created_at)),
  upload_timestamp: Date.parse(isoNow(r.created_at)) || Date.now(),
  status: (r.status as Evidence['status']) || 'En revisión',
  feedback: r.feedback,
  evaluated_by: r.evaluated_by,
  evaluated_at: r.evaluated_at ? formatUploadDate(r.evaluated_at) : undefined,
});

export const mapFichaRow = (r: Row): Ficha => ({
  code: r.code,
  name: r.name,
  status: (r.status as Ficha['status']) || 'ACTIVO',
  total_students: Number(r.total_students) || 0,
  progress_percentage: Number(r.progress_percentage) || 0,
  instructor_id: r.instructor_id,
  instructor_name: r.instructor_name,
  created_at: r.created_at,
});

export const mapEmpresaRow = (r: Row): Empresa => ({
  id: r.id,
  nombre: r.nombre,
  nit: r.nit,
  persona_contacto: r.persona_contacto,
  telefono: r.telefono,
  contacto: r.contacto,
  direccion: r.direccion,
  activa: !!r.activa,
});

export const mapAlertaRow = (r: Row): AlertaItem => ({
  id: r.id,
  remitente: r.remitente,
  destino: r.destino,
  mensaje: r.mensaje,
  fecha: formatDateTime(r.created_at),
});

export const mapHistorialRow = (r: Row): HistorialCambios => ({
  id: r.id,
  fecha: formatDateTime(r.fecha),
  usuario_nombre: r.usuario_nombre,
  modulo: r.modulo,
  accion: (r.accion as HistorialCambios['accion']) || 'CREAR',
  descripcion: r.descripcion,
});

// ---------------------------------------------------------------------------
// READS
// ---------------------------------------------------------------------------

export const fetchFichas = async (): Promise<Ficha[]> => {
  const { data, error } = await supabase.from('fichas').select('*').order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchFichas:', error.message);
    return [];
  }
  return safeArray(data as Row[], mapFichaRow);
};

export const fetchEmpresas = async (): Promise<Empresa[]> => {
  const { data, error } = await supabase.from('empresas').select('*').order('id', { ascending: true });
  if (error) {
    console.warn('fetchEmpresas:', error.message);
    return [];
  }
  return safeArray(data as Row[], mapEmpresaRow);
};

export const fetchEvidencias = async (userId?: string): Promise<Evidence[]> => {
  const query = supabase.from('evidencias').select('*');
  if (userId) query.eq('user_id', userId);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchEvidencias:', error.message);
    return [];
  }
  return safeArray(data as Row[], mapEvidenceRow);
};

export const fetchAlertas = async (): Promise<AlertaItem[]> => {
  const { data, error } = await supabase.from('alertas').select('*').order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchAlertas:', error.message);
    return [];
  }
  return safeArray(data as Row[], mapAlertaRow);
};

export const fetchHistorial = async (): Promise<HistorialCambios[]> => {
  const { data, error } = await supabase.from('historial_cambios').select('*').order('fecha', { ascending: false });
  if (error) {
    console.warn('fetchHistorial:', error.message);
    return [];
  }
  return safeArray(data as Row[], mapHistorialRow);
};

export const mapApprenticeRow = (r: Row): ApprenticeItem => ({
  id: r.id,
  name: r.full_name || 'Aprendiz SENA',
  initials: (r.full_name || 'AS')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
  email: r.email,
  ficha: r.ficha_code || 'ADSO 2673890',
  document_type: r.document_type,
  document_number: r.document_number,
  hours: Number(r.total_hours) || 0,
  totalHours: Number(r.required_hours) || 864,
  status: (r.practice_status as ApprenticeItem['status']) || 'Al día',
  company_id: r.company_id,
});

export const fetchApprentices = async (): Promise<ApprenticeItem[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'aprendiz')
    .order('full_name', { ascending: true });
  if (error) {
    console.warn('fetchApprentices:', error.message);
    return [];
  }
  return safeArray(data as Row[], mapApprenticeRow);
};

// ---------------------------------------------------------------------------
// WRITES
// ---------------------------------------------------------------------------

export const insertFicha = async (ficha: Partial<Ficha>) => {
  const { data, error } = await supabase.from('fichas').insert({
    code: ficha.code,
    name: ficha.name,
    status: ficha.status || 'ACTIVO',
    total_students: ficha.total_students || 0,
    progress_percentage: ficha.progress_percentage || 0,
    instructor_id: ficha.instructor_id,
    instructor_name: ficha.instructor_name,
  });
  if (error) console.warn('insertFicha:', error.message);
  return { data, error };
};

export const insertEmpresa = async (empresa: Partial<Empresa>) => {
  const { data, error } = await supabase.from('empresas').insert({
    nombre: empresa.nombre,
    nit: empresa.nit,
    persona_contacto: empresa.persona_contacto,
    telefono: empresa.telefono,
    contacto: empresa.contacto,
    direccion: empresa.direccion,
    activa: empresa.activa ?? true,
  });
  if (error) console.warn('insertEmpresa:', error.message);
  return { data, error };
};

export const insertAlerta = async (alerta: { remitente: string; destino: string; mensaje: string }) => {
  const { data, error } = await supabase.from('alertas').insert(alerta);
  if (error) console.warn('insertAlerta:', error.message);
  return { data, error };
};

export const insertHistorial = async (historial: {
  usuario_nombre: string;
  modulo: string;
  accion: HistorialCambios['accion'] | string;
  descripcion: string;
}) => {
  const { data, error } = await supabase.from('historial_cambios').insert(historial);
  if (error) console.warn('insertHistorial:', error.message);
  return { data, error };
};

export const insertEvidencia = async (evidencia: Partial<Evidence> & { status?: string }) => {
  const { data, error } = await supabase.from('evidencias').insert({
    user_id: evidencia.user_id,
    student_name: evidencia.student_name,
    student_email: evidencia.student_email,
    ficha_code: evidencia.ficha_code,
    title: evidencia.title,
    type: evidencia.type,
    description: evidencia.description,
    hours: evidencia.hours,
    file_name: evidencia.file_name,
    file_url: evidencia.file_url,
    file_size: evidencia.file_size,
    status: evidencia.status || 'En revisión',
  });
  if (error) console.warn('insertEvidencia:', error.message);
  return { data, error };
};

export const updateEvidencia = async (id: string, fields: { status?: string; feedback?: string; evaluated_by?: string; evaluated_at?: string }) => {
  const { data, error } = await supabase.from('evidencias').update(fields).eq('id', id);
  if (error) console.warn('updateEvidencia:', error.message);
  return { data, error };
};

export const upsertProfile = async (profile: {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  document_type?: string;
  document_number?: string;
  ficha_code?: string;
}) => {
  const { data, error } = await supabase.from('profiles').upsert({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
    document_type: profile.document_type || 'Cédula de Ciudadanía',
    document_number: profile.document_number || '',
    ficha_code: profile.ficha_code || 'ADSO 2673890',
  });
  if (error) console.warn('upsertProfile:', error.message);
  return { data, error };
};

// ---------------------------------------------------------------------------
// STORAGE (archivos de evidencias)
// ---------------------------------------------------------------------------

const EVIDENCES_BUCKET = 'evidencias';

export const uploadEvidenceFile = async (userId: string, file: File): Promise<{ publicUrl: string | null; path: string | null; error: string | null }> => {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage.from(EVIDENCES_BUCKET).upload(filePath, file, { upsert: false });
  if (error) {
    console.warn('uploadEvidenceFile:', error.message);
    return { publicUrl: null, path: null, error: error.message };
  }
  const { data: urlData } = supabase.storage.from(EVIDENCES_BUCKET).getPublicUrl(filePath);
  return { publicUrl: urlData?.publicUrl || null, path: filePath, error: null };
};

// ---------------------------------------------------------------------------
// SEED — Datos iniciales si las tablas están vacías
// ---------------------------------------------------------------------------

export const seedDatabase = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('seed_sena_data');
    if (error) {
      console.warn('seedDatabase (ejecute schema_sena_supabase.sql en Supabase):', error.message);
      return false;
    }
    return data === true || data === null || data === undefined;
  } catch (err) {
    console.warn('seedDatabase error:', err);
    return false;
  }
};

// Initial mock & fallback data matching the exact screenshots provided
export const INITIAL_APRENDIZ: UserProfile = {
  id: 'aprendiz-demo-1',
  email: 'aprendiz@sena.edu.co',
  full_name: 'Usuario SENA',
  role: 'aprendiz',
  document_type: 'Cédula de Ciudadanía',
  document_number: '1000234567',
  ficha_code: 'ADSO 2673890',
  ficha_name: 'Análisis y Desarrollo de Software',
  regional: 'Regional Antioquia',
  center: 'Centro de Comercio',
  avatar_url: '',
  total_hours: 480,
  required_hours: 864,
  approved_evidences_count: 12,
  practice_status: 'En Proceso',
  start_date: '01 Jul, 2023',
  end_date: '15 Dic, 2023',
  days_remaining: 48,
  progress_percentage: 55,
  assigned_instructor_name: 'Carlos Arturo Restrepo',
  assigned_instructor_email: 'carlos.restrepo@sena.edu.co',
  assigned_instructor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const INITIAL_INSTRUCTOR: UserProfile = {
  id: 'instructor-demo-1',
  email: 'carlos.restrepo@sena.edu.co',
  full_name: 'Carlos Arturo Restrepo',
  role: 'instructor',
  document_type: 'Cédula de Ciudadanía',
  document_number: '71234567',
  ficha_code: 'ADSO 2673890',
  ficha_name: 'Análisis y Desarrollo de Software',
  regional: 'Regional Antioquia',
  center: 'Centro de Comercio',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  total_hours: 864,
  required_hours: 864,
  approved_evidences_count: 45,
  practice_status: 'En Proceso',
  start_date: '01 Ene, 2023',
  end_date: '31 Dic, 2025',
  days_remaining: 180,
  progress_percentage: 100,
  assigned_instructor_name: '',
  assigned_instructor_email: '',
};

export const INITIAL_ADMIN: UserProfile = {
  id: 'admin-demo-1',
  email: 'coordinacion.academica@sena.edu.co',
  full_name: 'Dra. Esperanza Gómez',
  role: 'admin',
  document_type: 'Cédula de Ciudadanía',
  document_number: '43987654',
  ficha_code: 'SEDE-CENTRAL',
  ficha_name: 'Coordinación Misional y de Formación',
  regional: 'Regional Antioquia',
  center: 'Centro de Comercio y Servicios',
  avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  total_hours: 864,
  required_hours: 864,
  approved_evidences_count: 140,
  practice_status: 'En Proceso',
  start_date: '01 Ene, 2023',
  end_date: '31 Dic, 2026',
  days_remaining: 365,
  progress_percentage: 100,
  assigned_instructor_name: '',
  assigned_instructor_email: '',
};

export const INITIAL_EVIDENCES: Evidence[] = [
  {
    id: 'ev-1',
    user_id: 'aprendiz-demo-1',
    student_name: 'Maria Camila Rojas',
    student_initials: 'MC',
    student_email: 'mc.rojas@sena.edu.co',
    ficha_code: 'ADSO 2673890',
    title: 'Informe de Práctica Mes 2',
    type: 'Informe Mensual',
    description: 'Reporte consolidado de actividades del segundo mes de etapa productiva en la empresa patrocinadora.',
    hours: 80,
    file_name: 'Informe_Mes2_CamilaRojas.pdf',
    file_size: '2.4 MB',
    upload_date: 'Hace 2 horas',
    upload_timestamp: Date.now() - 2 * 3600 * 1000,
    status: 'En revisión',
  },
  {
    id: 'ev-2',
    user_id: 'aprendiz-demo-1',
    student_name: 'Juan Osorio',
    student_initials: 'JO',
    student_email: 'j.osorio@sena.edu.co',
    ficha_code: 'ADSO 2673890',
    title: 'Bitácora Semana 8',
    type: 'Bitácora',
    description: 'Desarrollo de módulos frontend y conexión con API REST según requerimientos del sprint.',
    hours: 40,
    file_name: 'Bitacora_Semana_8_JO.pdf',
    file_size: '1.1 MB',
    upload_date: 'Hace 5 horas',
    upload_timestamp: Date.now() - 5 * 3600 * 1000,
    status: 'En revisión',
  },
  {
    id: 'ev-3',
    user_id: 'aprendiz-demo-1',
    student_name: 'Ana Valencia',
    student_initials: 'AV',
    student_email: 'a.valencia@sena.edu.co',
    ficha_code: 'TPS 2567123',
    title: 'Evaluación Jefe Inmediato',
    type: 'Evaluación de Desempeño',
    description: 'Formulario oficial diligenciado y firmado por el supervisor empresarial.',
    hours: 0,
    file_name: 'Evaluacion_Jefe_Inmediato_Firma.pdf',
    file_size: '3.2 MB',
    upload_date: 'Ayer',
    upload_timestamp: Date.now() - 24 * 3600 * 1000,
    status: 'En revisión',
  },
  {
    id: 'ev-4',
    user_id: 'aprendiz-demo-1',
    student_name: 'Luis Díaz',
    student_initials: 'LD',
    student_email: 'l.diaz@sena.edu.co',
    ficha_code: 'ADSO 2673890',
    title: 'Plan de Mejora',
    type: 'Plan de Mejora',
    description: 'Acciones correctivas acordadas en la última visita de seguimiento del instructor.',
    hours: 20,
    file_name: 'Plan_De_Mejora_Fase1.pdf',
    file_size: '890 KB',
    upload_date: '28 Oct 2023',
    upload_timestamp: Date.now() - 48 * 3600 * 1000,
    status: 'En revisión',
  },
  {
    id: 'ev-5',
    user_id: 'aprendiz-demo-1',
    student_name: 'Usuario SENA',
    student_initials: 'US',
    student_email: 'aprendiz@sena.edu.co',
    ficha_code: 'ADSO 2673890',
    title: 'Bitácora Quincenal #4',
    type: 'Bitácora Quincenal',
    description: 'Bitácora de seguimiento de actividades quincenales periodo Octubre 1 al 15.',
    hours: 80,
    file_name: 'Bitacora_Quincenal_04_SENA.pdf',
    file_size: '1.8 MB',
    upload_date: '15 Oct, 2023',
    upload_timestamp: Date.now() - 60 * 3600 * 1000,
    status: 'En revisión',
  },
  {
    id: 'ev-6',
    user_id: 'aprendiz-demo-1',
    student_name: 'Usuario SENA',
    student_initials: 'US',
    student_email: 'aprendiz@sena.edu.co',
    ficha_code: 'ADSO 2673890',
    title: 'Bitácora Quincenal #3',
    type: 'Bitácora Quincenal',
    description: 'Implementación de pruebas unitarias y documentación técnica del sistema.',
    hours: 80,
    file_name: 'Bitacora_Quincenal_03_SENA.pdf',
    file_size: '2.1 MB',
    upload_date: '01 Oct, 2023',
    upload_timestamp: Date.now() - 120 * 3600 * 1000,
    status: 'Aprobado',
    feedback: 'Excelente cumplimiento de las metas del periodo. Evidencia aprobada sin observaciones.',
    evaluated_by: 'Carlos Arturo Restrepo',
    evaluated_at: '03 Oct, 2023',
  },
  {
    id: 'ev-7',
    user_id: 'aprendiz-demo-1',
    student_name: 'Usuario SENA',
    student_initials: 'US',
    student_email: 'aprendiz@sena.edu.co',
    ficha_code: 'ADSO 2673890',
    title: 'Formato de Seguimiento Etapa Productiva',
    type: 'Formato F023',
    description: 'Formato de seguimiento concertado con la empresa para la primera visita oficial.',
    hours: 0,
    file_name: 'Formato_F023_Seguimiento_Final.pdf',
    file_size: '3.6 MB',
    upload_date: '28 Sep, 2023',
    upload_timestamp: Date.now() - 150 * 3600 * 1000,
    status: 'Aprobado',
    feedback: 'Diligenciado correctamente con firmas correspondientes.',
    evaluated_by: 'Carlos Arturo Restrepo',
    evaluated_at: '29 Sep, 2023',
  },
  {
    id: 'ev-8',
    user_id: 'aprendiz-demo-1',
    student_name: 'Usuario SENA',
    student_initials: 'US',
    student_email: 'aprendiz@sena.edu.co',
    ficha_code: 'ADSO 2673890',
    title: 'Bitácora Quincenal #2',
    type: 'Bitácora Quincenal',
    description: 'Desarrollo de base de datos relacional y scripts de migración.',
    hours: 80,
    file_name: 'Bitacora_Quincenal_02_SENA.pdf',
    file_size: '1.4 MB',
    upload_date: '15 Sep, 2023',
    upload_timestamp: Date.now() - 180 * 3600 * 1000,
    status: 'Observaciones',
    feedback: 'Falta la firma del jefe inmediato en la hoja 2. Por favor corregir y volver a adjuntar.',
    evaluated_by: 'Carlos Arturo Restrepo',
    evaluated_at: '18 Sep, 2023',
  },
];

export const INITIAL_FICHAS: Ficha[] = [
  {
    code: 'ADSO 2673890',
    name: 'Análisis y Desarrollo de Software',
    status: 'ACTIVO',
    total_students: 24,
    progress_percentage: 65,
  },
  {
    code: 'TPS 2567123',
    name: 'Tecnólogo en Programación de Software',
    status: 'ACTIVO',
    total_students: 21,
    progress_percentage: 42,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Bitácora #3 Aprobada',
    message: 'El instructor Carlos Restrepo ha aprobado tu Bitácora Quincenal #3.',
    time: 'Hace 1 día',
    read: false,
    type: 'success',
  },
  {
    id: 'notif-2',
    title: 'Observación en Bitácora #2',
    message: 'Se requiere adjuntar firma del jefe inmediato.',
    time: 'Hace 3 días',
    read: false,
    type: 'warning',
  },
  {
    id: 'notif-3',
    title: 'Próxima visita de seguimiento',
    message: 'Programada visita de seguimiento para el 20 de Noviembre.',
    time: 'Hace 1 semana',
    read: true,
    type: 'info',
  },
];

export const INITIAL_EMPRESAS: Empresa[] = [
  {
    id: 1,
    nombre: 'Tech Solutions S.A.S.',
    nit: '900.123.456-1',
    persona_contacto: 'Laura Restrepo Gómez',
    telefono: '3104567890',
    contacto: 'laura.restrepo@techsolutions.com',
    direccion: 'Calle 10 # 43E-12, Medellín',
    activa: true,
  },
  {
    id: 2,
    nombre: 'Bancolombia S.A.',
    nit: '890.903.938-8',
    persona_contacto: 'Andrés Felipe Morales',
    telefono: '3001234567',
    contacto: 'talento@bancolombia.com.co',
    direccion: 'Carrera 48 # 26-85, Medellín',
    activa: true,
  },
  {
    id: 3,
    nombre: 'Innovatech Colombia',
    nit: '901.345.678-2',
    persona_contacto: 'Santiago Cardona',
    telefono: '3157890123',
    contacto: 'scardona@innovatech.co',
    direccion: 'Av. El Poblado # 5A-113, Medellín',
    activa: true,
  },
  {
    id: 4,
    nombre: 'Software Enterprise SAS',
    nit: '900.876.543-9',
    persona_contacto: 'Carolina Montoya',
    telefono: '3209876543',
    contacto: 'contacto@softwareenterprise.com',
    direccion: 'Cra 43A # 1Sur-220, Medellín',
    activa: true,
  },
  {
    id: 5,
    nombre: 'Grupo Nutresa S.A.',
    nit: '890.900.050-1',
    persona_contacto: 'Diana Patricia Silva',
    telefono: '3123456789',
    contacto: 'practicantes@gruponutresa.com',
    direccion: 'Calle 8 Sur # 50-67, Medellín',
    activa: true,
  },
];

export const INITIAL_HISTORIAL: HistorialCambios[] = [
  {
    id: 1,
    fecha: '2026-09-02 15:40:12',
    usuario_nombre: 'Dra. Esperanza Gómez',
    modulo: 'Empresas',
    accion: 'CREAR',
    descripcion: 'Registro de nueva empresa convenio: Tech Solutions S.A.S.',
  },
  {
    id: 2,
    fecha: '2026-09-02 14:20:00',
    usuario_nombre: 'Carlos Arturo Restrepo',
    modulo: 'Evidencias',
    accion: 'EVALUAR',
    descripcion: 'Aprobó Bitácora Quincenal #3 de Maria Camila Rojas',
  },
  {
    id: 3,
    fecha: '2026-09-02 11:15:30',
    usuario_nombre: 'Carlos Arturo Restrepo',
    modulo: 'Aprendiz',
    accion: 'MODIFICAR',
    descripcion: 'Asignó empresa patrocinadora "Innovatech Colombia" al aprendiz Juan Osorio',
  },
  {
    id: 4,
    fecha: '2026-09-01 16:45:10',
    usuario_nombre: 'Dra. Esperanza Gómez',
    modulo: 'Fichas',
    accion: 'CREAR',
    descripcion: 'Creación de ficha ADSO 2673890 con 24 aprendices matriculados',
  },
  {
    id: 5,
    fecha: '2026-09-01 09:00:00',
    usuario_nombre: 'Sistema SENA',
    modulo: 'Autenticación',
    accion: 'LOGIN',
    descripcion: 'Inicio de sesión exitoso usuario: admin@sena.edu.co',
  },
];

export const INITIAL_INSTRUCTORES: InstructorItem[] = [
  {
    id: 1,
    usuario_id: 'instructor-demo-1',
    nombres: 'Carlos Arturo',
    apellidos: 'Restrepo Vélez',
    correo: 'carlos.restrepo@sena.edu.co',
    area_formacion: 'Análisis y Desarrollo de Software',
    activo: true,
    fichas_asignadas: ['ADSO 2673890', 'TPS 2567123'],
  },
  {
    id: 2,
    usuario_id: 'instructor-demo-2',
    nombres: 'Patricia Helena',
    apellidos: 'Montoya Gómez',
    correo: 'patricia.montoya@sena.edu.co',
    area_formacion: 'Programación y Bases de Datos',
    activo: true,
    fichas_asignadas: ['TPS 2567123'],
  },
  {
    id: 3,
    usuario_id: 'instructor-demo-3',
    nombres: 'Mauricio',
    apellidos: 'Vélez Morales',
    correo: 'mauricio.velez@sena.edu.co',
    area_formacion: 'Infraestructura y Redes',
    activo: true,
    fichas_asignadas: ['ADSO 2673890'],
  },
];

export const INITIAL_APPRENTICES: ApprenticeItem[] = [
  {
    id: 'app-1',
    name: 'Maria Camila Rojas',
    initials: 'MC',
    email: 'mc.rojas@sena.edu.co',
    ficha: 'ADSO 2673890',
    document_type: 'Cédula de Ciudadanía',
    document_number: '1000234567',
    phone: '3124567890',
    hours: 560,
    totalHours: 864,
    status: 'Al día',
    company_id: 1,
    company_name: 'Tech Solutions S.A.S.',
  },
  {
    id: 'app-2',
    name: 'Juan Osorio',
    initials: 'JO',
    email: 'j.osorio@sena.edu.co',
    ficha: 'ADSO 2673890',
    document_type: 'Cédula de Ciudadanía',
    document_number: '1001987654',
    phone: '3157891234',
    hours: 480,
    totalHours: 864,
    status: 'Al día',
    company_id: 3,
    company_name: 'Innovatech Colombia',
  },
  {
    id: 'app-3',
    name: 'Ana Valencia',
    initials: 'AV',
    email: 'a.valencia@sena.edu.co',
    ficha: 'TPS 2567123',
    document_type: 'Tarjeta de Identidad',
    document_number: '1002345678',
    phone: '3206549870',
    hours: 410,
    totalHours: 864,
    status: 'En seguimiento',
    company_id: 2,
    company_name: 'Bancolombia S.A.',
  },
  {
    id: 'app-4',
    name: 'Luis Díaz',
    initials: 'LD',
    email: 'l.diaz@sena.edu.co',
    ficha: 'ADSO 2673890',
    document_type: 'Cédula de Ciudadanía',
    document_number: '1003456789',
    phone: '3145678901',
    hours: 320,
    totalHours: 864,
    status: 'Plan de Mejora',
    company_id: 4,
    company_name: 'Software Enterprise SAS',
  },
  {
    id: 'app-5',
    name: 'Usuario SENA',
    initials: 'US',
    email: 'aprendiz@sena.edu.co',
    ficha: 'ADSO 2673890',
    document_type: 'Cédula de Ciudadanía',
    document_number: '1000234567',
    phone: '3109876543',
    hours: 480,
    totalHours: 864,
    status: 'Al día',
    company_id: 4,
    company_name: 'Software Enterprise SAS',
  },
  {
    id: 'app-6',
    name: 'Valentina Restrepo',
    initials: 'VR',
    email: 'v.restrepo@sena.edu.co',
    ficha: 'TPS 2567123',
    document_type: 'Cédula de Ciudadanía',
    document_number: '1004567890',
    phone: '3187654321',
    hours: 620,
    totalHours: 864,
    status: 'Al día',
    company_id: 5,
    company_name: 'Grupo Nutresa S.A.',
  },
];

export const INITIAL_ALERTAS: AlertaItem[] = [
  {
    id: 'alert-1',
    remitente: 'Carlos Arturo Restrepo (Instructor)',
    destino: 'ADSO 2673890',
    mensaje: 'Recordatorio: Plazo máximo de entrega de la Bitácora Quincenal #4 vence este viernes.',
    fecha: '2026-09-02 08:30',
  },
  {
    id: 'alert-2',
    remitente: 'Carlos Arturo Restrepo (Instructor)',
    destino: 'TPS 2567123',
    mensaje: 'Por favor confirmar fecha de visita de concertación con su supervisor empresarial.',
    fecha: '2026-09-01 14:00',
  },
];

// Convenient mock aliases
export const mockAprendiz = INITIAL_APRENDIZ;
export const mockInstructor = INITIAL_INSTRUCTOR;
export const mockAdmin = INITIAL_ADMIN;
export const mockEvidences = INITIAL_EVIDENCES;
export const mockFichas = INITIAL_FICHAS;
export const mockNotifications = INITIAL_NOTIFICATIONS;
export const mockEmpresas = INITIAL_EMPRESAS;
export const mockHistorial = INITIAL_HISTORIAL;
export const mockInstructores = INITIAL_INSTRUCTORES;
export const mockApprentices = INITIAL_APPRENTICES;
export const mockAlertas = INITIAL_ALERTAS;

