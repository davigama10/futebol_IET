'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export interface ConfrontoInput {
  timeAIndice: number;
  timeBIndice: number;
}

export async function criarFormato(
  nome: string,
  quantidadeTimes: number,
  confrontos: ConfrontoInput[]
) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão.' };

  const supabase = await createClient();
  const { data: formato, error } = await supabase
    .from('formatos_torneio')
    .insert({ nome, quantidade_times: quantidadeTimes, criado_por: profile!.id })
    .select()
    .single();

  if (error || !formato) return { error: error?.message ?? 'Erro ao criar formato.' };

  const { error: erroPartidas } = await supabase.from('formato_partidas').insert(
    confrontos.map((c, i) => ({
      formato_id: formato.id,
      ordem: i + 1,
      time_a_indice: c.timeAIndice,
      time_b_indice: c.timeBIndice,
    }))
  );

  if (erroPartidas) return { error: erroPartidas.message };

  revalidatePath('/torneios/formatos');
  redirect('/torneios/formatos');
}

export async function atualizarFormato(
  id: string,
  nome: string,
  quantidadeTimes: number,
  confrontos: ConfrontoInput[]
) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('formatos_torneio')
    .update({ nome, quantidade_times: quantidadeTimes })
    .eq('id', id);

  if (error) return { error: error.message };

  const { error: erroDelete } = await supabase
    .from('formato_partidas')
    .delete()
    .eq('formato_id', id);
  if (erroDelete) return { error: erroDelete.message };

  const { error: erroInsert } = await supabase.from('formato_partidas').insert(
    confrontos.map((c, i) => ({
      formato_id: id,
      ordem: i + 1,
      time_a_indice: c.timeAIndice,
      time_b_indice: c.timeBIndice,
    }))
  );
  if (erroInsert) return { error: erroInsert.message };

  revalidatePath('/torneios/formatos');
  redirect('/torneios/formatos');
}

export async function excluirFormato(id: string) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) return { error: 'Sem permissão.' };

  const supabase = await createClient();
  const { error } = await supabase.from('formatos_torneio').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/torneios/formatos');
  return { error: null };
}
