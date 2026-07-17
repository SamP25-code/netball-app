-- Run once, manually, in the Supabase dashboard's SQL Editor — AFTER the
-- Prisma migration has created the "users" table (npx prisma migrate dev).
-- auth.users is a Supabase-managed schema Prisma doesn't know about, so this
-- sync trigger can't be expressed as a Prisma migration.
--
-- Keeps public.users in sync with auth.users on sign-up, so Prisma's
-- User.id always matches Supabase's auth.users.id.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, "displayName")
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'displayName', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
