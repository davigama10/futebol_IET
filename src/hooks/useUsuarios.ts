import { useCallback, useEffect, useState } from 'react';

import type { UserRole } from '../constants/roles';
import { supabase } from '../lib/supabase';
import type { ProfileRow } from '../types/database.types';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .order('nome', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setError(null);
      setUsuarios(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function definirRole(id: string, role: UserRole) {
    const { error: err } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (err) return { error: err.message };
    await carregar();
    return { error: null };
  }

  return { usuarios, loading, error, recarregar: carregar, definirRole };
}
