begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  career_goal text not null default '' check (char_length(career_goal) <= 500),
  education_level text not null default '' check (char_length(education_level) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Cuộc hội thoại mới' check (char_length(title) between 1 and 100),
  category text not null check (category in ('procedures', 'terminology', 'scenarios', 'career')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index conversations_user_updated_idx on public.conversations(user_id, updated_at desc);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 24000),
  created_at timestamptz not null default clock_timestamp()
);
create index messages_conversation_created_idx on public.messages(conversation_id, created_at);

-- Durable request ledger: also coordinates Vercel instances, quota and retries.
create table public.chat_requests (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  content text check (char_length(content) between 1 and 4000),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  result jsonb,
  created_at timestamptz not null default clock_timestamp()
);
create index chat_requests_user_created_idx on public.chat_requests(user_id, created_at desc);
create index chat_requests_conversation_pending_idx on public.chat_requests(conversation_id, created_at) where status = 'pending';

-- Keep only a content-free request marker for quota accounting after deletion.
-- Clearing content/result ensures deleting a conversation also deletes its text.
create function public.clear_deleted_conversation_requests() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.chat_requests set content = null, result = null, status = 'failed' where conversation_id = old.id;
  return old;
end;
$$;
revoke all on function public.clear_deleted_conversation_requests() from public, anon, authenticated;
create trigger clear_conversation_requests before delete on public.conversations for each row execute function public.clear_deleted_conversation_requests();

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = clock_timestamp(); return new; end;
$$;
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
create trigger conversations_updated before update on public.conversations for each row execute function public.touch_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, full_name) values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 100));
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id, full_name)
select id, left(coalesce(raw_user_meta_data ->> 'full_name', ''), 100) from auth.users on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.chat_requests enable row level security;

revoke all on public.profiles, public.conversations, public.messages, public.chat_requests from anon, authenticated;
grant select, delete on public.profiles to authenticated;
grant update(full_name, career_goal, education_level) on public.profiles to authenticated;
grant select, delete on public.conversations to authenticated;
grant insert(user_id, title, category) on public.conversations to authenticated;
grant update(title) on public.conversations to authenticated;
grant select on public.messages to authenticated;
-- No INSERT/UPDATE/DELETE grant or policy for messages: browser cannot forge assistant turns.
grant all on public.profiles, public.conversations, public.messages, public.chat_requests to service_role;

create policy profiles_read on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_delete on public.profiles for delete to authenticated using ((select auth.uid()) = id);
create policy conversations_read on public.conversations for select to authenticated using ((select auth.uid()) = user_id);
create policy conversations_insert on public.conversations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy conversations_update on public.conversations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy conversations_delete on public.conversations for delete to authenticated using ((select auth.uid()) = user_id);
create policy messages_read on public.messages for select to authenticated using (
  exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = (select auth.uid()))
);
-- Request bodies are never exposed through the Data API to end users.

create function public.reserve_chat_request(p_user_id uuid, p_conversation_id uuid, p_request_id uuid, p_content text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare prior public.chat_requests%rowtype; minute_count integer; day_count integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  if not exists(select 1 from public.conversations where id = p_conversation_id and user_id = p_user_id) then
    return jsonb_build_object('state', 'missing');
  end if;
  select * into prior from public.chat_requests where id = p_request_id;
  if found then
    if prior.user_id is distinct from p_user_id or prior.conversation_id is distinct from p_conversation_id or prior.content is distinct from p_content then
      return jsonb_build_object('state', 'conflict');
    end if;
    if prior.status = 'completed' then return jsonb_build_object('state', 'completed', 'messages', prior.result); end if;
    if prior.status = 'pending' and prior.created_at > clock_timestamp() - interval '90 seconds' then return jsonb_build_object('state', 'busy'); end if;
    -- Reusing failed/expired IDs is forbidden: prevents an old worker completing a new attempt.
    return jsonb_build_object('state', 'conflict');
  end if;
  select count(*) filter (where created_at > clock_timestamp() - interval '1 minute'), count(*)
    into minute_count, day_count from public.chat_requests
    where user_id = p_user_id and created_at > clock_timestamp() - interval '24 hours';
  if minute_count >= 8 or day_count >= 100 then return jsonb_build_object('state', 'limited'); end if;
  if exists(select 1 from public.chat_requests where conversation_id = p_conversation_id and status = 'pending' and created_at > clock_timestamp() - interval '90 seconds') then
    return jsonb_build_object('state', 'busy');
  end if;
  update public.chat_requests set status = 'failed' where conversation_id = p_conversation_id and status = 'pending';
  insert into public.chat_requests(id, user_id, conversation_id, content) values(p_request_id, p_user_id, p_conversation_id, p_content);
  return jsonb_build_object('state', 'reserved');
end;
$$;

create function public.complete_chat_request(p_user_id uuid, p_request_id uuid, p_answer text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare req public.chat_requests%rowtype; q public.messages%rowtype; a public.messages%rowtype; result_messages jsonb; owner_id uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  select * into req from public.chat_requests where id = p_request_id and user_id = p_user_id for update;
  if not found then raise exception 'Request unavailable'; end if;
  if req.status = 'completed' then return req.result; end if;
  if req.status <> 'pending' or req.created_at < clock_timestamp() - interval '90 seconds' then raise exception 'Request expired'; end if;
  select user_id into owner_id from public.conversations where id = req.conversation_id for update;
  if owner_id is distinct from p_user_id then raise exception 'Conversation unavailable'; end if;
  if char_length(p_answer) not between 1 and 24000 then raise exception 'Invalid answer'; end if;
  insert into public.messages(conversation_id, role, content) values(req.conversation_id, 'user', req.content) returning * into q;
  insert into public.messages(conversation_id, role, content, created_at) values(req.conversation_id, 'assistant', p_answer, q.created_at + interval '1 microsecond') returning * into a;
  result_messages := jsonb_build_array(to_jsonb(q), to_jsonb(a));
  update public.chat_requests set status = 'completed', result = result_messages where id = p_request_id;
  update public.conversations set updated_at = clock_timestamp() where id = req.conversation_id;
  return result_messages;
end;
$$;

create function public.fail_chat_request(p_user_id uuid, p_request_id uuid)
returns void language sql security invoker set search_path = '' as $$
  update public.chat_requests set status = 'failed' where id = p_request_id and user_id = p_user_id and status = 'pending';
$$;

revoke all on function public.reserve_chat_request(uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.complete_chat_request(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.fail_chat_request(uuid, uuid) from public, anon, authenticated;
grant execute on function public.reserve_chat_request(uuid, uuid, uuid, text) to service_role;
grant execute on function public.complete_chat_request(uuid, uuid, text) to service_role;
grant execute on function public.fail_chat_request(uuid, uuid) to service_role;
commit;
