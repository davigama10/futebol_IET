import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { useAuth } from '@/src/contexts/AuthContext';

export default function CadastroScreen() {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleCadastro() {
    setErro(null);

    if (!nome.trim()) {
      setErro('Informe seu nome.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setCarregando(true);
    const { error } = await signUp(email.trim(), senha, nome.trim());
    setCarregando(false);

    if (error) {
      setErro(error);
      return;
    }
    setSucesso(true);
  }

  if (sucesso) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.titulo}>
          Conta criada! Confirme seu e-mail (se necessário) e faça login.
        </Text>
        <Button mode="contained" onPress={() => router.replace('/(auth)/login')}>
          Ir para login
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.titulo}>
        Criar conta
      </Text>

      <TextInput label="Nome" value={nome} onChangeText={setNome} style={styles.input} />
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

      <Button mode="contained" onPress={handleCadastro} loading={carregando} disabled={carregando}>
        Cadastrar
      </Button>

      <Button mode="text" onPress={() => router.push('/(auth)/login')} style={styles.link}>
        Já tem conta? Entrar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: { marginBottom: 32, textAlign: 'center' },
  input: { marginBottom: 12 },
  link: { marginTop: 16, textAlign: 'center' },
});
