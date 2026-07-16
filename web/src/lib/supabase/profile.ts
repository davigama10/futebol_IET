import { cache } from 'react';

import type { UserRole } from '@/constants/roles';

import { createClient } from './server';

export interface CurrentProfile {
  id: string;
  nome: string;
  role: UserRole;
}

// cache() dedupes chamadas dentro do mesmo request — layout.tsx e page.tsx
// podem chamar isso sem gerar duas idas ao banco.
export const getUserProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nome, role')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return { id: profile.id, nome: profile.nome, role: profile.role };
});
