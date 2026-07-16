'use server';

import { revalidatePath } from 'next/cache';

import { isMasterAdmin, type UserRole } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export async function definirRole(id: string, role: UserRole) {
  const profile = await getUserProfile();
  if (!isMasterAdmin(profile?.role)) {
    return { error: 'Sem permissão para alterar papéis.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/usuarios');
  return { error: null };
}

// Wrapper de retorno `void`, exigido pela tipagem de `<form action={...}>`.
export async function definirRoleForm(id: string, role: UserRole) {
  await definirRole(id, role);
}
