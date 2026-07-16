import { HistoricoItem } from '@/components/historico-item';
import { createClient } from '@/lib/supabase/server';

export default async function HistoricoPage() {
  const supabase = await createClient();
  const { data: sorteios } = await supabase
    .from('sorteios')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Histórico</h1>
      {!sorteios || sorteios.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhum sorteio salvo ainda.</p>
      ) : (
        <div className="space-y-2">
          {sorteios.map((s) => (
            <HistoricoItem key={s.id} sorteio={s} />
          ))}
        </div>
      )}
    </div>
  );
}
