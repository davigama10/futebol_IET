'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { atualizarFormato, criarFormato, type ConfrontoInput } from '@/app/actions/formatos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormatoFormProps {
  formatoId?: string;
  valoresIniciais?: {
    nome: string;
    quantidadeTimes: number;
    confrontos: ConfrontoInput[];
  };
}

export function FormatoForm({ formatoId, valoresIniciais }: FormatoFormProps) {
  const [nome, setNome] = useState(valoresIniciais?.nome ?? '');
  const [quantidadeTimes, setQuantidadeTimes] = useState(valoresIniciais?.quantidadeTimes ?? 4);
  const [confrontos, setConfrontos] = useState<ConfrontoInput[]>(
    valoresIniciais?.confrontos ?? [{ timeAIndice: 1, timeBIndice: 2 }]
  );
  const [enviando, setEnviando] = useState(false);

  const opcoesTime = Array.from({ length: quantidadeTimes }, (_, i) => i + 1);

  function adicionarConfronto() {
    setConfrontos((atual) => [...atual, { timeAIndice: 1, timeBIndice: 2 }]);
  }

  function removerConfronto(index: number) {
    setConfrontos((atual) => atual.filter((_, i) => i !== index));
  }

  function atualizarConfronto(index: number, campo: keyof ConfrontoInput, valor: number) {
    setConfrontos((atual) => atual.map((c, i) => (i === index ? { ...c, [campo]: valor } : c)));
  }

  async function handleSalvar() {
    if (!nome.trim()) {
      toast.error('Informe o nome do formato.');
      return;
    }
    if (confrontos.length === 0) {
      toast.error('Adicione pelo menos um confronto.');
      return;
    }
    const invalido = confrontos.some(
      (c) =>
        c.timeAIndice < 1 ||
        c.timeAIndice > quantidadeTimes ||
        c.timeBIndice < 1 ||
        c.timeBIndice > quantidadeTimes ||
        c.timeAIndice === c.timeBIndice
    );
    if (invalido) {
      toast.error(
        'Confira os confrontos: os times precisam ser diferentes e dentro da quantidade escolhida.'
      );
      return;
    }

    setEnviando(true);
    const result = formatoId
      ? await atualizarFormato(formatoId, nome.trim(), quantidadeTimes, confrontos)
      : await criarFormato(nome.trim(), quantidadeTimes, confrontos);
    setEnviando(false);

    if (result?.error) toast.error(result.error);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do formato</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Todos contra todos"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="qtd">Quantidade de times</Label>
        <Input
          id="qtd"
          type="number"
          min={2}
          value={quantidadeTimes}
          onChange={(e) => setQuantidadeTimes(Math.max(2, Number(e.target.value) || 2))}
          className="w-24"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Confrontos (na ordem que vão acontecer)</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={adicionarConfronto}
            className="gap-1"
          >
            <Plus className="size-4" />
            Confronto
          </Button>
        </div>

        {confrontos.map((c, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="flex items-center gap-2 py-3">
              <span className="w-16 shrink-0 text-sm text-muted-foreground">Partida {i + 1}</span>
              <Select
                value={String(c.timeAIndice)}
                onValueChange={(v) => atualizarConfronto(i, 'timeAIndice', Number(v))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opcoesTime.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Time {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">x</span>
              <Select
                value={String(c.timeBIndice)}
                onValueChange={(v) => atualizarConfronto(i, 'timeBIndice', Number(v))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opcoesTime.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Time {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => removerConfronto(i)}
                aria-label="Remover confronto"
              >
                <Trash2 className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSalvar} disabled={enviando} className="w-full">
        {enviando ? 'Salvando...' : 'Salvar formato'}
      </Button>
    </div>
  );
}
