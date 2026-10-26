-- Run once in YOUR Supabase project. No credentials are part of this repository.
-- One portable JSONB document per account. Domain validation stays provider-neutral.
create table if not exists public.nourish_documents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and data->>'version' = '1'),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);
alter table public.nourish_documents enable row level security;
revoke all on public.nourish_documents from anon, authenticated;
grant select on public.nourish_documents to authenticated;
create policy "Read only my own Nourish document"
  on public.nourish_documents for select to authenticated
  using ((select auth.uid()) = user_id);

-- Writes only through this function: atomic optimistic concurrency, immutable owner ID.
create or replace function public.save_nourish_document(p_data jsonb, p_expected_revision bigint, p_expected_user_id uuid)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  current_revision bigint;
  next_revision bigint;
begin
  if owner_id is null or owner_id is distinct from p_expected_user_id then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'Invalid revision' using errcode='22023';
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or
     p_data->>'version' is distinct from '1' or
     jsonb_typeof(p_data->'profile') is distinct from 'object' or
     jsonb_typeof(p_data->'entries') is distinct from 'object' or
     jsonb_typeof(p_data->'activities') is distinct from 'object' or
     jsonb_typeof(p_data->'weights') is distinct from 'array' or
     jsonb_typeof(p_data->'custom') is distinct from 'array' or
     jsonb_typeof(p_data->'templates') is distinct from 'array' or
     octet_length(p_data::text) > 8388608 then
    raise exception 'Invalid or oversized Nourish document' using errcode='22023';
  end if;
  -- A new account may only create revision zero. Concurrent initial writes serialize here.
  insert into public.nourish_documents(user_id,data,revision)
  values(owner_id,p_data,0) on conflict (user_id) do nothing;
  select revision into current_revision from public.nourish_documents
    where user_id=owner_id for update;
  if current_revision <> p_expected_revision then
    raise exception 'Revision conflict' using errcode='40001';
  end if;
  next_revision := current_revision+1;
  update public.nourish_documents set data=p_data,revision=next_revision,updated_at=now()
    where user_id=owner_id;
  return next_revision;
end;
$$;
revoke all on function public.save_nourish_document(jsonb,bigint,uuid) from public,anon;
grant execute on function public.save_nourish_document(jsonb,bigint,uuid) to authenticated;
