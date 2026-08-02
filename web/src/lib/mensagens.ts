import type { ResultadoSorteio } from '@/domain/sorteio.types';
import type { RankingEntry } from '@/lib/torneio-stats';
import type { TorneioRow, TorneioTimeRow } from '@/types/database.types';

// Emojis "astrais" (fora do plano básico Unicode, ex: 🔵🏃🔥) corrompem em
// alguns clientes ao passar pelo link wa.me. Usamos só emojis/símbolos do
// plano básico (BMP) — inclusive os números "keycap" (1️⃣, 2️⃣...), que embora
// pareçam compostos, todos os seus codepoints são BMP.
const NUMEROS_TIME = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

export function montarMensagemSorteio(resultado: ResultadoSorteio): string {
  const linhas: string[] = ['⚽ *Sorteio da Pelada* ⚽', ''];

  resultado.times.forEach((time, i) => {
    const numero = NUMEROS_TIME[i] ?? `${i + 1}.`;
    linhas.push(`${numero} *Time ${i + 1}*`);
    time.jogadores.forEach((j) => linhas.push(`• ${j.nome}`));
    linhas.push('');
  });

  if (resultado.avulsos.length > 0) {
    linhas.push('⚠️ *Avulsos (decidir em campo)*');
    resultado.avulsos.forEach((j) => linhas.push(`• ${j.nome}`));
    linhas.push('');
  }

  linhas.push('Bom jogo! ⚽✨');

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

export function montarMensagemTorneio(
  torneio: TorneioRow,
  classificacao: TorneioTimeRow[],
  artilharia: RankingEntry[],
  assistencias: RankingEntry[]
): string {
  const dataFormatada = new Date(`${torneio.data}T00:00:00`).toLocaleDateString('pt-BR');
  const nomeTorneio = torneio.nome || `Torneio de ${dataFormatada}`;
  const campeao = classificacao[0];

  const linhas: string[] = [`⚽ *${nomeTorneio}* ⚽`, dataFormatada, ''];

  if (campeao) {
    linhas.push(`⭐ *Campeão: Time ${campeao.indice}*`, '');
  }

  linhas.push('*Classificação*');
  classificacao.forEach((t, i) => {
    const saldo = t.gols_pro - t.gols_contra;
    const saldoTexto = saldo > 0 ? `+${saldo}` : `${saldo}`;
    linhas.push(`${i + 1}º Time ${t.indice} — ${t.pontos} pts (${saldoTexto})`);
  });
  linhas.push('');

  linhas.push('*Artilharia*');
  if (artilharia.length === 0) linhas.push('Ninguém marcou.');
  else artilharia.forEach((a) => linhas.push(`${a.nome} — ${a.total} gol(s)`));
  linhas.push('');

  linhas.push('*Assistências*');
  if (assistencias.length === 0) linhas.push('Nenhuma assistência registrada.');
  else assistencias.forEach((a) => linhas.push(`${a.nome} — ${a.total} assistência(s)`));

  return linhas.join('\n').trim();
}

export function compartilharNoWhatsApp(mensagem: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
