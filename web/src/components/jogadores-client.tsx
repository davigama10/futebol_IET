'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { JogadorCard } from '@/components/jogador-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useJogadores } from '@/hooks/useJogadores';
import { normalizarTexto } from '@/lib/texto';

export function JogadoresClient({ admin }: { admin: boolean }) {
  const { jogadores, loading, error } = useJogadores();
  const [busca, setBusca] = useState('');

  const jogadoresFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);
    if (!termo) return jogadores;
    return jogadores.filter((j) => normalizarTexto(j.nome).includes(termo));
  }, [jogadores, busca]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Jogadores</h1>
        {admin && (
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/jogadores/novo">Novo jogador</Link>}
          />
        )}
      </div>

      <Input
        placeholder="Buscar jogador pelo nome"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : jogadoresFiltrados.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {busca ? 'Nenhum jogador encontrado.' : 'Nenhum jogador cadastrado ainda.'}
        </p>
      ) : (
        <div className="space-y-2">
          {jogadoresFiltrados.map((j) =>
            admin ? (
              <Link key={j.id} href={`/jogadores/${j.id}`}>
                <JogadorCard jogador={j} />
              </Link>
            ) : (
              <JogadorCard key={j.id} jogador={j} />
            )
          )}
        </div>
      )}
    </div>
  );
}
