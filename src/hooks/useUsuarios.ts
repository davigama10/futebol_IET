import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { UserRole } from '../constants/roles';
import { supabase } from '../lib/supabase';
import type { ProfileRow } from '../types/database.types';

const USUARIOS_KEY = ['usuarios'];

async function fetchUsuarios(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('nome', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useUsuarios() {
  const queryClient = useQueryClient();
  const {
    data: usuarios = [],
    isLoading: loading,
    error,
    refetch: recarregar,
  } = useQuery({ queryKey: USUARIOS_KEY, queryFn: fetchUsuarios });

  async function definirRole(id: string, role: UserRole) {
    const { error: err } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (err) return { error: err.message };
    await queryClient.invalidateQueries({ queryKey: USUARIOS_KEY });
    return { error: null };
  }

  return {
    usuarios,
    loading,
    error: error ? (error as Error).message : null,
    recarregar,
    definirRole,
  };
}
