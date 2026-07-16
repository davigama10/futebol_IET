'use client';

import { MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { salvarEstatisticas } from '@/app/actions/estatisticas';
import { TimeCard } from '@/components/time-card';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResultadoSorteio } from '@/domain/sorteio.types';
import { compartilharNoWhatsApp, montarMensagemEstatisticas, montarMensagemSorteio } from '@/lib/mensagens';
import type { SorteioRow } from '@/types/database.types';

interface Estatistica {
  gols: number;
  assistencias: number;
}

interface HistoricoItemProps {
  sorteio: SorteioRow;
  estatisticasIniciais: Record<string, Estatistica>;
  admin: boolean;
}

export function HistoricoItem({ sorteio, estatisticasIniciais, admin }: HistoricoItemProps) {
  const [aberto, setAberto] = useState(false);
  const [linhaAtiva, setLinhaAtiva] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const resultado = sorteio.resultado as ResultadoSorteio;

  const todosJogadores = useMemo(
    () => [...resultado.times.flatMap((t) => t.jogadores), ...resultado.avulsos],
    [resultado]
  );

  const [valores, setValores] = useState<Record<string, Estatistica>>(() => {
    const base: Record<string, Estatistica> = {};
    todosJogadores.forEach((j) => {
      base[j.id] = estatisticasIniciais[j.id] ?? { gols: 0, assistencias: 0 };
    });
    return base;
  });

  const dataLabel = new Date(sorteio.created_at).toLocaleDateString('pt-BR');
  const temEstatistica = Object.values(valores).some((v) => v.gols > 0 || v.assistencias > 0);

  function atualizarEstatistica(jogadorId: string, campo: 'gols' | 'assistencias', valor: number) {
    setValores((atual) => ({
      ...atual,
      [jogadorId]: { ...atual[jogadorId], [campo]: valor },
    }));
  }

  async function handleSalvarEstatisticas() {
    setSalvando(true);
    const estatisticas = todosJogadores.map((j) => ({
      jogadorId: j.id,
      gols: valores[j.id]?.gols ?? 0,
      assistencias: valores[j.id]?.assistencias ?? 0,
    }));
    const { error } = await salvarEstatisticas(sorteio.id, estatisticas);
    setSalvando(false);

    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Estatísticas salvas.');
  }

  function renderTimeCard(time: (typeof resultado.times)[number], titulo: string) {
    return (
      <TimeCard
        key={titulo}
        time={time}
        titulo={titulo}
        estatisticas={valores}
        onEstatisticaChange={atualizarEstatistica}
        editavel={admin}
        linhaAtiva={linhaAtiva}
        onToggleLinha={(id) => setLinhaAtiva((atual) => (atual === id ? null : id))}
      />
    );
  }

  return (
    <Card className="cursor-pointer" onClick={() => setAberto((v) => !v)}>
      <CardHeader>
        <CardTitle>{dataLabel}</CardTitle>
        <CardDescription>
          Times de {sorteio.tamanho_time} · {resultado.times.length} time(s)
        </CardDescription>
      </CardHeader>
      {aberto && (
        <div className="space-y-3 px-6 pb-6" onClick={(e) => e.stopPropagation()}>
          {resultado.times.map((time, i) => renderTimeCard(time, `Time ${i + 1}`))}
          {resultado.avulsos.length > 0 &&
            renderTimeCard(
              {
                jogadores: resultado.avulsos,
                somaNivel: resultado.avulsos.reduce((acc, j) => acc + j.nivel, 0),
              },
              'Avulsos'
            )}

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => compartilharNoWhatsApp(montarMensagemSorteio(resultado))}
              className="gap-2"
            >
              <MessageCircle className="size-4" />
              Compartilhar times
            </Button>

            {admin && (
              <Button size="sm" onClick={handleSalvarEstatisticas} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar estatísticas'}
              </Button>
            )}

            {(admin || temEstatistica) && (
              <Button
                size="sm"
                variant="outline"
                disabled={!temEstatistica}
                onClick={() =>
                  compartilharNoWhatsApp(
                    montarMensagemEstatisticas(dataLabel, todosJogadores, valores)
                  )
                }
                className="gap-2"
              >
                <MessageCircle className="size-4" />
                Compartilhar estatísticas
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
