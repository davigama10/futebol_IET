'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { JogadorForm } from '@/components/jogador-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { Posicao } from '@/domain/sorteio.types';
import { useJogadores } from '@/hooks/useJogadores';
import type { JogadorRow } from '@/types/database.types';

export function EditarJogadorClient({ jogador }: { jogador: JogadorRow }) {
  const router = useRouter();
  const { atualizar, excluir } = useJogadores();
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(values: { nome: string; nivel: number; posicao: Posicao }) {
    setEnviando(true);
    const { error } = await atualizar(jogador.id, values);
    setEnviando(false);

    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Jogador atualizado.');
    router.push('/jogadores');
  }

  async function handleExcluir() {
    setEnviando(true);
    const { error } = await excluir(jogador.id);
    setEnviando(false);

    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Jogador excluído.');
    router.push('/jogadores');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Editar jogador</h1>
      <JogadorForm
        valoresIniciais={{ nome: jogador.nome, nivel: jogador.nivel, posicao: jogador.posicao }}
        onSubmit={handleSubmit}
        enviando={enviando}
        textoBotao="Salvar alterações"
      />

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="destructive" disabled={enviando} className="w-full max-w-md">
              Excluir jogador
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir jogador</AlertDialogTitle>
            <AlertDialogDescription>
              Remover {jogador.nome} do cadastro? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
