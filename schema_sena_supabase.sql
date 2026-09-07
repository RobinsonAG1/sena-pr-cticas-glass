-- =============================================================================
-- ESQUEMA OFICIAL DE BASE DE DATOS: SENA PRÁCTICAS GLASS
-- Sistema Integrado de Seguimiento y Evaluación de Etapa Productiva SENA
-- =============================================================================

-- 1. TABLA: Fichas de Formación
CREATE TABLE IF NOT EXISTS public.fichas (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVO',
  total_students INT DEFAULT 0,
  progress_percentage INT DEFAULT 0,
  instructor_id UUID,
  instructor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA: Empresas Patrocinadoras / Coformadoras
CREATE TABLE IF NOT EXISTS public.empresas (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  nit TEXT UNIQUE NOT NULL,
  persona_contacto TEXT,
  telefono TEXT,
  contacto TEXT,
  direccion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA: Perfiles de Usuario (Aprendices, Instructores, Administradores)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('aprendiz', 'instructor', 'admin')),
  document_type TEXT DEFAULT 'Cédula de Ciudadanía',
  document_number TEXT,
  ficha_code TEXT REFERENCES public.fichas(code) ON DELETE SET NULL,
  regional TEXT DEFAULT 'Regional Antioquia',
  center TEXT DEFAULT 'Centro de Comercio',
  total_hours INT DEFAULT 0,
  required_hours INT DEFAULT 864,
  approved_evidences_count INT DEFAULT 0,
  practice_status TEXT DEFAULT 'En Proceso',
  start_date DATE,
  end_date DATE,
  company_id BIGINT REFERENCES public.empresas(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLA: Evidencias Formativas (Bitácoras, Informes, F023)
CREATE TABLE IF NOT EXISTS public.evidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT,
  ficha_code TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  hours INT DEFAULT 0,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size TEXT,
  status TEXT DEFAULT 'En revisión' CHECK (status IN ('Aprobado', 'En revisión', 'Observaciones')),
  feedback TEXT,
  evaluated_by TEXT,
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABLA: Historial y Auditoría de Cambios
CREATE TABLE IF NOT EXISTS public.historial_cambios (
  id BIGSERIAL PRIMARY KEY,
  fecha TIMESTAMPTZ DEFAULT now(),
  usuario_nombre TEXT NOT NULL,
  modulo TEXT NOT NULL,
  accion TEXT NOT NULL,
  descripcion TEXT NOT NULL
);

-- 6. TABLA: Alertas y Comunicados Institucionales
CREATE TABLE IF NOT EXISTS public.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remitente TEXT NOT NULL,
  destino TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.fichas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_cambios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS DE ACCESO RLS
-- =============================================================================
CREATE POLICY "Allow read access for authenticated users" ON public.fichas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.empresas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.evidencias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert/update for evidencias" ON public.evidencias FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow read for historial" ON public.historial_cambios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read for alertas" ON public.alertas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for historial" ON public.historial_cambios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for alertas" ON public.alertas FOR INSERT TO authenticated WITH CHECK (true);

-- Permisos anónimos para pruebas públicas locales
CREATE POLICY "Anon read fichas" ON public.fichas FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read empresas" ON public.empresas FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read evidencias" ON public.evidencias FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert evidencias" ON public.evidencias FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon read alertas" ON public.alertas FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read historial" ON public.historial_cambios FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert fichas" ON public.fichas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon insert empresas" ON public.empresas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon insert alertas" ON public.alertas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon insert historial" ON public.historial_cambios FOR INSERT TO anon WITH CHECK (true);

-- Permisos para que cada usuario autenticado gestione su propio perfil
CREATE POLICY "Allow insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Actualizaciones de evidencias por parte de usuarios autenticados (evaluación del instructor)
CREATE POLICY "Allow update evidencias" ON public.evidencias FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- TRIGGER: Creación automática de perfil al registrarse un usuario (auth.users)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    document_type,
    document_number,
    ficha_code,
    regional,
    center,
    required_hours
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario SENA'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'aprendiz'),
    COALESCE(NEW.raw_user_meta_data->>'document_type', 'Cédula de Ciudadanía'),
    COALESCE(NEW.raw_user_meta_data->>'document_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'ficha_code', 'ADSO 2673890'),
    COALESCE(NEW.raw_user_meta_data->>'regional', 'Regional Antioquia'),
    COALESCE(NEW.raw_user_meta_data->>'center', 'Centro de Comercio'),
    864
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STORAGE: Bucket público para archivos de evidencias
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidencias', 'evidencias', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public uploads to evidencias" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'evidencias');

CREATE POLICY "Allow authenticated uploads to evidencias" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidencias');

-- =============================================================================
-- DATOS INICIALES DE DEMOSTRACIÓN (seed idempotente)
-- Ejecutar este bloque una vez (o llamar desde la app con supabase.rpc('seed_sena_data')).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.seed_sena_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Idempotente: no insertar nada si la base ya tiene fichas registradas
  IF EXISTS (SELECT 1 FROM public.fichas) THEN
    RETURN;
  END IF;

  INSERT INTO public.fichas (code, name, status, total_students, progress_percentage, instructor_name)
  VALUES
    ('ADSO 2673890', 'Análisis y Desarrollo de Software', 'ACTIVO', 24, 65, 'Carlos Arturo Restrepo'),
    ('TPS 2567123', 'Tecnólogo en Programación de Software', 'ACTIVO', 21, 42, 'Carlos Arturo Restrepo')
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO public.empresas (nombre, nit, persona_contacto, telefono, contacto, direccion, activa)
  VALUES
    ('Tech Solutions S.A.S.', '900.123.456-1', 'Laura Restrepo Gómez', '3104567890', 'laura.restrepo@techsolutions.com', 'Calle 10 # 43E-12, Medellín', true),
    ('Bancolombia S.A.', '890.903.938-8', 'Andrés Felipe Morales', '3001234567', 'talento@bancolombia.com.co', 'Carrera 48 # 26-85, Medellín', true),
    ('Innovatech Colombia', '901.345.678-2', 'Santiago Cardona', '3157890123', 'scardona@innovatech.co', 'Av. El Poblado # 5A-113, Medellín', true),
    ('Software Enterprise SAS', '900.876.543-9', 'Carolina Montoya', '3209876543', 'contacto@softwareenterprise.com', 'Cra 43A # 1Sur-220, Medellín', true),
    ('Grupo Nutresa S.A.', '890.900.050-1', 'Diana Patricia Silva', '3123456789', 'practicantes@gruponutresa.com', 'Calle 8 Sur # 50-67, Medellín', true)
  ON CONFLICT (nit) DO NOTHING;

  INSERT INTO public.alertas (remitente, destino, mensaje)
  VALUES
    ('Carlos Arturo Restrepo (Instructor)', 'ADSO 2673890', 'Recordatorio: Plazo máximo de entrega de la Bitácora Quincenal #4 vence este viernes.'),
    ('Carlos Arturo Restrepo (Instructor)', 'TPS 2567123', 'Por favor confirmar fecha de visita de concertación con su supervisor empresarial.')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.historial_cambios (usuario_nombre, modulo, accion, descripcion)
  VALUES
    ('Dra. Esperanza Gómez', 'Empresas', 'CREAR', 'Registro de nueva empresa convenio: Tech Solutions S.A.S.'),
    ('Carlos Arturo Restrepo', 'Evidencias', 'EVALUAR', 'Aprobó Bitácora Quincenal #3 de Maria Camila Rojas'),
    ('Dra. Esperanza Gómez', 'Fichas', 'CREAR', 'Creación de ficha ADSO 2673890 con 24 aprendices matriculados')
  ON CONFLICT DO NOTHING;
END;
$$;
