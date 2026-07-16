import { Goal, Handshake } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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

function Lista({ entradas, sufixo }: { entradas: RankingEntry[]; sufixo: string }) {
  if (entradas.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem estatísticas registradas ainda.</p>;
  }

  return (
    <ol className="space-y-1.5">
      {entradas.map((e, i) => (
        <li key={e.jogadorId} className="flex items-center gap-2 text-sm">
          <span className="w-4 shrink-0 text-muted-foreground">{i + 1}º</span>
          <span className="flex-1 truncate">{e.nome}</span>
          <Badge variant="secondary">
            {e.total} {sufixo}
          </Badge>
        </li>
      ))}
    </ol>
  );
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
          <Lista entradas={artilheiros} sufixo="gol(s)" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Handshake className="size-4 text-primary" />
            Assistências
          </div>
          <Lista entradas={garcons} sufixo="assist." />
        </div>
      </CardContent>
    </Card>
  );
}
