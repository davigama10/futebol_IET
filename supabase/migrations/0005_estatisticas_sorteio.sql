-- Gols e assistências de cada jogador num sorteio específico (permite
-- levantar artilharia/assistências ao longo do mês).
create table public.estatisticas_sorteio (
  id uuid primary key default gen_random_uuid(),
  sorteio_id uuid not null references public.sorteios(id) on delete cascade,
  jogador_id uuid not null references public.jogadores(id) on delete cascade,
  gols smallint not null default 0 check (gols >= 0),
  assistencias smallint not null default 0 check (assistencias >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sorteio_id, jogador_id)
);

create trigger estatisticas_sorteio_set_updated_at
  before update on public.estatisticas_sorteio
  for each row execute procedure public.set_updated_at();

alter table public.estatisticas_sorteio enable row level security;

create policy "estatisticas_select_all_authenticated" on public.estatisticas_sorteio
  for select using (auth.role() = 'authenticated');

create policy "estatisticas_insert_admin" on public.estatisticas_sorteio
  for insert with check (public.current_role() in ('admin', 'master_admin'));

create policy "estatisticas_update_admin" on public.estatisticas_sorteio
  for update using (public.current_role() in ('admin', 'master_admin'));

create policy "estatisticas_delete_admin" on public.estatisticas_sorteio
  for delete using (public.current_role() in ('admin', 'master_admin'));
