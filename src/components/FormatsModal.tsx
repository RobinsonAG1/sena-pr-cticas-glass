import React from 'react';
import { X, Download, FileText, CheckCircle } from 'lucide-react';

interface FormatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormatsModal: React.FC<FormatsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const officialFormats = [
    {
      id: 'f1',
      code: 'GFPI-F-023',
      name: 'Formato Planeación, Seguimiento y Evaluación Etapa Productiva',
      version: 'Versión 04',
      size: '245 KB',
      type: 'DOCX / PDF',
    },
    {
      id: 'f2',
      code: 'BIT-QUI-01',
      name: 'Bitácora Quincenal de Etapa Productiva SENA',
      version: 'Versión 03',
      size: '180 KB',
      type: 'XLSX / PDF',
    },
    {
      id: 'f3',
      code: 'CONC-EMP-02',
      name: 'Acta de Concertación de Actividades con Ente Coformador',
      version: 'Versión 02',
      size: '190 KB',
      type: 'PDF',
    },
    {
      id: 'f4',
      code: 'EVAL-JEFE-05',
      name: 'Formato de Evaluación Final del Jefe Inmediato',
      version: 'Versión 03',
      size: '210 KB',
      type: 'DOCX',
    },
  ];

  const handleDownload = (formatName: string) => {
    const textContent = `SERVICIO NACIONAL DE APRENDIZAJE SENA\nFORMATO INSTITUCIONAL OFICIAL\n${formatName}\nDescargado desde SENA Prácticas Glass.`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formatName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Formatos Oficiales SENA</h2>
            <p className="text-xs text-slate-400">
              Descarga plantillas institucionales vigentes para la etapa productiva.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {officialFormats.map((format) => (
            <div
              key={format.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-white/15 flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {format.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Código: <span className="text-slate-300 font-semibold">{format.code}</span> • {format.version} • {format.size}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDownload(format.name)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 border border-white/10 hover:border-emerald-500 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <span>Sistema Integrado de Gestión y Autocontrol (SIGA) SENA</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
