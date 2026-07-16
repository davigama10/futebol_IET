import { sortearTimes } from './sorteio';
import type { JogadorSorteio } from './sorteio.types';

function criarJogadores(spec: [nivel: number, posicao: 'atacante' | 'defensor'][]): JogadorSorteio[] {
  return spec.map(([nivel, posicao], i) => ({
    id: `j${i}`,
    nome: `Jogador ${i}`,
    nivel,
    posicao,
  }));
}

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

  it('é determinístico para o mesmo input', () => {
    const jogadores = criarJogadores([
      [5, 'atacante'], [4, 'defensor'], [3, 'atacante'], [2, 'defensor'],
      [1, 'atacante'], [5, 'defensor'], [4, 'atacante'], [3, 'defensor'],
    ]);

    const r1 = sortearTimes(jogadores, 4);
    const r2 = sortearTimes(jogadores, 4);

    expect(r1).toEqual(r2);
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
});
