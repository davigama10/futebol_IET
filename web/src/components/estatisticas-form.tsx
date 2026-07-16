'use client';

import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { salvarEstatisticas } from '@/app/actions/estatisticas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { JogadorSorteio } from '@/domain/sorteio.types';
import { compartilharNoWhatsApp, montarMensagemEstatisticas } from '@/lib/mensagens';

interface EstatisticasIniciais {
  [jogadorId: string]: { gols: number; assistencias: number };
}

interface EstatisticasFormProps {
  sorteioId: string;
  dataLabel: string;
  jogadores: JogadorSorteio[];
  iniciais: EstatisticasIniciais;
  admin: boolean;
}

export function EstatisticasForm({
  sorteioId,
  dataLabel,
  jogadores,
  iniciais,
  admin,
}: EstatisticasFormProps) {
  const [valores, setValores] = useState<EstatisticasIniciais>(() => {
    const base: EstatisticasIniciais = {};
    jogadores.forEach((j) => {
      base[j.id] = iniciais[j.id] ?? { gols: 0, assistencias: 0 };
    });
    return base;
  });
  const [salvando, setSalvando] = useState(false);

  function atualizar(jogadorId: string, campo: 'gols' | 'assistencias', valor: string) {
    const n = Math.max(0, Number(valor) || 0);
    setValores((atual) => ({
      ...atual,
      [jogadorId]: { ...atual[jogadorId], [campo]: n },
    }));
  }

  async function handleSalvar() {
    setSalvando(true);
    const estatisticas = jogadores.map((j) => ({
      jogadorId: j.id,
      gols: valores[j.id]?.gols ?? 0,
      assistencias: valores[j.id]?.assistencias ?? 0,
    }));
    const { error } = await salvarEstatisticas(sorteioId, estatisticas);
    setSalvando(false);

    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Estatísticas salvas.');
  }

  function handleCompartilhar() {
    compartilharNoWhatsApp(montarMensagemEstatisticas(dataLabel, jogadores, valores));
  }

  const temEstatistica = jogadores.some((j) => {
    const v = valores[j.id];
    return v && (v.gols > 0 || v.assistencias > 0);
  });

  if (!admin) {
    if (!temEstatistica) return null;

    return (
      <div className="space-y-2 border-t border-border/60 pt-3">
        <p className="text-sm font-medium">Gols e assistências</p>
        {jogadores
          .filter((j) => valores[j.id] && (valores[j.id].gols > 0 || valores[j.id].assistencias > 0))
          .map((j) => (
            <p key={j.id} className="text-sm text-muted-foreground">
              {j.nome} — {valores[j.id].gols} gol(s), {valores[j.id].assistencias} assistência(s)
            </p>
          ))}
        <Button size="sm" variant="outline" onClick={handleCompartilhar} className="gap-2">
          <MessageCircle className="size-4" />
          Compartilhar no WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-border/60 pt-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Gols e assistências</p>
        <div className="flex gap-2 pr-16 text-xs text-muted-foreground">
          <span className="w-16 text-center">Gols</span>
          <span className="w-16 text-center">Assist.</span>
        </div>
      </div>
      <div className="space-y-2">
        {jogadores.map((j) => (
          <div key={j.id} className="flex items-center gap-2">
            <span className="flex-1 truncate text-sm">{j.nome}</span>
            <Input
              type="number"
              min={0}
              value={valores[j.id]?.gols ?? 0}
              onChange={(e) => atualizar(j.id, 'gols', e.target.value)}
              className="w-16 text-center"
              aria-label={`Gols de ${j.nome}`}
            />
            <Input
              type="number"
              min={0}
              value={valores[j.id]?.assistencias ?? 0}
              onChange={(e) => atualizar(j.id, 'assistencias', e.target.value)}
              className="w-16 text-center"
              aria-label={`Assistências de ${j.nome}`}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleSalvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar estatísticas'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCompartilhar}
          disabled={!temEstatistica}
          className="gap-2"
        >
          <MessageCircle className="size-4" />
          Compartilhar no WhatsApp
        </Button>
      </div>
    </div>
  );
}
