import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, Text, TextInput } from 'react-native-paper';

import { isAdmin } from '@/src/constants/roles';
import { useProfile } from '@/src/contexts/ProfileContext';
import { JogadorCard } from '@/src/components/JogadorCard';
import { useJogadores } from '@/src/hooks/useJogadores';
import { normalizarTexto } from '@/src/lib/texto';

export default function JogadoresScreen() {
  const { jogadores, loading, error } = useJogadores();
  const { profile } = useProfile();
  const admin = isAdmin(profile?.role);
  const [busca, setBusca] = useState('');

  const jogadoresFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);
    if (!termo) return jogadores;
    return jogadores.filter((j) => normalizarTexto(j.nome).includes(termo));
  }, [jogadores, busca]);

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

      <TextInput
        mode="outlined"
        placeholder="Buscar jogador pelo nome"
        left={<TextInput.Icon icon="magnify" />}
        value={busca}
        onChangeText={setBusca}
        style={styles.busca}
      />

      <FlatList
        data={jogadoresFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            {busca ? 'Nenhum jogador encontrado.' : 'Nenhum jogador cadastrado ainda.'}
          </Text>
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
  busca: { marginHorizontal: 16, marginTop: 16, marginBottom: 4 },
  lista: { paddingVertical: 16 },
  vazio: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  erro: { color: 'red', textAlign: 'center', padding: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
