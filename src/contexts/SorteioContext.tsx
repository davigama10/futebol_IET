import { createContext, useContext, useState, type ReactNode } from 'react';

import { sortearTimes } from '../domain/sorteio';
import type { JogadorSorteio, ResultadoSorteio, TamanhoTime } from '../domain/sorteio.types';
import { supabase } from '../lib/supabase';

interface SorteioContextValue {
  resultado: ResultadoSorteio | null;
  tamanhoTime: TamanhoTime | null;
  salvando: boolean;
  salvo: boolean;
  sortear: (jogadores: JogadorSorteio[], tamanhoTime: TamanhoTime) => void;
  salvarNoHistorico: () => Promise<{ error: string | null }>;
}

const SorteioContext = createContext<SorteioContextValue | undefined>(undefined);

export function SorteioProvider({ children }: { children: ReactNode }) {
  const [resultado, setResultado] = useState<ResultadoSorteio | null>(null);
  const [tamanhoTime, setTamanhoTime] = useState<TamanhoTime | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  function sortear(jogadores: JogadorSorteio[], tamanho: TamanhoTime) {
    setResultado(sortearTimes(jogadores, tamanho));
    setTamanhoTime(tamanho);
    setSalvo(false);
  }

  async function salvarNoHistorico() {
    if (!resultado || !tamanhoTime) return { error: 'Nenhum sorteio para salvar.' };

    setSalvando(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('sorteios').insert({
      tamanho_time: tamanhoTime,
      resultado,
      criado_por: userData.user?.id,
    });
    setSalvando(false);

    if (!error) setSalvo(true);
    return { error: error?.message ?? null };
  }

  return (
    <SorteioContext.Provider
      value={{ resultado, tamanhoTime, salvando, salvo, sortear, salvarNoHistorico }}>
      {children}
    </SorteioContext.Provider>
  );
}

export function useSorteioContext() {
  const ctx = useContext(SorteioContext);
  if (!ctx) throw new Error('useSorteioContext deve ser usado dentro de SorteioProvider');
  return ctx;
}
