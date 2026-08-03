'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { reabrirPartida } from '@/app/actions/partidas';
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

export function ReabrirPartidaButton({ partidaId }: { partidaId: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  async function handleReabrir() {
    setEnviando(true);
    const result = await reabrirPartida(partidaId);
    setEnviando(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Partida reaberta.');
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" disabled={enviando} className="w-full">
            Reabrir partida
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reabrir partida</AlertDialogTitle>
          <AlertDialogDescription>
            Isso desfaz o efeito dessa partida na classificação (vitória/empate/derrota, saldo e
            pontos) e volta o status pra &quot;em andamento&quot;, pra você poder corrigir os gols.
            Se o torneio já estava finalizado, ele também volta a ficar em andamento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleReabrir}>Reabrir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
