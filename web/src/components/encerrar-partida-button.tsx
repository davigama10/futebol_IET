'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { encerrarPartida } from '@/app/actions/partidas';
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

export function EncerrarPartidaButton({ partidaId }: { partidaId: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  async function handleEncerrar() {
    setEnviando(true);
    const result = await encerrarPartida(partidaId);
    setEnviando(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Partida encerrada.');
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" disabled={enviando} className="w-full">
            Encerrar partida
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Encerrar partida</AlertDialogTitle>
          <AlertDialogDescription>
            O placar atual será considerado final e a classificação do torneio será atualizada. Não é
            possível registrar mais gols, cartões ou defesas depois disso (a menos que a partida seja
            reaberta).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleEncerrar}>Encerrar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
