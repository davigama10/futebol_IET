import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text } from 'react-native-paper';

import { JogadorForm } from '@/src/components/JogadorForm';
import { useJogadores } from '@/src/hooks/useJogadores';

export default function EditarJogadorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { jogadores, loading, atualizar, excluir } = useJogadores();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const jogador = jogadores.find((j) => j.id === id);

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!jogador) {
    return (
      <View style={styles.centro}>
        <Text>Jogador não encontrado.</Text>
      </View>
    );
  }

  async function handleSubmit(values: { nome: string; nivel: number; posicao: 'atacante' | 'defensor' }) {
    setEnviando(true);
    const { error } = await atualizar(jogador!.id, values);
    setEnviando(false);

    if (error) {
      setErro(error);
      return;
    }
    router.back();
  }

  function handleExcluir() {
    Alert.alert('Excluir jogador', `Remover ${jogador!.nome} do cadastro?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setEnviando(true);
          const { error } = await excluir(jogador!.id);
          setEnviando(false);

          if (error) {
            setErro(error);
            return;
          }
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <JogadorForm
        valoresIniciais={{ nome: jogador.nome, nivel: jogador.nivel, posicao: jogador.posicao }}
        onSubmit={handleSubmit}
        enviando={enviando}
        textoBotao="Salvar alterações"
      />
      {erro && <HelperText type="error" style={styles.erro}>{erro}</HelperText>}
      <Button
        mode="outlined"
        textColor="#B3261E"
        onPress={handleExcluir}
        disabled={enviando}
        style={styles.excluir}>
        Excluir jogador
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  erro: { marginHorizontal: 24 },
  excluir: { marginHorizontal: 24, marginTop: 8 },
});
