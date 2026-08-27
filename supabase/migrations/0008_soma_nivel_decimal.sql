-- soma_nivel é a soma dos níveis dos jogadores de um time, e nível agora aceita
-- meia estrela (0007_nivel_meia_estrela.sql) — a soma pode ser não-inteira
-- (ex: 14.5), então a coluna precisa aceitar decimais também.
alter table public.torneio_times alter column soma_nivel type numeric(5, 1);
alter table public.torneio_times alter column soma_nivel set default 0;
