'use client';

import { Goal, Hand, Handshake, ListOrdered, MessageCircle, SquareStack, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { CartaoIcone } from '@/components/cartao-icone';
import { GoleirosTorneio } from '@/components/goleiros-torneio';
import { RankingLista } from '@/components/ranking-lista';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { JogadorSorteio } from '@/domain/sorteio.types';
import { compartilharNoWhatsApp, montarMensagemSorteio, montarMensagemTorneio } from '@/lib/mensagens';
import { cn } from '@/lib/utils';
import { ordenarClassificacao, type CartoesEntry, type RankingEntry } from '@/lib/torneio-stats';
import type { PartidaRow, TorneioRow, TorneioTimeRow } from '@/types/database.types';

type Aba = 'partidas' | 'classificacao' | 'artilharia' | 'assistencias' | 'cartoes' | 'goleiros';

interface TorneioTabsProps {
  torneio: TorneioRow;
  times: TorneioTimeRow[];
  partidas: PartidaRow[];
  artilharia: RankingEntry[];
  assistencias: RankingEntry[];
  cartoes: CartoesEntry[];
  defesas: RankingEntry[];
  goleirosDisponiveis: { id: string; nome: string }[];
  admin: boolean;
}

const ABAS: { id: Aba; label: string; icon: typeof ListOrdered }[] = [
  { id: 'partidas', label: 'Partidas', icon: ListOrdered },
  { id: 'classificacao', label: 'Classificação', icon: Trophy },
  { id: 'artilharia', label: 'Artilharia', icon: Goal },
  { id: 'assistencias', label: 'Assistências', icon: Handshake },
  { id: 'cartoes', label: 'Cartões', icon: SquareStack },
  { id: 'goleiros', label: 'Goleiros', icon: Hand },
];

export function TorneioTabs({
  torneio,
  times,
  partidas,
  artilharia,
  assistencias,
  cartoes,
  defesas,
  goleirosDisponiveis,
  admin,
}: TorneioTabsProps) {
  const [aba, setAba] = useState<Aba>('partidas');

  const timesPorId = useMemo(() => new Map(times.map((t) => [t.id, t])), [times]);

  const classificacao = useMemo(() => ordenarClassificacao(times), [times]);

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
              montarMensagemTorneio(torneio, classificacao, artilharia, assistencias, defesas)
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
                  <th className="py-2 pr-2 text-center">J</th>
                  <th className="py-2 pr-2 text-center">V</th>
                  <th className="py-2 pr-2 text-center">E</th>
                  <th className="py-2 pr-2 text-center">D</th>
                  <th className="py-2 pr-2 text-center">SG</th>
                  <th className="py-2 pr-2 text-center">GP</th>
                  <th className="py-2 pr-2 text-center">GC</th>
                  <th className="py-2 pr-2 text-center" title="Cartões amarelos">CA</th>
                  <th className="py-2 text-center" title="Cartões vermelhos">CV</th>
                </tr>
              </thead>
              <tbody>
                {classificacao.map((t, i) => (
                  <tr key={t.id} className={cn('border-b last:border-0', i === 0 && 'text-primary')}>
                    <td className="py-2 pr-2">{i + 1}º</td>
                    <td className="py-2 pr-2 font-medium">Time {t.indice}</td>
                    <td className="py-2 pr-2 text-center font-semibold">{t.pontos}</td>
                    <td className="py-2 pr-2 text-center">{t.vitorias + t.empates + t.derrotas}</td>
                    <td className="py-2 pr-2 text-center">{t.vitorias}</td>
                    <td className="py-2 pr-2 text-center">{t.empates}</td>
                    <td className="py-2 pr-2 text-center">{t.derrotas}</td>
                    <td className="py-2 pr-2 text-center">{t.gols_pro - t.gols_contra}</td>
                    <td className="py-2 pr-2 text-center">{t.gols_pro}</td>
                    <td className="py-2 pr-2 text-center">{t.gols_contra}</td>
                    <td className="py-2 pr-2 text-center">{t.cartoes_amarelos ?? 0}</td>
                    <td className="py-2 text-center">{t.cartoes_vermelhos ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pt-3 text-xs text-muted-foreground">
              Desempate: pontos, saldo de gols, gols pró e, por último, menos cartões (amarelo = 1,
              vermelho = 3).
            </p>
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

      {aba === 'cartoes' && (
        <Card className="border-border/60 shadow-sm">
          <CardContent>
            {cartoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cartão registrado ainda.</p>
            ) : (
              <ol className="space-y-1.5">
                {cartoes.map((c) => (
                  <li key={c.jogadorId} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">{c.nome}</span>
                    {c.amarelos > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <CartaoIcone tipo="amarelo" /> {c.amarelos}
                      </Badge>
                    )}
                    {c.vermelhos > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <CartaoIcone tipo="vermelho" /> {c.vermelhos}
                      </Badge>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}

      {aba === 'goleiros' && (
        <Card className="border-border/60 shadow-sm">
          <CardContent>
            <GoleirosTorneio
              torneioId={torneio.id}
              defesas={defesas}
              disponiveis={goleirosDisponiveis}
              admin={admin}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
