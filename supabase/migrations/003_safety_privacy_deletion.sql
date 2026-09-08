create table if not exists public.place_private_locations (
  place_id text primary key references public.places(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  latitude double precision,
  longitude double precision,
  address_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.place_private_locations enable row level security;
drop policy if exists "owner private location" on public.place_private_locations;
create policy "owner private location" on public.place_private_locations for all to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
insert into public.place_private_locations(place_id,owner_id,latitude,longitude)
select id,owner_id,latitude,longitude from public.places where kind='private' and owner_id is not null and latitude is not null and longitude is not null
on conflict(place_id) do update set owner_id=excluded.owner_id,latitude=excluded.latitude,longitude=excluded.longitude,updated_at=now();
update public.places set latitude=round(latitude::numeric,2)::double precision,longitude=round(longitude::numeric,2)::double precision where kind='private' and latitude is not null and longitude is not null;
create table if not exists public.user_blocks (blocker_id uuid not null references auth.users(id) on delete cascade, blocked_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id));
create table if not exists public.content_reports (id uuid primary key default gen_random_uuid(),reporter_id uuid not null references auth.users(id) on delete cascade,reported_user_id uuid references auth.users(id) on delete set null,content_type text not null default 'user',content_id text,reason text not null,details text,status text not null default 'open' check(status in ('open','reviewing','resolved','rejected')),created_at timestamptz not null default now(),reviewed_at timestamptz);
alter table public.user_blocks enable row level security;alter table public.content_reports enable row level security;
drop policy if exists "own blocks" on public.user_blocks;create policy "own blocks" on public.user_blocks for all to authenticated using(blocker_id=(select auth.uid())) with check(blocker_id=(select auth.uid()));
drop policy if exists "own reports insert" on public.content_reports;drop policy if exists "own reports read" on public.content_reports;create policy "own reports insert" on public.content_reports for insert to authenticated with check(reporter_id=(select auth.uid()));create policy "own reports read" on public.content_reports for select to authenticated using(reporter_id=(select auth.uid()));
create index if not exists idx_user_blocks_blocked on public.user_blocks(blocked_id);create index if not exists idx_content_reports_reporter on public.content_reports(reporter_id);create index if not exists idx_content_reports_status_created on public.content_reports(status,created_at desc);create index if not exists idx_private_locations_owner on public.place_private_locations(owner_id);