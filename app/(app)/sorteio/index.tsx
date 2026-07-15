import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text } from 'react-native-paper';

import { JogadorCard } from '@/src/components/JogadorCard';
import { SeletorTamanhoTime } from '@/src/components/SeletorTamanhoTime';
import type { TamanhoTime } from '@/src/domain/sorteio.types';
import { useSorteioContext } from '@/src/contexts/SorteioContext';
import { useJogadores } from '@/src/hooks/useJogadores';

export default function SorteioScreen() {
  const { jogadores, loading } = useJogadores();
  const { sortear } = useSorteioContext();
  const [tamanhoTime, setTamanhoTime] = useState<TamanhoTime>(5);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  function alternarSelecao(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function handleSortear() {
    const jogadoresSelecionados = jogadores
      .filter((j) => selecionados.has(j.id))
      .map((j) => ({ id: j.id, nome: j.nome, nivel: j.nivel, posicao: j.posicao }));

    sortear(jogadoresSelecionados, tamanhoTime);
    router.push('/(app)/sorteio/resultado');
  }

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.titulo}>
        Quem vai jogar esta semana?
      </Text>

      <SeletorTamanhoTime value={tamanhoTime} onChange={setTamanhoTime} />

      <FlatList
        data={jogadores}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum jogador cadastrado ainda.</Text>}
        renderItem={({ item }) => (
          <JogadorCard
            jogador={item}
            selecionado={selecionados.has(item.id)}
            onPress={() => alternarSelecao(item.id)}
          />
        )}
      />

      <View style={styles.rodape}>
        <HelperText type="info">{selecionados.size} jogador(es) selecionado(s)</HelperText>
        <Button mode="contained" disabled={selecionados.size === 0} onPress={handleSortear}>
          Sortear times
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  vazio: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  rodape: { padding: 16 },
});
