import { Goal, Handshake } from 'lucide-react';

import { RankingLista } from '@/components/ranking-lista';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RankingEntry {
  jogadorId: string;
  nome: string;
  total: number;
}

interface RankingMensalProps {
  mesLabel: string;
  artilheiros: RankingEntry[];
  garcons: RankingEntry[];
}

export function RankingMensal({ mesLabel, artilheiros, garcons }: RankingMensalProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Artilharia de {mesLabel}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Goal className="size-4 text-primary" />
            Gols
          </div>
          <RankingLista entradas={artilheiros} sufixo="gol(s)" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Handshake className="size-4 text-primary" />
            Assistências
          </div>
          <RankingLista entradas={garcons} sufixo="assist." />
        </div>
      </CardContent>
    </Card>
  );
}
