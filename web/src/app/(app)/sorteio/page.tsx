import { redirect } from 'next/navigation';

import { SorteioClient } from '@/components/sorteio-client';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';
import { buscarTimesDoUltimoSorteio } from '@/lib/ultimo-sorteio';

export default async function SorteioPage() {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) redirect('/');

  const supabase = await createClient();
  const timesAnteriores = await buscarTimesDoUltimoSorteio(supabase);

  return <SorteioClient timesAnteriores={timesAnteriores} />;
}
