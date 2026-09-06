-- Run this in Supabase Dashboard → SQL Editor
-- Fixes RLS issues and ensures signup creates a profiles row

-- 1. Ensure profiles table exists with expected columns
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  updated_at timestamptz default now(),
  username text,
  full_name text,
  avatar_url text,
  website text,
  role text check (role in ('customer', 'admin', 'super_admin')) default 'customer',
  phone text,
  gym_name text,
  is_approved boolean default false,
  approved_by uuid references auth.users (id),
  approved_at timestamptz
);

-- Upgrade older profiles schemas that were created without app columns
alter table public.profiles add column if not exists updated_at timestamptz default now();
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists gym_name text;
alter table public.profiles add column if not exists is_approved boolean default false;
alter table public.profiles add column if not exists approved_by uuid;
alter table public.profiles add column if not exists approved_at timestamptz;

-- Keep role values constrained (safe even if constraint already exists)
do $$
begin
  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('customer', 'admin', 'super_admin'));
exception
  when duplicate_object then null;
end $$;

alter table public.profiles enable row level security;

-- 2. Drop policies that may cause infinite recursion / conflicts
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Profiles are viewable by owner" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Super admins can view all profiles" on public.profiles;
drop policy if exists "Super admins can read all profiles" on public.profiles;
drop policy if exists "Super admins can update all profiles" on public.profiles;
drop policy if exists "Enable read access for users based on user_id" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_super_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_super_admin" on public.profiles;

-- 3. Security definer helper (bypasses RLS when checking role)
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

-- 4. Safe RLS policies
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "profiles_select_super_admin"
on public.profiles for select
to authenticated
using (public.is_super_admin());

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_update_super_admin"
on public.profiles for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- 5. Auto-create profile on auth signup (runs even when email confirmation
--    leaves the client without a session — required for DB storage)
--    is_approved stays FALSE until:
--      - customer: email is confirmed (see handle_email_confirmed)
--      - admin: super admin approves in the app
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  user_role text := coalesce(meta->>'role', 'customer');
  approved boolean := false;
begin
  if user_role not in ('customer', 'admin', 'super_admin') then
    user_role := 'customer';
  end if;

  -- Only seeded / elevated super_admins start approved
  if user_role = 'super_admin' then
    approved := true;
  end if;

  insert into public.profiles (
    id,
    full_name,
    role,
    phone,
    gym_name,
    avatar_url,
    is_approved,
    approved_by,
    approved_at,
    updated_at
  )
  values (
    new.id,
    coalesce(nullif(meta->>'full_name', ''), 'User'),
    user_role,
    nullif(meta->>'phone', ''),
    nullif(meta->>'gym_name', ''),
    coalesce(
      nullif(meta->>'avatar_url', ''),
      'https://images.unsplash.com/photo-1548690312-e3b507d8c110?fit=crop&w=300&h=300&q=80'
    ),
    approved,
    case when approved then new.id else null end,
    case when approved then now() else null end,
    now()
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    phone = coalesce(excluded.phone, public.profiles.phone),
    gym_name = coalesce(excluded.gym_name, public.profiles.gym_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    -- Do not downgrade an already-approved profile on conflict
    is_approved = public.profiles.is_approved or excluded.is_approved,
    approved_by = coalesce(public.profiles.approved_by, excluded.approved_by),
    approved_at = coalesce(public.profiles.approved_at, excluded.approved_at),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. When customer confirms email, mark profile approved (not for admins)
create or replace function public.handle_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text := coalesce(new.raw_user_meta_data->>'role', 'customer');
begin
  if old.email_confirmed_at is null
     and new.email_confirmed_at is not null
     and user_role = 'customer' then
    update public.profiles
    set
      is_approved = true,
      approved_by = coalesce(approved_by, new.id),
      approved_at = coalesce(approved_at, now()),
      updated_at = now()
    where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_email_confirmed();
