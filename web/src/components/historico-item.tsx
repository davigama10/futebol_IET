'use client';

import { MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EstatisticasForm } from '@/components/estatisticas-form';
import { TimeCard } from '@/components/time-card';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResultadoSorteio } from '@/domain/sorteio.types';
import { compartilharNoWhatsApp, montarMensagemSorteio } from '@/lib/mensagens';
import type { SorteioRow } from '@/types/database.types';

interface HistoricoItemProps {
  sorteio: SorteioRow;
  estatisticasIniciais: Record<string, { gols: number; assistencias: number }>;
  admin: boolean;
}

export function HistoricoItem({ sorteio, estatisticasIniciais, admin }: HistoricoItemProps) {
  const [aberto, setAberto] = useState(false);
  const resultado = sorteio.resultado as ResultadoSorteio;

  const todosJogadores = useMemo(
    () => [...resultado.times.flatMap((t) => t.jogadores), ...resultado.avulsos],
    [resultado]
  );

  const dataLabel = new Date(sorteio.created_at).toLocaleDateString('pt-BR');

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
          {resultado.times.map((time, i) => (
            <TimeCard key={i} time={time} titulo={`Time ${i + 1}`} />
          ))}
          {resultado.avulsos.length > 0 && (
            <TimeCard
              time={{
                jogadores: resultado.avulsos,
                somaNivel: resultado.avulsos.reduce((acc, j) => acc + j.nivel, 0),
              }}
              titulo="Avulsos"
            />
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => compartilharNoWhatsApp(montarMensagemSorteio(resultado))}
            className="w-full gap-2"
          >
            <MessageCircle className="size-4" />
            Compartilhar times no WhatsApp
          </Button>

          <EstatisticasForm
            sorteioId={sorteio.id}
            dataLabel={dataLabel}
            jogadores={todosJogadores}
            iniciais={estatisticasIniciais}
            admin={admin}
          />
        </div>
      )}
    </Card>
  );
}
