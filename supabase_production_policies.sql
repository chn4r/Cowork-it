-- Cowork it — security hardening BEFORE public launch
-- Run after authentication/profile ownership is implemented.
drop policy if exists "demo place insert" on public.places;
drop policy if exists "demo place update" on public.places;
drop policy if exists "demo favorites" on public.device_favorites;
drop policy if exists "demo threads" on public.device_threads;
create policy "owner inserts place" on public.places for insert to authenticated with check (owner_id = auth.uid());
create policy "owner updates place" on public.places for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "user favorites" on public.device_favorites for all to authenticated using (user_id=auth.uid()) with check(user_id=auth.uid());
create policy "user threads" on public.device_threads for all to authenticated using (user_id=auth.uid()) with check(user_id=auth.uid());
