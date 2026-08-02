import { notFound } from 'next/navigation';

import { TorneioTabs } from '@/components/torneio-tabs';
import { Badge } from '@/components/ui/badge';
import { calcularArtilharia, calcularAssistencias } from '@/lib/torneio-stats';
import { createClient } from '@/lib/supabase/server';
import type { JogadorSorteio } from '@/domain/sorteio.types';

export default async function TorneioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: torneio } = await supabase.from('torneios').select('*').eq('id', id).single();
  if (!torneio) notFound();

  const [{ data: times }, { data: partidas }] = await Promise.all([
    supabase.from('torneio_times').select('*').eq('torneio_id', id).order('indice'),
    supabase.from('partidas').select('*').eq('torneio_id', id).order('ordem'),
  ]);

  const partidaIds = (partidas ?? []).map((p) => p.id);
  const { data: eventos } =
    partidaIds.length > 0
      ? await supabase.from('eventos_gol').select('*').in('partida_id', partidaIds)
      : { data: [] };

  const nomesPorJogador = new Map<string, string>();
  (times ?? []).forEach((t) => {
    (t.jogadores as JogadorSorteio[]).forEach((j) => nomesPorJogador.set(j.id, j.nome));
  });

  const artilharia = calcularArtilharia(eventos ?? [], nomesPorJogador);
  const assistencias = calcularAssistencias(eventos ?? [], nomesPorJogador);

  const dataFormatada = new Date(`${torneio.data}T00:00:00`).toLocaleDateString('pt-BR');

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{torneio.nome || `Torneio de ${dataFormatada}`}</h1>
          <p className="text-sm text-muted-foreground">{dataFormatada}</p>
        </div>
        <Badge variant={torneio.status === 'finalizado' ? 'secondary' : 'default'}>
          {torneio.status === 'finalizado' ? 'Finalizado' : 'Em andamento'}
        </Badge>
      </div>

      <TorneioTabs
        torneio={torneio}
        times={times ?? []}
        partidas={partidas ?? []}
        artilharia={artilharia}
        assistencias={assistencias}
      />
    </div>
  );
}
