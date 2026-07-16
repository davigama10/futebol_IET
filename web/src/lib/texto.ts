const DIACRITICOS = /[̀-ͯ]/g;

export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(DIACRITICOS, '').toLowerCase().trim();
}
