import type { JogadorSorteio, ResultadoSorteio, TamanhoTime, TimeMontado } from './sorteio.types';

/**
 * Monta o máximo de times completos de `tamanhoTime` jogadores, balanceando a soma de
 * nível de habilidade e a quantidade de atacantes/defensores entre eles. Jogadores que não
 * couberem em nenhum time completo (quando o total não é múltiplo exato) formam o grupo avulsos.
 *
 * Determinístico para o mesmo input — sem aleatoriedade.
 */
export function sortearTimes(
  jogadoresSelecionados: JogadorSorteio[],
  tamanhoTime: TamanhoTime
): ResultadoSorteio {
  const qtdTimesCompletos = Math.floor(jogadoresSelecionados.length / tamanhoTime);

  if (qtdTimesCompletos === 0) {
    return { times: [], avulsos: [...jogadoresSelecionados] };
  }

  const ordenados = [...jogadoresSelecionados].sort((a, b) => b.nivel - a.nivel);

  const times: TimeMontado[] = Array.from({ length: qtdTimesCompletos }, () => ({
    jogadores: [],
    somaNivel: 0,
  }));

  const avulsos: JogadorSorteio[] = [];

  for (const jogador of ordenados) {
    const candidatos = times.filter((t) => t.jogadores.length < tamanhoTime);

    if (candidatos.length === 0) {
      avulsos.push(jogador);
      continue;
    }

    candidatos.sort((a, b) => {
      if (a.somaNivel !== b.somaNivel) return a.somaNivel - b.somaNivel;

      const mesmaPosA = a.jogadores.filter((j) => j.posicao === jogador.posicao).length;
      const mesmaPosB = b.jogadores.filter((j) => j.posicao === jogador.posicao).length;
      if (mesmaPosA !== mesmaPosB) return mesmaPosA - mesmaPosB;

      return a.jogadores.length - b.jogadores.length;
    });

    const escolhido = candidatos[0];
    escolhido.jogadores.push(jogador);
    escolhido.somaNivel += jogador.nivel;
  }

  return { times, avulsos };
}
