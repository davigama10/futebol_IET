import type { JogadorSorteio, ResultadoSorteio, TamanhoTime, TimeMontado } from './sorteio.types';

export interface OpcoesSorteio {
  /**
   * Times do último sorteio (ids dos jogadores de cada time). Duplas que jogaram juntas nele são
   * evitadas quando isso não custa o equilíbrio dos times.
   */
  timesAnteriores?: string[][];
  /** Fonte de aleatoriedade em [0, 1). Padrão `Math.random` — injetável pra testes reprodutíveis. */
  aleatorio?: () => number;
}

/**
 * Peso de cada critério no custo de uma distribuição (menor = melhor). Equilíbrio de nível domina:
 * meia estrela de diferença entre dois times custa o mesmo que 10 duplas repetidas.
 */
export const PESOS_SORTEIO = {
  nivel: 20,
  posicao: 4,
  duplaRepetida: 1,
};

const TENTATIVAS = 40;

/**
 * Monta o máximo de times completos de `tamanhoTime` jogadores, balanceando a soma de nível de
 * habilidade e a quantidade de jogadores de cada função (atacante/meio-campo/defensor/goleiro)
 * entre eles e, quando possível, evitando repetir duplas do último sorteio. Jogadores que não
 * couberem em nenhum time completo (os de menor nível) formam o grupo avulsos.
 *
 * Aleatório: o mesmo grupo de jogadores gera times diferentes a cada sorteio, sempre escolhendo
 * a distribuição mais equilibrada entre várias tentativas.
 */
export function sortearTimes(
  jogadoresSelecionados: JogadorSorteio[],
  tamanhoTime: TamanhoTime,
  opcoes: OpcoesSorteio = {}
): ResultadoSorteio {
  const aleatorio = opcoes.aleatorio ?? Math.random;
  const qtdTimesCompletos = Math.floor(jogadoresSelecionados.length / tamanhoTime);

  if (qtdTimesCompletos === 0) {
    return { times: [], avulsos: [...jogadoresSelecionados] };
  }

  // sort é estável: embaralhar antes faz empates de nível serem decididos aleatoriamente.
  const ordenados = embaralhar(jogadoresSelecionados, aleatorio).sort((a, b) => b.nivel - a.nivel);
  const participantes = ordenados.slice(0, qtdTimesCompletos * tamanhoTime);
  const avulsos = ordenados.slice(qtdTimesCompletos * tamanhoTime);

  const duplasAnteriores = montarDuplas(opcoes.timesAnteriores ?? []);

  let melhor: JogadorSorteio[][] = [];
  let melhorCusto = Infinity;

  for (let t = 0; t < TENTATIVAS; t++) {
    const times = distribuicaoInicial(participantes, qtdTimesCompletos, tamanhoTime, aleatorio);
    const custoFinal = melhorarPorTrocas(times, duplasAnteriores, aleatorio);
    if (custoFinal < melhorCusto) {
      melhorCusto = custoFinal;
      melhor = times;
    }
  }

  const times: TimeMontado[] = melhor.map((jogadores) => ({
    jogadores,
    somaNivel: somaNivel(jogadores),
  }));

  return { times, avulsos };
}

/** Quantas duplas de companheiros de time em `times` também jogaram juntas em `timesAnteriores`. */
export function contarDuplasRepetidas(times: TimeMontado[], timesAnteriores: string[][]): number {
  const duplas = montarDuplas(timesAnteriores);
  return times.reduce((acc, t) => acc + duplasRepetidasNoTime(t.jogadores, duplas), 0);
}

function chaveDupla(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function montarDuplas(times: string[][]): Set<string> {
  const duplas = new Set<string>();
  times.forEach((ids) => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) duplas.add(chaveDupla(ids[i], ids[j]));
    }
  });
  return duplas;
}

function duplasRepetidasNoTime(jogadores: JogadorSorteio[], duplas: Set<string>) {
  if (duplas.size === 0) return 0;
  let total = 0;
  for (let i = 0; i < jogadores.length; i++) {
    for (let j = i + 1; j < jogadores.length; j++) {
      if (duplas.has(chaveDupla(jogadores[i].id, jogadores[j].id))) total++;
    }
  }
  return total;
}

