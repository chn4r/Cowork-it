create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  bio text,
  universe text,
  availability_status text not null default 'offline',
  availability_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id text primary key,
  owner_id uuid references auth.users(id) on delete set null,
  title text not null,
  kind text not null check (kind in ('private','public','workshop')),
  universe text not null,
  city text not null,
  latitude double precision,
  longitude double precision,
  distance_km numeric,
  rating numeric,
  reviews integer not null default 0,
  price_per_day numeric not null default 0,
  capacity integer not null default 1 check (capacity > 0),
  quiet boolean not null default false,
  wifi boolean not null default false,
  tools boolean not null default false,
  live boolean not null default false,
  availability_updated_at timestamptz not null default now(),
  host_name text,
  description text,
  rules text,
  amenities jsonb not null default '[]'::jsonb,
  slots jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, place_id)
);

create table if not exists public.threads (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  person_name text not null default '',
  initials text not null default '',
  context jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.favorites enable row level security;
alter table public.threads enable row level security;

drop policy if exists "profiles readable" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
drop policy if exists "places readable" on public.places;
drop policy if exists "owner place insert" on public.places;
drop policy if exists "owner place update" on public.places;
drop policy if exists "owner place delete" on public.places;
drop policy if exists "own favorites" on public.favorites;
drop policy if exists "own threads" on public.threads;

create policy "profiles readable" on public.profiles for select using (true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "places readable" on public.places for select using (true);
create policy "owner place insert" on public.places for insert to authenticated with check (owner_id = auth.uid());
create policy "owner place update" on public.places for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner place delete" on public.places for delete to authenticated using (owner_id = auth.uid());
create policy "own favorites" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own threads" on public.threads for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

insert into public.places (id,title,kind,universe,city,latitude,longitude,distance_km,rating,reviews,price_per_day,capacity,quiet,wifi,tools,live,host_name,description,rules,amenities,slots)
values
('p1','La Verrière','private','computer','Rennes',48.1115,-1.6804,18.4,4.9,42,18,4,true,true,false,true,'Maëlle','Bureau calme et lumineux, fibre, écran et café.','Calme demandé.','["Fibre","Prises","Écran","Café"]','["Aujourd’hui 14–18 h"]'),
('p2','Médiathèque — espace travail','public','computer','Guichen',47.9678,-1.7959,7.2,4.6,31,0,16,true,true,false,true,'Communauté','Tables, prises, Wi-Fi et zone silencieuse.','Vérifier les horaires.','["Wi-Fi","Prises","PMR","Gratuit"]','["Aujourd’hui jusqu’à 18 h"]'),
('p3','Atelier partagé des Forges','workshop','artisan','Bruz',48.0255,-1.7464,12.8,4.8,67,12,8,false,true,true,true,'Collectif Les Forges','Établis et outillage partagé.','EPI obligatoires.','["Établis","Outillage","Parking"]','["Aujourd’hui 13–19 h"]')
on conflict (id) do nothing;
