# AutosTandil

Web publica y panel admin MVP para una agencia local de autos en consignacion.

## Supabase

- Tabla principal: `public.autos`.
- Servicio principal de lectura publica: `useCars` / `cars`.
- Admin CRUD: `/admin` crea, edita, cambia estado y elimina puntualmente por `id` sobre `public.autos`.
- Imagenes: el campo `images` se guarda como array JSON de URLs. La primera URL es la portada usada por catalogo y detalle.
- Analytics MVP: `public.page_views`, `public.car_views` y `public.whatsapp_clicks`.
- Fallback: si faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, o si falla la consulta, la web usa los mocks locales de `src/data/cars.js`.

### Auth de subastas

Para que los mails de confirmacion de cuenta no vuelvan a `localhost`, configurar:

- `.env`: `VITE_SITE_URL=https://autos-tandil.vercel.app` o el dominio final, sin slash final.
- Vercel: la misma variable `VITE_SITE_URL`.
- Supabase Dashboard > Authentication > URL Configuration:
  - Site URL: dominio final de produccion.
  - Redirect URLs: dominio final con wildcard y URLs locales de desarrollo, por ejemplo `https://autos-tandil.vercel.app/**`, `http://localhost:5173/**` y `http://127.0.0.1:5173/**`.

La app fuerza el redirect de registro a `/subastas` usando `emailRedirectTo`, pero Supabase igual requiere que esa URL este permitida en el dashboard.

## Admin

El panel usa un gestor visual de fotos con previews, portada, reordenamiento y eliminacion puntual del array. Soporta:

- Carga por URL individual.
- Carga por lote de URLs.
- Upload multiple desde la computadora a Supabase Storage.

El upload usa el bucket `autos-images` y guarda las public URLs resultantes en `images`. Para habilitarlo:

1. Configurar `VITE_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `.env`.
2. Ejecutar `npm run supabase:create-storage`.
3. Ejecutar `npm run supabase:create-storage-policies`.
4. Verificar con `npm run supabase:check-storage`.

`SUPABASE_SERVICE_ROLE_KEY` es solo para scripts Node locales/CI. Nunca debe importarse desde frontend ni subirse a git. Para produccion conviene reemplazar el admin temporal por Supabase Auth, RLS y policies mas estrictas por usuario/rol.

Se puede verificar el bucket con:

```bash
npm run supabase:check-storage
```

Limitacion actual: al quitar una imagen desde el admin solo se elimina del array `images`; no se borra el archivo del bucket.

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run supabase:setup`
- `npm run supabase:check-storage`
- `npm run supabase:create-storage`
- `npm run supabase:create-storage-policies`
- `npm run supabase:apply-analytics`
- `npm run test:e2e`

`npm run supabase:setup` usa `DATABASE_URL` solo desde entorno local/script. No debe exponerse en el frontend.
Playwright usa `http://127.0.0.1:5176` por defecto para evitar reutilizar otro Vite local; se puede cambiar con `PLAYWRIGHT_PORT`.

## Variables

Ver `.env.example`.
