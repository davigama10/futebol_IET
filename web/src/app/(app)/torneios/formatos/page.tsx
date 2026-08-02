import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { FormatoRow } from '@/components/formato-row';
import { Button } from '@/components/ui/button';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export default async function FormatosPage() {
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) redirect('/torneios');

  const supabase = await createClient();
  const { data: formatos } = await supabase
    .from('formatos_torneio')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Formatos de torneio</h1>
        <Button size="sm" render={<Link href="/torneios/formatos/novo" />} className="gap-1">
          <Plus className="size-4" />
          Novo formato
        </Button>
      </div>

      {!formatos || formatos.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhum formato cadastrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {formatos.map((f) => (
            <FormatoRow key={f.id} formato={f} />
          ))}
        </div>
      )}
    </div>
  );
}
