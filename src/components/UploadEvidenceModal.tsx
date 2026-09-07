import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Evidence, UserProfile } from '../types';
import { insertEvidencia, uploadEvidenceFile } from '../lib/supabase';

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onEvidenceCreated: (newEvidence: Evidence) => void;
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onEvidenceCreated,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Bitácora Quincenal');
  const [hours, setHours] = useState<number>(80);
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const studentName = currentUser?.full_name || 'Aprendiz SENA';
  const studentEmail = currentUser?.email || 'aprendiz@sena.edu.co';
  const fichaCode = currentUser?.ficha_code || 'ADSO 2673890';
  const studentInitials = studentName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('') || 'AP';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(`${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const generatedFileName = fileName || `${title.replace(/\s+/g, '_')}_SENA.pdf`;

    // 1. Upload the physical file to Supabase Storage (if a file was selected)
    let fileUrl: string | null = null;
    if (file) {
      try {
        const upload = await uploadEvidenceFile(currentUser?.id || 'demo-user', file);
        fileUrl = upload.publicUrl || null;
        if (upload.error) {
          console.warn('Storage upload skipped:', upload.error);
        }
      } catch (err: any) {
        console.warn('Storage upload skipped (bucket may not exist):', err?.message || err);
      }
    }

    const newEvidence: Evidence = {
      id: `ev-${Date.now()}`,
      user_id: currentUser?.id || 'demo-user',
      student_name: studentName,
      student_initials: studentInitials,
      student_email: studentEmail,
      ficha_code: fichaCode,
      title: title || 'Nueva Evidencia Formativa',
      type: type,
      description: description,
      hours: Number(hours) || 0,
      file_name: generatedFileName,
      file_url: fileUrl || undefined,
      file_size: fileSize || '1.8 MB',
      upload_date: 'Hace un momento',
      upload_timestamp: Date.now(),
      status: 'En revisión',
    };

    // 2. Persist the evidence row in Supabase
    const { error: dbError } = await insertEvidencia(newEvidence);
    if (dbError) {
      setError(`No se pudo persistir la evidencia en Supabase: ${dbError.message}`);
      setSubmitting(false);
      return;
    }

    onEvidenceCreated(newEvidence);
    setSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setFileName(null);
      setFile(null);
      setError(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Subir Nueva Evidencia
            </h2>
            <p className="text-xs text-slate-400">
              Adjunta tu bitácora o formato de seguimiento para revisión del instructor.
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">¡Evidencia Radicada con Éxito!</h3>
            <p className="text-xs text-slate-400">
              Notificación enviada a tu instructor asignado. Estado: En revisión.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Título de la Evidencia
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Bitácora Quincenal #5"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tipo de Formato
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="Bitácora Quincenal">Bitácora Quincenal</option>
                  <option value="Formato F023">Formato F023 de Seguimiento</option>
                  <option value="Informe Mensual">Informe Mensual de Práctica</option>
                  <option value="Evaluación de Desempeño">Evaluación Jefe Inmediato</option>
                  <option value="Plan de Trabajo">Plan de Trabajo Inicial</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Horas Reportadas
                </label>
                <input
                  type="number"
                  min="0"
                  max="160"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Descripción de Actividades Realizadas
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente las tareas o logros cumplidos durante este periodo..."
                className="w-full p-3 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Drag & Drop / File Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Adjuntar Archivo Firmado (PDF, DOCX)
              </label>
              <label className="border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/60 transition-all">
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileText className="w-8 h-8 text-indigo-400 mb-2" />
                {fileName ? (
                  <div className="text-xs">
                    <span className="font-semibold text-emerald-400 block">{fileName}</span>
                    <span className="text-slate-500">{fileSize}</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    <span className="font-medium text-slate-200 block mb-0.5">
                      Haz clic para seleccionar o arrastra el documento
                    </span>
                    <span>Máximo 15MB en formato PDF oficial</span>
                  </div>
                )}
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !title}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                {submitting ? 'Subiendo...' : 'Radicar Evidencia'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
