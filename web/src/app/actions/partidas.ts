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

export async function removerGol(eventoId: string) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para remover gols.' };

  const supabase = await createClient();

  const { data: evento, error: erroEvento } = await supabase
    .from('eventos_gol')
    .select('*')
    .eq('id', eventoId)
    .single();

  if (erroEvento || !evento) return { error: erroEvento?.message ?? 'Gol não encontrado.' };

  const { data: partida, error: erroPartida } = await supabase
    .from('partidas')
    .select('*')
    .eq('id', evento.partida_id)
    .single();

  if (erroPartida || !partida) return { error: erroPartida?.message ?? 'Partida não encontrada.' };
  if (partida.status === 'finalizada') {
    return { error: 'Reabra a partida antes de remover um gol.' };
  }

  const { error: erroDelete } = await supabase.from('eventos_gol').delete().eq('id', eventoId);
  if (erroDelete) return { error: erroDelete.message };

  const atualizacaoPlacar =
    evento.time_id === partida.time_a_id
      ? { gols_time_a: Math.max(0, partida.gols_time_a - 1) }
      : { gols_time_b: Math.max(0, partida.gols_time_b - 1) };

  const { error: erroPlacar } = await supabase
    .from('partidas')
    .update(atualizacaoPlacar)
    .eq('id', partida.id);

  if (erroPlacar) return { error: erroPlacar.message };

  revalidatePath(`/torneios/${partida.torneio_id}`);
  revalidatePath(`/torneios/${partida.torneio_id}/partidas/${partida.id}`);
  return { error: null };
}

type Resultado = 'vitoria' | 'empate' | 'derrota';

function resultadosDoConfronto(golsA: number, golsB: number): [Resultado, Resultado] {
  if (golsA > golsB) return ['vitoria', 'derrota'];
  if (golsA < golsB) return ['derrota', 'vitoria'];
  return ['empate', 'empate'];
}

async function ajustarClassificacao(
  supabase: Awaited<ReturnType<typeof createClient>>,
  time: TorneioTimeRow,
  golsPro: number,
  golsContraPartida: number,
  resultado: Resultado,
  sinal: 1 | -1
) {
  return supabase
    .from('torneio_times')
    .update({
      vitorias: time.vitorias + sinal * (resultado === 'vitoria' ? 1 : 0),
      empates: time.empates + sinal * (resultado === 'empate' ? 1 : 0),
      derrotas: time.derrotas + sinal * (resultado === 'derrota' ? 1 : 0),
      gols_pro: time.gols_pro + sinal * golsPro,
      gols_contra: time.gols_contra + sinal * golsContraPartida,
      pontos: time.pontos + sinal * (resultado === 'vitoria' ? 3 : resultado === 'empate' ? 1 : 0),
    })
    .eq('id', time.id);
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
  const [resultadoA, resultadoB] = resultadosDoConfronto(golsA, golsB);

  const [{ error: erroA }, { error: erroB }] = await Promise.all([
    ajustarClassificacao(supabase, timeA, golsA, golsB, resultadoA, 1),
    ajustarClassificacao(supabase, timeB, golsB, golsA, resultadoB, 1),
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

export async function reabrirPartida(partidaId: string) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para reabrir partidas.' };

  const supabase = await createClient();

  const { data: partida, error: erroPartida } = await supabase
    .from('partidas')
    .select('*')
    .eq('id', partidaId)
    .single();

  if (erroPartida || !partida) return { error: erroPartida?.message ?? 'Partida não encontrada.' };
  if (partida.status !== 'finalizada') return { error: 'Essa partida não está encerrada.' };

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
  const [resultadoA, resultadoB] = resultadosDoConfronto(golsA, golsB);

  const [{ error: erroA }, { error: erroB }] = await Promise.all([
    ajustarClassificacao(supabase, timeA, golsA, golsB, resultadoA, -1),
    ajustarClassificacao(supabase, timeB, golsB, golsA, resultadoB, -1),
  ]);

  if (erroA || erroB) return { error: (erroA ?? erroB)?.message ?? 'Erro ao reverter classificação.' };

  const { error: erroReabrir } = await supabase
    .from('partidas')
    .update({ status: 'em_andamento', finalizada_em: null })
    .eq('id', partidaId);

  if (erroReabrir) return { error: erroReabrir.message };

  await supabase
    .from('torneios')
    .update({ status: 'em_andamento' })
    .eq('id', partida.torneio_id)
    .eq('status', 'finalizado');

  revalidatePath(`/torneios/${partida.torneio_id}`);
  revalidatePath(`/torneios/${partida.torneio_id}/partidas/${partidaId}`);
  return { error: null };
}
