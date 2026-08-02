import { redirect } from 'next/navigation';

import { FormatoForm } from '@/components/formato-form';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';

export default async function NovoFormatoPage() {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) redirect('/torneios');

  return (
    <div className="space-y-4">
      <h1 className="mx-auto max-w-2xl text-xl font-semibold">Novo formato</h1>
      <FormatoForm />
    </div>
  );
}
