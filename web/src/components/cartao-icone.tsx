import { cn } from '@/lib/utils';
import type { TipoCartao } from '@/types/database.types';

export function CartaoIcone({ tipo, className }: { tipo: TipoCartao; className?: string }) {
  return (
    <span
      aria-label={tipo === 'amarelo' ? 'Cartão amarelo' : 'Cartão vermelho'}
      className={cn(
        'inline-block h-3.5 w-2.5 shrink-0 rounded-[2px]',
        tipo === 'amarelo' ? 'bg-yellow-400' : 'bg-red-600',
        className
      )}
    />
  );
}
