import type { EventoGolRow } from '@/types/database.types';

export interface RankingEntry {
  jogadorId: string;
  nome: string;
  total: number;
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
