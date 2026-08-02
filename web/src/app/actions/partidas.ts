'use server';

import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';
import type { TorneioTimeRow } from '@/types/database.types';

interface RegistrarGolInput {
  partidaId: string;
  timeId: string;
  jogadorId: string;
  assistenciaJogadorId: string | null;
  golContra: boolean;
}

export async function registrarGol(input: RegistrarGolInput) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para registrar gols.' };

  const supabase = await createClient();

  const { data: partida, error: erroPartida } = await supabase
    .from('partidas')
    .select('*')
    .eq('id', input.partidaId)
    .single();

  if (erroPartida || !partida) return { error: erroPartida?.message ?? 'Partida não encontrada.' };
  if (partida.status === 'finalizada') return { error: 'Essa partida já foi encerrada.' };

  const { error: erroEvento } = await supabase.from('eventos_gol').insert({
    partida_id: input.partidaId,
    time_id: input.timeId,
    jogador_id: input.jogadorId,
    assistencia_jogador_id: input.assistenciaJogadorId,
    gol_contra: input.golContra,
  });

  if (erroEvento) return { error: erroEvento.message };

  const atualizacaoPlacar =
    input.timeId === partida.time_a_id
      ? { gols_time_a: partida.gols_time_a + 1 }
      : { gols_time_b: partida.gols_time_b + 1 };

  const { error: erroPlacar } = await supabase
    .from('partidas')
    .update(atualizacaoPlacar)
    .eq('id', input.partidaId);

  if (erroPlacar) return { error: erroPlacar.message };

  revalidatePath(`/torneios/${partida.torneio_id}`);
  revalidatePath(`/torneios/${partida.torneio_id}/partidas/${input.partidaId}`);
  return { error: null };
}

export async function encerrarPartida(partidaId: string) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para encerrar partidas.' };

  const supabase = await createClient();

  const { data: partida, error: erroPartida } = await supabase
    .from('partidas')
    .select('*')
    .eq('id', partidaId)
    .single();

  if (erroPartida || !partida) return { error: erroPartida?.message ?? 'Partida não encontrada.' };
  if (partida.status === 'finalizada') return { error: 'Essa partida já foi encerrada.' };

  const { data: times, error: erroTimes } = await supabase
    .from('torneio_times')
    .select('*')
    .in('id', [partida.time_a_id, partida.time_b_id]);

  if (erroTimes || !times) return { error: erroTimes?.message ?? 'Erro ao carregar os times.' };

  const timeA = times.find((t) => t.id === partida.time_a_id);
  const timeB = times.find((t) => t.id === partida.time_b_id);
  if (!timeA || !timeB) return { error: 'Times da partida não encontrados.' };

  const golsA = partida.gols_time_a;
  const golsB = partida.gols_time_b;

  const resultadoA = golsA > golsB ? 'vitoria' : golsA < golsB ? 'derrota' : 'empate';
  const resultadoB = golsA > golsB ? 'derrota' : golsA < golsB ? 'vitoria' : 'empate';

  async function aplicarResultado(
    time: TorneioTimeRow,
    golsPro: number,
    golsContraPartida: number,
    resultado: 'vitoria' | 'empate' | 'derrota'
  ) {
    return supabase
      .from('torneio_times')
      .update({
        vitorias: time.vitorias + (resultado === 'vitoria' ? 1 : 0),
        empates: time.empates + (resultado === 'empate' ? 1 : 0),
        derrotas: time.derrotas + (resultado === 'derrota' ? 1 : 0),
        gols_pro: time.gols_pro + golsPro,
        gols_contra: time.gols_contra + golsContraPartida,
        pontos: time.pontos + (resultado === 'vitoria' ? 3 : resultado === 'empate' ? 1 : 0),
      })
      .eq('id', time.id);
  }

  const [{ error: erroA }, { error: erroB }] = await Promise.all([
    aplicarResultado(timeA, golsA, golsB, resultadoA),
    aplicarResultado(timeB, golsB, golsA, resultadoB),
  ]);

  if (erroA || erroB) return { error: (erroA ?? erroB)?.message ?? 'Erro ao atualizar classificação.' };

  const { error: erroFinalizar } = await supabase
    .from('partidas')
    .update({ status: 'finalizada', finalizada_em: new Date().toISOString() })
    .eq('id', partidaId);

  if (erroFinalizar) return { error: erroFinalizar.message };

  const { data: outrasPartidas } = await supabase
    .from('partidas')
    .select('status')
    .eq('torneio_id', partida.torneio_id);

  const restam = (outrasPartidas ?? []).filter((p) => p.status !== 'finalizada');

  if (restam.length === 0) {
    await supabase.from('torneios').update({ status: 'finalizado' }).eq('id', partida.torneio_id);
  }

  revalidatePath(`/torneios/${partida.torneio_id}`);
  revalidatePath(`/torneios/${partida.torneio_id}/partidas/${partidaId}`);
  return { error: null };
}
