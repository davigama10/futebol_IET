-- profiles
alter table public.profiles enable row level security;

create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

-- self may update own nome, but never own role
create policy "profiles_update_self_nome" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- master_admin may update anyone's role
create policy "profiles_update_role_master" on public.profiles
  for update using (public.current_role() = 'master_admin')
  with check (true);

-- jogadores
alter table public.jogadores enable row level security;

create policy "jogadores_select_all_authenticated" on public.jogadores
  for select using (auth.role() = 'authenticated');

create policy "jogadores_insert_admin" on public.jogadores
  for insert with check (public.current_role() in ('admin', 'master_admin'));

create policy "jogadores_update_admin" on public.jogadores
  for update using (public.current_role() in ('admin', 'master_admin'));

create policy "jogadores_delete_admin" on public.jogadores
  for delete using (public.current_role() in ('admin', 'master_admin'));

-- sorteios
alter table public.sorteios enable row level security;

create policy "sorteios_select_all_authenticated" on public.sorteios
  for select using (auth.role() = 'authenticated');

create policy "sorteios_insert_admin" on public.sorteios
  for insert with check (public.current_role() in ('admin', 'master_admin'));
