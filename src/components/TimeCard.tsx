import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { ROTULO_POSICAO, type TimeMontado } from '../domain/sorteio.types';

interface TimeCardProps {
  time: TimeMontado;
  titulo: string;
}

export function TimeCard({ time, titulo }: TimeCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Title title={titulo} subtitle={`Soma de nível: ${time.somaNivel}`} />
      <Card.Content>
        {time.jogadores.map((j) => (
          <Text key={j.id} variant="bodyMedium" style={styles.linha}>
            {j.nome} — nível {j.nivel} · {ROTULO_POSICAO[j.posicao]}
          </Text>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, marginHorizontal: 16 },
  linha: { marginBottom: 4 },
});
