import { ArrowLeft, ArrowRight, Goal, Handshake } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CartaoIcone } from '@/components/cartao-icone';
import { DefesasGoleiros } from '@/components/defesas-goleiros';
import { EncerrarPartidaButton } from '@/components/encerrar-partida-button';
import { ReabrirPartidaButton } from '@/components/reabrir-partida-button';
import { RegistrarCartaoDialog } from '@/components/registrar-cartao-dialog';
import { RegistrarGolDialog } from '@/components/registrar-gol-dialog';
import { RemoverGolButton } from '@/components/remover-gol-button';
import type { TimeDoTorneio } from '@/components/seletor-jogador';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isAdmin } from '@/constants/roles';
import type { JogadorSorteio } from '@/domain/sorteio.types';
import { mapearNomesDoTorneio } from '@/lib/torneio-stats';
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

  const torneioId = partida.torneio_id;

  const [
    { data: timesTorneio },
    { data: goleirosTorneio },
    { data: partidasTorneio },
    { data: eventos },
    { data: cartoes },
    { data: defesas },
  ] = await Promise.all([
    supabase.from('torneio_times').select('*').eq('torneio_id', torneioId).order('indice'),
    supabase.from('torneio_goleiros').select('*').eq('torneio_id', torneioId).order('nome'),
    supabase.from('partidas').select('id, ordem').eq('torneio_id', torneioId).order('ordem'),
    supabase
      .from('eventos_gol')
      .select('*')
      .eq('partida_id', partidaId)
      .order('created_at', { ascending: true }),
    supabase
      .from('eventos_cartao')
      .select('*')
      .eq('partida_id', partidaId)
      .order('created_at', { ascending: true }),
    supabase.from('defesas_goleiro').select('*').eq('partida_id', partidaId),
  ]);

  const timeA = (timesTorneio ?? []).find((t) => t.id === partida.time_a_id);
  const timeB = (timesTorneio ?? []).find((t) => t.id === partida.time_b_id);
  if (!timeA || !timeB) notFound();

  const times: TimeDoTorneio[] = (timesTorneio ?? []).map((t) => ({
    id: t.id,
    indice: t.indice,
    jogadores: (t.jogadores as JogadorSorteio[]).map((j) => ({ id: j.id, nome: j.nome })),
  }));
  const infoA = times.find((t) => t.id === timeA.id)!;
  const infoB = times.find((t) => t.id === timeB.id)!;

  const goleiros = (goleirosTorneio ?? []).map((g) => ({ id: g.jogador_id, nome: g.nome }));
  const nomesPorJogador = mapearNomesDoTorneio(timesTorneio ?? [], goleirosTorneio ?? []);

  // Jogador que marcou/recebeu cartão por um time que não é o dele ("Outros").
  const completando = (jogadorId: string, timeId: string) =>
    !times.find((t) => t.id === timeId)?.jogadores.some((j) => j.id === jogadorId);

  const indicePartida = (partidasTorneio ?? []).findIndex((p) => p.id === partidaId);
  const proximaPartida = indicePartida >= 0 ? partidasTorneio?.[indicePartida + 1] : undefined;

  const defesasIniciais = Object.fromEntries((defesas ?? []).map((d) => [d.jogador_id, d.defesas]));

  const emAndamento = partida.status === 'em_andamento';
  const podeEditar = admin && emAndamento;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/torneios/${torneioId}`} />}
          className="-ml-2 gap-1"
        >
          <ArrowLeft className="size-4" />
          Voltar para partidas
        </Button>
        {proximaPartida && (
          <Button
            variant="ghost"
            size="sm"
            render={<Link href={`/torneios/${torneioId}/partidas/${proximaPartida.id}`} />}
            className="-mr-2 gap-1"
          >
            Próxima partida
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>

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

      {podeEditar && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <RegistrarGolDialog
              partidaId={partidaId}
              timeMarcador={infoA}
              timeAdversario={infoB}
              timesTorneio={times}
              goleiros={goleiros}
            />
            <RegistrarGolDialog
              partidaId={partidaId}
              timeMarcador={infoB}
              timeAdversario={infoA}
              timesTorneio={times}
              goleiros={goleiros}
            />
          </div>
          <RegistrarCartaoDialog
            partidaId={partidaId}
            timeA={infoA}
            timeB={infoB}
            timesTorneio={times}
            goleiros={goleiros}
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
                    {e.gol_contra ? ' (gol contra)' : ''}
                    {!e.gol_contra && completando(e.jogador_id, e.time_id) ? ' (completando)' : ''} —
                    Time {time.indice}
                    {e.assistencia_jogador_id && (
                      <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground">
                        <Handshake className="size-3.5" />
                        {nomesPorJogador.get(e.assistencia_jogador_id) ?? 'Jogador'}
                      </span>
                    )}
                  </span>
                  {podeEditar && <RemoverGolButton eventoId={e.id} />}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Cartões</p>
        {!cartoes || cartoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cartão registrado.</p>
        ) : (
          cartoes.map((c) => {
            const time = c.time_id === timeA.id ? timeA : timeB;
            return (
              <Card key={c.id} className="border-border/60">
                <CardContent className="flex items-center gap-2 py-2.5 text-sm">
                  <CartaoIcone tipo={c.tipo} />
                  <span className="flex-1">
                    <strong>{nomesPorJogador.get(c.jogador_id) ?? 'Jogador'}</strong>
                    {completando(c.jogador_id, c.time_id) ? ' (completando)' : ''} — Time {time.indice}
                  </span>
                  {podeEditar && <RemoverGolButton eventoId={c.id} tipo="cartao" />}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Goleiros da partida — defesas</p>
        <DefesasGoleiros
          key={partida.status}
          partidaId={partidaId}
          goleiros={goleiros}
          defesasIniciais={defesasIniciais}
          editavel={podeEditar}
        />
      </div>

      {podeEditar && <EncerrarPartidaButton partidaId={partidaId} />}
      {admin && !emAndamento && <ReabrirPartidaButton partidaId={partidaId} />}
    </div>
  );
}
