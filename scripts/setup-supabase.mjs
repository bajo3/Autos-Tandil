import pg from 'pg';
import { CARS } from '../src/data/cars.js';

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL no esta configurado.');
  process.exit(1);
}

const schemaSql = `
create table if not exists public.autos (
  id text primary key,
  brand text not null,
  model text not null,
  version text not null default '',
  year integer not null,
  km integer not null default 0,
  price numeric(14,2) not null default 0,
  currency text not null default 'ARS',
  fuel text not null default '',
  trans text not null default '',
  engine text not null default '',
  color text not null default '',
  type text not null default 'Auto',
  body text not null default '',
  badges text[] not null default '{}',
  description text not null default '',
  photo_urls text[] not null default '{}',
  thumb_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'reserved', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.autos add column if not exists brand text;
alter table public.autos add column if not exists model text;
alter table public.autos add column if not exists version text not null default '';
alter table public.autos add column if not exists year integer;
alter table public.autos add column if not exists km integer not null default 0;
alter table public.autos add column if not exists price numeric(14,2) not null default 0;
alter table public.autos add column if not exists currency text not null default 'ARS';
alter table public.autos add column if not exists fuel text not null default '';
alter table public.autos add column if not exists trans text not null default '';
alter table public.autos add column if not exists engine text not null default '';
alter table public.autos add column if not exists color text not null default '';
alter table public.autos add column if not exists type text not null default 'Auto';
alter table public.autos add column if not exists body text not null default '';
alter table public.autos add column if not exists badges text[] not null default '{}';
alter table public.autos add column if not exists description text not null default '';
alter table public.autos add column if not exists photo_urls text[] not null default '{}';
alter table public.autos add column if not exists thumb_url text;
alter table public.autos add column if not exists status text not null default 'draft';
alter table public.autos add column if not exists created_at timestamptz not null default now();
alter table public.autos add column if not exists updated_at timestamptz not null default now();

create index if not exists autos_status_idx on public.autos (status);
create index if not exists autos_brand_idx on public.autos (brand);
create index if not exists autos_type_idx on public.autos (type);
create index if not exists autos_created_at_idx on public.autos (created_at desc);
`;

const seedSql = `
insert into public.autos (
  id, brand, model, version, year, km, price, currency, fuel, trans, engine,
  color, type, body, badges, description, photo_urls, thumb_url, status
) values (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
  $12, $13, $14, $15, $16, $17, $18, 'published'
)
on conflict (id) do nothing;
`;

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(schemaSql);

  let inserted = 0;
  for (const car of CARS) {
    const result = await client.query(seedSql, [
      car.id, car.brand, car.model, car.version, car.year, car.km, car.price,
      car.currency, car.fuel, car.trans, car.engine, car.color, car.type,
      car.body, car.badges, car.desc, car.photoUrls, car.thumbUrl,
    ]);
    inserted += result.rowCount;
  }

  const { rows } = await client.query('select count(*)::int as count from public.autos;');
  console.log(`Supabase listo. Autos insertados ahora: ${inserted}. Total en tabla: ${rows[0].count}.`);
} finally {
  await client.end();
}
