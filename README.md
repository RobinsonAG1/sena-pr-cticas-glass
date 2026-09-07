<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/caf707c2-2fe7-4544-af3a-b5e831a9e803

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Supabase

El proyecto usa `@supabase/supabase-js`. Las credenciales están en `.env`:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`

**Configuración inicial de la base de datos (una sola vez):**

1. Crea las tablas base ejecutando `schema_sena_supabase.sql` en el SQL Editor de Supabase.
2. Ejecuta la migración de integración `schema_supabase_update.sql` (políticas RLS adicionales, trigger de perfil, bucket de Storage `evidencias` y función `seed_sena_data()`).
3. En Storage, verifica que exista el bucket público `evidencias`.

La app hace lectura/escritura contra las tablas (`fichas`, `empresas`, `evidencias`, `alertas`, `historial_cambios`, `profiles`) y degrada a datos de demostración si la base está vacía o inaccesible.
