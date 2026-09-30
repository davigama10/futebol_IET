import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

import { ROTULO_POSICAO } from '../domain/sorteio.types';
import type { JogadorRow } from '../types/database.types';

interface JogadorCardProps {
  jogador: JogadorRow;
  onPress?: () => void;
  selecionado?: boolean;
}

export function JogadorCard({ jogador, onPress, selecionado }: JogadorCardProps) {
  return (
    <Card style={styles.card} onPress={onPress} mode={selecionado ? 'contained' : 'outlined'}>
      <Card.Content style={styles.content}>
        <View>
          <Text variant="titleMedium">{jogador.nome}</Text>
          <Text variant="bodySmall" style={styles.subtitulo}>
            Nível {jogador.nivel} · {ROTULO_POSICAO[jogador.posicao]}
          </Text>
        </View>
        {selecionado !== undefined && (
          <Chip selected={selecionado}>{selecionado ? 'Selecionado' : 'Selecionar'}</Chip>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8, marginHorizontal: 16 },
  content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtitulo: { opacity: 0.7, marginTop: 2 },
});
