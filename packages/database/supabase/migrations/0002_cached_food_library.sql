-- Preserve the authoritative library on unrelated saves and reject edits based on an old library.
create or replace function public.save_nourish_cached_document(
 p_data jsonb, p_expected_revision bigint, p_expected_user_id uuid,
 p_save_custom boolean, p_expected_custom jsonb
) returns bigint language plpgsql security definer set search_path = '' as $$
declare current_custom jsonb; payload jsonb;
begin
 if auth.uid() is null or auth.uid() is distinct from p_expected_user_id then
  raise exception 'Authentication required' using errcode='42501';
 end if;
 if p_save_custom is null then raise exception 'Invalid library flag' using errcode='22023'; end if;
 select data->'custom' into current_custom from public.nourish_documents where user_id=auth.uid() for update;
 current_custom := coalesce(current_custom,'[]'::jsonb);
 if p_save_custom and current_custom is distinct from p_expected_custom then
  raise exception 'Food library changed. Refresh foods before editing.' using errcode='40001';
 end if;
 payload := case when p_save_custom then p_data else jsonb_set(p_data,'{custom}',current_custom) end;
 return public.save_nourish_document(payload,p_expected_revision,p_expected_user_id);
end;
$$;
revoke all on function public.save_nourish_cached_document(jsonb,bigint,uuid,boolean,jsonb) from public,anon;
grant execute on function public.save_nourish_cached_document(jsonb,bigint,uuid,boolean,jsonb) to authenticated;
