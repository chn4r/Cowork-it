create extension if not exists postgis;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  bio text,
  universe text,
  availability_status text default 'offline',
  availability_until timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  title text not null,
  kind text not null,
  universe text not null,
  city text not null,
  location geography(point,4326),
  description text,
  price_day numeric default 0,
  capacity integer default 1,
  availability_updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.favorites (
  user_id uuid references auth.users(id) on delete cascade,
  place_id uuid references public.places(id) on delete cascade,
  created_at timestamptz default now(),
  primary key(user_id, place_id)
);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  context_place_id uuid references public.places(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.thread_members (
  thread_id uuid references public.threads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key(thread_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.threads(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.favorites enable row level security;
alter table public.threads enable row level security;
alter table public.thread_members enable row level security;
alter table public.messages enable row level security;

create policy "public profiles readable" on public.profiles for select using (true);
create policy "own profile editable" on public.profiles for update using (auth.uid() = id);
create policy "places readable" on public.places for select using (true);
create policy "authenticated can create place" on public.places for insert to authenticated with check (owner_id = auth.uid());
create policy "owners can update place" on public.places for update using (owner_id = auth.uid());
create policy "own favorites" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
