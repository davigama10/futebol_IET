'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { criarTorneio } from '@/app/actions/torneios';
import { JogadorCard } from '@/components/jogador-card';
import { TimeCard } from '@/components/time-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { sortearTimes } from '@/domain/sorteio';
import type { ResultadoSorteio, TamanhoTime } from '@/domain/sorteio.types';
import { useJogadores } from '@/hooks/useJogadores';
import { normalizarTexto } from '@/lib/texto';
import type { FormatoTorneioRow } from '@/types/database.types';

type Fase = 'dados' | 'jogadores' | 'resultado';

export function NovoTorneioClient({ formatos }: { formatos: FormatoTorneioRow[] }) {
  const { jogadores, loading } = useJogadores();

  const [fase, setFase] = useState<Fase>('dados');
  const [nome, setNome] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [quantidadeTimes, setQuantidadeTimes] = useState(4);
  const [jogadoresPorTime, setJogadoresPorTime] = useState<TamanhoTime>(5);
  const [formatoId, setFormatoId] = useState<string>('');

  const [busca, setBusca] = useState('');
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const [resultado, setResultado] = useState<ResultadoSorteio | null>(null);
  const [salvando, setSalvando] = useState(false);

  const formatosCompativeis = useMemo(
    () => formatos.filter((f) => f.quantidade_times === quantidadeTimes),
    [formatos, quantidadeTimes]
  );

  const totalNecessario = quantidadeTimes * jogadoresPorTime;

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

  function handleContinuarDados() {
    if (!formatoId) {
      toast.error('Escolha um formato de torneio.');
      return;
    }
    setFase('jogadores');
  }

  function handleSortear() {
    const jogadoresSelecionados = jogadores
      .filter((j) => selecionados.has(j.id))
      .map((j) => ({ id: j.id, nome: j.nome, nivel: j.nivel, posicao: j.posicao }));

    const novoResultado = sortearTimes(jogadoresSelecionados, jogadoresPorTime);
    setResultado(novoResultado);
    setFase('resultado');
  }

  async function handleSalvar() {
    if (!resultado) return;
    setSalvando(true);
    const result = await criarTorneio({
      nome: nome.trim() || null,
      data,
      quantidadeTimes,
      jogadoresPorTime,
      formatoId,
      times: resultado.times,
    });
    setSalvando(false);

    if (result?.error) toast.error(result.error);
  }

  if (fase === 'dados') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-xl font-semibold">Novo torneio</h1>

        <div className="space-y-2">
          <Label htmlFor="nome">Nome do torneio (opcional)</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Torneio da Igreja"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data">Data</Label>
          <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qtd-times">Quantidade de times</Label>
          <Input
            id="qtd-times"
            type="number"
            min={2}
            value={quantidadeTimes}
            onChange={(e) => {
              setQuantidadeTimes(Math.max(2, Number(e.target.value) || 2));
              setFormatoId('');
            }}
            className="w-24"
          />
        </div>

        <div className="space-y-2">
          <Label>Jogadores por time</Label>
          <ToggleGroup
            value={[String(jogadoresPorTime)]}
            onValueChange={(vals) => vals[0] && setJogadoresPorTime(Number(vals[0]) as TamanhoTime)}
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

        <div className="space-y-2">
          <Label>Formato do torneio</Label>
          {formatosCompativeis.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum formato cadastrado pra {quantidadeTimes} times. Crie um em{' '}
              <span className="text-primary">Torneios → Formatos</span> antes de continuar.
            </p>
          ) : (
            <Select value={formatoId} onValueChange={(v) => setFormatoId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um formato" />
              </SelectTrigger>
              <SelectContent>
                {formatosCompativeis.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button onClick={handleContinuarDados} className="w-full">
          Continuar
        </Button>
      </div>
    );
  }

  if (fase === 'resultado' && resultado) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Confira o sorteio</h1>
          <Button variant="outline" size="sm" onClick={() => setFase('jogadores')}>
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
              titulo="Avulsos (não entram no torneio)"
            />
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setFase('jogadores')}
            disabled={salvando}
            className="flex-1"
          >
            Cancelar torneio
          </Button>
          <Button onClick={handleSalvar} disabled={salvando} className="flex-1">
            {salvando ? 'Salvando...' : 'Salvar torneio'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quem vai jogar o torneio?</h1>
        <Button variant="outline" size="sm" onClick={() => setFase('dados')}>
          Voltar
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Selecione exatamente <strong>{totalNecessario}</strong> jogadores ({quantidadeTimes} times ×{' '}
        {jogadoresPorTime} jogadores).
      </p>

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
          {selecionados.size} de {totalNecessario} jogador(es) selecionado(s)
        </p>
        <Button onClick={handleSortear} disabled={selecionados.size !== totalNecessario} className="w-full">
          Sortear times
        </Button>
      </div>
    </div>
  );
}
