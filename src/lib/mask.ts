// Máscara de digitação estilo "contábil" (como o Excel): o usuário digita só os
// dígitos e eles vão entrando da direita pra esquerda, empurrando a casa decimal.
// Ex.: digitar 1 2 3 4 5 => 1,00 -> 12,00 -> 123,00 -> 1.234,00 -> 12.345,00

export function digitsToNumber(digits: string, casas = 2): number {
  if (!digits) return 0;
  const n = parseInt(digits, 10);
  if (isNaN(n)) return 0;
  return n / Math.pow(10, casas);
}

export function formatDigits(digits: string, casas = 2): string {
  const valor = digitsToNumber(digits, casas);
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function sanitizeDigits(raw: string, maxLen = 15): string {
  const onlyDigits = raw.replace(/\D/g, "");
  const semZerosIniciais = onlyDigits.replace(/^0+(?=\d)/, "");
  return semZerosIniciais.slice(0, maxLen);
}
