import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { UserRole } from '../constants/roles';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Profile {
  id: string;
  nome: string;
  role: UserRole;
}

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile() {
    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, role')
      .eq('id', session.user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refresh: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile deve ser usado dentro de ProfileProvider');
  return ctx;
}
