'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { registrarCartao } from '@/app/actions/partidas';
import { CartaoIcone } from '@/components/cartao-icone';
import {
  montarGruposOutros,
  SeletorJogador,
  type JogadorRef,
  type TimeDoTorneio,
} from '@/components/seletor-jogador';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { TipoCartao } from '@/types/database.types';

interface RegistrarCartaoDialogProps {
  partidaId: string;
  timeA: TimeDoTorneio;
  timeB: TimeDoTorneio;
  timesTorneio: TimeDoTorneio[];
  goleiros: JogadorRef[];
}

export function RegistrarCartaoDialog({
  partidaId,
  timeA,
  timeB,
  timesTorneio,
  goleiros,
}: RegistrarCartaoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoCartao>('amarelo');
  const [timeId, setTimeId] = useState(timeA.id);
  const [enviando, setEnviando] = useState(false);

  const time = timeId === timeB.id ? timeB : timeA;

  function handleOpenChange(novoOpen: boolean) {
    setOpen(novoOpen);
    if (!novoOpen) {
      setTipo('amarelo');
      setTimeId(timeA.id);
    }
  }

  async function handleEscolher(jogadorId: string) {
    setEnviando(true);
    const result = await registrarCartao({ partidaId, timeId: time.id, jogadorId, tipo });
    setEnviando(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(tipo === 'amarelo' ? 'Cartão amarelo registrado.' : 'Cartão vermelho registrado.');
    handleOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" className="w-full gap-2">
            <CartaoIcone tipo="amarelo" />
            <CartaoIcone tipo="vermelho" />
            Registrar cartão
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar cartão</DialogTitle>
          <DialogDescription>Escolha o cartão, o time e quem recebeu.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <ToggleGroup
            value={[tipo]}
            onValueChange={(vals) => vals[0] && setTipo(vals[0] as TipoCartao)}
            variant="outline"
            className="w-full"
          >
            <ToggleGroupItem value="amarelo" className="flex-1 gap-2">
              <CartaoIcone tipo="amarelo" /> Amarelo
            </ToggleGroupItem>
            <ToggleGroupItem value="vermelho" className="flex-1 gap-2">
              <CartaoIcone tipo="vermelho" /> Vermelho
            </ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            value={[timeId]}
            onValueChange={(vals) => vals[0] && setTimeId(vals[0])}
            variant="outline"
            className="w-full"
          >
            {[timeA, timeB].map((t) => (
              <ToggleGroupItem key={t.id} value={t.id} className="flex-1">
                Time {t.indice}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <SeletorJogador
            key={time.id}
            principais={time.jogadores}
            outros={montarGruposOutros(timesTorneio, goleiros, time.id)}
            onEscolher={handleEscolher}
            disabled={enviando}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
