import type {
  DefesaGoleiroRow,
  EventoCartaoRow,
  EventoGolRow,
  TorneioTimeRow,
} from '@/types/database.types';

import {
  calcularArtilharia,
  calcularAssistencias,
  calcularCartoes,
  calcularDefesas,
  mapearNomesDoTorneio,
  ordenarClassificacao,
} from './torneio-stats';

function time(parcial: Partial<TorneioTimeRow> & { id: string }): TorneioTimeRow {
  return {
    torneio_id: 't',
    indice: 1,
    jogadores: [],
    soma_nivel: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    gols_pro: 0,
    gols_contra: 0,
    pontos: 0,
    cartoes_amarelos: 0,
    cartoes_vermelhos: 0,
    ...parcial,
  };
}

function gol(parcial: Partial<EventoGolRow> & { jogador_id: string; time_id: string }): EventoGolRow {
  return {
    id: Math.random().toString(),
    partida_id: 'p1',
    assistencia_jogador_id: null,
    gol_contra: false,
    created_at: '',
    ...parcial,
  };
}

const timeA = time({ id: 'A', indice: 1, jogadores: [{ id: 'joao', nome: 'João' }, { id: 'pedro', nome: 'Pedro' }] });
const timeB = time({ id: 'B', indice: 2, jogadores: [{ id: 'lucas', nome: 'Lucas' }, { id: 'marcos', nome: 'Marcos' }] });
const nomes = mapearNomesDoTorneio([timeA, timeB], [{ jogador_id: 'gk', nome: 'Goleiro' }]);

describe('estatísticas do torneio', () => {
  it('conta gol de "Outros" pro autor, mesmo jogando por outro time', () => {
    // João (Time A) completando o Time B e marcando por ele.
    const eventos = [
      gol({ jogador_id: 'joao', time_id: 'B', assistencia_jogador_id: 'lucas' }),
      gol({ jogador_id: 'lucas', time_id: 'B' }),
    ];

    const artilharia = calcularArtilharia(eventos, nomes);
    expect(artilharia.find((a) => a.jogadorId === 'joao')?.total).toBe(1);
    expect(calcularAssistencias(eventos, nomes)).toEqual([{ jogadorId: 'lucas', nome: 'Lucas', total: 1 }]);
  });

  it('gol contra não conta na artilharia nem tem assistência (regra original)', () => {
    const eventos = [gol({ jogador_id: 'marcos', time_id: 'A', gol_contra: true, assistencia_jogador_id: 'lucas' })];
    expect(calcularArtilharia(eventos, nomes)).toEqual([]);
    expect(calcularAssistencias(eventos, nomes)).toEqual([]);
  });

  it('acumula cartões por jogador, vermelhos primeiro', () => {
    const base = { partida_id: 'p', time_id: 'A', created_at: '' };
    const cartoes: EventoCartaoRow[] = [
      { ...base, id: '1', jogador_id: 'pedro', tipo: 'amarelo' },
      { ...base, id: '2', jogador_id: 'pedro', tipo: 'amarelo' },
      { ...base, id: '3', jogador_id: 'joao', tipo: 'vermelho' },
    ];

    expect(calcularCartoes(cartoes, nomes)).toEqual([
      { jogadorId: 'joao', nome: 'João', amarelos: 0, vermelhos: 1 },
      { jogadorId: 'pedro', nome: 'Pedro', amarelos: 2, vermelhos: 0 },
    ]);
  });

  it('soma defesas das partidas e lista goleiros sem defesas com zero', () => {
    const base = { created_at: '', updated_at: '' };
    const defesas: DefesaGoleiroRow[] = [
      { ...base, id: '1', partida_id: 'p1', jogador_id: 'gk', defesas: 5 },
      { ...base, id: '2', partida_id: 'p2', jogador_id: 'gk', defesas: 3 },
    ];
    const goleiros = [{ jogador_id: 'gk' }, { jogador_id: 'gk2' }];
    const nomesComGk2 = new Map([...nomes, ['gk2', 'Reserva']]);

    expect(calcularDefesas(defesas, goleiros, nomesComGk2)).toEqual([
      { jogadorId: 'gk', nome: 'Goleiro', total: 8 },
      { jogadorId: 'gk2', nome: 'Reserva', total: 0 },
    ]);
  });
});

describe('ordenarClassificacao', () => {
  it('mantém os critérios originais: pontos, saldo, gols pró', () => {
    const ordem = ordenarClassificacao([
      time({ id: 'x', pontos: 3, gols_pro: 2, gols_contra: 1 }),
      time({ id: 'y', pontos: 6 }),
      time({ id: 'z', pontos: 3, gols_pro: 4, gols_contra: 2 }),
      time({ id: 'w', pontos: 3, gols_pro: 3, gols_contra: 2 }),
    ]);
    expect(ordem.map((t) => t.id)).toEqual(['y', 'z', 'w', 'x']);
  });

  it('usa menos cartões só como último desempate', () => {
    const empatados = { pontos: 4, gols_pro: 3, gols_contra: 1 };
    const ordem = ordenarClassificacao([
      time({ id: 'sujo', ...empatados, cartoes_vermelhos: 1 }),
      time({ id: 'limpo', ...empatados, cartoes_amarelos: 2 }),
      time({ id: 'melhor', pontos: 4, gols_pro: 4, gols_contra: 1, cartoes_vermelhos: 3 }),
    ]);
    // "melhor" tem mais saldo — cartões não passam por cima dos critérios anteriores.
    expect(ordem.map((t) => t.id)).toEqual(['melhor', 'limpo', 'sujo']);
  });
});
