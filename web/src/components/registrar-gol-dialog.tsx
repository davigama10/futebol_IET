'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { registrarGol } from '@/app/actions/partidas';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { JogadorSorteio } from '@/domain/sorteio.types';

interface TimeInfo {
  id: string;
  indice: number;
  jogadores: JogadorSorteio[];
}

interface RegistrarGolDialogProps {
  partidaId: string;
  timeMarcador: TimeInfo;
  timeAdversario: TimeInfo;
}

type Etapa = 'autor' | 'pergunta-assistencia' | 'assistencia';

export function RegistrarGolDialog({ partidaId, timeMarcador, timeAdversario }: RegistrarGolDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [golContra, setGolContra] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>('autor');
  const [autorId, setAutorId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function resetar() {
    setGolContra(false);
    setEtapa('autor');
    setAutorId(null);
  }

  function handleOpenChange(novoOpen: boolean) {
    setOpen(novoOpen);
    if (!novoOpen) resetar();
  }

  async function enviar(jogadorId: string, assistenciaJogadorId: string | null, contra: boolean) {
    setEnviando(true);
    const result = await registrarGol({
      partidaId,
      timeId: timeMarcador.id,
      jogadorId,
      assistenciaJogadorId,
      golContra: contra,
    });
    setEnviando(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Gol registrado!');
    handleOpenChange(false);
    router.refresh();
  }

  function handleEscolherAutor(jogadorId: string) {
    if (golContra) {
      enviar(jogadorId, null, true);
      return;
    }
    setAutorId(jogadorId);
    setEtapa('pergunta-assistencia');
  }

  function handleAssistencia(teveAssistencia: boolean) {
    if (!teveAssistencia && autorId) {
      enviar(autorId, null, false);
      return;
    }
    setEtapa('assistencia');
  }

  const jogadoresListados = golContra ? timeAdversario.jogadores : timeMarcador.jogadores;
  const jogadoresParaAssistencia = timeMarcador.jogadores.filter((j) => j.id !== autorId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="flex-1">Gol do Time {timeMarcador.indice}</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gol do Time {timeMarcador.indice}</DialogTitle>
          <DialogDescription>
            {etapa === 'autor' && (golContra ? 'Quem fez o gol contra?' : 'Quem marcou o gol?')}
            {etapa === 'pergunta-assistencia' && 'Houve assistência?'}
            {etapa === 'assistencia' && 'Quem deu a assistência?'}
          </DialogDescription>
        </DialogHeader>

        {etapa === 'autor' && (
          <div className="space-y-3">
            <Button
              type="button"
              size="sm"
              variant={golContra ? 'default' : 'outline'}
              onClick={() => setGolContra((v) => !v)}
              className="w-full"
            >
              {golContra ? `✓ Gol contra (jogador do Time ${timeAdversario.indice})` : 'Foi gol contra?'}
            </Button>

            <div className="max-h-80 space-y-1 overflow-y-auto">
              {jogadoresListados.map((j) => (
                <Button
                  key={j.id}
                  type="button"
                  variant="outline"
                  disabled={enviando}
                  onClick={() => handleEscolherAutor(j.id)}
                  className="w-full justify-start"
                >
                  {j.nome}
                </Button>
              ))}
            </div>
          </div>
        )}

        {etapa === 'pergunta-assistencia' && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleAssistencia(false)}>
              Não
            </Button>
            <Button className="flex-1" onClick={() => handleAssistencia(true)}>
              Sim
            </Button>
          </div>
        )}

        {etapa === 'assistencia' && (
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {jogadoresParaAssistencia.map((j) => (
              <Button
                key={j.id}
                type="button"
                variant="outline"
                disabled={enviando}
                onClick={() => enviar(autorId!, j.id, false)}
                className="w-full justify-start"
              >
                {j.nome}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
