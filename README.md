# AutosTandil

Web publica y panel admin MVP para una agencia local de autos en consignacion.

## Supabase

- Tabla principal: `public.autos`.
- Servicio principal de lectura publica: `useCars` / `cars`.
- Admin CRUD: `/admin` crea, edita, cambia estado y elimina puntualmente por `id` sobre `public.autos`.
- Fallback: si faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, o si falla la consulta, la web usa los mocks locales de `src/data/cars.js`.

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run supabase:setup`

`npm run supabase:setup` usa `DATABASE_URL` solo desde entorno local/script. No debe exponerse en el frontend.

## Variables

Ver `.env.example`.
