import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, Tabs } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isAdmin, isMasterAdmin } from '@/src/constants/roles';
import { useAuth } from '@/src/contexts/AuthContext';
import { useProfile } from '@/src/contexts/ProfileContext';
import { SorteioProvider } from '@/src/contexts/SorteioContext';

export default function AppLayout() {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const colorScheme = useColorScheme();

  if (authLoading || profileLoading) return null;
  if (!session) return <Redirect href="/(auth)/login" />;

  const admin = isAdmin(profile?.role);
  const masterAdmin = isMasterAdmin(profile?.role);

  return (
    <SorteioProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="jogadores/index"
          options={{
            title: 'Jogadores',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="groups" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="jogadores/novo"
          options={{ href: null, headerShown: true, title: 'Novo jogador' }}
        />
        <Tabs.Screen
          name="jogadores/[id]"
          options={{ href: null, headerShown: true, title: 'Editar jogador' }}
        />
        <Tabs.Screen
          name="sorteio/index"
          options={{
            href: admin ? undefined : null,
            title: 'Sorteio',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="sports-soccer" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="sorteio/resultado"
          options={{ href: null, headerShown: true, title: 'Times sorteados' }}
        />
        <Tabs.Screen
          name="historico/index"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="history" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="usuarios/index"
          options={{
            href: masterAdmin ? undefined : null,
            title: 'Usuários',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="admin-panel-settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SorteioProvider>
  );
}
