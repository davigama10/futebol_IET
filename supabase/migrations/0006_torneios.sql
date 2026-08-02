-- Sistema de torneios: formatos reutilizáveis de confronto, torneios criados a
-- partir do sorteio existente, partidas, e log de gols/assistências.

-- Formato reutilizável (ex: "Todos contra todos - 4 times"). Os confrontos usam
-- índices abstratos (1..quantidade_times), resolvidos pros times reais quando um
-- torneio é criado a partir desse formato.
create table public.formatos_torneio (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  quantidade_times smallint not null check (quantidade_times >= 2),
  criado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.formato_partidas (
  id uuid primary key default gen_random_uuid(),
  formato_id uuid not null references public.formatos_torneio(id) on delete cascade,
  ordem smallint not null,
  time_a_indice smallint not null check (time_a_indice >= 1),
  time_b_indice smallint not null check (time_b_indice >= 1),
  check (time_a_indice <> time_b_indice),
  unique (formato_id, ordem)
);

create table public.torneios (
  id uuid primary key default gen_random_uuid(),
  nome text,
  data date not null,
  quantidade_times smallint not null check (quantidade_times >= 2),
  jogadores_por_time smallint not null check (jogadores_por_time in (4, 5, 6)),
  formato_id uuid not null references public.formatos_torneio(id),
  status text not null default 'em_andamento' check (status in ('em_andamento', 'finalizado')),
  criado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Composição real de cada time do torneio (snapshot do resultado do sorteio) +
-- classificação denormalizada, atualizada quando uma partida é encerrada.
create table public.torneio_times (
  id uuid primary key default gen_random_uuid(),
  torneio_id uuid not null references public.torneios(id) on delete cascade,
  indice smallint not null check (indice >= 1),
  jogadores jsonb not null,
  soma_nivel smallint not null default 0,
  vitorias smallint not null default 0,
  empates smallint not null default 0,
  derrotas smallint not null default 0,
  gols_pro smallint not null default 0,
  gols_contra smallint not null default 0,
  pontos smallint not null default 0,
  unique (torneio_id, indice)
);

create table public.partidas (
  id uuid primary key default gen_random_uuid(),
  torneio_id uuid not null references public.torneios(id) on delete cascade,
  ordem smallint not null,
  time_a_id uuid not null references public.torneio_times(id),
  time_b_id uuid not null references public.torneio_times(id),
  gols_time_a smallint not null default 0,
  gols_time_b smallint not null default 0,
  status text not null default 'em_andamento' check (status in ('em_andamento', 'finalizada')),
  created_at timestamptz not null default now(),
  finalizada_em timestamptz
);

-- Log de cada gol — fonte de verdade do placar e da artilharia/assistências do
-- torneio. `time_id` é o time creditado no placar (o beneficiado, mesmo em gol
-- contra); `jogador_id` é o autor, que em gol contra pertence ao time adversário
-- de `time_id`. Gols contra não contam artilharia pessoal nem têm assistência.
create table public.eventos_gol (
  id uuid primary key default gen_random_uuid(),
  partida_id uuid not null references public.partidas(id) on delete cascade,
  time_id uuid not null references public.torneio_times(id),
  jogador_id uuid not null references public.jogadores(id),
  assistencia_jogador_id uuid references public.jogadores(id),
  gol_contra boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS: mesmo padrão de jogadores/sorteios — leitura livre pra autenticado,
-- escrita só admin/master_admin (reaproveita public.current_role() de 0001).
alter table public.formatos_torneio enable row level security;
alter table public.formato_partidas enable row level security;
alter table public.torneios enable row level security;
alter table public.torneio_times enable row level security;
alter table public.partidas enable row level security;
alter table public.eventos_gol enable row level security;

create policy "formatos_torneio_select" on public.formatos_torneio
  for select using (auth.role() = 'authenticated');
create policy "formatos_torneio_write" on public.formatos_torneio
  for all using (public.current_role() in ('admin', 'master_admin'))
  with check (public.current_role() in ('admin', 'master_admin'));

create policy "formato_partidas_select" on public.formato_partidas
  for select using (auth.role() = 'authenticated');
create policy "formato_partidas_write" on public.formato_partidas
  for all using (public.current_role() in ('admin', 'master_admin'))
  with check (public.current_role() in ('admin', 'master_admin'));

create policy "torneios_select" on public.torneios
  for select using (auth.role() = 'authenticated');
create policy "torneios_write" on public.torneios
  for all using (public.current_role() in ('admin', 'master_admin'))
  with check (public.current_role() in ('admin', 'master_admin'));

create policy "torneio_times_select" on public.torneio_times
  for select using (auth.role() = 'authenticated');
create policy "torneio_times_write" on public.torneio_times
  for all using (public.current_role() in ('admin', 'master_admin'))
  with check (public.current_role() in ('admin', 'master_admin'));

create policy "partidas_select" on public.partidas
  for select using (auth.role() = 'authenticated');
create policy "partidas_write" on public.partidas
  for all using (public.current_role() in ('admin', 'master_admin'))
  with check (public.current_role() in ('admin', 'master_admin'));

create policy "eventos_gol_select" on public.eventos_gol
  for select using (auth.role() = 'authenticated');
create policy "eventos_gol_write" on public.eventos_gol
  for all using (public.current_role() in ('admin', 'master_admin'))
  with check (public.current_role() in ('admin', 'master_admin'));
