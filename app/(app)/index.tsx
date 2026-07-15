import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { isAdmin, isMasterAdmin } from '@/src/constants/roles';
import { useAuth } from '@/src/contexts/AuthContext';
import { useProfile } from '@/src/contexts/ProfileContext';

export default function HomeScreen() {
  const { profile } = useProfile();
  const { signOut } = useAuth();
  const admin = isAdmin(profile?.role);
  const masterAdmin = isMasterAdmin(profile?.role);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.saudacao}>
        Olá, {profile?.nome ?? ''}
      </Text>
      <Text variant="bodyMedium" style={styles.role}>
        Papel: {profile?.role ?? '—'}
      </Text>

      <View style={styles.acoes}>
        <Card style={styles.card} onPress={() => router.push('/(app)/jogadores')}>
          <Card.Title title="Jogadores" subtitle="Ver jogadores cadastrados" />
        </Card>

        {admin && (
          <Card style={styles.card} onPress={() => router.push('/(app)/sorteio')}>
            <Card.Title title="Sorteio da semana" subtitle="Selecionar e sortear times" />
          </Card>
        )}

        <Card style={styles.card} onPress={() => router.push('/(app)/historico')}>
          <Card.Title title="Histórico" subtitle="Sorteios anteriores" />
        </Card>

        {masterAdmin && (
          <Card style={styles.card} onPress={() => router.push('/(app)/usuarios')}>
            <Card.Title title="Usuários" subtitle="Gerenciar permissões" />
          </Card>
        )}
      </View>

      <Button mode="outlined" onPress={signOut} style={styles.sair}>
        Sair
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  saudacao: { marginBottom: 4 },
  role: { marginBottom: 24, opacity: 0.7 },
  acoes: { gap: 12 },
  card: { marginBottom: 4 },
  sair: { marginTop: 32 },
});
