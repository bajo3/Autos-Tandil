-- Subastas: backend completo (auctions, profiles, participants, bids, payments, admins)
-- Idempotente: se puede correr varias veces sin romper.

create extension if not exists pgcrypto;

-- =============================================================
-- ADMINS: roster de usuarios con permisos de gestion
-- =============================================================
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- =============================================================
-- PROFILES: datos del bidder (extiende auth.users)
-- =============================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  dni text not null default '',
  phone text not null default '',
  phone_verified boolean not null default false,
  city text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- Auto-crear profile cuando nace un auth.user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =============================================================
-- AUCTIONS
-- =============================================================
do $$ begin
  create type public.auction_status as enum ('draft','scheduled','live','ended','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  car_id text references public.autos(id) on delete set null,
  title text not null,
  description text not null default '',
  cover_url text,
  starting_price numeric(14,2) not null,
  min_increment numeric(14,2) not null default 100000,
  reserve_price numeric(14,2),
  deposit_amount numeric(14,2) not null default 100000,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  anti_snipe_seconds integer not null default 120,
  status public.auction_status not null default 'draft',
  current_bid numeric(14,2),
  current_bid_user_id uuid references auth.users(id) on delete set null,
  bid_count integer not null default 0,
  winner_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists auctions_status_idx on public.auctions (status);
create index if not exists auctions_ends_at_idx on public.auctions (ends_at);

drop trigger if exists auctions_touch on public.auctions;
create trigger auctions_touch before update on public.auctions
for each row execute function public.touch_updated_at();

-- =============================================================
-- PARTICIPANTS (lista blanca por subasta, con seña)
-- =============================================================
do $$ begin
  create type public.deposit_status as enum ('pending','authorized','paid','refunded','forfeited');
exception when duplicate_object then null; end $$;

create table if not exists public.auction_participants (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  deposit_status public.deposit_status not null default 'pending',
  deposit_payment_id text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (auction_id, user_id)
);

create index if not exists ap_auction_idx on public.auction_participants (auction_id);
create index if not exists ap_user_idx on public.auction_participants (user_id);

-- =============================================================
-- BIDS (append-only)
-- =============================================================
create table if not exists public.auction_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists bids_auction_idx on public.auction_bids (auction_id, created_at desc);

-- =============================================================
-- PAYMENTS (MercadoPago seña + final)
-- =============================================================
do $$ begin
  create type public.payment_kind as enum ('deposit','final');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending','approved','rejected','refunded','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  auction_id uuid not null references public.auctions(id) on delete cascade,
  kind public.payment_kind not null default 'deposit',
  provider text not null default 'mercadopago',
  provider_payment_id text,
  preference_id text,
  amount numeric(14,2) not null,
  status public.payment_status not null default 'pending',
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists payments_auction_idx on public.payments (auction_id);
create index if not exists payments_provider_id_idx on public.payments (provider_payment_id);

drop trigger if exists payments_touch on public.payments;
create trigger payments_touch before update on public.payments
for each row execute function public.touch_updated_at();

-- =============================================================
-- RPC: place_bid (toda la validacion server-side)
-- =============================================================
create or replace function public.place_bid(p_auction_id uuid, p_amount numeric)
returns public.auction_bids
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_auction public.auctions;
  v_min numeric;
  v_bid public.auction_bids;
  v_extend boolean := false;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  select * into v_auction from public.auctions where id = p_auction_id for update;
  if not found then
    raise exception 'AUCTION_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_auction.status <> 'live' then
    raise exception 'AUCTION_NOT_LIVE' using errcode = 'P0001';
  end if;

  if now() < v_auction.starts_at or now() >= v_auction.ends_at then
    raise exception 'AUCTION_OUT_OF_WINDOW' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.auction_participants
    where auction_id = p_auction_id and user_id = v_user
      and deposit_status in ('authorized','paid')
  ) then
    raise exception 'NOT_APPROVED_PARTICIPANT' using errcode = 'P0001';
  end if;

  v_min := coalesce(v_auction.current_bid, v_auction.starting_price - v_auction.min_increment) + v_auction.min_increment;
  if p_amount < v_min then
    raise exception 'BID_TOO_LOW: minimo %', v_min using errcode = 'P0001';
  end if;

  insert into public.auction_bids (auction_id, user_id, amount)
  values (p_auction_id, v_user, p_amount)
  returning * into v_bid;

  -- Anti-snipe: si la puja entra en la ventana final, extiende ends_at
  v_extend := (v_auction.ends_at - now()) < make_interval(secs => v_auction.anti_snipe_seconds);

  update public.auctions
  set current_bid = p_amount,
      current_bid_user_id = v_user,
      bid_count = bid_count + 1,
      ends_at = case when v_extend
                     then now() + make_interval(secs => v_auction.anti_snipe_seconds)
                     else ends_at end
  where id = p_auction_id;

  return v_bid;
end; $$;

revoke all on function public.place_bid(uuid, numeric) from public;
grant execute on function public.place_bid(uuid, numeric) to authenticated;

-- =============================================================
-- RPC: close_auction (admin) — declara ganador y cierra
-- =============================================================
create or replace function public.close_auction(p_auction_id uuid)
returns public.auctions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_a public.auctions;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '28000';
  end if;
  update public.auctions
  set status = 'ended',
      winner_user_id = current_bid_user_id
  where id = p_auction_id
  returning * into v_a;
  return v_a;
end; $$;

grant execute on function public.close_auction(uuid) to authenticated;

-- =============================================================
-- RLS
-- =============================================================
alter table public.admins enable row level security;
alter table public.profiles enable row level security;
alter table public.auctions enable row level security;
alter table public.auction_participants enable row level security;
alter table public.auction_bids enable row level security;
alter table public.payments enable row level security;

-- admins: solo lectura por el propio admin
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins
for select using (user_id = auth.uid());

-- profiles: cada usuario su propia row
drop policy if exists profiles_self_rw on public.profiles;
create policy profiles_self_rw on public.profiles
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists profiles_admin_read on public.profiles;
create policy profiles_admin_read on public.profiles
for select using (public.is_admin());

-- auctions: lectura publica de subastas no-draft; admin escribe todo
drop policy if exists auctions_public_read on public.auctions;
create policy auctions_public_read on public.auctions
for select using (status <> 'draft' or public.is_admin());

drop policy if exists auctions_admin_write on public.auctions;
create policy auctions_admin_write on public.auctions
for all using (public.is_admin()) with check (public.is_admin());

-- participants: el usuario ve los suyos; admin ve todos; insert por usuario (queda 'pending')
drop policy if exists ap_self_read on public.auction_participants;
create policy ap_self_read on public.auction_participants
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists ap_self_insert on public.auction_participants;
create policy ap_self_insert on public.auction_participants
for insert with check (user_id = auth.uid());

drop policy if exists ap_admin_update on public.auction_participants;
create policy ap_admin_update on public.auction_participants
for update using (public.is_admin()) with check (public.is_admin());

-- bids: lectura publica; insert SOLO por RPC (no policy de insert directo)
drop policy if exists bids_public_read on public.auction_bids;
create policy bids_public_read on public.auction_bids for select using (true);

-- payments: usuario ve los suyos; admin todos; escritura via service role (webhook MP)
drop policy if exists payments_self_read on public.payments;
create policy payments_self_read on public.payments
for select using (user_id = auth.uid() or public.is_admin());

-- Realtime: emitir cambios de auctions y bids
alter publication supabase_realtime add table public.auctions;
alter publication supabase_realtime add table public.auction_bids;
