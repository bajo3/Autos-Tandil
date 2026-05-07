# AutosTandil

Web publica y panel admin MVP para una agencia local de autos en consignacion.

## Supabase

- Tabla principal: `public.autos`.
- Servicio principal de lectura publica: `useCars` / `cars`.
- Admin CRUD: `/admin` crea, edita, cambia estado y elimina puntualmente por `id` sobre `public.autos`.
- Imagenes: el campo `images` se guarda como array JSON de URLs. La primera URL es la portada usada por catalogo y detalle.
- Analytics MVP: `public.page_views`, `public.car_views` y `public.whatsapp_clicks`.
- Fallback: si faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, o si falla la consulta, la web usa los mocks locales de `src/data/cars.js`.

## Admin

El panel usa un gestor visual de fotos con previews, portada, reordenamiento y eliminacion puntual del array. Soporta:

- Carga por URL individual.
- Carga por lote de URLs.
- Upload multiple desde la computadora a Supabase Storage.

El upload usa el bucket `autos-images` y guarda las public URLs resultantes en `images`. Para habilitarlo:

1. Configurar `VITE_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `.env`.
2. Ejecutar `npm run supabase:create-storage`.
3. Verificar con `npm run supabase:check-storage`.

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
- `npm run supabase:apply-analytics`
- `npm run test:e2e`

`npm run supabase:setup` usa `DATABASE_URL` solo desde entorno local/script. No debe exponerse en el frontend.

## Variables

Ver `.env.example`.
