import { notFound, redirect } from 'next/navigation';

import { FormatoForm } from '@/components/formato-form';
import { isAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export default async function EditarFormatoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getUserProfile();
  if (!isAdmin(profile?.role)) redirect('/torneios');

  const supabase = await createClient();
  const [{ data: formato }, { data: confrontos }] = await Promise.all([
    supabase.from('formatos_torneio').select('*').eq('id', id).single(),
    supabase.from('formato_partidas').select('*').eq('formato_id', id).order('ordem'),
  ]);

  if (!formato) notFound();

  return (
    <div className="space-y-4">
      <h1 className="mx-auto max-w-2xl text-xl font-semibold">Editar formato</h1>
      <FormatoForm
        formatoId={formato.id}
        valoresIniciais={{
          nome: formato.nome,
          quantidadeTimes: formato.quantidade_times,
          confrontos: (confrontos ?? []).map((c) => ({
            timeAIndice: c.time_a_indice,
            timeBIndice: c.time_b_indice,
          })),
        }}
      />
    </div>
  );
}
