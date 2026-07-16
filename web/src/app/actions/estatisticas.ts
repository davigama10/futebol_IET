'use server';

import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export interface EstatisticaInput {
  jogadorId: string;
  gols: number;
  assistencias: number;
}

export async function salvarEstatisticas(sorteioId: string, estatisticas: EstatisticaInput[]) {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) {
    return { error: 'Sem permissão para salvar estatísticas.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('estatisticas_sorteio').upsert(
    estatisticas.map((e) => ({
      sorteio_id: sorteioId,
      jogador_id: e.jogadorId,
      gols: e.gols,
      assistencias: e.assistencias,
    })),
    { onConflict: 'sorteio_id,jogador_id' }
  );

  if (error) return { error: error.message };

  revalidatePath('/historico');
  return { error: null };
}
