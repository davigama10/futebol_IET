'use client';

import { Goal, Handshake, Shirt } from 'lucide-react';

import { NumberStepper } from '@/components/number-stepper';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { infoPosicao } from '@/domain/posicoes';
import type { TimeMontado } from '@/domain/sorteio.types';
import { cn } from '@/lib/utils';

interface Estatistica {
  gols: number;
  assistencias: number;
}

interface TimeCardProps {
  time: TimeMontado;
  titulo: string;
  estatisticas?: Record<string, Estatistica>;
  onEstatisticaChange?: (jogadorId: string, campo: 'gols' | 'assistencias', valor: number) => void;
  editavel?: boolean;
  linhaAtiva?: string | null;
  onToggleLinha?: (jogadorId: string) => void;
}

export function TimeCard({
  time,
  titulo,
  estatisticas,
  onEstatisticaChange,
  editavel = false,
  linhaAtiva,
  onToggleLinha,
}: TimeCardProps) {
  const mostrarEstatisticas = !!estatisticas;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shirt className="size-4.5" />
          </span>
          <CardTitle>{titulo}</CardTitle>
        </div>
        <Badge variant="secondary">Nível {time.somaNivel}</Badge>
      </CardHeader>
      <CardContent className="space-y-1">
        {time.jogadores.map((j) => {
          const est = estatisticas?.[j.id] ?? { gols: 0, assistencias: 0 };
          const ativo = linhaAtiva === j.id;
          const clicavel = mostrarEstatisticas && editavel;
          const temEstatistica = est.gols > 0 || est.assistencias > 0;

          return (
            <div
              key={j.id}
              className={cn(
                'group/linha -mx-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                clicavel && 'cursor-pointer hover:bg-accent/50'
              )}
              onClick={clicavel ? () => onToggleLinha?.(j.id) : undefined}
            >
              <span
                className={cn('size-1.5 shrink-0 rounded-full', infoPosicao(j.posicao).corPonto)}
              />
              <span className="flex-1 truncate">{j.nome}</span>

              {!mostrarEstatisticas && (
                <span className="text-muted-foreground">
                  {j.nivel} · {infoPosicao(j.posicao).label}
                </span>
              )}

              {mostrarEstatisticas && !editavel && temEstatistica && (
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {est.gols > 0 && (
                    <span className="flex items-center gap-1">
                      <Goal className="size-3" /> {est.gols}
                    </span>
                  )}
                  {est.assistencias > 0 && (
                    <span className="flex items-center gap-1">
                      <Handshake className="size-3" /> {est.assistencias}
                    </span>
                  )}
                </span>
              )}

              {clicavel && (
                <>
                  <span className={ativo ? 'hidden' : 'group-hover/linha:hidden'}>
                    {temEstatistica ? (
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {est.gols > 0 && (
                          <span className="flex items-center gap-1">
                            <Goal className="size-3" /> {est.gols}
                          </span>
                        )}
                        {est.assistencias > 0 && (
                          <span className="flex items-center gap-1">
                            <Handshake className="size-3" /> {est.assistencias}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">toque p/ editar</span>
                    )}
                  </span>

                  <div
                    className={
                      ativo
                        ? 'flex items-center gap-3'
                        : 'hidden items-center gap-3 group-hover/linha:flex'
                    }
                    onClick={(e) => e.stopPropagation()}
                  >
                    <NumberStepper
                      value={est.gols}
                      onChange={(n) => onEstatisticaChange?.(j.id, 'gols', n)}
                      ariaLabel={`gols de ${j.nome}`}
                      size="icon-sm"
                    />
                    <NumberStepper
                      value={est.assistencias}
                      onChange={(n) => onEstatisticaChange?.(j.id, 'assistencias', n)}
                      ariaLabel={`assistências de ${j.nome}`}
                      size="icon-sm"
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
