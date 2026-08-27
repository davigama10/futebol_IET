'use client';

import { Goal, Handshake, ListOrdered, MessageCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { RankingLista } from '@/components/ranking-lista';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { JogadorSorteio } from '@/domain/sorteio.types';
import { compartilharNoWhatsApp, montarMensagemSorteio, montarMensagemTorneio } from '@/lib/mensagens';
import { cn } from '@/lib/utils';
import type { RankingEntry } from '@/lib/torneio-stats';
import type { PartidaRow, TorneioRow, TorneioTimeRow } from '@/types/database.types';

type Aba = 'partidas' | 'classificacao' | 'artilharia' | 'assistencias';

interface TorneioTabsProps {
  torneio: TorneioRow;
  times: TorneioTimeRow[];
  partidas: PartidaRow[];
  artilharia: RankingEntry[];
  assistencias: RankingEntry[];
}

const ABAS: { id: Aba; label: string; icon: typeof ListOrdered }[] = [
  { id: 'partidas', label: 'Partidas', icon: ListOrdered },
  { id: 'classificacao', label: 'Classificação', icon: Trophy },
  { id: 'artilharia', label: 'Artilharia', icon: Goal },
  { id: 'assistencias', label: 'Assistências', icon: Handshake },
];

export function TorneioTabs({ torneio, times, partidas, artilharia, assistencias }: TorneioTabsProps) {
  const [aba, setAba] = useState<Aba>('partidas');

  const timesPorId = useMemo(() => new Map(times.map((t) => [t.id, t])), [times]);

  const classificacao = useMemo(
    () =>
      [...times].sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        const saldoA = a.gols_pro - a.gols_contra;
        const saldoB = b.gols_pro - b.gols_contra;
        if (saldoB !== saldoA) return saldoB - saldoA;
        return b.gols_pro - a.gols_pro;
      }),
    [times]
  );

  function handleCompartilharTimes() {
    const timesOrdenados = [...times].sort((a, b) => a.indice - b.indice);
    compartilharNoWhatsApp(
      montarMensagemSorteio({
        times: timesOrdenados.map((t) => ({
          jogadores: t.jogadores as JogadorSorteio[],
          somaNivel: t.soma_nivel,
        })),
        avulsos: [],
      })
    );
  }

  return (
    <div className="space-y-4">
      {torneio.status === 'finalizado' ? (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() =>
            compartilharNoWhatsApp(
              montarMensagemTorneio(torneio, classificacao, artilharia, assistencias)
            )
          }
        >
          <MessageCircle className="size-4" />
          Compartilhar resultado no WhatsApp
        </Button>
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={handleCompartilharTimes}>
          <MessageCircle className="size-4" />
          Compartilhar times no WhatsApp
        </Button>
      )}

      <div className="flex flex-wrap gap-1">
        {ABAS.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            size="sm"
            variant={aba === id ? 'default' : 'outline'}
            onClick={() => setAba(id)}
            className="gap-1.5"
          >
            <Icon className="size-4" />
            {label}
          </Button>
        ))}
      </div>

      {aba === 'partidas' && (
        <div className="space-y-2">
          {partidas.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Nenhuma partida cadastrada.</p>
          ) : (
            partidas.map((p) => {
              const timeA = timesPorId.get(p.time_a_id);
              const timeB = timesPorId.get(p.time_b_id);
              return (
                <Link key={p.id} href={`/torneios/${torneio.id}/partidas/${p.id}`}>
                  <Card className="border-border/60 shadow-sm transition hover:border-primary/50">
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">
                          Time {timeA?.indice ?? '?'} {p.gols_time_a} x {p.gols_time_b} Time{' '}
                          {timeB?.indice ?? '?'}
                        </p>
                        <p className="text-sm text-muted-foreground">Partida {p.ordem}</p>
                      </div>
                      <Badge variant={p.status === 'finalizada' ? 'secondary' : 'default'}>
                        {p.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      )}

      {aba === 'classificacao' && (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Time</th>
                  <th className="py-2 pr-2 text-center">Pts</th>
                  <th className="py-2 pr-2 text-center">V</th>
                  <th className="py-2 pr-2 text-center">E</th>
                  <th className="py-2 pr-2 text-center">D</th>
                  <th className="py-2 pr-2 text-center">SG</th>
                  <th className="py-2 pr-2 text-center">GP</th>
                  <th className="py-2 text-center">GC</th>
                </tr>
              </thead>
              <tbody>
                {classificacao.map((t, i) => (
                  <tr key={t.id} className={cn('border-b last:border-0', i === 0 && 'text-primary')}>
                    <td className="py-2 pr-2">{i + 1}º</td>
                    <td className="py-2 pr-2 font-medium">Time {t.indice}</td>
                    <td className="py-2 pr-2 text-center font-semibold">{t.pontos}</td>
                    <td className="py-2 pr-2 text-center">{t.vitorias}</td>
                    <td className="py-2 pr-2 text-center">{t.empates}</td>
                    <td className="py-2 pr-2 text-center">{t.derrotas}</td>
                    <td className="py-2 pr-2 text-center">{t.gols_pro - t.gols_contra}</td>
                    <td className="py-2 pr-2 text-center">{t.gols_pro}</td>
                    <td className="py-2 text-center">{t.gols_contra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {aba === 'artilharia' && (
        <Card className="border-border/60 shadow-sm">
          <CardContent>
            <RankingLista entradas={artilharia} sufixo="gol(s)" vazio="Nenhum gol registrado ainda." />
          </CardContent>
        </Card>
      )}

      {aba === 'assistencias' && (
        <Card className="border-border/60 shadow-sm">
          <CardContent>
            <RankingLista
              entradas={assistencias}
              sufixo="assist."
              vazio="Nenhuma assistência registrada ainda."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
