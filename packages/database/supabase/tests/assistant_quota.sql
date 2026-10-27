-- Real quota and privilege checks. No test counters survive this transaction.
begin;
do $$
declare u uuid; i integer;
begin
 if has_function_privilege('anon','public.take_nourish_assistant_quota()','execute') then raise exception 'Anonymous quota access'; end if;
 if has_table_privilege('authenticated','public.nourish_assistant_usage','select') or has_table_privilege('authenticated','public.nourish_assistant_usage','update') then raise exception 'Direct counter access'; end if;
 select id into u from auth.users limit 1;
 if u is null then raise exception 'An existing account is required'; end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 -- An old window starts a new hourly and daily allowance without deleting anything.
 insert into public.nourish_assistant_usage values(u,'2000-01-01','2000-01-01 00:00:00+00',100,20)
 on conflict(user_id) do update set day='2000-01-01',hour='2000-01-01 00:00:00+00',day_count=100,hour_count=20;
 for i in 1..20 loop
  if not public.take_nourish_assistant_quota() then raise exception 'Allowance refused too early'; end if;
 end loop;
 if public.take_nourish_assistant_quota() then raise exception 'Hourly limit not enforced'; end if;
 update public.nourish_assistant_usage set hour=now()-interval '2 hours',day_count=100 where user_id=u;
 if public.take_nourish_assistant_quota() then raise exception 'Daily limit not enforced'; end if;
end $$;
rollback;
select 'PASS: anonymous denied, counters private, hourly/daily limits and reset; all writes rolled back' as result;
