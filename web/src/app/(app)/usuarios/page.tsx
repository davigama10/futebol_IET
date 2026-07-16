import { redirect } from 'next/navigation';

import { UsuarioRow } from '@/components/usuario-row';
import { isMasterAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export default async function UsuariosPage() {
  const profile = await getUserProfile();
  if (!isMasterAdmin(profile?.role)) redirect('/');

  const supabase = await createClient();
  const { data: usuarios } = await supabase
    .from('profiles')
    .select('*')
    .order('nome', { ascending: true });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Usuários</h1>
      <div className="space-y-2">
        {(usuarios ?? []).map((u) => (
          <UsuarioRow key={u.id} usuario={u} souEu={u.id === profile!.id} />
        ))}
      </div>
    </div>
  );
}
