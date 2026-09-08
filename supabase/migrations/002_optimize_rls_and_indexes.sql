create index if not exists idx_places_owner_id on public.places(owner_id);
create index if not exists idx_threads_owner_id on public.threads(owner_id);
create index if not exists idx_favorites_place_id on public.favorites(place_id);
create index if not exists idx_places_city on public.places(city);
create index if not exists idx_places_kind_universe on public.places(kind, universe);
create index if not exists idx_places_live_updated on public.places(live, availability_updated_at desc);

alter policy "own profile insert" on public.profiles with check ((select auth.uid()) = id);
alter policy "own profile update" on public.profiles using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
alter policy "owner place insert" on public.places with check (owner_id = (select auth.uid()));
alter policy "owner place update" on public.places using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "owner place delete" on public.places using (owner_id = (select auth.uid()));
alter policy "own favorites" on public.favorites using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "own threads" on public.threads using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