function somaNivel(jogadores: JogadorSorteio[]) {
  return jogadores.reduce((acc, j) => acc + j.nivel, 0);
}

function embaralhar<T>(itens: T[], aleatorio: () => number): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Variância (soma dos desvios² em relação à média) — suave o bastante pra busca por trocas. */
function desvioQuadratico(valores: number[]) {
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  return valores.reduce((acc, v) => acc + (v - media) ** 2, 0);
}

function custo(times: JogadorSorteio[][], duplasAnteriores: Set<string>): number {
  const custoNivel = desvioQuadratico(times.map(somaNivel));

  const posicoes = new Set(times.flat().map((j) => j.posicao));
  let custoPosicao = 0;
  posicoes.forEach((p) => {
    custoPosicao += desvioQuadratico(times.map((t) => t.filter((j) => j.posicao === p).length));
  });

  const repetidas = times.reduce((acc, t) => acc + duplasRepetidasNoTime(t, duplasAnteriores), 0);

  return (
    PESOS_SORTEIO.nivel * custoNivel +
    PESOS_SORTEIO.posicao * custoPosicao +
    PESOS_SORTEIO.duplaRepetida * repetidas
  );
}

/**
 * Ponto de partida guloso (o algoritmo original): do maior nível pro menor, cada jogador vai pro
 * time com menor soma de nível e, no empate, com menos jogadores da mesma função — com empates
 * restantes decididos aleatoriamente.
 */
function distribuicaoInicial(
  participantes: JogadorSorteio[],
  qtdTimes: number,
  tamanhoTime: number,
  aleatorio: () => number
): JogadorSorteio[][] {
  const ordenados = embaralhar(participantes, aleatorio).sort((a, b) => b.nivel - a.nivel);
  const times: JogadorSorteio[][] = Array.from({ length: qtdTimes }, () => []);

  for (const jogador of ordenados) {
    const candidatos = embaralhar(
      times.filter((t) => t.length < tamanhoTime),
      aleatorio
    ).sort((a, b) => {
      const somaA = somaNivel(a);
      const somaB = somaNivel(b);
      if (somaA !== somaB) return somaA - somaB;

      const mesmaPosA = a.filter((j) => j.posicao === jogador.posicao).length;
      const mesmaPosB = b.filter((j) => j.posicao === jogador.posicao).length;
      if (mesmaPosA !== mesmaPosB) return mesmaPosA - mesmaPosB;

      return a.length - b.length;
    });

    candidatos[0].push(jogador);
  }

  return times;
}

/**
 * Busca local: troca jogadores de times diferentes enquanto alguma troca reduzir o custo.
 * Altera `times` in-place e devolve o custo final.
 */
function melhorarPorTrocas(
  times: JogadorSorteio[][],
  duplasAnteriores: Set<string>,
  aleatorio: () => number
): number {
  let custoAtual = custo(times, duplasAnteriores);

  const posicoesDeJogador: [number, number][] = [];
  times.forEach((t, ti) => t.forEach((_, ji) => posicoesDeJogador.push([ti, ji])));

  let melhorou = true;
  while (melhorou) {
    melhorou = false;
    const ordem = embaralhar(posicoesDeJogador, aleatorio);

    for (let x = 0; x < ordem.length; x++) {
      for (let y = x + 1; y < ordem.length; y++) {
        const [ta, ja] = ordem[x];
        const [tb, jb] = ordem[y];
        if (ta === tb) continue;

        [times[ta][ja], times[tb][jb]] = [times[tb][jb], times[ta][ja]];
        const novoCusto = custo(times, duplasAnteriores);

        if (novoCusto < custoAtual - 1e-9) {
          custoAtual = novoCusto;
          melhorou = true;
        } else {
          [times[ta][ja], times[tb][jb]] = [times[tb][jb], times[ta][ja]];
        }
      }
    }
  }

  return custoAtual;
}
