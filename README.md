# AutosTandil

Web publica y panel admin MVP para una agencia local de autos en consignacion.

## Supabase

- Tabla principal: `public.autos`.
- Servicio principal de lectura publica: `useCars` / `cars`.
- Admin CRUD: `/admin` crea, edita, cambia estado y elimina puntualmente por `id` sobre `public.autos`.
- Imagenes: el campo `images` se guarda como array JSON de URLs. La primera URL es la portada usada por catalogo y detalle.
- Fallback: si faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, o si falla la consulta, la web usa los mocks locales de `src/data/cars.js`.

## Admin

El panel usa un gestor visual de fotos con previews, portada, reordenamiento y eliminacion puntual del array. Soporta:

- Carga por URL individual.
- Carga por lote de URLs.
- Upload multiple desde la computadora a Supabase Storage.

El upload usa el bucket `autos-images` y guarda las public URLs resultantes en `images`. Para habilitarlo:

1. Crear un bucket de Storage llamado `autos-images`.
2. Hacerlo publico o configurar una estrategia de lectura compatible con URLs publicas.
3. Agregar policies para permitir `insert` desde el rol que use el admin temporal.
4. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

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

`npm run supabase:setup` usa `DATABASE_URL` solo desde entorno local/script. No debe exponerse en el frontend.

## Variables

Ver `.env.example`.
