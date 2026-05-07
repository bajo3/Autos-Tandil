create extension if not exists pgcrypto;

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  page_type text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);

create table if not exists public.car_views (
  id uuid primary key default gen_random_uuid(),
  car_id text references public.autos(id) on delete set null,
  slug text,
  title text,
  created_at timestamptz not null default now()
);

create index if not exists car_views_car_id_idx on public.car_views (car_id);
create index if not exists car_views_slug_idx on public.car_views (slug);
create index if not exists car_views_created_at_idx on public.car_views (created_at desc);

create table if not exists public.whatsapp_clicks (
  id uuid primary key default gen_random_uuid(),
  car_id text references public.autos(id) on delete set null,
  slug text,
  title text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_clicks_car_id_idx on public.whatsapp_clicks (car_id);
create index if not exists whatsapp_clicks_slug_idx on public.whatsapp_clicks (slug);
create index if not exists whatsapp_clicks_created_at_idx on public.whatsapp_clicks (created_at desc);
