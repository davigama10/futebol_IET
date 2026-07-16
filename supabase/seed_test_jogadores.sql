-- Script de teste: insere 25 jogadores fictícios para testar o sorteio.
-- Rode no SQL Editor do Supabase (não é uma migration, não faz parte do schema).
-- Pode rodar quantas vezes quiser; para limpar depois, veja o DELETE comentado no final.

insert into public.jogadores (nome, nivel, posicao) values
  ('Lucas Silva', 5, 'atacante'),
  ('Pedro Henrique', 3, 'defensor'),
  ('João Vitor', 4, 'atacante'),
  ('Matheus Souza', 2, 'defensor'),
  ('Gabriel Santos', 5, 'defensor'),
  ('Rafael Costa', 1, 'atacante'),
  ('Bruno Oliveira', 3, 'atacante'),
  ('Thiago Almeida', 4, 'defensor'),
  ('Felipe Rocha', 2, 'atacante'),
  ('Diego Ferreira', 5, 'atacante'),
  ('André Pereira', 3, 'defensor'),
  ('Marcos Lima', 4, 'atacante'),
  ('Vinícius Gomes', 1, 'defensor'),
  ('Leonardo Barbosa', 2, 'defensor'),
  ('Rodrigo Martins', 5, 'defensor'),
  ('Gustavo Ribeiro', 3, 'atacante'),
  ('Eduardo Carvalho', 4, 'defensor'),
  ('Fernando Araújo', 1, 'atacante'),
  ('Caio Nunes', 2, 'atacante'),
  ('Igor Teixeira', 5, 'atacante'),
  ('Daniel Correia', 3, 'defensor'),
  ('Renato Dias', 4, 'atacante'),
  ('Alexandre Moura', 1, 'defensor'),
  ('Vitor Cardoso', 2, 'defensor'),
  ('Samuel Freitas', 4, 'atacante');

-- Para remover só esses jogadores de teste depois:
-- delete from public.jogadores where nome in (
--   'Lucas Silva', 'Pedro Henrique', 'João Vitor', 'Matheus Souza', 'Gabriel Santos',
--   'Rafael Costa', 'Bruno Oliveira', 'Thiago Almeida', 'Felipe Rocha', 'Diego Ferreira',
--   'André Pereira', 'Marcos Lima', 'Vinícius Gomes', 'Leonardo Barbosa', 'Rodrigo Martins',
--   'Gustavo Ribeiro', 'Eduardo Carvalho', 'Fernando Araújo', 'Caio Nunes', 'Igor Teixeira',
--   'Daniel Correia', 'Renato Dias', 'Alexandre Moura', 'Vitor Cardoso', 'Samuel Freitas'
-- );
