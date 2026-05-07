import pg from 'pg';
import { CARS } from '../src/data/cars.js';

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL no esta configurado.');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

try {
  await client.query("alter table public.autos add column if not exists images jsonb not null default '[]'::jsonb;");

  let updated = 0;
  for (const car of CARS) {
    const result = await client.query(
      `
      update public.autos
      set images = $2::jsonb
      where id = $1
        and (images is null or images = '[]'::jsonb)
      `,
      [car.id, JSON.stringify(car.images || [])],
    );
    updated += result.rowCount;
  }

  console.log(`Imagenes enriquecidas en Supabase: ${updated}. Filas con imagenes existentes no fueron modificadas.`);
} finally {
  await client.end();
}
