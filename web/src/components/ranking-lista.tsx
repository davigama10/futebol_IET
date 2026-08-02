import { Badge } from '@/components/ui/badge';

interface RankingEntry {
  jogadorId: string;
  nome: string;
  total: number;
}

interface RankingListaProps {
  entradas: RankingEntry[];
  sufixo: string;
  vazio?: string;
}

export function RankingLista({
  entradas,
  sufixo,
  vazio = 'Sem estatísticas registradas ainda.',
}: RankingListaProps) {
  if (entradas.length === 0) {
    return <p className="text-sm text-muted-foreground">{vazio}</p>;
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
