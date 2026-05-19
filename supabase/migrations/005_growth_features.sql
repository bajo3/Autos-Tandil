create extension if not exists pgcrypto;

alter table public.autos add column if not exists usage_tags text[] not null default '{}';

alter table public.auctions alter column deposit_amount set default 1000000;
update public.auctions set deposit_amount = 1000000 where deposit_amount < 1000000;

create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  source text,
  car_id text references public.autos(id) on delete set null,
  slug text,
  title text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site_events_type_idx on public.site_events (event_type);
create index if not exists site_events_source_idx on public.site_events (source);
create index if not exists site_events_created_at_idx on public.site_events (created_at desc);

create table if not exists public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null default 'seller',
  status text not null default 'new',
  full_name text not null default '',
  phone text not null default '',
  email text not null default '',
  car_id text references public.autos(id) on delete set null,
  car_title text not null default '',
  vehicle_brand text not null default '',
  vehicle_model text not null default '',
  vehicle_year integer,
  vehicle_km integer,
  budget_min numeric(14,2),
  budget_max numeric(14,2),
  preferences jsonb not null default '{}'::jsonb,
  notes text not null default '',
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sales_leads_type_idx on public.sales_leads (lead_type);
create index if not exists sales_leads_status_idx on public.sales_leads (status);
create index if not exists sales_leads_created_at_idx on public.sales_leads (created_at desc);

drop trigger if exists sales_leads_touch on public.sales_leads;
create trigger sales_leads_touch before update on public.sales_leads
for each row execute function public.touch_updated_at();

create table if not exists public.buyer_alerts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'active',
  full_name text not null default '',
  phone text not null default '',
  email text not null default '',
  query text not null default '',
  brand text,
  type text,
  fuel text,
  transmission text,
  budget_max numeric(14,2),
  year_min integer,
  source text not null default 'catalog',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buyer_alerts_status_idx on public.buyer_alerts (status);
create index if not exists buyer_alerts_created_at_idx on public.buyer_alerts (created_at desc);

drop trigger if exists buyer_alerts_touch on public.buyer_alerts;
create trigger buyer_alerts_touch before update on public.buyer_alerts
for each row execute function public.touch_updated_at();
