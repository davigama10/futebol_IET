'use server';

import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';
import type { TipoCartao, TorneioTimeRow } from '@/types/database.types';

type Supabase = Awaited<ReturnType<typeof createClient>>;

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

interface DesempenhoNaPartida {
  golsPro: number;
  golsContra: number;
  resultado: Resultado;
  amarelos: number;
  vermelhos: number;
}

async function ajustarClassificacao(
  supabase: Supabase,
  time: TorneioTimeRow,
  desempenho: DesempenhoNaPartida,
  sinal: 1 | -1
) {
  const { golsPro, golsContra, resultado, amarelos, vermelhos } = desempenho;
  return supabase
    .from('torneio_times')
    .update({
      vitorias: time.vitorias + sinal * (resultado === 'vitoria' ? 1 : 0),
      empates: time.empates + sinal * (resultado === 'empate' ? 1 : 0),
      derrotas: time.derrotas + sinal * (resultado === 'derrota' ? 1 : 0),
      gols_pro: time.gols_pro + sinal * golsPro,
      gols_contra: time.gols_contra + sinal * golsContra,
      pontos: time.pontos + sinal * (resultado === 'vitoria' ? 3 : resultado === 'empate' ? 1 : 0),
      cartoes_amarelos: Math.max(0, (time.cartoes_amarelos ?? 0) + sinal * amarelos),
      cartoes_vermelhos: Math.max(0, (time.cartoes_vermelhos ?? 0) + sinal * vermelhos),
    })
    .eq('id', time.id);
}

/**
 * Aplica (sinal 1, ao encerrar) ou desfaz (sinal -1, ao reabrir) o efeito de uma partida na
 * classificação dos dois times — resultado, gols e cartões. Enquanto a partida está encerrada
 * nenhum gol/cartão pode ser lançado ou removido, então reabrir sempre desfaz exatamente o que
 * foi aplicado.
 */
