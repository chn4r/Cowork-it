create table if not exists public.place_reviews (
  id uuid primary key default gen_random_uuid(),
  place_key text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(place_key,user_id)
);

create table if not exists public.place_validations (
  id uuid primary key default gen_random_uuid(),
  place_key text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('correct','outdated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(place_key,user_id)
);

alter table public.place_reviews enable row level security;
alter table public.place_validations enable row level security;

drop policy if exists place_reviews_read_all on public.place_reviews;
create policy place_reviews_read_all on public.place_reviews for select using (true);
drop policy if exists place_reviews_insert_own on public.place_reviews;
create policy place_reviews_insert_own on public.place_reviews for insert with check (auth.uid() = user_id);
drop policy if exists place_reviews_update_own on public.place_reviews;
create policy place_reviews_update_own on public.place_reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists place_reviews_delete_own on public.place_reviews;
create policy place_reviews_delete_own on public.place_reviews for delete using (auth.uid() = user_id);

drop policy if exists place_validations_read_all on public.place_validations;
create policy place_validations_read_all on public.place_validations for select using (true);
drop policy if exists place_validations_insert_own on public.place_validations;
create policy place_validations_insert_own on public.place_validations for insert with check (auth.uid() = user_id);
drop policy if exists place_validations_update_own on public.place_validations;
create policy place_validations_update_own on public.place_validations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists place_validations_delete_own on public.place_validations;
create policy place_validations_delete_own on public.place_validations for delete using (auth.uid() = user_id);

create index if not exists idx_place_reviews_place on public.place_reviews(place_key,created_at desc);
create index if not exists idx_place_validations_place on public.place_validations(place_key,status);
