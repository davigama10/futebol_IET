import { useCallback, useEffect, useState } from 'react';

import type { Posicao } from '../domain/sorteio.types';
import { supabase } from '../lib/supabase';
import type { JogadorRow } from '../types/database.types';

export interface JogadorInput {
  nome: string;
  nivel: number;
  posicao: Posicao;
}

export function useJogadores() {
  const [jogadores, setJogadores] = useState<JogadorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('jogadores')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setError(null);
      setJogadores(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function criar(input: JogadorInput) {
    const { data: userData } = await supabase.auth.getUser();
    const { error: err } = await supabase.from('jogadores').insert({
      nome: input.nome,
      nivel: input.nivel,
      posicao: input.posicao,
      criado_por: userData.user?.id,
    });
    if (err) return { error: err.message };
    await carregar();
    return { error: null };
  }

  async function atualizar(id: string, input: JogadorInput) {
    const { error: err } = await supabase
      .from('jogadores')
      .update({ nome: input.nome, nivel: input.nivel, posicao: input.posicao })
      .eq('id', id);
    if (err) return { error: err.message };
    await carregar();
    return { error: null };
  }

  async function excluir(id: string) {
    const { error: err } = await supabase.from('jogadores').delete().eq('id', id);
    if (err) return { error: err.message };
    await carregar();
    return { error: null };
  }

  return { jogadores, loading, error, recarregar: carregar, criar, atualizar, excluir };
}
