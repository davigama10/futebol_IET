import type { JogadorSorteio } from '@/domain/sorteio.types';
import type {
  DefesaGoleiroRow,
  EventoCartaoRow,
  EventoGolRow,
  TorneioGoleiroRow,
  TorneioTimeRow,
} from '@/types/database.types';

export interface RankingEntry {
  jogadorId: string;
  nome: string;
  total: number;
}

export interface CartoesEntry {
  jogadorId: string;
  nome: string;
  amarelos: number;
  vermelhos: number;
}

/** Nome de todo mundo que participa do torneio (jogadores de linha dos times + goleiros). */
export function mapearNomesDoTorneio(
  times: Pick<TorneioTimeRow, 'jogadores'>[],
  goleiros: Pick<TorneioGoleiroRow, 'jogador_id' | 'nome'>[] = []
): Map<string, string> {
  const nomes = new Map<string, string>();
  times.forEach((t) => (t.jogadores as JogadorSorteio[]).forEach((j) => nomes.set(j.id, j.nome)));
  goleiros.forEach((g) => nomes.set(g.jogador_id, g.nome));
  return nomes;
}

function paraRanking(
  contagem: Map<string, number>,
  nomesPorJogador: Map<string, string>
): RankingEntry[] {
  return [...contagem.entries()]
    .map(([jogadorId, total]) => ({
      jogadorId,
      total,
      nome: nomesPorJogador.get(jogadorId) ?? 'Jogador removido',
    }))
    .sort((a, b) => b.total - a.total);
}

// Artilharia é pelo autor (`jogador_id`), independente do time creditado no placar — um jogador
// completando outro time ("Outros") soma gols pra ele normalmente.
export function calcularArtilharia(
  eventos: EventoGolRow[],
  nomesPorJogador: Map<string, string>
): RankingEntry[] {
  const contagem = new Map<string, number>();
  eventos
    .filter((e) => !e.gol_contra)
    .forEach((e) => contagem.set(e.jogador_id, (contagem.get(e.jogador_id) ?? 0) + 1));

  return paraRanking(contagem, nomesPorJogador);
}

export function calcularAssistencias(
  eventos: EventoGolRow[],
  nomesPorJogador: Map<string, string>
): RankingEntry[] {
  const contagem = new Map<string, number>();
  eventos
    .filter((e) => !e.gol_contra && e.assistencia_jogador_id)
    .forEach((e) => {
      const id = e.assistencia_jogador_id!;
      contagem.set(id, (contagem.get(id) ?? 0) + 1);
    });

  return paraRanking(contagem, nomesPorJogador);
}

export function calcularCartoes(
  eventos: EventoCartaoRow[],
  nomesPorJogador: Map<string, string>
): CartoesEntry[] {
  const porJogador = new Map<string, CartoesEntry>();
  eventos.forEach((e) => {
    const entrada = porJogador.get(e.jogador_id) ?? {
      jogadorId: e.jogador_id,
      nome: nomesPorJogador.get(e.jogador_id) ?? 'Jogador removido',
      amarelos: 0,
      vermelhos: 0,
    };
    if (e.tipo === 'amarelo') entrada.amarelos++;
    else entrada.vermelhos++;
    porJogador.set(e.jogador_id, entrada);
  });

  return [...porJogador.values()].sort(
    (a, b) => b.vermelhos - a.vermelhos || b.amarelos - a.amarelos
  );
}

/** Total de defesas de cada goleiro do torneio (inclusive quem ainda não fez nenhuma). */
export function calcularDefesas(
  defesas: DefesaGoleiroRow[],
  goleiros: Pick<TorneioGoleiroRow, 'jogador_id'>[],
  nomesPorJogador: Map<string, string>
): RankingEntry[] {
  const contagem = new Map<string, number>(goleiros.map((g) => [g.jogador_id, 0]));
  defesas.forEach((d) => contagem.set(d.jogador_id, (contagem.get(d.jogador_id) ?? 0) + d.defesas));
  return paraRanking(contagem, nomesPorJogador);
}

// ---------------------------------------------------------------------------------------------
// Classificação

/** Pontuação disciplinar (fair play): amarelo = 1, vermelho = 3. Menos é melhor. */
export function pontosDisciplinares(time: Pick<TorneioTimeRow, 'cartoes_amarelos' | 'cartoes_vermelhos'>) {
  return (time.cartoes_amarelos ?? 0) + 3 * (time.cartoes_vermelhos ?? 0);
}

export type CriterioClassificacao = 'pontos' | 'saldo' | 'gols_pro' | 'cartoes';

const COMPARADORES: Record<CriterioClassificacao, (a: TorneioTimeRow, b: TorneioTimeRow) => number> = {
  pontos: (a, b) => b.pontos - a.pontos,
  saldo: (a, b) => b.gols_pro - b.gols_contra - (a.gols_pro - a.gols_contra),
  gols_pro: (a, b) => b.gols_pro - a.gols_pro,
  cartoes: (a, b) => pontosDisciplinares(a) - pontosDisciplinares(b),
};

/**
 * Ordem dos critérios de classificação/desempate. Os três primeiros são os originais; `cartoes`
 * entra por último, então só decide empates que antes ficavam sem critério. Pra mudar a
 * prioridade, basta reordenar esta lista.
 */
export const CRITERIOS_CLASSIFICACAO: CriterioClassificacao[] = ['pontos', 'saldo', 'gols_pro', 'cartoes'];

export function ordenarClassificacao(
  times: TorneioTimeRow[],
  criterios: CriterioClassificacao[] = CRITERIOS_CLASSIFICACAO
): TorneioTimeRow[] {
  return [...times].sort((a, b) => {
    for (const criterio of criterios) {
      const r = COMPARADORES[criterio](a, b);
      if (r !== 0) return r;
    }
    return 0;
  });
}
