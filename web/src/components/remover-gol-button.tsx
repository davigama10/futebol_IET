'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { removerGol } from '@/app/actions/partidas';
import { Button } from '@/components/ui/button';

export function RemoverGolButton({ eventoId }: { eventoId: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  async function handleRemover() {
    setEnviando(true);
    const result = await removerGol(eventoId);
    setEnviando(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Gol removido.');
    router.refresh();
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      disabled={enviando}
      onClick={handleRemover}
      aria-label="Remover gol"
    >
      <Trash2 />
    </Button>
  );
}
