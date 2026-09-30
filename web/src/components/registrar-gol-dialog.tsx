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
import {
  montarGruposOutros,
  SeletorJogador,
  type JogadorRef,
  type TimeDoTorneio,
} from '@/components/seletor-jogador';

interface RegistrarGolDialogProps {
  partidaId: string;
  timeMarcador: TimeDoTorneio;
  timeAdversario: TimeDoTorneio;
  /** Todos os times do torneio e os goleiros — alimentam a lista "Outros". */
  timesTorneio: TimeDoTorneio[];
  goleiros: JogadorRef[];
}

type Etapa = 'autor' | 'pergunta-assistencia' | 'assistencia';

export function RegistrarGolDialog({
  partidaId,
  timeMarcador,
  timeAdversario,
  timesTorneio,
  goleiros,
}: RegistrarGolDialogProps) {
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

  // O gol é sempre creditado a `timeMarcador`; a lista só muda quem pode ser o autor. Em gol
  // contra, o autor é do time adversário. "Outros" cobre quem está completando um dos times.
  const timeDoAutor = golContra ? timeAdversario : timeMarcador;
  const outrosAutor = montarGruposOutros(timesTorneio, goleiros, timeDoAutor.id);
  const outrosAssistencia = montarGruposOutros(timesTorneio, goleiros, timeMarcador.id);

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

            <SeletorJogador
              key={golContra ? 'contra' : 'normal'}
              principais={timeDoAutor.jogadores}
              outros={outrosAutor}
              onEscolher={handleEscolherAutor}
              disabled={enviando}
            />
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
          <SeletorJogador
            principais={timeMarcador.jogadores}
            outros={outrosAssistencia}
            excluir={autorId ? [autorId] : []}
            onEscolher={(id) => enviar(autorId!, id, false)}
            disabled={enviando}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
