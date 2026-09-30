import type { JogadorSorteio, ResultadoSorteio } from '@/domain/sorteio.types';
import type { createClient } from '@/lib/supabase/server';

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Times (ids dos jogadores) do sorteio mais recente — seja o de um torneio ou um sorteio simples
 * salvo no histórico. Usado pelo sorteio pra evitar repetir as mesmas duplas da semana anterior.
 */
export async function buscarTimesDoUltimoSorteio(supabase: Supabase): Promise<string[][]> {
  const [{ data: ultimoTorneio }, { data: ultimoSorteio }] = await Promise.all([
    supabase
      .from('torneios')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('sorteios')
      .select('resultado, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const torneioMaisRecente =
    ultimoTorneio && (!ultimoSorteio || ultimoTorneio.created_at >= ultimoSorteio.created_at);

  if (torneioMaisRecente) {
    const { data: times } = await supabase
      .from('torneio_times')
      .select('jogadores')
      .eq('torneio_id', ultimoTorneio.id);
    return (times ?? []).map((t) => (t.jogadores as JogadorSorteio[]).map((j) => j.id));
  }

  if (ultimoSorteio) {
    const resultado = ultimoSorteio.resultado as ResultadoSorteio;
    return resultado.times.map((t) => t.jogadores.map((j) => j.id));
  }

  return [];
}
