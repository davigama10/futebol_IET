-- Cartões por partida, goleiros por torneio e defesas por partida. Tudo aditivo:
-- nenhuma tabela/coluna existente muda de significado e torneios já criados
-- continuam funcionando (colunas novas nascem zeradas, tabelas novas vazias).

-- Log de cada cartão — mesmo padrão de eventos_gol: `time_id` é o time pelo qual
-- o jogador estava jogando naquela partida (pode não ser o time original dele,
-- ex: alguém completando outro time), `jogador_id` quem recebeu o cartão.
create table public.eventos_cartao (
  id uuid primary key default gen_random_uuid(),
  partida_id uuid not null references public.partidas(id) on delete cascade,
  time_id uuid not null references public.torneio_times(id),
  jogador_id uuid not null references public.jogadores(id),
  tipo text not null check (tipo in ('amarelo', 'vermelho')),
  created_at timestamptz not null default now()
);

-- Contadores de cartões na classificação denormalizada, atualizados junto com
-- vitórias/gols quando a partida é encerrada (e revertidos ao reabrir). Servem
-- de critério de desempate (menos cartões = melhor).
alter table public.torneio_times
  add column cartoes_amarelos smallint not null default 0,
  add column cartoes_vermelhos smallint not null default 0;

-- Goleiros disponíveis num torneio — ficam fora do sorteio dos times de linha.
-- `nome` é snapshot (igual aos jogadores em torneio_times.jogadores).
create table public.torneio_goleiros (
  id uuid primary key default gen_random_uuid(),
  torneio_id uuid not null references public.torneios(id) on delete cascade,
  jogador_id uuid not null references public.jogadores(id),
  nome text not null,
  created_at timestamptz not null default now(),
  unique (torneio_id, jogador_id)
);

-- Defesas de cada goleiro em cada partida (Torneio → Partida → Goleiro → Defesas).
-- O total do torneio é a soma das linhas das partidas dele.
create table public.defesas_goleiro (
  id uuid primary key default gen_random_uuid(),
  partida_id uuid not null references public.partidas(id) on delete cascade,
  jogador_id uuid not null references public.jogadores(id),
  defesas smallint not null default 0 check (defesas >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partida_id, jogador_id)
);

create trigger defesas_goleiro_set_updated_at
  before update on public.defesas_goleiro
  for each row execute procedure public.set_updated_at();

-- RLS: mesmo padrão de 0006 — leitura pra autenticado, escrita só admin.
alter table public.eventos_cartao enable row level security;
alter table public.torneio_goleiros enable row level security;
alter table public.defesas_goleiro enable row level security;

create policy "eventos_cartao_select" on public.eventos_cartao
  for select using (auth.role() = 'authenticated');
create policy "eventos_cartao_write" on public.eventos_cartao
  for all using (public.current_role() in ('admin', 'master_admin'))
  with check (public.current_role() in ('admin', 'master_admin'));

create policy "torneio_goleiros_select" on public.torneio_goleiros
  for select using (auth.role() = 'authenticated');
create policy "torneio_goleiros_write" on public.torneio_goleiros
  for all using (public.current_role() in ('admin', 'master_admin'))
  with check (public.current_role() in ('admin', 'master_admin'));

create policy "defesas_goleiro_select" on public.defesas_goleiro
  for select using (auth.role() = 'authenticated');
create policy "defesas_goleiro_write" on public.defesas_goleiro
  for all using (public.current_role() in ('admin', 'master_admin'))
  with check (public.current_role() in ('admin', 'master_admin'));
