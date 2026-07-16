import { JogadoresClient } from '@/components/jogadores-client';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';

export default async function JogadoresPage() {
  const profile = await getUserProfile();
  return <JogadoresClient admin={isAdmin(profile?.role)} />;
}
