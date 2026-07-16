'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { JogadorForm } from '@/components/jogador-form';
import type { Posicao } from '@/domain/sorteio.types';
import { useJogadores } from '@/hooks/useJogadores';

export function NovoJogadorClient() {
  const router = useRouter();
  const { criar } = useJogadores();
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(values: { nome: string; nivel: number; posicao: Posicao }) {
    setEnviando(true);
    const { error } = await criar(values);
    setEnviando(false);

    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Jogador cadastrado.');
    router.push('/jogadores');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Novo jogador</h1>
      <JogadorForm onSubmit={handleSubmit} enviando={enviando} textoBotao="Cadastrar jogador" />
    </div>
  );
}
