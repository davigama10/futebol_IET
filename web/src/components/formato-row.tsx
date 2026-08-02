'use client';

import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { excluirFormato } from '@/app/actions/formatos';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { FormatoTorneioRow } from '@/types/database.types';

export function FormatoRow({ formato }: { formato: FormatoTorneioRow }) {
  const [excluindo, setExcluindo] = useState(false);

  async function handleExcluir() {
    setExcluindo(true);
    const { error } = await excluirFormato(formato.id);
    setExcluindo(false);

    if (error) toast.error(error);
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">{formato.nome}</p>
          <p className="text-sm text-muted-foreground">{formato.quantidade_times} times</p>
        </div>
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" render={<Link href={`/torneios/formatos/${formato.id}`} />}>
            <Pencil />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="icon-sm" variant="ghost" disabled={excluindo}>
                  <Trash2 />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir formato</AlertDialogTitle>
                <AlertDialogDescription>
                  Remover o formato &quot;{formato.nome}&quot;? Se ele já foi usado em algum torneio,
                  a exclusão será bloqueada automaticamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleExcluir}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
