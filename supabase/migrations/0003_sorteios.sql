-- Histórico de sorteios: snapshot imutável do resultado (times + avulsos).
create table public.sorteios (
  id uuid primary key default gen_random_uuid(),
  tamanho_time smallint not null check (tamanho_time in (4, 5, 6)),
  resultado jsonb not null,
  criado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
