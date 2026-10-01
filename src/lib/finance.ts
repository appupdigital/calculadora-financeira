export function fmt(n: number, casas = 2): string {
  if (!isFinite(n)) return "—";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

export function npv(rate: number, cf0: number, fluxos: number[]): number {
  let total = cf0;
  for (let t = 0; t < fluxos.length; t++) {
    total += fluxos[t] / Math.pow(1 + rate, t + 1);
  }
  return total;
}

export function irr(cf0: number, fluxos: number[]): number | null {
  // bisseção entre -99% e 500%
  let lo = -0.99,
    hi = 5.0;
  let fLo = npv(lo, cf0, fluxos);
  let fHi = npv(hi, cf0, fluxos);
  if (fLo * fHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid, cf0, fluxos);
    if (Math.abs(fMid) < 1e-6) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

export interface ResultadoInvestimento {
  vpl: number;
  tir: number | null;
  il: number;
  paybackSimples: number | null;
  paybackDescontado: number | null;
}

export function calcularInvestimento(cf0Abs: number, k: number, fluxos: number[]): ResultadoInvestimento {
  const cf0 = -Math.abs(cf0Abs);

  // Payback simples
  let acumulado = 0;
  let paybackSimples: number | null = null;
  for (let t = 0; t < fluxos.length; t++) {
    const antes = acumulado;
    acumulado += fluxos[t];
    if (acumulado >= -cf0 && paybackSimples === null) {
      const falta = -cf0 - antes;
      paybackSimples = t + falta / fluxos[t];
    }
  }

  // Payback descontado
  let acumDesc = 0;
  let paybackDescontado: number | null = null;
  for (let t = 0; t < fluxos.length; t++) {
    const vp = fluxos[t] / Math.pow(1 + k, t + 1);
    const antes = acumDesc;
    acumDesc += vp;
    if (acumDesc >= -cf0 && paybackDescontado === null) {
      const falta = -cf0 - antes;
      paybackDescontado = t + falta / vp;
    }
  }

  const vpl = npv(k, cf0, fluxos);
  const tir = irr(cf0, fluxos);
  const vpBeneficios = vpl - cf0;
  const il = vpBeneficios / -cf0;

  return { vpl, tir, il, paybackSimples, paybackDescontado };
}

export interface ResultadoIndices {
  lg: number;
  lc: number;
  ls: number;
  pct: number;
  ce: number;
}

export function calcularIndices(
  ac: number,
  rlp: number,
  disp: number,
  drl: number,
  pc: number,
  pnc: number,
  pl: number
): ResultadoIndices {
  const lg = (ac + rlp) / (pc + pnc);
  const lc = ac / pc;
  const ls = (disp + drl) / pc;
  const pct = ((pc + pnc) / pl) * 100;
  const ce = (pc / (pc + pnc)) * 100;
  return { lg, lc, ls, pct, ce };
}
