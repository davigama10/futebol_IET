'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

export interface JogadorRef {
  id: string;
  nome: string;
}

export interface TimeDoTorneio {
  id: string;
  indice: number;
  jogadores: JogadorRef[];
}

export interface GrupoJogadores {
  titulo: string;
  jogadores: JogadorRef[];
}

/**
 * Todos os participantes do torneio fora do time `excluirTimeId`, agrupados por time (+ goleiros)
 * — é a lista do "Outros", pra quem está completando um time que não é o seu.
 */
export function montarGruposOutros(
  times: TimeDoTorneio[],
  goleiros: JogadorRef[],
  excluirTimeId: string
): GrupoJogadores[] {
  const grupos = times
    .filter((t) => t.id !== excluirTimeId)
    .sort((a, b) => a.indice - b.indice)
    .map((t) => ({ titulo: `Time ${t.indice}`, jogadores: t.jogadores }));
  if (goleiros.length > 0) grupos.push({ titulo: 'Goleiros', jogadores: goleiros });
  return grupos;
}

interface SeletorJogadorProps {
  principais: JogadorRef[];
  outros: GrupoJogadores[];
  onEscolher: (jogadorId: string) => void;
  disabled?: boolean;
  /** Ids que não podem ser escolhidos (ex: o próprio autor do gol na assistência). */
  excluir?: string[];
}

export function SeletorJogador({ principais, outros, onEscolher, disabled, excluir = [] }: SeletorJogadorProps) {
  const [mostrarOutros, setMostrarOutros] = useState(false);
  const filtrar = (lista: JogadorRef[]) => lista.filter((j) => !excluir.includes(j.id));

  const gruposOutros = outros
    .map((g) => ({ ...g, jogadores: filtrar(g.jogadores) }))
    .filter((g) => g.jogadores.length > 0);

  function botao(j: JogadorRef) {
    return (
      <Button
        key={j.id}
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => onEscolher(j.id)}
        className="w-full justify-start"
      >
        {j.nome}
      </Button>
    );
  }

  return (
    <div className="max-h-80 space-y-1 overflow-y-auto">
      {filtrar(principais).map(botao)}

      {gruposOutros.length > 0 && (
        <Button
          type="button"
          size="sm"
          variant={mostrarOutros ? 'secondary' : 'ghost'}
          onClick={() => setMostrarOutros((v) => !v)}
          className="w-full"
        >
          {mostrarOutros ? 'Ocultar outros' : 'Outros (jogador completando o time)'}
        </Button>
      )}

      {mostrarOutros &&
        gruposOutros.map((g) => (
          <div key={g.titulo} className="space-y-1 pt-1">
            <p className="text-xs font-medium text-muted-foreground">{g.titulo}</p>
            {g.jogadores.map(botao)}
          </div>
        ))}
    </div>
  );
}
