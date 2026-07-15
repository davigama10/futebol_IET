create type public.posicao_jogador as enum ('atacante', 'defensor');

create table public.jogadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nivel smallint not null check (nivel between 1 and 5),
  posicao public.posicao_jogador not null,
  ativo boolean not null default true,
  criado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jogadores_set_updated_at
  before update on public.jogadores
  for each row execute procedure public.set_updated_at();
