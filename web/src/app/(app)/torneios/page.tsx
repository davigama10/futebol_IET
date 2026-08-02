import { ListChecks, Plus } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export default async function TorneiosPage() {
  const profile = await getUserProfile();
  const admin = isAdmin(profile?.role);

  const supabase = await createClient();
  const { data: torneios } = await supabase
    .from('torneios')
    .select('*')
    .order('data', { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Torneios</h1>
        {admin && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" render={<Link href="/torneios/formatos" />} className="gap-1">
              <ListChecks className="size-4" />
              Formatos
            </Button>
            <Button size="sm" render={<Link href="/torneios/novo" />} className="gap-1">
              <Plus className="size-4" />
              Novo torneio
            </Button>
          </div>
        )}
      </div>

      {!torneios || torneios.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhum torneio criado ainda.</p>
      ) : (
        <div className="space-y-2">
          {torneios.map((t) => {
            const dataFormatada = new Date(`${t.data}T00:00:00`).toLocaleDateString('pt-BR');
            return (
              <Link key={t.id} href={`/torneios/${t.id}`}>
                <Card className="border-border/60 shadow-sm transition hover:border-primary/50">
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{t.nome || `Torneio de ${dataFormatada}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {dataFormatada} · {t.quantidade_times} times
                      </p>
                    </div>
                    <Badge variant={t.status === 'finalizado' ? 'secondary' : 'default'}>
                      {t.status === 'finalizado' ? 'Finalizado' : 'Em andamento'}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
