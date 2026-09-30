'use client';

import { Hand, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { adicionarGoleiro, removerGoleiro } from '@/app/actions/torneios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RankingEntry } from '@/lib/torneio-stats';

interface GoleirosTorneioProps {
  torneioId: string;
  /** Goleiros do torneio com o total de defesas, já ordenados. */
  defesas: RankingEntry[];
  /** Jogadores com função Goleiro que ainda não estão no torneio (só pra admin). */
  disponiveis: { id: string; nome: string }[];
  admin: boolean;
}

export function GoleirosTorneio({ torneioId, defesas, disponiveis, admin }: GoleirosTorneioProps) {
  const router = useRouter();
  const [novoId, setNovoId] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function executar(acao: () => Promise<{ error: string | null }>, sucesso: string) {
    setEnviando(true);
    const result = await acao();
    setEnviando(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(sucesso);
    router.refresh();
  }

  function handleAdicionar() {
    const goleiro = disponiveis.find((g) => g.id === novoId);
    if (!goleiro) return;
    setNovoId('');
    executar(() => adicionarGoleiro(torneioId, goleiro), 'Goleiro adicionado.');
  }

  return (
    <div className="space-y-4">
      {defesas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum goleiro neste torneio.</p>
      ) : (
        <ol className="space-y-1.5">
          {defesas.map((g, i) => (
            <li key={g.jogadorId} className="flex items-center gap-2 text-sm">
              <span className="w-4 shrink-0 text-muted-foreground">{i + 1}º</span>
              <Hand className="size-4 shrink-0 text-violet-500" />
              <span className="flex-1 truncate">{g.nome}</span>
              <Badge variant="secondary">{g.total} defesa(s)</Badge>
              {admin && (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={enviando}
                  onClick={() =>
                    executar(() => removerGoleiro(torneioId, g.jogadorId), 'Goleiro removido.')
                  }
                  aria-label={`Remover ${g.nome} do torneio`}
                >
                  <Trash2 />
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}

      {admin && disponiveis.length > 0 && (
        <div className="flex gap-2">
          <Select value={novoId} onValueChange={(v) => setNovoId(v ?? '')}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Adicionar goleiro ao torneio" />
            </SelectTrigger>
            <SelectContent>
              {disponiveis.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdicionar} disabled={!novoId || enviando}>
            Adicionar
          </Button>
        </div>
      )}
    </div>
  );
}
