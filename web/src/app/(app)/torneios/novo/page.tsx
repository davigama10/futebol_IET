import { redirect } from 'next/navigation';

import { NovoTorneioClient } from '@/components/novo-torneio-client';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';
import { buscarTimesDoUltimoSorteio } from '@/lib/ultimo-sorteio';

export default async function NovoTorneioPage() {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) redirect('/torneios');

  const supabase = await createClient();
  const [{ data: formatos }, timesAnteriores] = await Promise.all([
    supabase.from('formatos_torneio').select('*').order('nome', { ascending: true }),
    buscarTimesDoUltimoSorteio(supabase),
  ]);

  return <NovoTorneioClient formatos={formatos ?? []} timesAnteriores={timesAnteriores} />;
}
