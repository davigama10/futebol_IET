-- Novas funções de jogador: meio-campo (entra no balanceamento do sorteio junto
-- com atacante/defensor) e goleiro (fica fora do sorteio de linha dos torneios,
-- num grupo próprio — ver 0010_cartoes_goleiros_defesas.sql).
--
-- Fica num arquivo separado porque um valor novo de enum não pode ser usado na
-- mesma transação em que foi criado. Jogadores existentes não são afetados.
alter type public.posicao_jogador add value if not exists 'meio_campo';
alter type public.posicao_jogador add value if not exists 'goleiro';
