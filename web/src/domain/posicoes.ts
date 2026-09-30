import type { Posicao } from './sorteio.types';

// Fonte única dos rótulos/cores das funções — formulário, cards e listas leem daqui.
export const POSICOES: { valor: Posicao; label: string; corPonto: string; corAvatar: string }[] = [
  { valor: 'atacante', label: 'Atacante', corPonto: 'bg-primary', corAvatar: 'bg-primary/10 text-primary' },
  {
    valor: 'meio_campo',
    label: 'Meio-campo',
    corPonto: 'bg-amber-500',
    corAvatar: 'bg-amber-500/10 text-amber-600',
  },
  {
    valor: 'defensor',
    label: 'Defensor',
    corPonto: 'bg-blue-500',
    corAvatar: 'bg-blue-500/10 text-blue-600',
  },
  {
    valor: 'goleiro',
    label: 'Goleiro',
    corPonto: 'bg-violet-500',
    corAvatar: 'bg-violet-500/10 text-violet-600',
  },
];

const POR_VALOR = new Map(POSICOES.map((p) => [p.valor, p]));

export function infoPosicao(posicao: Posicao) {
  return POR_VALOR.get(posicao) ?? POSICOES[0];
}

export function ehGoleiro(jogador: { posicao: Posicao }) {
  return jogador.posicao === 'goleiro';
}
