import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, Text } from 'react-native-paper';

import { isAdmin } from '@/src/constants/roles';
import { useProfile } from '@/src/contexts/ProfileContext';
import { JogadorCard } from '@/src/components/JogadorCard';
import { useJogadores } from '@/src/hooks/useJogadores';

export default function JogadoresScreen() {
  const { jogadores, loading, error } = useJogadores();
  const { profile } = useProfile();
  const admin = isAdmin(profile?.role);

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.erro}>{error}</Text>}
      <FlatList
        data={jogadores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum jogador cadastrado ainda.</Text>
        }
        renderItem={({ item }) => (
          <JogadorCard
            jogador={item}
            onPress={admin ? () => router.push(`/(app)/jogadores/${item.id}`) : undefined}
          />
        )}
      />
      {admin && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/(app)/jogadores/novo')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lista: { paddingVertical: 16 },
  vazio: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  erro: { color: 'red', textAlign: 'center', padding: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
