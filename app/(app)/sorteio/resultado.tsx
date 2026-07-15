import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';

import { TimeCard } from '@/src/components/TimeCard';
import { useSorteioContext } from '@/src/contexts/SorteioContext';

export default function ResultadoSorteioScreen() {
  const { resultado, salvarNoHistorico, salvando, salvo } = useSorteioContext();
  const [erro, setErro] = useState<string | null>(null);

  if (!resultado) {
    return (
      <View style={styles.centro}>
        <Text>Nenhum sorteio realizado ainda.</Text>
      </View>
    );
  }

  async function handleSalvar() {
    setErro(null);
    const { error } = await salvarNoHistorico();
    if (error) setErro(error);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {resultado.times.map((time, i) => (
        <TimeCard key={i} time={time} titulo={`Time ${i + 1}`} />
      ))}

      {resultado.avulsos.length > 0 && (
        <TimeCard
          time={{
            jogadores: resultado.avulsos,
            somaNivel: resultado.avulsos.reduce((acc, j) => acc + j.nivel, 0),
          }}
          titulo="Avulsos (decidir em campo)"
        />
      )}

      {erro && <HelperText type="error" style={styles.erro}>{erro}</HelperText>}

      <Button
        mode="contained"
        onPress={handleSalvar}
        loading={salvando}
        disabled={salvando || salvo}
        style={styles.botao}>
        {salvo ? 'Salvo no histórico' : 'Salvar no histórico'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  erro: { marginHorizontal: 16 },
  botao: { marginHorizontal: 16, marginTop: 8 },
});
