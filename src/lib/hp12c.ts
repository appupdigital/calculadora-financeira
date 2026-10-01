// Núcleo matemático da calculadora financeira estilo HP12C (regime de juros compostos, RPN).
// Convenção de sinais: dinheiro que sai do seu bolso é negativo, dinheiro que entra é positivo
// (a mesma convenção usada na HP12C real).

export interface TVM {
  n?: number; // número de períodos
  i?: number; // taxa por período, em DECIMAL (0.01 = 1%)
  pv?: number; // valor presente
  pmt?: number; // prestação/pagamento periódico
  fv?: number; // valor futuro
}

const EPS_I = 1e-9;

function fatorBeg(i: number, begin: boolean) {
  return 1 + i * (begin ? 1 : 0);
}

/** Resolve FV a partir de n, i, PV, PMT. */
export function resolverFV(n: number, i: number, pv: number, pmt: number, begin: boolean): number {
  if (Math.abs(i) < EPS_I) return -(pv + pmt * n);
  const fator = Math.pow(1 + i, n);
  const termoPmt = pmt * fatorBeg(i, begin) * ((fator - 1) / i);
  return -(pv * fator + termoPmt);
}

/** Resolve PV a partir de n, i, PMT, FV. */
export function resolverPV(n: number, i: number, pmt: number, fv: number, begin: boolean): number {
  if (Math.abs(i) < EPS_I) return -(fv + pmt * n);
  const fator = Math.pow(1 + i, n);
  const termoPmt = pmt * fatorBeg(i, begin) * ((fator - 1) / i);
  return -(fv + termoPmt) / fator;
}

/** Resolve PMT a partir de n, i, PV, FV. */
export function resolverPMT(n: number, i: number, pv: number, fv: number, begin: boolean): number {
  if (Math.abs(i) < EPS_I) return -(pv + fv) / n;
  const fator = Math.pow(1 + i, n);
  const numerador = -(pv * fator + fv);
  const denominador = fatorBeg(i, begin) * ((fator - 1) / i);
  return numerador / denominador;
}

/** Resolve n a partir de i, PV, PMT, FV. */
export function resolverN(i: number, pv: number, pmt: number, fv: number, begin: boolean): number | null {
  if (Math.abs(i) < EPS_I) {
    if (pmt === 0) return null;
    return -(pv + fv) / pmt;
  }
  const k = (pmt * fatorBeg(i, begin)) / i;
  const num = k - fv;
  const den = k + pv;
  if (den === 0) return null;
  const razao = num / den;
  if (razao <= 0) return null;
  const n = Math.log(razao) / Math.log(1 + i);
  return isFinite(n) ? n : null;
}

/** Função de avaliação: deve ser zero na taxa i correta. */
function gDeI(i: number, n: number, pv: number, pmt: number, fv: number, begin: boolean): number {
  if (Math.abs(i) < EPS_I) return pv + pmt * n + fv;
  const fator = Math.pow(1 + i, n);
  return pv * fator + pmt * fatorBeg(i, begin) * ((fator - 1) / i) + fv;
}

/** Resolve i (taxa por período, em decimal) a partir de n, PV, PMT, FV por busca numérica. */
export function resolverI(n: number, pv: number, pmt: number, fv: number, begin: boolean): number | null {
  // varre a faixa de -99,99% a 1000% por período procurando uma troca de sinal
  const pontos: number[] = [];
  for (let p = -0.9999; p <= 10; p += 0.0025) pontos.push(p);

  let loI: number | null = null;
  let hiI: number | null = null;
  let gLo = 0;
  for (let k = 0; k < pontos.length - 1; k++) {
    const a = pontos[k];
    const b = pontos[k + 1];
    const ga = gDeI(a, n, pv, pmt, fv, begin);
    const gb = gDeI(b, n, pv, pmt, fv, begin);
    if (ga === 0) return a;
    if (ga * gb < 0) {
      loI = a;
      hiI = b;
      gLo = ga;
      break;
    }
  }
  if (loI === null || hiI === null) return null;

  let lo = loI;
  let hi = hiI;
  let flo = gLo;
  for (let iter = 0; iter < 200; iter++) {
    const mid = (lo + hi) / 2;
    const fmid = gDeI(mid, n, pv, pmt, fv, begin);
    if (Math.abs(fmid) < 1e-7) return mid;
    if (flo * fmid < 0) {
      hi = mid;
    } else {
      lo = mid;
      flo = fmid;
    }
  }
  return (lo + hi) / 2;
}

export type ChaveTVM = "n" | "i" | "pv" | "pmt" | "fv";

/** Dado um conjunto de registradores com exatamente 4 valores definidos, calcula o 5º. */
export function resolverTVM(regs: TVM, alvo: ChaveTVM, begin: boolean): number | null {
  const { n, i, pv, pmt, fv } = regs;
  switch (alvo) {
    case "fv":
      if (n === undefined || i === undefined || pv === undefined || pmt === undefined) return null;
      return resolverFV(n, i, pv, pmt, begin);
    case "pv":
      if (n === undefined || i === undefined || pmt === undefined || fv === undefined) return null;
      return resolverPV(n, i, pmt, fv, begin);
    case "pmt":
      if (n === undefined || i === undefined || pv === undefined || fv === undefined) return null;
      return resolverPMT(n, i, pv, fv, begin);
    case "n":
      if (i === undefined || pv === undefined || pmt === undefined || fv === undefined) return null;
      return resolverN(i, pv, pmt, fv, begin);
    case "i":
      if (n === undefined || pv === undefined || pmt === undefined || fv === undefined) return null;
      return resolverI(n, pv, pmt, fv, begin);
  }
}

/** Formata um número para o visor, estilo HP12C, com separador de milhar e vírgula decimal. */
export function formatarVisor(valor: number, casas: number): string {
  if (!isFinite(valor)) return "Error 0";
  const negativo = valor < 0;
  const abs = Math.abs(valor);
  const texto = abs.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return (negativo ? "-" : "") + texto;
}
