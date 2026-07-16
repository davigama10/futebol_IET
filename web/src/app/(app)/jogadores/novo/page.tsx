import { redirect } from 'next/navigation';

import { NovoJogadorClient } from '@/components/novo-jogador-client';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';

export default async function NovoJogadorPage() {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) redirect('/jogadores');

  return <NovoJogadorClient />;
}
