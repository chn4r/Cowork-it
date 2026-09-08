-- Cowork it 3.1 — Supabase/PostgreSQL schema
create extension if not exists pgcrypto;
create extension if not exists postgis;

create table if not exists public.places (
  id text primary key,
  owner_id uuid null references auth.users(id) on delete set null,
  title text not null,
  kind text not null check (kind in ('private','public','workshop')),
  universe text not null check (universe in ('computer','artisan','association','private')),
  city text not null,
  latitude double precision,
  longitude double precision,
  geog geography(point,4326) generated always as (case when latitude is null or longitude is null then null else st_setsrid(st_makepoint(longitude,latitude),4326)::geography end) stored,
  distance_km numeric,
  rating numeric default 0,
  reviews integer default 0,
  price_per_day numeric default 0,
  capacity integer default 1 check (capacity > 0),
  quiet boolean default false,
  wifi boolean default false,
  tools boolean default false,
  live boolean default false,
  availability_updated_at timestamptz default now(),
  host_name text,
  description text,
  rules text,
  amenities jsonb not null default '[]'::jsonb,
  slots jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists places_geog_idx on public.places using gist(geog);
create index if not exists places_universe_idx on public.places(universe);
create index if not exists places_live_idx on public.places(live);

create table if not exists public.device_favorites (
  device_id text not null,
  user_id uuid null references auth.users(id) on delete cascade,
  place_id text not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(device_id,place_id)
);

create table if not exists public.device_threads (
  id text primary key,
  device_id text not null,
  user_id uuid null references auth.users(id) on delete cascade,
  person_name text not null,
  initials text,
  context jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Prototype policies. Suitable for a controlled demo only.
alter table public.places enable row level security;
alter table public.device_favorites enable row level security;
alter table public.device_threads enable row level security;

-- Public places are readable. Writes require authentication in production.
drop policy if exists "places readable" on public.places;
create policy "places readable" on public.places for select using (true);

drop policy if exists "demo place insert" on public.places;
create policy "demo place insert" on public.places for insert with check (true);
drop policy if exists "demo place update" on public.places;
create policy "demo place update" on public.places for update using (true) with check (true);

drop policy if exists "demo favorites" on public.device_favorites;
create policy "demo favorites" on public.device_favorites for all using (true) with check (true);
drop policy if exists "demo threads" on public.device_threads;
create policy "demo threads" on public.device_threads for all using (true) with check (true);

-- BEFORE PUBLIC LAUNCH: replace demo write policies with auth.uid()-scoped policies.
