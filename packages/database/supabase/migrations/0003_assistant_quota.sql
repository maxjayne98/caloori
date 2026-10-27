-- Counters only; conversations and personal prompts are never stored here.
create table if not exists public.nourish_assistant_usage (
 user_id uuid primary key references auth.users(id) on delete cascade,
 day date not null, hour timestamptz not null, day_count integer not null, hour_count integer not null
);
alter table public.nourish_assistant_usage enable row level security;
revoke all on public.nourish_assistant_usage from public,anon,authenticated;
create or replace function public.take_nourish_assistant_quota() returns boolean
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); current_day date := (now() at time zone 'UTC')::date;
 current_hour timestamptz := date_trunc('hour',now()); usage public.nourish_assistant_usage%rowtype;
begin
 if u is null then raise exception 'Authentication required' using errcode='42501'; end if;
 insert into public.nourish_assistant_usage values(u,current_day,current_hour,0,0) on conflict(user_id) do nothing;
 select * into usage from public.nourish_assistant_usage where user_id=u for update;
 if usage.day <> current_day then usage.day_count:=0; end if;
 if usage.hour <> current_hour then usage.hour_count:=0; end if;
 if usage.day_count >= 100 or usage.hour_count >= 20 then return false; end if;
 update public.nourish_assistant_usage set day=current_day,hour=current_hour,day_count=usage.day_count+1,hour_count=usage.hour_count+1 where user_id=u;
 return true;
end $$;
revoke all on function public.take_nourish_assistant_quota() from public,anon;
grant execute on function public.take_nourish_assistant_quota() to authenticated;
