'use client';

import { MessageCircle, Shuffle } from 'lucide-react';
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
import { ehGoleiro } from '@/domain/posicoes';
import { contarDuplasRepetidas, sortearTimes } from '@/domain/sorteio';
import type { ResultadoSorteio, TamanhoTime } from '@/domain/sorteio.types';
import { useJogadores } from '@/hooks/useJogadores';
import { compartilharNoWhatsApp, montarMensagemSorteio } from '@/lib/mensagens';
import { normalizarTexto } from '@/lib/texto';
import type { FormatoTorneioRow, JogadorRow } from '@/types/database.types';

type Fase = 'dados' | 'goleiros' | 'jogadores' | 'resultado';

interface NovoTorneioClientProps {
  formatos: FormatoTorneioRow[];
  timesAnteriores: string[][];
}

export function NovoTorneioClient({ formatos, timesAnteriores }: NovoTorneioClientProps) {
  const { jogadores, loading } = useJogadores();
  const [goleirosSelecionados, setGoleirosSelecionados] = useState<Set<string>>(new Set());

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

  const goleiros = useMemo(() => jogadores.filter(ehGoleiro), [jogadores]);

  // Jogadores de linha entram no sorteio. Goleiros que não foram escolhidos como goleiros do
  // torneio aparecem num grupo à parte, caso queiram jogar na linha.
  const { linhaFiltrados, goleirosNaLinhaFiltrados } = useMemo(() => {
    const termo = normalizarTexto(busca);
    const filtrados = termo
      ? jogadores.filter((j) => normalizarTexto(j.nome).includes(termo))
      : jogadores;
    return {
      linhaFiltrados: filtrados.filter((j) => !ehGoleiro(j)),
      goleirosNaLinhaFiltrados: filtrados.filter(
        (j) => ehGoleiro(j) && !goleirosSelecionados.has(j.id)
      ),
    };
  }, [jogadores, busca, goleirosSelecionados]);

  const todosFiltradosSelecionados =
    linhaFiltrados.length > 0 && linhaFiltrados.every((j) => selecionados.has(j.id));

  // Quem foi escolhido como goleiro do torneio não pode estar também entre os de linha.
  const selecionadosLinha = useMemo(
    () => new Set([...selecionados].filter((id) => !goleirosSelecionados.has(id))),
    [selecionados, goleirosSelecionados]
  );

  const duplasRepetidas = useMemo(
    () => (resultado ? contarDuplasRepetidas(resultado.times, timesAnteriores) : 0),
    [resultado, timesAnteriores]
  );

  function alternarSelecao(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarGoleiro(id: string) {
    setGoleirosSelecionados((atual) => {
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
        linhaFiltrados.forEach((j) => novo.delete(j.id));
      } else {
        linhaFiltrados.forEach((j) => novo.add(j.id));
      }
      return novo;
    });
  }

  function handleContinuarDados() {
    if (!formatoId) {
      toast.error('Escolha um formato de torneio.');
      return;
    }
    setFase('goleiros');
  }

  function handleSortear() {
    const jogadoresSelecionados = jogadores
      .filter((j) => selecionadosLinha.has(j.id))
      .map((j) => ({ id: j.id, nome: j.nome, nivel: j.nivel, posicao: j.posicao }));

    const novoResultado = sortearTimes(jogadoresSelecionados, jogadoresPorTime, { timesAnteriores });
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
      goleiros: goleiros
        .filter((g) => goleirosSelecionados.has(g.id))
        .map((g) => ({ id: g.id, nome: g.nome })),
    });
    setSalvando(false);

    if (result?.error) toast.error(result.error);
  }

  function handleCompartilhar() {
    if (!resultado) return;
    compartilharNoWhatsApp(montarMensagemSorteio(resultado));
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

  if (fase === 'goleiros') {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Goleiros do torneio</h1>
          <Button variant="outline" size="sm" onClick={() => setFase('dados')}>
            Voltar
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Os goleiros escolhidos aqui não entram no sorteio dos times de linha — ficam disponíveis
          para as partidas e têm as defesas contabilizadas. É opcional.
        </p>

        <ListaSelecao
          loading={loading}
          jogadores={goleiros}
          selecionados={goleirosSelecionados}
          onAlternar={alternarGoleiro}
          vazio="Nenhum jogador cadastrado com a função Goleiro."
        />

        <div className="sticky bottom-0 border-t bg-background py-3">
          <p className="mb-2 text-sm text-muted-foreground">
            {goleirosSelecionados.size} goleiro(s) selecionado(s)
          </p>
          <Button onClick={() => setFase('jogadores')} className="w-full">
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  if (fase === 'resultado' && resultado) {
    const goleirosDoTorneio = goleiros.filter((g) => goleirosSelecionados.has(g.id));

    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Confira o sorteio</h1>
          <Button variant="outline" size="sm" onClick={() => setFase('jogadores')}>
            Voltar
          </Button>
        </div>

        {timesAnteriores.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {duplasRepetidas === 0
              ? 'Nenhuma dupla repetida do último sorteio.'
              : `${duplasRepetidas} dupla(s) de companheiros repetida(s) do último sorteio (o mínimo possível mantendo os times equilibrados).`}
          </p>
        )}

        <Button variant="outline" onClick={handleSortear} disabled={salvando} className="w-full gap-2">
          <Shuffle className="size-4" />
          Sortear de novo
        </Button>

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
          {goleirosDoTorneio.length > 0 && (
            <div className="rounded-xl border border-border/60 p-4 text-sm shadow-sm">
              <p className="mb-2 font-medium">Goleiros</p>
              <ul className="space-y-1">
                {goleirosDoTorneio.map((g) => (
                  <li key={g.id}>{g.nome}</li>
                ))}
              </ul>
            </div>
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

        <Button variant="outline" onClick={handleCompartilhar} className="w-full gap-2">
          <MessageCircle className="size-4" />
          Compartilhar times no WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quem vai jogar o torneio?</h1>
        <Button variant="outline" size="sm" onClick={() => setFase('goleiros')}>
          Voltar
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Selecione exatamente <strong>{totalNecessario}</strong> jogadores de linha ({quantidadeTimes}{' '}
        times × {jogadoresPorTime} jogadores).
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
          disabled={linhaFiltrados.length === 0}
        >
          {todosFiltradosSelecionados ? 'Desmarcar todos' : 'Marcar todos'}
        </Button>
      </div>

      <ListaSelecao
        loading={loading}
        jogadores={linhaFiltrados}
        selecionados={selecionadosLinha}
        onAlternar={alternarSelecao}
        vazio={busca ? 'Nenhum jogador encontrado.' : 'Nenhum jogador cadastrado ainda.'}
      />

      {!loading && goleirosNaLinhaFiltrados.length > 0 && (
        <div className="space-y-2">
          <p className="pt-2 text-sm font-medium">Goleiros (se forem jogar na linha)</p>
          <ListaSelecao
            loading={false}
            jogadores={goleirosNaLinhaFiltrados}
            selecionados={selecionadosLinha}
            onAlternar={alternarSelecao}
            vazio=""
          />
        </div>
      )}

      <div className="sticky bottom-0 border-t bg-background py-3">
        <p className="mb-2 text-sm text-muted-foreground">
          {selecionadosLinha.size} de {totalNecessario} jogador(es) selecionado(s)
        </p>
        <Button
          onClick={handleSortear}
          disabled={selecionadosLinha.size !== totalNecessario}
          className="w-full"
        >
          Sortear times
        </Button>
      </div>
    </div>
  );
}

interface ListaSelecaoProps {
  loading: boolean;
  jogadores: JogadorRow[];
  selecionados: Set<string>;
  onAlternar: (id: string) => void;
  vazio: string;
}

function ListaSelecao({ loading, jogadores, selecionados, onAlternar, vazio }: ListaSelecaoProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (jogadores.length === 0) {
    return vazio ? <p className="py-8 text-center text-muted-foreground">{vazio}</p> : null;
  }

  return (
    <div className="space-y-2">
      {jogadores.map((j) => (
        <JogadorCard
          key={j.id}
          jogador={j}
          selecionado={selecionados.has(j.id)}
          onClick={() => onAlternar(j.id)}
        />
      ))}
    </div>
  );
}
