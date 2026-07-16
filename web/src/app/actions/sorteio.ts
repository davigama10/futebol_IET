'use server';

import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/constants/roles';
import type { ResultadoSorteio, TamanhoTime } from '@/domain/sorteio.types';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export async function salvarSorteio(resultado: ResultadoSorteio, tamanhoTime: TamanhoTime) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) {
    return { error: 'Sem permissão para salvar o sorteio.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('sorteios').insert({
    tamanho_time: tamanhoTime,
    resultado,
    criado_por: profile!.id,
  });

  if (error) return { error: error.message };

  revalidatePath('/historico');
  return { error: null };
}
