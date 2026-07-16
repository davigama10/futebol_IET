import { redirect } from 'next/navigation';

import { NavBar } from '@/components/nav-bar';
import { getUserProfile } from '@/lib/supabase/profile';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile();

  if (!profile) redirect('/login');

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar nome={profile.nome} role={profile.role} />
      <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
    </div>
  );
}
