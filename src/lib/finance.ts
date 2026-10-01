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

export interface ResultadoLucratividade {
  atm: number;
  ga: number;
  rsv: number;
  roa: number;
  plma: number;
  roe: number;
  tempoDobrar: number;
}

export function calcularLucratividade(
  vl: number,
  ll: number,
  atInicial: number,
  atFinal: number,
  plInicial: number,
  plFinal: number
): ResultadoLucratividade {
  const atm = (atInicial + atFinal) / 2;
  const ga = vl / atm;
  const rsv = (ll / vl) * 100;
  const roa = ga * rsv;
  const plma = (plInicial + plFinal - ll) / 2;
  const roe = (ll / plma) * 100;
  const tempoDobrar = 72 / roa;
  return { atm, ga, rsv, roa, plma, roe, tempoDobrar };
}

export interface ResultadoPrazosCiclos {
  estm: number;
  pmre: number;
  drm: number;
  pmrv: number;
  compras: number;
  fornm: number;
  pmpc: number;
  co: number;
  cf: number;
}

export function calcularPrazosCiclos(
  estoqueInicial: number,
  estoqueFinal: number,
  cpv: number,
  drInicial: number,
  drFinal: number,
  vendasBrutas: number,
  fornInicial: number,
  fornFinal: number,
  dp: number
): ResultadoPrazosCiclos {
  const estm = (estoqueInicial + estoqueFinal) / 2;
  const pmre = (estm / cpv) * dp;

  const drm = (drInicial + drFinal) / 2;
  const pmrv = (drm / vendasBrutas) * dp;

  const compras = cpv + estoqueFinal - estoqueInicial;
  const fornm = (fornInicial + fornFinal) / 2;
  const pmpc = (fornm / compras) * dp;

  const co = pmre + pmrv;
  const cf = co - pmpc;

  return { estm, pmre, drm, pmrv, compras, fornm, pmpc, co, cf };
}

export interface ResultadoJuros {
  montanteSimples: number;
  jurosSimples: number;
  montanteComposto: number;
  jurosCompostos: number;
}

export type UnidadeTaxa = "mes" | "ano";
export type UnidadePeriodo = "meses" | "anos";

export function calcularJuros(
  pv: number,
  taxa: number,
  taxaUnidade: UnidadeTaxa,
  n: number,
  nUnidade: UnidadePeriodo
): ResultadoJuros {
  const nMeses = nUnidade === "anos" ? n * 12 : n;

  // Juros simples: conversão de taxa proporcional (linear)
  const taxaMesSimples = taxaUnidade === "ano" ? taxa / 12 : taxa;
  const montanteSimples = pv * (1 + taxaMesSimples * nMeses);

  // Juros compostos: conversão de taxa equivalente (geométrica)
  const taxaMesComposta = taxaUnidade === "ano" ? Math.pow(1 + taxa, 1 / 12) - 1 : taxa;
  const montanteComposto = pv * Math.pow(1 + taxaMesComposta, nMeses);

  return {
    montanteSimples,
    jurosSimples: montanteSimples - pv,
    montanteComposto,
    jurosCompostos: montanteComposto - pv,
  };
}

export interface ResultadoConversaoTaxa {
  proporcional: number;
  equivalente: number;
}

/** Converte uma taxa de "mes" para "ano" ou de "ano" para "mes". */
export function calcularConversaoTaxa(taxa: number, origem: UnidadeTaxa): ResultadoConversaoTaxa {
  if (origem === "mes") {
    return {
      proporcional: taxa * 12,
      equivalente: Math.pow(1 + taxa, 12) - 1,
    };
  }
  return {
    proporcional: taxa / 12,
    equivalente: Math.pow(1 + taxa, 1 / 12) - 1,
  };
}
