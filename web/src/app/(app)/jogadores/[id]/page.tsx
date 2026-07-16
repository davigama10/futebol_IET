import { notFound, redirect } from 'next/navigation';

import { EditarJogadorClient } from '@/components/editar-jogador-client';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export default async function EditarJogadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) redirect('/jogadores');

  const supabase = await createClient();
  const { data: jogador } = await supabase.from('jogadores').select('*').eq('id', id).single();

  if (!jogador) notFound();

  return <EditarJogadorClient jogador={jogador} />;
}
