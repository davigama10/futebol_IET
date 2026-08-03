import { Goal, Handshake } from 'lucide-react';
import { notFound } from 'next/navigation';

import { EncerrarPartidaButton } from '@/components/encerrar-partida-button';
import { ReabrirPartidaButton } from '@/components/reabrir-partida-button';
import { RegistrarGolDialog } from '@/components/registrar-gol-dialog';
import { RemoverGolButton } from '@/components/remover-gol-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { isAdmin } from '@/constants/roles';
import type { JogadorSorteio } from '@/domain/sorteio.types';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export default async function PartidaPage({
  params,
}: {
  params: Promise<{ id: string; partidaId: string }>;
}) {
  const { partidaId } = await params;
  const profile = await getUserProfile();
  const admin = isAdmin(profile?.role);

  const supabase = await createClient();
  const { data: partida } = await supabase.from('partidas').select('*').eq('id', partidaId).single();
  if (!partida) notFound();

  const [{ data: timeA }, { data: timeB }, { data: eventos }] = await Promise.all([
    supabase.from('torneio_times').select('*').eq('id', partida.time_a_id).single(),
    supabase.from('torneio_times').select('*').eq('id', partida.time_b_id).single(),
    supabase
      .from('eventos_gol')
      .select('*')
      .eq('partida_id', partidaId)
      .order('created_at', { ascending: true }),
  ]);

  if (!timeA || !timeB) notFound();

  const jogadoresA = timeA.jogadores as JogadorSorteio[];
  const jogadoresB = timeB.jogadores as JogadorSorteio[];
  const nomesPorJogador = new Map(
    [...jogadoresA, ...jogadoresB].map((j) => [j.id, j.nome] as const)
  );

  const emAndamento = partida.status === 'em_andamento';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1 text-center">
        <p className="text-sm text-muted-foreground">Partida {partida.ordem}</p>
        <p className="text-3xl font-semibold">
          {partida.gols_time_a} <span className="text-muted-foreground">x</span> {partida.gols_time_b}
        </p>
        <p className="text-sm">
          Time {timeA.indice} <span className="text-muted-foreground">vs</span> Time {timeB.indice}
        </p>
        <Badge variant={emAndamento ? 'default' : 'secondary'}>
          {emAndamento ? 'Em andamento' : 'Finalizada'}
        </Badge>
      </div>

      {admin && emAndamento && (
        <div className="flex gap-2">
          <RegistrarGolDialog
            partidaId={partidaId}
            timeMarcador={{ id: timeA.id, indice: timeA.indice, jogadores: jogadoresA }}
            timeAdversario={{ id: timeB.id, indice: timeB.indice, jogadores: jogadoresB }}
          />
          <RegistrarGolDialog
            partidaId={partidaId}
            timeMarcador={{ id: timeB.id, indice: timeB.indice, jogadores: jogadoresB }}
            timeAdversario={{ id: timeA.id, indice: timeA.indice, jogadores: jogadoresA }}
          />
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Gols da partida</p>
        {!eventos || eventos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum gol registrado ainda.</p>
        ) : (
          eventos.map((e) => {
            const time = e.time_id === timeA.id ? timeA : timeB;
            return (
              <Card key={e.id} className="border-border/60">
                <CardContent className="flex items-center gap-2 py-2.5 text-sm">
                  <Goal className="size-4 shrink-0 text-primary" />
                  <span className="flex-1">
                    <strong>{nomesPorJogador.get(e.jogador_id) ?? 'Jogador'}</strong>
                    {e.gol_contra ? ' (gol contra)' : ''} — Time {time.indice}
                    {e.assistencia_jogador_id && (
                      <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground">
                        <Handshake className="size-3.5" />
                        {nomesPorJogador.get(e.assistencia_jogador_id) ?? 'Jogador'}
                      </span>
                    )}
                  </span>
                  {admin && emAndamento && <RemoverGolButton eventoId={e.id} />}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {admin && emAndamento && <EncerrarPartidaButton partidaId={partidaId} />}
      {admin && !emAndamento && <ReabrirPartidaButton partidaId={partidaId} />}
    </div>
  );
}
