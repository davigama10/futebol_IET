'use client';

import { Hand } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { salvarDefesas } from '@/app/actions/partidas';
import { NumberStepper } from '@/components/number-stepper';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface DefesasGoleirosProps {
  partidaId: string;
  goleiros: { id: string; nome: string }[];
  defesasIniciais: Record<string, number>;
  editavel: boolean;
}

export function DefesasGoleiros({ partidaId, goleiros, defesasIniciais, editavel }: DefesasGoleirosProps) {
  const router = useRouter();
  const [defesas, setDefesas] = useState(defesasIniciais);
  // Cada alteração é salva na hora, em fila: as gravações chegam ao servidor na ordem dos cliques
  // e o valor final é sempre o último que aparece na tela.
  const fila = useRef<Promise<unknown>>(Promise.resolve());

  function alterar(jogadorId: string, valor: number) {
    setDefesas((atual) => ({ ...atual, [jogadorId]: valor }));
    fila.current = fila.current.then(async () => {
      const result = await salvarDefesas(partidaId, jogadorId, valor);
      if (result.error) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  if (goleiros.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum goleiro neste torneio. Adicione na aba Goleiros do torneio.
      </p>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="space-y-2 py-3">
        {goleiros.map((g) => {
          const valor = defesas[g.id] ?? 0;
          return (
            <div key={g.id} className="flex items-center gap-2 text-sm">
              <Hand className="size-4 shrink-0 text-violet-500" />
              <span className="flex-1 truncate">{g.nome}</span>
              {editavel ? (
                <NumberStepper
                  value={valor}
                  onChange={(n) => alterar(g.id, n)}
                  ariaLabel={`defesas de ${g.nome}`}
                  size="icon-sm"
                />
              ) : (
                <Badge variant="secondary">{valor} defesa(s)</Badge>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
