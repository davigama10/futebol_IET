import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';

import { useProfile } from '@/src/contexts/ProfileContext';
import { useUsuarios } from '@/src/hooks/useUsuarios';

export default function UsuariosScreen() {
  const { usuarios, loading, definirRole } = useUsuarios();
  const { profile } = useProfile();

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={usuarios}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.lista}
      renderItem={({ item }) => {
        const ehEuMesmo = item.id === profile?.id;
        const ehMasterAdmin = item.role === 'master_admin';

        return (
          <Card style={styles.card}>
            <Card.Title title={item.nome} subtitle={`Papel: ${item.role}`} />
            {!ehEuMesmo && !ehMasterAdmin && (
              <Card.Actions>
                {item.role === 'viewer' ? (
                  <Button onPress={() => definirRole(item.id, 'admin')}>Promover a admin</Button>
                ) : (
                  <Button onPress={() => definirRole(item.id, 'viewer')}>Revogar admin</Button>
                )}
              </Card.Actions>
            )}
          </Card>
        );
      }}
      ListEmptyComponent={<Text style={styles.vazio}>Nenhum usuário encontrado.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lista: { paddingVertical: 16 },
  card: { marginBottom: 8, marginHorizontal: 16 },
  vazio: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
});
