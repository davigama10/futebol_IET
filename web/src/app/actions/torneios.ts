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
