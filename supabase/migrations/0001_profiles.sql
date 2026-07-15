-- Profiles: one row per authenticated user, created automatically on signup.
create type public.user_role as enum ('viewer', 'admin', 'master_admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  role public.user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email), 'viewer');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper used by RLS policies across tables, avoids repeating the subquery.
create function public.current_role()
returns public.user_role
language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;
