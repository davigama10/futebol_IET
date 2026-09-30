import { contarDuplasRepetidas, sortearTimes } from './sorteio';
import type { JogadorSorteio, Posicao } from './sorteio.types';

function criarJogadores(spec: (readonly [nivel: number, posicao: Posicao])[]): JogadorSorteio[] {
  return spec.map(([nivel, posicao], i) => ({
    id: `j${i}`,
    nome: `Jogador ${i}`,
    nivel,
    posicao,
  }));
}

// Gerador pseudoaleatório com semente (mulberry32) — deixa os testes reprodutíveis.
function semente(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const POSICOES_LINHA: Posicao[] = ['atacante', 'meio_campo', 'defensor'];

describe('sortearTimes', () => {
  it('monta times completos e balanceados quando o total é múltiplo exato do tamanho', () => {
    const jogadores = criarJogadores([
      [5, 'atacante'], [5, 'defensor'], [4, 'atacante'], [4, 'defensor'],
      [3, 'atacante'], [3, 'defensor'], [2, 'atacante'], [2, 'defensor'],
      [1, 'atacante'], [1, 'defensor'],
    ]);

    const resultado = sortearTimes(jogadores, 5);

    expect(resultado.times).toHaveLength(2);
    expect(resultado.avulsos).toHaveLength(0);
    resultado.times.forEach((t) => expect(t.jogadores).toHaveLength(5));

    const somas = resultado.times.map((t) => t.somaNivel);
    expect(Math.abs(somas[0] - somas[1])).toBeLessThanOrEqual(1);
  });

  it('deixa jogadores que sobram (não múltiplo exato) no grupo avulsos', () => {
    const jogadores = criarJogadores(
      Array.from({ length: 22 }, (_, i) => [((i % 5) + 1), i % 2 === 0 ? 'atacante' : 'defensor'] as const)
    );

    const resultado = sortearTimes(jogadores, 5);

    expect(resultado.times).toHaveLength(4);
    resultado.times.forEach((t) => expect(t.jogadores).toHaveLength(5));
    expect(resultado.avulsos).toHaveLength(2);
    // Mantém a regra original: quem fica de fora são os de menor nível.
    resultado.avulsos.forEach((j) => expect(j.nivel).toBe(1));
  });

  it('retorna todos como avulsos quando não há jogadores suficientes para um time completo', () => {
    const jogadores = criarJogadores([[5, 'atacante'], [3, 'defensor']]);

    const resultado = sortearTimes(jogadores, 5);

    expect(resultado.times).toHaveLength(0);
    expect(resultado.avulsos).toHaveLength(2);
  });

  it('balanceia quantidade de atacantes e defensores entre os times', () => {
    const jogadores = criarJogadores([
      [3, 'atacante'], [3, 'atacante'], [3, 'atacante'], [3, 'atacante'],
      [3, 'defensor'], [3, 'defensor'], [3, 'defensor'], [3, 'defensor'],
    ]);

    const resultado = sortearTimes(jogadores, 4);

    expect(resultado.times).toHaveLength(2);
    resultado.times.forEach((t) => {
      const atacantes = t.jogadores.filter((j) => j.posicao === 'atacante').length;
      const defensores = t.jogadores.filter((j) => j.posicao === 'defensor').length;
      expect(atacantes).toBe(2);
      expect(defensores).toBe(2);
    });
  });

  it('balanceia atacantes, meio-campistas e defensores entre os times', () => {
    const jogadores = criarJogadores(
      Array.from({ length: 12 }, (_, i) => [3, POSICOES_LINHA[i % 3]] as const)
    );

    const resultado = sortearTimes(jogadores, 4, { aleatorio: semente(7) });

    expect(resultado.times).toHaveLength(3);
    resultado.times.forEach((t) => {
      POSICOES_LINHA.forEach((p) => {
        const qtd = t.jogadores.filter((j) => j.posicao === p).length;
        expect(qtd === 1 || qtd === 2).toBe(true);
      });
    });
  });

  it('é reprodutível com a mesma fonte de aleatoriedade', () => {
    const jogadores = criarJogadores([
      [5, 'atacante'], [4, 'defensor'], [3, 'atacante'], [2, 'defensor'],
      [1, 'atacante'], [5, 'defensor'], [4, 'atacante'], [3, 'defensor'],
    ]);

    const r1 = sortearTimes(jogadores, 4, { aleatorio: semente(42) });
    const r2 = sortearTimes(jogadores, 4, { aleatorio: semente(42) });

    expect(r1).toEqual(r2);
  });

  it('varia os times entre sorteios do mesmo grupo de jogadores', () => {
    const jogadores = criarJogadores(
      Array.from({ length: 20 }, (_, i) => [((i % 5) + 1), POSICOES_LINHA[i % 3]] as const)
    );

    const composicoes = new Set(
      [1, 2, 3, 4, 5].map((s) => {
        const r = sortearTimes(jogadores, 5, { aleatorio: semente(s) });
        return r.times
          .map((t) => t.jogadores.map((j) => j.id).sort().join(','))
          .sort()
          .join(' / ');
      })
    );

    expect(composicoes.size).toBeGreaterThan(1);
  });

  it('evita repetir duplas do último sorteio sem perder o equilíbrio', () => {
    const jogadores = criarJogadores(
      Array.from({ length: 20 }, (_, i) => [((i % 5) + 1), POSICOES_LINHA[i % 3]] as const)
    );

    const anterior = sortearTimes(jogadores, 5, { aleatorio: semente(1) });
    const timesAnteriores = anterior.times.map((t) => t.jogadores.map((j) => j.id));

    const semHistorico = sortearTimes(jogadores, 5, { aleatorio: semente(2) });
    const comHistorico = sortearTimes(jogadores, 5, { aleatorio: semente(2), timesAnteriores });

    const repetidasSem = contarDuplasRepetidas(semHistorico.times, timesAnteriores);
    const repetidasCom = contarDuplasRepetidas(comHistorico.times, timesAnteriores);

    // 4 times de 5 vindos de 4 times de 5: pelo menos 1 dupla repetida por time é inevitável.
    expect(repetidasCom).toBeLessThanOrEqual(4);
    expect(repetidasCom).toBeLessThanOrEqual(repetidasSem);

    const somas = comHistorico.times.map((t) => t.somaNivel);
    expect(Math.max(...somas) - Math.min(...somas)).toBeLessThanOrEqual(0.5);
  });

  it('não perde nem duplica jogadores', () => {
    const jogadores = criarJogadores(
      Array.from({ length: 17 }, (_, i) => [((i % 5) + 1), i % 2 === 0 ? 'atacante' : 'defensor'] as const)
    );

    const resultado = sortearTimes(jogadores, 6);
    const totalNoResultado =
      resultado.times.reduce((acc, t) => acc + t.jogadores.length, 0) + resultado.avulsos.length;

    expect(totalNoResultado).toBe(jogadores.length);

    const idsResultado = new Set([
      ...resultado.times.flatMap((t) => t.jogadores.map((j) => j.id)),
      ...resultado.avulsos.map((j) => j.id),
    ]);
    expect(idsResultado.size).toBe(jogadores.length);
  });

  it('roda rápido no maior cenário realista (6 times de 6)', () => {
    const jogadores = criarJogadores(
      Array.from({ length: 36 }, (_, i) => [(((i * 7) % 9) + 2) / 2, POSICOES_LINHA[i % 3]] as const)
    );
    const timesAnteriores = sortearTimes(jogadores, 6).times.map((t) => t.jogadores.map((j) => j.id));

    const inicio = performance.now();
    sortearTimes(jogadores, 6, { timesAnteriores });
    expect(performance.now() - inicio).toBeLessThan(1500);
  });
});
