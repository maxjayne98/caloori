-- Run in the SQL editor after 0002. Every test write is rolled back.
begin;
do $$
declare
 owner_id uuid; original_data jsonb; original_revision bigint; saved_revision bigint; actual_custom jsonb;
begin
 if has_function_privilege('anon','public.save_nourish_cached_document(jsonb,bigint,uuid,boolean,jsonb)','execute') then
  raise exception 'Anonymous execution must be denied';
 end if;
 select user_id,data,revision into owner_id,original_data,original_revision from public.nourish_documents limit 1;
 if owner_id is null then raise exception 'An existing account is required for this rollback test'; end if;
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 actual_custom := original_data->'custom';
 saved_revision := public.save_nourish_cached_document(jsonb_set(original_data,'{custom}','[]'),original_revision,owner_id,false,'[]');
 if (select data->'custom' from public.nourish_documents where user_id=owner_id) is distinct from actual_custom then
  raise exception 'Unrelated save changed the library';
 end if;
 begin
  perform public.save_nourish_cached_document(original_data,saved_revision,owner_id,true,'[{"id":"stale-baseline"}]');
  raise exception 'Stale library was accepted';
 exception when serialization_failure then null;
 end;
 begin
  perform public.save_nourish_cached_document(original_data,saved_revision,'00000000-0000-0000-0000-000000000000',false,'[]');
  raise exception 'Wrong account was accepted';
 exception when insufficient_privilege then null;
 end;
 saved_revision := public.save_nourish_cached_document(original_data,saved_revision,owner_id,true,actual_custom);
 if (select data from public.nourish_documents where user_id=owner_id) is distinct from original_data then
  raise exception 'Valid library save changed content';
 end if;
end $$;
rollback;
select 'PASS: library preservation, stale edits, account isolation, anonymous access; all writes rolled back' as result;
