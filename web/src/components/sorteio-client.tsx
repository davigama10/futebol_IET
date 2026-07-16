'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { salvarSorteio } from '@/app/actions/sorteio';
import { JogadorCard } from '@/components/jogador-card';
import { TimeCard } from '@/components/time-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { sortearTimes } from '@/domain/sorteio';
import type { ResultadoSorteio, TamanhoTime } from '@/domain/sorteio.types';
import { useJogadores } from '@/hooks/useJogadores';
import { normalizarTexto } from '@/lib/texto';

type Fase = 'selecionando' | 'resultado';

export function SorteioClient() {
  const { jogadores, loading } = useJogadores();
  const [busca, setBusca] = useState('');
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [tamanhoTime, setTamanhoTime] = useState<TamanhoTime>(5);
  const [fase, setFase] = useState<Fase>('selecionando');
  const [resultado, setResultado] = useState<ResultadoSorteio | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const jogadoresFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);
    if (!termo) return jogadores;
    return jogadores.filter((j) => normalizarTexto(j.nome).includes(termo));
  }, [jogadores, busca]);

  const todosFiltradosSelecionados =
    jogadoresFiltrados.length > 0 && jogadoresFiltrados.every((j) => selecionados.has(j.id));

  function alternarSelecao(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarSelecaoTodos() {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (todosFiltradosSelecionados) {
        jogadoresFiltrados.forEach((j) => novo.delete(j.id));
      } else {
        jogadoresFiltrados.forEach((j) => novo.add(j.id));
      }
      return novo;
    });
  }

  function handleSortear() {
    const jogadoresSelecionados = jogadores
      .filter((j) => selecionados.has(j.id))
      .map((j) => ({ id: j.id, nome: j.nome, nivel: j.nivel, posicao: j.posicao }));

    setResultado(sortearTimes(jogadoresSelecionados, tamanhoTime));
    setSalvo(false);
    setFase('resultado');
  }

  async function handleSalvar() {
    if (!resultado) return;
    setSalvando(true);
    const { error } = await salvarSorteio(resultado, tamanhoTime);
    setSalvando(false);

    if (error) {
      toast.error(error);
      return;
    }
    setSalvo(true);
    toast.success('Sorteio salvo no histórico.');
  }

  if (fase === 'resultado' && resultado) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Times sorteados</h1>
          <Button variant="outline" size="sm" onClick={() => setFase('selecionando')}>
            Voltar
          </Button>
        </div>

        <div className="space-y-4">
          {resultado.times.map((time, i) => (
            <TimeCard key={i} time={time} titulo={`Time ${i + 1}`} />
          ))}

          {resultado.avulsos.length > 0 && (
            <TimeCard
              time={{
                jogadores: resultado.avulsos,
                somaNivel: resultado.avulsos.reduce((acc, j) => acc + j.nivel, 0),
              }}
              titulo="Avulsos (decidir em campo)"
            />
          )}
        </div>

        <Button onClick={handleSalvar} disabled={salvando || salvo} className="w-full">
          {salvo ? 'Salvo no histórico' : salvando ? 'Salvando...' : 'Salvar no histórico'}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">⚽ Quem vai jogar esta semana?</h1>

      <div className="space-y-2">
        <p className="text-sm font-medium">Tamanho do time</p>
        <ToggleGroup
          value={[String(tamanhoTime)]}
          onValueChange={(vals) => vals[0] && setTamanhoTime(Number(vals[0]) as TamanhoTime)}
          variant="outline"
          className="w-full"
        >
          {[4, 5, 6].map((n) => (
            <ToggleGroupItem key={n} value={String(n)} className="flex-1">
              {n} por time
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Input
        placeholder="Buscar jogador pelo nome"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={alternarSelecaoTodos}
          disabled={jogadoresFiltrados.length === 0}
        >
          {todosFiltradosSelecionados ? 'Desmarcar todos' : 'Marcar todos'}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : jogadoresFiltrados.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {busca ? 'Nenhum jogador encontrado.' : 'Nenhum jogador cadastrado ainda.'}
        </p>
      ) : (
        <div className="space-y-2">
          {jogadoresFiltrados.map((j) => (
            <JogadorCard
              key={j.id}
              jogador={j}
              selecionado={selecionados.has(j.id)}
              onClick={() => alternarSelecao(j.id)}
            />
          ))}
        </div>
      )}

      <div className="sticky bottom-0 border-t bg-background py-3">
        <p className="mb-2 text-sm text-muted-foreground">
          {selecionados.size} jogador(es) selecionado(s)
        </p>
        <Button onClick={handleSortear} disabled={selecionados.size === 0} className="w-full">
          Sortear times
        </Button>
      </div>
    </div>
  );
}
