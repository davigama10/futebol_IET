import { CheckCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { infoPosicao } from '@/domain/posicoes';
import { cn } from '@/lib/utils';
import type { JogadorRow } from '@/types/database.types';

interface JogadorCardProps {
  jogador: JogadorRow;
  onClick?: () => void;
  selecionado?: boolean;
}

export function JogadorCard({ jogador, onClick, selecionado }: JogadorCardProps) {
  const posicao = infoPosicao(jogador.posicao);

  return (
    <Card
      onClick={onClick}
      className={cn(
        'gap-0 border-border/60 py-0 shadow-sm transition-all duration-150',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md',
        selecionado && 'border-primary bg-primary/5 ring-1 ring-primary/20'
      )}
    >
      <CardContent className="flex items-center gap-3 py-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
            posicao.corAvatar
          )}
        >
          {jogador.nome.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{jogador.nome}</p>
          <p className="text-sm text-muted-foreground">
            Nível {jogador.nivel} · {posicao.label}
          </p>
        </div>

        {selecionado !== undefined &&
          (selecionado ? (
            <Badge className="gap-1">
              <CheckCircle2 className="size-3.5" />
              Selecionado
            </Badge>
          ) : (
            <Badge variant="outline">Selecionar</Badge>
          ))}
      </CardContent>
    </Card>
  );
}
