-- =============================================================================
-- MIGRACIÓN SENA PRÁCTICAS GLASS — Conexión completa con Supabase
-- Ejecutar ESTE bloque (no el archivo completo) en el SQL Editor de Supabase.
-- Seguro de ejecutar: todas las sentencias son idempotentes.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PERMISOS ANÓNIMOS ADICIONALES (lectura para demo pública sin login)
-- ---------------------------------------------------------------------------
CREATE POLICY "Anon read alertas" ON public.alertas FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read historial" ON public.historial_cambios FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert fichas" ON public.fichas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon insert empresas" ON public.empresas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon insert alertas" ON public.alertas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon insert historial" ON public.historial_cambios FOR INSERT TO anon WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 2. PERMISOS AUTENTICADOS (cada usuario gestiona su propio perfil)
-- ---------------------------------------------------------------------------
CREATE POLICY "Allow insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow update evidencias" ON public.evidencias FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 3. TRIGGER: crea automáticamente el perfil al registrarse (auth.users)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 4. STORAGE: bucket público para archivos de evidencias
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidencias', 'evidencias', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public uploads to evidencias" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'evidencias');

CREATE POLICY "Allow authenticated uploads to evidencias" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidencias');

-- ---------------------------------------------------------------------------
-- 5. DATOS INICIALES DE DEMOSTRACIÓN (función seed ejecutable desde la app)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_sena_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    ('Carlos Arturo Restrepo (Instructor)', 'TPS 2567123', 'Por favor confirmar fecha de visita de concertación con su supervisor empresarial.');

  INSERT INTO public.historial_cambios (usuario_nombre, modulo, accion, descripcion)
  VALUES
    ('Dra. Esperanza Gómez', 'Empresas', 'CREAR', 'Registro de nueva empresa convenio: Tech Solutions S.A.S.'),
    ('Carlos Arturo Restrepo', 'Evidencias', 'EVALUAR', 'Aprobó Bitácora Quincenal #3 de Maria Camila Rojas'),
    ('Dra. Esperanza Gómez', 'Fichas', 'CREAR', 'Creación de ficha ADSO 2673890 con 24 aprendices matriculados');
END;
$$;