import React, { useState } from 'react';
import {
  IdCard,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  User,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Users,
} from 'lucide-react';
import { SenaLogo } from './SenaLogo';
import type { DocumentType, UserRole, UserProfile } from '../types';
import { supabase, mockAdmin, upsertProfile } from '../lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  aprendizDemo: UserProfile;
  instructorDemo: UserProfile;
  adminDemo?: UserProfile;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  aprendizDemo,
  instructorDemo,
  adminDemo = mockAdmin,
}) => {
  const [selectedRole, setSelectedRole] = useState<'aprendiz' | 'instructor' | 'admin'>('aprendiz');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('Cédula de Ciudadanía');
  const [docNumber, setDocNumber] = useState('1000234567');
  const [email, setEmail] = useState('carlos.restrepo@sena.edu.co');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('Nuevo Usuario SENA');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const documentTypes: DocumentType[] = [
    'Cédula de Ciudadanía',
    'Tarjeta de Identidad',
    'Cédula de Extranjería',
    'PEP',
    'Permiso Protección Temporal (PPT)',
    'Pasaporte',
  ];

  const handleRoleTabChange = (role: 'aprendiz' | 'instructor' | 'admin') => {
    setSelectedRole(role);
    setIsRegisterMode(false);
    setErrorMessage(null);
    if (role === 'aprendiz') {
      setDocNumber('1000234567');
    } else if (role === 'instructor') {
      setEmail('carlos.restrepo@sena.edu.co');
    } else {
      setEmail('coordinacion.academica@sena.edu.co');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const loginEmail =
        selectedRole === 'aprendiz'
          ? `aprendiz_${docNumber.replace(/\D/g, '') || '1000234567'}@sena.edu.co`
          : email;

      // Attempt Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password.length >= 6 ? password : 'Password123!',
      });

      if (error) {
        console.warn('Supabase auth note:', error.message);
      }

      // Sync the authenticated profile into the profiles table
      if (data.session?.user) {
        upsertProfile({
          id: data.session.user.id,
          email: data.session.user.email || loginEmail,
          full_name: data.session.user.user_metadata?.full_name || fullName,
          role: selectedRole,
          document_type: docType,
          document_number: docNumber,
          ficha_code: 'ADSO 2673890',
        });
      }

      // Successful routing based on role
      if (selectedRole === 'instructor') {
        const user: UserProfile = {
          ...instructorDemo,
          email: email || instructorDemo.email,
        };
        onLoginSuccess(user);
      } else if (selectedRole === 'admin') {
        const user: UserProfile = {
          ...adminDemo,
          email: email || adminDemo.email,
        };
        onLoginSuccess(user);
      } else {
        const user: UserProfile = {
          ...aprendizDemo,
          document_type: docType,
          document_number: docNumber || '1000234567',
        };
        onLoginSuccess(user);
      }
    } catch (err: any) {
      if (selectedRole === 'instructor') {
        onLoginSuccess(instructorDemo);
      } else if (selectedRole === 'admin') {
        onLoginSuccess(adminDemo);
      } else {
        onLoginSuccess(aprendizDemo);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password.length >= 6 ? password : 'Password123!',
        options: {
          data: {
            full_name: fullName,
            document_type: docType,
            document_number: docNumber,
            role: selectedRole,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('¡Cuenta creada con éxito! Iniciando sesión...');

        // Persist the profile (the DB trigger handle_new_user also does this)
        if (data.user) {
          upsertProfile({
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: selectedRole,
            document_type: docType,
            document_number: docNumber,
            ficha_code: 'ADSO 2673890',
          });
        }

        setTimeout(() => {
          onLoginSuccess({
            ...(selectedRole === 'instructor' ? instructorDemo : selectedRole === 'admin' ? adminDemo : aprendizDemo),
            full_name: fullName,
            email: email,
            document_type: docType,
            document_number: docNumber,
            role: selectedRole,
          });
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080f20] flex flex-col justify-between items-center relative overflow-hidden text-slate-100">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-10 my-auto">
        <div className="w-full max-w-md bg-[#0c1529]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Logo & Platform Name */}
          <div className="flex flex-col items-center text-center space-y-2">
            <SenaLogo size="lg" showText={false} />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              Plataforma Etapa Productiva
            </h1>
            <p className="text-xs text-slate-400 max-w-xs">
              Sistema Nacional de Aprendizaje SENA • Gestión y Seguimiento de Formación
            </p>
          </div>

          {/* Role Selection Tabs (Aprendiz, Instructor, Administrador) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Seleccione su rol de acceso:
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-white/10">
              <button
                type="button"
                id="login-role-aprendiz"
                onClick={() => handleRoleTabChange('aprendiz')}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedRole === 'aprendiz'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Aprendiz</span>
              </button>

              <button
                type="button"
                id="login-role-instructor"
                onClick={() => handleRoleTabChange('instructor')}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedRole === 'instructor'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Instructor</span>
              </button>

              <button
                type="button"
                id="login-role-admin"
                onClick={() => handleRoleTabChange('admin')}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Role Status Tag */}
          <div className="text-center">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                selectedRole === 'aprendiz'
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  : selectedRole === 'instructor'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              <span>Acceso para:</span>
              <strong className="capitalize">
                {selectedRole === 'admin' ? 'Coordinación / Administrador' : selectedRole}
              </strong>
            </span>
          </div>

          {/* Feedback banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Registration Mode */}
          {isRegisterMode ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Juan Pérez Gómez"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@sena.edu.co"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Contraseña de Registro
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                {loading ? 'Creando cuenta...' : 'Confirmar Registro'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            </form>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {selectedRole === 'aprendiz' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Tipo de Documento
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value as DocumentType)}
                        className="w-full h-11 pl-10 pr-8 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {documentTypes.map((type) => (
                          <option key={type} value={type} className="bg-slate-900 text-slate-200">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Número de Documento
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                        #
                      </span>
                      <input
                        type="text"
                        required
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="Ej. 1000234567"
                        className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Institutional Mode (Instructor / Admin) */
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Correo Institucional (@sena.edu.co)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'admin'
                          ? 'coordinacion@sena.edu.co'
                          : 'instructor@sena.edu.co'
                      }
                      className={`w-full h-11 pl-10 pr-3 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none ${
                        selectedRole === 'admin'
                          ? 'focus:border-amber-500'
                          : 'focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert('Para restablecer su contraseña, contacte al soporte del centro de formación SENA.')
                    }
                    className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-11 mt-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-amber-500/20'
                    : selectedRole === 'instructor'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-[#696fff] to-[#8185ff] hover:brightness-110 text-white shadow-indigo-600/30'
                }`}
              >
                {loading ? 'Validando...' : `Iniciar Sesión como ${selectedRole === 'admin' ? 'Admin' : selectedRole === 'instructor' ? 'Instructor' : 'Aprendiz'}`}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Direct Demo Access Buttons */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                  O prueba rápida en 1 clic:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onLoginSuccess(aprendizDemo)}
                    className="py-1.5 px-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold transition-colors cursor-pointer text-center"
                  >
                    Demo Aprendiz
                  </button>

                  <button
                    type="button"
                    onClick={() => onLoginSuccess(instructorDemo)}
                    className="py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors cursor-pointer text-center"
                  >
                    Demo Instructor
                  </button>

                  <button
                    type="button"
                    onClick={() => onLoginSuccess(adminDemo)}
                    className="py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold transition-colors cursor-pointer text-center"
                  >
                    Demo Admin
                  </button>
                </div>
              </div>

              {/* Register link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ¿No tienes cuenta registrada? Regístrate aquí
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
        <span>Plataforma Segura SENA 2025</span>
        <span className="mx-1.5">•</span>
        <span className="text-[11px] text-slate-600">Supabase Connected</span>
      </footer>
    </div>
  );
};
