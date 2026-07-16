import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper';

import { JogadorCard } from '@/src/components/JogadorCard';
import { SeletorTamanhoTime } from '@/src/components/SeletorTamanhoTime';
import type { TamanhoTime } from '@/src/domain/sorteio.types';
import { useSorteioContext } from '@/src/contexts/SorteioContext';
import { useJogadores } from '@/src/hooks/useJogadores';
import { normalizarTexto } from '@/src/lib/texto';

export default function SorteioScreen() {
  const { jogadores, loading } = useJogadores();
  const { sortear } = useSorteioContext();
  const [tamanhoTime, setTamanhoTime] = useState<TamanhoTime>(5);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState('');

  const jogadoresFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);
    if (!termo) return jogadores;
    return jogadores.filter((j) => normalizarTexto(j.nome).includes(termo));
  }, [jogadores, busca]);

  const todosFiltradosSelecionados =
    jogadoresFiltrados.length > 0 && jogadoresFiltrados.every((j) => selecionados.has(j.id));

  function alternarSelecao(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarSelecaoTodos() {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (todosFiltradosSelecionados) {
        jogadoresFiltrados.forEach((j) => novo.delete(j.id));
      } else {
        jogadoresFiltrados.forEach((j) => novo.add(j.id));
      }
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
        ⚽ Quem vai jogar esta semana?
      </Text>

      <SeletorTamanhoTime value={tamanhoTime} onChange={setTamanhoTime} />

      <TextInput
        mode="outlined"
        placeholder="Buscar jogador pelo nome"
        left={<TextInput.Icon icon="magnify" />}
        value={busca}
        onChangeText={setBusca}
        style={styles.busca}
      />

      <Button
        mode="text"
        onPress={alternarSelecaoTodos}
        disabled={jogadoresFiltrados.length === 0}
        style={styles.marcarTodos}>
        {todosFiltradosSelecionados ? 'Desmarcar todos' : 'Marcar todos'}
      </Button>

      <FlatList
        data={jogadoresFiltrados}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            {busca ? 'Nenhum jogador encontrado.' : 'Nenhum jogador cadastrado ainda.'}
          </Text>
        }
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
  busca: { marginHorizontal: 16, marginBottom: 4 },
  marcarTodos: { alignSelf: 'flex-end', marginRight: 8 },
  vazio: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
  rodape: { padding: 16 },
});
