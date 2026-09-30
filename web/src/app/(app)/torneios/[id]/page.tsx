import { notFound } from 'next/navigation';

import { TorneioTabs } from '@/components/torneio-tabs';
import { Badge } from '@/components/ui/badge';
import { isAdmin } from '@/constants/roles';
import {
  calcularArtilharia,
  calcularAssistencias,
  calcularCartoes,
  calcularDefesas,
  mapearNomesDoTorneio,
} from '@/lib/torneio-stats';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export default async function TorneioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getUserProfile();
  const admin = isAdmin(profile?.role);
  const supabase = await createClient();

  const { data: torneio } = await supabase.from('torneios').select('*').eq('id', id).single();
  if (!torneio) notFound();

  const [{ data: times }, { data: partidas }, { data: goleiros }] = await Promise.all([
    supabase.from('torneio_times').select('*').eq('torneio_id', id).order('indice'),
    supabase.from('partidas').select('*').eq('torneio_id', id).order('ordem'),
    supabase.from('torneio_goleiros').select('*').eq('torneio_id', id).order('nome'),
  ]);

  const partidaIds = (partidas ?? []).map((p) => p.id);
  const vazio = { data: [] };
  const [{ data: eventos }, { data: cartoes }, { data: defesas }, { data: goleirosCadastrados }] =
    await Promise.all([
      partidaIds.length > 0
        ? supabase.from('eventos_gol').select('*').in('partida_id', partidaIds)
        : vazio,
      partidaIds.length > 0
        ? supabase.from('eventos_cartao').select('*').in('partida_id', partidaIds)
        : vazio,
      partidaIds.length > 0
        ? supabase.from('defesas_goleiro').select('*').in('partida_id', partidaIds)
        : vazio,
      admin
        ? supabase
            .from('jogadores')
            .select('id, nome')
            .eq('posicao', 'goleiro')
            .eq('ativo', true)
            .order('nome')
        : vazio,
    ]);

  const nomesPorJogador = mapearNomesDoTorneio(times ?? [], goleiros ?? []);

  const artilharia = calcularArtilharia(eventos ?? [], nomesPorJogador);
  const assistencias = calcularAssistencias(eventos ?? [], nomesPorJogador);
  const rankingCartoes = calcularCartoes(cartoes ?? [], nomesPorJogador);
  const rankingDefesas = calcularDefesas(defesas ?? [], goleiros ?? [], nomesPorJogador);

  const idsGoleirosNoTorneio = new Set((goleiros ?? []).map((g) => g.jogador_id));
  const goleirosDisponiveis = (goleirosCadastrados ?? []).filter(
    (g) => !idsGoleirosNoTorneio.has(g.id)
  );

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
        cartoes={rankingCartoes}
        defesas={rankingDefesas}
        goleirosDisponiveis={goleirosDisponiveis}
        admin={admin}
      />
    </div>
  );
}
