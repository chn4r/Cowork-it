create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'pending' check (status in ('pending','verified','completed','rejected')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  source text not null default 'web'
);
alter table public.account_deletion_requests enable row level security;
create index if not exists idx_account_deletion_requests_status on public.account_deletion_requests(status,requested_at desc);
