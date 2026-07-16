import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { Posicao } from '@/domain/sorteio.types';
import { createClient } from '@/lib/supabase/client';
import type { JogadorRow } from '@/types/database.types';

export interface JogadorInput {
  nome: string;
  nivel: number;
  posicao: Posicao;
}

const JOGADORES_KEY = ['jogadores'];

export function useJogadores() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  async function fetchJogadores(): Promise<JogadorRow[]> {
    const { data, error } = await supabase
      .from('jogadores')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  const {
    data: jogadores = [],
    isLoading: loading,
    error,
    refetch: recarregar,
  } = useQuery({ queryKey: JOGADORES_KEY, queryFn: fetchJogadores });

  async function criar(input: JogadorInput) {
    const { data: userData } = await supabase.auth.getUser();
    const { error: err } = await supabase.from('jogadores').insert({
      nome: input.nome,
      nivel: input.nivel,
      posicao: input.posicao,
      criado_por: userData.user?.id,
    });
    if (err) return { error: err.message };
    await queryClient.invalidateQueries({ queryKey: JOGADORES_KEY });
    return { error: null };
  }

  async function atualizar(id: string, input: JogadorInput) {
    const { error: err } = await supabase
      .from('jogadores')
      .update({ nome: input.nome, nivel: input.nivel, posicao: input.posicao })
      .eq('id', id);
    if (err) return { error: err.message };
    await queryClient.invalidateQueries({ queryKey: JOGADORES_KEY });
    return { error: null };
  }

  async function excluir(id: string) {
    const { error: err } = await supabase.from('jogadores').delete().eq('id', id);
    if (err) return { error: err.message };
    await queryClient.invalidateQueries({ queryKey: JOGADORES_KEY });
    return { error: null };
  }

  return {
    jogadores,
    loading,
    error: error ? (error as Error).message : null,
    recarregar,
    criar,
    atualizar,
    excluir,
  };
}
