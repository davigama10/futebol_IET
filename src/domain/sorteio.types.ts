export type Posicao = 'atacante' | 'defensor';

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
