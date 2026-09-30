'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { isAdmin } from '@/constants/roles';
import type { TimeMontado } from '@/domain/sorteio.types';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

interface CriarTorneioInput {
  nome: string | null;
  data: string;
  quantidadeTimes: number;
  jogadoresPorTime: 4 | 5 | 6;
  formatoId: string;
  times: TimeMontado[];
  goleiros: GoleiroInput[];
}

interface GoleiroInput {
  id: string;
  nome: string;
}

export async function criarTorneio(input: CriarTorneioInput) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para criar torneios.' };

  const supabase = await createClient();

  const { data: torneio, error: erroTorneio } = await supabase
    .from('torneios')
    .insert({
      nome: input.nome,
      data: input.data,
      quantidade_times: input.quantidadeTimes,
      jogadores_por_time: input.jogadoresPorTime,
      formato_id: input.formatoId,
      criado_por: profile!.id,
    })
    .select()
    .single();

  if (erroTorneio || !torneio) return { error: erroTorneio?.message ?? 'Erro ao criar torneio.' };

  const { data: timesInseridos, error: erroTimes } = await supabase
    .from('torneio_times')
    .insert(
      input.times.map((t, i) => ({
        torneio_id: torneio.id,
        indice: i + 1,
        jogadores: t.jogadores,
        soma_nivel: t.somaNivel,
      }))
    )
    .select();

  if (erroTimes || !timesInseridos) {
    return { error: erroTimes?.message ?? 'Erro ao salvar os times.' };
  }

  if (input.goleiros.length > 0) {
    const { error: erroGoleiros } = await supabase.from('torneio_goleiros').insert(
      input.goleiros.map((g) => ({ torneio_id: torneio.id, jogador_id: g.id, nome: g.nome }))
    );
    if (erroGoleiros) return { error: erroGoleiros.message };
  }

  const timeIdPorIndice = new Map(timesInseridos.map((t) => [t.indice, t.id]));

  const { data: confrontos, error: erroConfrontos } = await supabase
    .from('formato_partidas')
    .select('*')
    .eq('formato_id', input.formatoId)
    .order('ordem');

  if (erroConfrontos || !confrontos) {
    return { error: erroConfrontos?.message ?? 'Erro ao carregar o formato.' };
  }

  const partidasParaInserir = confrontos.map((c) => ({
    torneio_id: torneio.id,
    ordem: c.ordem,
    time_a_id: timeIdPorIndice.get(c.time_a_indice),
    time_b_id: timeIdPorIndice.get(c.time_b_indice),
  }));

  if (partidasParaInserir.some((p) => !p.time_a_id || !p.time_b_id)) {
    return { error: 'O formato faz referência a um time que não existe nesse torneio.' };
  }

  const { error: erroPartidas } = await supabase
    .from('partidas')
    .insert(partidasParaInserir as { torneio_id: string; ordem: number; time_a_id: string; time_b_id: string }[]);

  if (erroPartidas) return { error: erroPartidas.message };

  revalidatePath('/torneios');
  redirect(`/torneios/${torneio.id}`);
}

export async function adicionarGoleiro(torneioId: string, goleiro: GoleiroInput) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para alterar o torneio.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('torneio_goleiros')
    .insert({ torneio_id: torneioId, jogador_id: goleiro.id, nome: goleiro.nome });

  if (error) {
    return { error: error.code === '23505' ? 'Esse goleiro já está no torneio.' : error.message };
  }

  revalidatePath(`/torneios/${torneioId}`);
  return { error: null };
}

export async function removerGoleiro(torneioId: string, jogadorId: string) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão para alterar o torneio.' };

  const supabase = await createClient();

  // Não deixa sumir com defesas já lançadas — elas continuariam contando sem o goleiro aparecer.
  const { data: partidas } = await supabase.from('partidas').select('id').eq('torneio_id', torneioId);
  const partidaIds = (partidas ?? []).map((p) => p.id);
  if (partidaIds.length > 0) {
    const { count } = await supabase
      .from('defesas_goleiro')
      .select('id', { count: 'exact', head: true })
      .eq('jogador_id', jogadorId)
      .in('partida_id', partidaIds);
    if ((count ?? 0) > 0) {
      return { error: 'Esse goleiro já tem defesas registradas. Zere as defesas nas partidas antes.' };
    }
  }

  const { error } = await supabase
    .from('torneio_goleiros')
    .delete()
    .eq('torneio_id', torneioId)
    .eq('jogador_id', jogadorId);

  if (error) return { error: error.message };

  revalidatePath(`/torneios/${torneioId}`);
  return { error: null };
}