async function aplicarPartidaNaClassificacao(
  supabase: Supabase,
  partida: { id: string; time_a_id: string; time_b_id: string; gols_time_a: number; gols_time_b: number },
  sinal: 1 | -1
) {
  const [{ data: times, error: erroTimes }, { data: cartoes, error: erroCartoes }] = await Promise.all([
    supabase.from('torneio_times').select('*').in('id', [partida.time_a_id, partida.time_b_id]),
    supabase.from('eventos_cartao').select('time_id, tipo').eq('partida_id', partida.id),
  ]);

  if (erroTimes || !times) return { error: erroTimes?.message ?? 'Erro ao carregar os times.' };
  if (erroCartoes) return { error: erroCartoes.message };

  const timeA = times.find((t) => t.id === partida.time_a_id);
  const timeB = times.find((t) => t.id === partida.time_b_id);
  if (!timeA || !timeB) return { error: 'Times da partida não encontrados.' };

  const contarCartoes = (timeId: string, tipo: TipoCartao) =>
    (cartoes ?? []).filter((c) => c.time_id === timeId && c.tipo === tipo).length;

  const golsA = partida.gols_time_a;
  const golsB = partida.gols_time_b;
  const [resultadoA, resultadoB] = resultadosDoConfronto(golsA, golsB);

  const [{ error: erroA }, { error: erroB }] = await Promise.all([
    ajustarClassificacao(
      supabase,
      timeA,
      {
        golsPro: golsA,
        golsContra: golsB,
        resultado: resultadoA,
        amarelos: contarCartoes(timeA.id, 'amarelo'),
        vermelhos: contarCartoes(timeA.id, 'vermelho'),
      },
      sinal
    ),
    ajustarClassificacao(
      supabase,
      timeB,
      {
        golsPro: golsB,
        golsContra: golsA,
        resultado: resultadoB,
        amarelos: contarCartoes(timeB.id, 'amarelo'),
        vermelhos: contarCartoes(timeB.id, 'vermelho'),
      },
      sinal
    ),
  ]);

  if (erroA || erroB) return { error: (erroA ?? erroB)?.message ?? 'Erro ao atualizar classificação.' };
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

  const { error: erroClassificacao } = await aplicarPartidaNaClassificacao(supabase, partida, 1);
  if (erroClassificacao) return { error: erroClassificacao };

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

  const { error: erroClassificacao } = await aplicarPartidaNaClassificacao(supabase, partida, -1);
  if (erroClassificacao) return { error: erroClassificacao };

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

/** Carrega a partida e garante que ainda está em andamento (eventos só mudam com ela aberta). */
async function carregarPartidaEmAndamento(supabase: Supabase, partidaId: string) {
  const { data: partida, error } = await supabase
    .from('partidas')
    .select('*')
    .eq('id', partidaId)
    .single();

  if (error || !partida) return { partida: null, error: error?.message ?? 'Partida não encontrada.' };
  if (partida.status === 'finalizada') {
    return { partida: null, error: 'Essa partida está encerrada. Reabra para alterar.' };
  }
  return { partida, error: null };
}

function revalidarPartida(torneioId: string, partidaId: string) {
  revalidatePath(`/torneios/${torneioId}`);
  revalidatePath(`/torneios/${torneioId}/partidas/${partidaId}`);
}

interface RegistrarCartaoInput {
  partidaId: string;
  timeId: string;
  jogadorId: string;
  tipo: TipoCartao;
}

export async function registrarCartao(input: RegistrarCartaoInput) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para registrar cartões.' };

  const supabase = await createClient();
  const { partida, error } = await carregarPartidaEmAndamento(supabase, input.partidaId);
  if (!partida) return { error };

  if (input.timeId !== partida.time_a_id && input.timeId !== partida.time_b_id) {
    return { error: 'O time informado não está nessa partida.' };
  }

  const { error: erroEvento } = await supabase.from('eventos_cartao').insert({
    partida_id: input.partidaId,
    time_id: input.timeId,
    jogador_id: input.jogadorId,
    tipo: input.tipo,
  });

  if (erroEvento) return { error: erroEvento.message };

  revalidarPartida(partida.torneio_id, partida.id);
  return { error: null };
}

export async function removerCartao(eventoId: string) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para remover cartões.' };

  const supabase = await createClient();

  const { data: evento, error: erroEvento } = await supabase
    .from('eventos_cartao')
    .select('*')
    .eq('id', eventoId)
    .single();

  if (erroEvento || !evento) return { error: erroEvento?.message ?? 'Cartão não encontrado.' };

  const { partida, error } = await carregarPartidaEmAndamento(supabase, evento.partida_id);
  if (!partida) return { error };

  const { error: erroDelete } = await supabase.from('eventos_cartao').delete().eq('id', eventoId);
  if (erroDelete) return { error: erroDelete.message };

  revalidarPartida(partida.torneio_id, partida.id);
  return { error: null };
}

/** Define (valor absoluto) quantas defesas um goleiro fez numa partida. */
export async function salvarDefesas(partidaId: string, jogadorId: string, defesas: number) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para registrar defesas.' };
  if (!Number.isInteger(defesas) || defesas < 0) return { error: 'Quantidade de defesas inválida.' };

  const supabase = await createClient();
  const { partida, error } = await carregarPartidaEmAndamento(supabase, partidaId);
  if (!partida) return { error };

  const { error: erroSalvar } =
    defesas === 0
      ? await supabase
          .from('defesas_goleiro')
          .delete()
          .eq('partida_id', partidaId)
          .eq('jogador_id', jogadorId)
      : await supabase
          .from('defesas_goleiro')
          .upsert(
            { partida_id: partidaId, jogador_id: jogadorId, defesas },
            { onConflict: 'partida_id,jogador_id' }
          );

  if (erroSalvar) return { error: erroSalvar.message };

  revalidarPartida(partida.torneio_id, partida.id);
  return { error: null };
}
