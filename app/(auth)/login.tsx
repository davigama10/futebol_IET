import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { useAuth } from '@/src/contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    setErro(null);
    setCarregando(true);
    const { error } = await signIn(email.trim(), senha);
    setCarregando(false);
    if (error) {
      setErro(error);
      return;
    }
    router.replace('/(app)');
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.titulo}>
        Pelada da Igreja
      </Text>

      <TextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      {erro && <HelperText type="error">{erro}</HelperText>}

      <Button mode="contained" onPress={handleLogin} loading={carregando} disabled={carregando}>
        Entrar
      </Button>

      <Link href="/(auth)/cadastro" style={styles.link}>
        Não tem conta? Cadastre-se
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: { marginBottom: 32, textAlign: 'center' },
  input: { marginBottom: 12 },
  link: { marginTop: 16, textAlign: 'center' },
});
