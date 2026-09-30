export type Posicao = 'atacante' | 'meio_campo' | 'defensor' | 'goleiro';

export const ROTULO_POSICAO: Record<Posicao, string> = {
  atacante: 'Atacante',
  meio_campo: 'Meio-campo',
  defensor: 'Defensor',
  goleiro: 'Goleiro',
};

export interface JogadorSorteio {
  id: string;
  nome: string;
  nivel: number; // 1-5
  posicao: Posicao;
}

export interface TimeMontado {
  jogadores: JogadorSorteio[];
  somaNivel: number;
}

export interface ResultadoSorteio {
  times: TimeMontado[];
  avulsos: JogadorSorteio[];
}

export type TamanhoTime = 4 | 5 | 6;
