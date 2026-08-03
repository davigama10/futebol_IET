-- Permite nível de habilidade em incrementos de meia estrela (ex: 3.5).
alter table public.jogadores drop constraint jogadores_nivel_check;
alter table public.jogadores alter column nivel type numeric(2, 1) using nivel::numeric(2, 1);
alter table public.jogadores add constraint jogadores_nivel_check
  check (nivel >= 1 and nivel <= 5 and (nivel * 2) = floor(nivel * 2));
