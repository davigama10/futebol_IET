'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { removerCartao, removerGol } from '@/app/actions/partidas';
import { Button } from '@/components/ui/button';

interface RemoverGolButtonProps {
  eventoId: string;
  /** Tipo de evento removido — gol (padrão) ou cartão. */
  tipo?: 'gol' | 'cartao';
}

export function RemoverGolButton({ eventoId, tipo = 'gol' }: RemoverGolButtonProps) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const ehCartao = tipo === 'cartao';

  async function handleRemover() {
    setEnviando(true);
    const result = ehCartao ? await removerCartao(eventoId) : await removerGol(eventoId);
    setEnviando(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(ehCartao ? 'Cartão removido.' : 'Gol removido.');
    router.refresh();
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      disabled={enviando}
      onClick={handleRemover}
      aria-label={ehCartao ? 'Remover cartão' : 'Remover gol'}
    >
      <Trash2 />
    </Button>
  );
}
