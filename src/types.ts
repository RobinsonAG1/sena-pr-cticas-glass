export type UserRole = 'aprendiz' | 'instructor' | 'admin';

export type DocumentType = 
  | 'Cédula de Ciudadanía'
  | 'Tarjeta de Identidad'
  | 'Cédula de Extranjería'
  | 'PEP'
  | 'Permiso Protección Temporal (PPT)'
  | 'Pasaporte';

export type EvidenceStatus = 'Aprobado' | 'En revisión' | 'Observaciones';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  document_type: DocumentType;
  document_number: string;
  ficha_code: string;
  ficha_name: string;
  regional: string;
  center: string;
  avatar_url?: string;
  total_hours: number;
  required_hours: number;
  approved_evidences_count: number;
  practice_status: 'En Proceso' | 'Finalizada' | 'Pendiente' | 'En Riesgo';
  start_date: string;
  end_date: string;
  days_remaining: number;
  progress_percentage: number;
  assigned_instructor_name: string;
  assigned_instructor_email: string;
  assigned_instructor_avatar?: string;
}

export interface Evidence {
  id: string;
  user_id: string;
  student_name: string;
  student_initials?: string;
  student_email?: string;
  ficha_code: string;
  title: string;
  type: string;
  description?: string;
  hours: number;
  file_name: string;
  file_size?: string;
  file_url?: string;
  upload_date: string;
  upload_timestamp: number;
  status: EvidenceStatus;
  feedback?: string;
  evaluated_by?: string;
  evaluated_at?: string;
}

export interface Ficha {
  code: string;
  name: string;
  status: 'ACTIVO' | 'EN_CIERRE' | 'FINALIZADO';
  total_students: number;
  progress_percentage: number;
  instructor_id?: string;
  instructor_name?: string;
  created_at?: string;
}

export interface Empresa {
  id: number | string;
  nombre: string;
  nit: string;
  persona_contacto: string;
  telefono: string;
  contacto: string; // correo
  direccion: string;
  activa: boolean;
}

export interface HistorialCambios {
  id: number | string;
  fecha: string;
  usuario_nombre: string;
  modulo: string;
  accion: 'CREAR' | 'MODIFICAR' | 'ELIMINAR' | 'LOGIN' | 'EVALUAR';
  descripcion: string;
}

export interface InstructorItem {
  id: number | string;
  usuario_id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  area_formacion: string;
  activo: boolean;
  fichas_asignadas: string[];
}

export interface ApprenticeItem {
  id: string;
  name: string;
  initials?: string;
  email: string;
  ficha: string;
  document_type?: string;
  document_number?: string;
  phone?: string;
  hours: number;
  totalHours: number;
  status: 'Al día' | 'En seguimiento' | 'Plan de Mejora' | 'Finalizada' | 'Pendiente';
  company_id?: number | string;
  company_name?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'warning' | 'info' | 'urgent';
}

export interface AlertaItem {
  id: string;
  remitente: string;
  destino: string; // 'todos' o ficha o email
  mensaje: string;
  fecha: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  text: string;
  timestamp: string;
}

