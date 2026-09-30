import { router } from 'expo-router';
import { useState } from 'react';
import { HelperText } from 'react-native-paper';

import { JogadorForm } from '@/src/components/JogadorForm';
import { useJogadores } from '@/src/hooks/useJogadores';
import type { Posicao } from '@/src/domain/sorteio.types';

export default function NovoJogadorScreen() {
  const { criar } = useJogadores();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(values: { nome: string; nivel: number; posicao: Posicao }) {
    setEnviando(true);
    const { error } = await criar(values);
    setEnviando(false);

    if (error) {
      setErro(error);
      return;
    }
    router.back();
  }

  return (
    <>
      <JogadorForm onSubmit={handleSubmit} enviando={enviando} textoBotao="Cadastrar jogador" />
      {erro && <HelperText type="error" style={{ marginHorizontal: 24 }}>{erro}</HelperText>}
    </>
  );
}
