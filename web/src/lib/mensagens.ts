import type { ResultadoSorteio } from '@/domain/sorteio.types';

export function montarMensagemSorteio(resultado: ResultadoSorteio): string {
  const linhas: string[] = ['⚽ *Sorteio da Pelada*', ''];

  resultado.times.forEach((time, i) => {
    linhas.push(`*Time ${i + 1}* (nível ${time.somaNivel})`);
    time.jogadores.forEach((j) => linhas.push(`- ${j.nome}`));
    linhas.push('');
  });

  if (resultado.avulsos.length > 0) {
    linhas.push('*Avulsos (decidir em campo)*');
    resultado.avulsos.forEach((j) => linhas.push(`- ${j.nome}`));
  }

  return linhas.join('\n').trim();
}

interface JogadorRef {
  id: string;
  nome: string;
}

export function montarMensagemEstatisticas(
  dataLabel: string,
  jogadores: JogadorRef[],
  estatisticas: Record<string, { gols: number; assistencias: number }>
): string {
  const comGols = jogadores
    .filter((j) => (estatisticas[j.id]?.gols ?? 0) > 0)
    .sort((a, b) => (estatisticas[b.id]?.gols ?? 0) - (estatisticas[a.id]?.gols ?? 0));

  const comAssist = jogadores
    .filter((j) => (estatisticas[j.id]?.assistencias ?? 0) > 0)
    .sort(
      (a, b) => (estatisticas[b.id]?.assistencias ?? 0) - (estatisticas[a.id]?.assistencias ?? 0)
    );

  const linhas: string[] = [`⚽ *Artilheiros e assistências — ${dataLabel}*`, '', '*Gols:*'];

  if (comGols.length === 0) linhas.push('Ninguém marcou hoje.');
  else comGols.forEach((j) => linhas.push(`- ${j.nome}: ${estatisticas[j.id].gols}`));

  linhas.push('', '*Assistências:*');

  if (comAssist.length === 0) linhas.push('Nenhuma assistência registrada.');
  else comAssist.forEach((j) => linhas.push(`- ${j.nome}: ${estatisticas[j.id].assistencias}`));

  return linhas.join('\n').trim();
}

export function compartilharNoWhatsApp(mensagem: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
