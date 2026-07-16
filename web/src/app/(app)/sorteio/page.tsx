import { redirect } from 'next/navigation';

import { SorteioClient } from '@/components/sorteio-client';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';

export default async function SorteioPage() {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) redirect('/');

  return <SorteioClient />;
}
