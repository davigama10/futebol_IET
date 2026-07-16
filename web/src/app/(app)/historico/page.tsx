import { HistoricoItem } from '@/components/historico-item';
import { RankingMensal } from '@/components/ranking-mensal';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export default async function HistoricoPage() {
  const profile = await getUserProfile();
  const supabase = await createClient();

  const [{ data: sorteios }, { data: estatisticas }, { data: jogadores }] = await Promise.all([
    supabase.from('sorteios').select('*').order('created_at', { ascending: false }),
    supabase.from('estatisticas_sorteio').select('*'),
    supabase.from('jogadores').select('id, nome'),
  ]);

  const estatisticasPorSorteio = new Map<
    string,
    Record<string, { gols: number; assistencias: number }>
  >();
  (estatisticas ?? []).forEach((e) => {
    const mapa = estatisticasPorSorteio.get(e.sorteio_id) ?? {};
    mapa[e.jogador_id] = { gols: e.gols, assistencias: e.assistencias };
    estatisticasPorSorteio.set(e.sorteio_id, mapa);
  });

  const nomesPorJogador = new Map((jogadores ?? []).map((j) => [j.id, j.nome]));

  const agora = new Date();
  const sorteiosDoMes = new Set(
    (sorteios ?? [])
      .filter((s) => {
        const data = new Date(s.created_at);
        return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
      })
      .map((s) => s.id)
  );

  const golsPorJogador = new Map<string, number>();
  const assistPorJogador = new Map<string, number>();
  (estatisticas ?? [])
    .filter((e) => sorteiosDoMes.has(e.sorteio_id))
    .forEach((e) => {
      golsPorJogador.set(e.jogador_id, (golsPorJogador.get(e.jogador_id) ?? 0) + e.gols);
      assistPorJogador.set(
        e.jogador_id,
        (assistPorJogador.get(e.jogador_id) ?? 0) + e.assistencias
      );
    });

  function topN(mapa: Map<string, number>) {
    return [...mapa.entries()]
      .filter(([, total]) => total > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([jogadorId, total]) => ({
        jogadorId,
        total,
        nome: nomesPorJogador.get(jogadorId) ?? 'Jogador removido',
      }));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Histórico</h1>

      <RankingMensal
        mesLabel={`${MESES[agora.getMonth()]} de ${agora.getFullYear()}`}
        artilheiros={topN(golsPorJogador)}
        garcons={topN(assistPorJogador)}
      />

      {!sorteios || sorteios.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhum sorteio salvo ainda.</p>
      ) : (
        <div className="space-y-2">
          {sorteios.map((s) => (
            <HistoricoItem
              key={s.id}
              sorteio={s}
              estatisticasIniciais={estatisticasPorSorteio.get(s.id) ?? {}}
              admin={isAdmin(profile?.role)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
