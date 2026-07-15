import { Redirect } from 'expo-router';

import { useAuth } from '@/src/contexts/AuthContext';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return null;
  return <Redirect href={session ? '/(app)' : '/(auth)/login'} />;
}
