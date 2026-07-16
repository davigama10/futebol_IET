import { Shirt } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeMontado } from '@/domain/sorteio.types';

interface TimeCardProps {
  time: TimeMontado;
  titulo: string;
}

export function TimeCard({ time, titulo }: TimeCardProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shirt className="size-4.5" />
          </span>
          <CardTitle>{titulo}</CardTitle>
        </div>
        <Badge variant="secondary">Nível {time.somaNivel}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {time.jogadores.map((j) => (
          <div key={j.id} className="flex items-center gap-2 text-sm">
            <span
              className={`size-1.5 shrink-0 rounded-full ${
                j.posicao === 'atacante' ? 'bg-primary' : 'bg-blue-500'
              }`}
            />
            <span className="flex-1">{j.nome}</span>
            <span className="text-muted-foreground">
              {j.nivel} · {j.posicao === 'atacante' ? 'Atacante' : 'Defensor'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
