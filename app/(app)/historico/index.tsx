import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';

import { TimeCard } from '@/src/components/TimeCard';
import type { ResultadoSorteio } from '@/src/domain/sorteio.types';
import { supabase } from '@/src/lib/supabase';
import type { SorteioRow } from '@/src/types/database.types';

export default function HistoricoScreen() {
  const [sorteios, setSorteios] = useState<SorteioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('sorteios')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSorteios(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={sorteios}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.lista}
      ListEmptyComponent={<Text style={styles.vazio}>Nenhum sorteio salvo ainda.</Text>}
      renderItem={({ item }) => {
        const resultado = item.resultado as ResultadoSorteio;
        const aberto = expandido === item.id;
        return (
          <Card
            style={styles.card}
            onPress={() => setExpandido(aberto ? null : item.id)}>
            <Card.Title
              title={new Date(item.created_at).toLocaleDateString('pt-BR')}
              subtitle={`Times de ${item.tamanho_time} · ${resultado.times.length} time(s)`}
            />
            {aberto && (
              <Card.Content>
                {resultado.times.map((time, i) => (
                  <TimeCard key={i} time={time} titulo={`Time ${i + 1}`} />
                ))}
                {resultado.avulsos.length > 0 && (
                  <TimeCard
                    time={{
                      jogadores: resultado.avulsos,
                      somaNivel: resultado.avulsos.reduce((acc, j) => acc + j.nivel, 0),
                    }}
                    titulo="Avulsos"
                  />
                )}
              </Card.Content>
            )}
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lista: { paddingVertical: 16 },
  card: { marginBottom: 8, marginHorizontal: 16 },
  vazio: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
});
