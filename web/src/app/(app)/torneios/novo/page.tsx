import { redirect } from 'next/navigation';

import { NovoTorneioClient } from '@/components/novo-torneio-client';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export default async function NovoTorneioPage() {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) redirect('/torneios');

  const supabase = await createClient();
  const { data: formatos } = await supabase
    .from('formatos_torneio')
    .select('*')
    .order('nome', { ascending: true });

  return <NovoTorneioClient formatos={formatos ?? []} />;
}
