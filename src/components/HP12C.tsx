import { useReducer } from "react";
import { resolverTVM, formatarVisor, type TVM, type ChaveTVM } from "../lib/hp12c";

interface Stack {
  x: number;
  y: number;
  z: number;
  t: number;
}

interface State {
  stack: Stack;
  buffer: string;
  entering: boolean;
  liftStack: boolean;
  regs: Record<string, number>;
  tvm: TVM;
  begin: boolean;
  decimals: number;
  pendingPrefix: "STO" | "RCL" | null;
  pendingShift: "f" | "g" | null;
  message: string | null;
  lastAction: string;
  lastX: number;
  pontosEstatistica: [number, number][];
}

const ESTADO_INICIAL: State = {
  stack: { x: 0, y: 0, z: 0, t: 0 },
  buffer: "0",
  entering: false,
  liftStack: false,
  regs: {},
  tvm: {},
  begin: false,
  decimals: 2,
  pendingPrefix: null,
  pendingShift: null,
  message: null,
  lastAction: "Calculadora pronta. Digite um número e pressione ENTER.",
  lastX: 0,
  pontosEstatistica: [],
};

type Acao =
  | { type: "digit"; d: string }
  | { type: "dot" }
  | { type: "chs" }
  | { type: "enter" }
  | { type: "op"; op: "+" | "-" | "×" | "÷" }
  | { type: "percent" }
  | { type: "percentTotal" }
  | { type: "deltaPercent" }
  | { type: "inv" }
  | { type: "pow" }
  | { type: "rolldown" }
  | { type: "swapxy" }
  | { type: "clx" }
  | { type: "ac" }
  | { type: "stoPrefix" }
  | { type: "rclPrefix" }
  | { type: "tvm"; key: ChaveTVM }
  | { type: "shift"; which: "f" | "g" }
  | { type: "decorative"; msg: string }
  | { type: "eex" }
  | { type: "sigmaPlus" }
  | { type: "setDecimals"; n: number };

function commit(s: State): State {
  if (!s.entering) return s;
  const v = parseFloat(s.buffer);
  return { ...s, stack: { ...s.stack, x: isFinite(v) ? v : 0 }, entering: false };
}

function lift(s: State): State {
  if (!s.liftStack) return s;
  return { ...s, stack: { x: s.stack.x, y: s.stack.x, z: s.stack.y, t: s.stack.z } };
}

// --- Amortização ---
function amortizar(bal: number, i: number, pmt: number, cnt: number) {
  let saldo = bal;
  let juros = 0;
  let principal = 0;
  for (let k = 0; k < cnt; k++) {
    const jurosK = saldo * i;
    const principalK = -pmt - jurosK;
    juros += jurosK;
    principal += principalK;
    saldo += jurosK + pmt;
  }
  return { juros, principal, saldoFinal: saldo };
}

// --- Depreciação ---
function deprecSLCalc(custo: number, residual: number, vidaUtil: number, periodo: number) {
  const dep = (custo - residual) / vidaUtil;
  const valorContabil = custo - dep * periodo;
  return { dep, valorContabil };
}

function deprecSOYDCalc(custo: number, residual: number, vidaUtil: number, periodo: number) {
  const syd = (vidaUtil * (vidaUtil + 1)) / 2;
  const base = custo - residual;
  let acumulado = 0;
  let depPeriodo = 0;
  for (let k = 1; k <= periodo; k++) {
    const depK = ((vidaUtil - k + 1) / syd) * base;
    acumulado += depK;
    if (k === periodo) depPeriodo = depK;
  }
  return { dep: depPeriodo, valorContabil: custo - acumulado };
}

function deprecDBCalc(custo: number, residual: number, vidaUtil: number, periodo: number, fatorPercentual: number) {
  const taxa = (fatorPercentual > 0 ? fatorPercentual / 100 : 2) / vidaUtil;
  let saldo = custo;
  let depPeriodo = 0;
  for (let k = 1; k <= periodo; k++) {
    const depK = Math.min(saldo * taxa, saldo - residual);
    saldo -= depK;
    if (k === periodo) depPeriodo = depK;
  }
  return { dep: depPeriodo, valorContabil: saldo };
}

// --- Estatísticas ---
function mediaEDesvio(valores: number[]) {
  const n = valores.length;
  const media = valores.reduce((a, b) => a + b, 0) / n;
  if (n < 2) return { media, desvio: NaN };
  const variancia = valores.reduce((acc, v) => acc + (v - media) ** 2, 0) / (n - 1);
  return { media, desvio: Math.sqrt(variancia) };
}

function regressaoLinear(pontos: [number, number][]) {
  const n = pontos.length;
  const xs = pontos.map((p) => p[0]);
  const ys = pontos.map((p) => p[1]);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = pontos.reduce((acc, [x, y]) => acc + x * y, 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
  const sumY2 = ys.reduce((acc, y) => acc + y * y, 0);
  const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const a = (sumY - b * sumX) / n;
  const r =
    (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return { a, b, r };
}

function reducer(state: State, acao: Acao): State {
  let s: State = { ...state, message: null };

  // --- teclas de prefixo f / g (shift), já ativas: decide o que a PRÓXIMA tecla faz ---
  if (s.pendingShift && acao.type !== "shift") {
    const shift = s.pendingShift;
    s = commit({ ...s, pendingShift: null });

    if (shift === "g" && acao.type === "tvm" && acao.key === "n") {
      const novoN = s.stack.x * 12;
      return {
        ...s,
        tvm: { ...s.tvm, n: novoN },
        stack: { ...s.stack, x: novoN },
        liftStack: true,
        lastAction: `g 12× — n = ${formatarVisor(novoN, s.decimals)} (anos convertidos em meses)`,
      };
    }
    if (shift === "g" && acao.type === "tvm" && acao.key === "i") {
      const mensal = s.stack.x / 12;
      return {
        ...s,
        tvm: { ...s.tvm, i: mensal / 100 },
        stack: { ...s.stack, x: mensal },
        liftStack: true,
        lastAction: `g 12÷ — i = ${formatarVisor(mensal, s.decimals)}% (taxa anual convertida em mensal)`,
      };
    }
    if (shift === "g" && acao.type === "digit" && acao.d === "7") {
      return { ...s, begin: true, lastAction: "g BEG — modo BEGIN (pagamentos no início do período)" };
    }
    if (shift === "g" && acao.type === "digit" && acao.d === "8") {
      return { ...s, begin: false, lastAction: "g END — modo END (pagamentos no fim do período)" };
    }
    if (shift === "g" && acao.type === "enter") {
      return {
        ...s,
        stack: { ...s.stack, x: s.lastX },
        liftStack: true,
        lastAction: `g LSTx — último X antes da operação: ${formatarVisor(s.lastX, s.decimals)}`,
      };
    }
    if (shift === "g" && acao.type === "clx") {
      return { ...s, tvm: {}, lastAction: "g CLEAR — registradores financeiros (n, i, PV, PMT, FV) zerados" };
    }
    if (shift === "f" && acao.type === "clx") {
      return { ...s, regs: {}, lastAction: "f CLEAR — registradores de memória (R0–R9) zerados" };
    }

    if (shift === "f" && acao.type === "tvm" && acao.key === "n") {
      const { n, i, pv, pmt } = s.tvm;
      if (n === undefined || i === undefined || pv === undefined || pmt === undefined) {
        return { ...s, message: "Error 4", lastAction: "AMORT precisa de n, i, PV e PMT preenchidos" };
      }
      const cnt = Math.round(s.stack.x) || 1;
      const { juros, principal, saldoFinal } = amortizar(pv, i, pmt, cnt);
      return {
        ...s,
        tvm: { ...s.tvm, pv: saldoFinal },
        stack: { ...s.stack, x: principal, y: juros },
        liftStack: true,
        lastAction: `f AMORT (${cnt} parcela(s)) — principal = ${formatarVisor(principal, s.decimals)} (X), juros = ${formatarVisor(juros, s.decimals)} (Y), novo saldo PV = ${formatarVisor(saldoFinal, s.decimals)}`,
      };
    }

    if (shift === "f" && acao.type === "percentTotal") {
      const { n, pv, fv } = s.tvm;
      if (n === undefined || pv === undefined || fv === undefined) {
        return { ...s, message: "Error 4", lastAction: "Depreciação SL precisa de n (vida útil), PV (custo) e FV (valor residual)" };
      }
      const periodo = Math.round(s.stack.x) || 1;
      const { dep, valorContabil } = deprecSLCalc(pv, fv, n, periodo);
      return {
        ...s,
        stack: { ...s.stack, x: dep, y: valorContabil },
        liftStack: true,
        lastAction: `f SL — depreciação do período ${periodo} = ${formatarVisor(dep, s.decimals)} (X), valor contábil = ${formatarVisor(valorContabil, s.decimals)} (Y)`,
      };
    }

    if (shift === "f" && acao.type === "deltaPercent") {
      const { n, pv, fv } = s.tvm;
      if (n === undefined || pv === undefined || fv === undefined) {
        return { ...s, message: "Error 4", lastAction: "Depreciação SOYD precisa de n (vida útil), PV (custo) e FV (valor residual)" };
      }
      const periodo = Math.round(s.stack.x) || 1;
      const { dep, valorContabil } = deprecSOYDCalc(pv, fv, n, periodo);
      return {
        ...s,
        stack: { ...s.stack, x: dep, y: valorContabil },
        liftStack: true,
        lastAction: `f SOYD — depreciação do período ${periodo} = ${formatarVisor(dep, s.decimals)} (X), valor contábil = ${formatarVisor(valorContabil, s.decimals)} (Y)`,
      };
    }

    if (shift === "f" && acao.type === "eex") {
      const { n, pv, fv, i } = s.tvm;
      if (n === undefined || pv === undefined || fv === undefined) {
        return { ...s, message: "Error 4", lastAction: "Depreciação DB precisa de n (vida útil), PV (custo) e FV (valor residual)" };
      }
      const periodo = Math.round(s.stack.x) || 1;
      const fator = i !== undefined ? i * 100 : 0; // reaproveita o registrador i como fator % (ex.: 200 = dobro da linear)
      const { dep, valorContabil } = deprecDBCalc(pv, fv, n, periodo, fator);
      return {
        ...s,
        stack: { ...s.stack, x: dep, y: valorContabil },
        liftStack: true,
        lastAction: `f DB — depreciação do período ${periodo} = ${formatarVisor(dep, s.decimals)} (X), valor contábil = ${formatarVisor(valorContabil, s.decimals)} (Y). Fator usado: ${fator > 0 ? fator.toFixed(0) + "%" : "200% (padrão)"}`,
      };
    }

    if (shift === "g" && acao.type === "sigmaPlus") {
      if (s.pontosEstatistica.length === 0) {
        return { ...s, lastAction: "Σ− — não há pontos para remover" };
      }
      const novos = s.pontosEstatistica.slice(0, -1);
      return {
        ...s,
        pontosEstatistica: novos,
        stack: { ...s.stack, x: novos.length },
        lastAction: `Σ− — último ponto removido (restam ${novos.length})`,
      };
    }

    if (shift === "f" && acao.type === "digit" && acao.d === "1") {
      if (s.pontosEstatistica.length === 0) {
        return { ...s, message: "Error 3", lastAction: "x̄,ȳ precisa de pelo menos um ponto (Σ+)" };
      }
      const xs = s.pontosEstatistica.map((p) => p[0]);
      const ys = s.pontosEstatistica.map((p) => p[1]);
      const mx = mediaEDesvio(xs).media;
      const my = mediaEDesvio(ys).media;
      return {
        ...s,
        stack: { ...s.stack, x: mx, y: my },
        liftStack: true,
        lastAction: `f x̄,ȳ — média de x = ${formatarVisor(mx, s.decimals)} (X), média de y = ${formatarVisor(my, s.decimals)} (Y)`,
      };
    }

    if (shift === "f" && acao.type === "digit" && acao.d === "2") {
      if (s.pontosEstatistica.length < 2) {
        return { ...s, message: "Error 3", lastAction: "s (desvio-padrão) precisa de pelo menos 2 pontos (Σ+)" };
      }
      const xs = s.pontosEstatistica.map((p) => p[0]);
      const ys = s.pontosEstatistica.map((p) => p[1]);
      const sx = mediaEDesvio(xs).desvio;
      const sy = mediaEDesvio(ys).desvio;
      return {
        ...s,
        stack: { ...s.stack, x: sx, y: sy },
        liftStack: true,
        lastAction: `f s — desvio-padrão amostral de x = ${formatarVisor(sx, s.decimals)} (X), de y = ${formatarVisor(sy, s.decimals)} (Y)`,
      };
    }

    if (shift === "f" && acao.type === "digit" && acao.d === "3") {
      if (s.pontosEstatistica.length < 2) {
        return { ...s, message: "Error 3", lastAction: "ŷ,r precisa de pelo menos 2 pontos (Σ+)" };
      }
      const { a, b, r } = regressaoLinear(s.pontosEstatistica);
      const xEstimado = s.stack.x;
      const yEstimado = a + b * xEstimado;
      return {
        ...s,
        stack: { ...s.stack, x: yEstimado, y: r },
        liftStack: true,
        lastAction: `f ŷ,r — para x=${formatarVisor(xEstimado, s.decimals)}: ŷ = ${formatarVisor(yEstimado, s.decimals)} (X), correlação r = ${formatarVisor(r, 4)} (Y)`,
      };
    }

    return {
      ...s,
      lastAction: "Essa função f/g é decorativa nesta simulação (reproduz o visual, não a função original da HP12C).",
    };
  }

  switch (acao.type) {
    case "digit": {
      if (s.pendingPrefix) {
        const n = parseInt(acao.d, 10);
        if (isNaN(n) || n < 0 || n > 9) return { ...s, pendingPrefix: null };
        s = commit(s);
        if (s.pendingPrefix === "STO") {
          return {
            ...s,
            regs: { ...s.regs, [acao.d]: s.stack.x },
            pendingPrefix: null,
            lastAction: `Armazenado em R${acao.d}: ${formatarVisor(s.stack.x, s.decimals)}`,
          };
        } else {
          const v = s.regs[acao.d] ?? 0;
          return {
            ...s,
            stack: { ...s.stack, x: v },
            entering: false,
            liftStack: true,
            pendingPrefix: null,
            lastAction: `Recuperado de R${acao.d}: ${formatarVisor(v, s.decimals)}`,
          };
        }
      }
      if (!s.entering) {
        s = lift(s);
        if (acao.d === "0") return { ...s, buffer: "0", entering: true };
        return { ...s, buffer: acao.d, entering: true };
      }
      if (s.buffer.length > 14) return s;
      if (s.buffer === "0") return { ...s, buffer: acao.d };
      if (s.buffer === "-0") return { ...s, buffer: "-" + acao.d };
      return { ...s, buffer: s.buffer + acao.d };
    }

    case "dot": {
      if (s.pendingPrefix) return s;
      if (!s.entering) {
        s = lift(s);
        return { ...s, buffer: "0.", entering: true };
      }
      if (s.buffer.includes(".")) return s;
      return { ...s, buffer: s.buffer + "." };
    }

    case "chs": {
      if (s.entering) {
        const buf = s.buffer.startsWith("-") ? s.buffer.slice(1) : "-" + s.buffer;
        return { ...s, buffer: buf };
      }
      return { ...s, stack: { ...s.stack, x: -s.stack.x } };
    }

    case "enter": {
      s = commit(s);
      return {
        ...s,
        stack: { x: s.stack.x, y: s.stack.x, z: s.stack.y, t: s.stack.z },
        entering: false,
        liftStack: false,
        lastAction: "ENTER — valor duplicado na pilha (X → Y)",
      };
    }

    case "op": {
      s = commit(s);
      const { x, y, z, t } = s.stack;
      let r = 0;
      let errou = false;
      if (acao.op === "+") r = y + x;
      else if (acao.op === "-") r = y - x;
      else if (acao.op === "×") r = y * x;
      else {
        if (x === 0) errou = true;
        else r = y / x;
      }
      if (errou || !isFinite(r)) {
        return { ...s, message: "Error 0", lastAction: "Erro: divisão por zero" };
      }
      return {
        ...s,
        stack: { x: r, y: z, z: t, t },
        entering: false,
        liftStack: true,
        lastX: x,
        lastAction: `${formatarVisor(y, s.decimals)} ${acao.op} ${formatarVisor(x, s.decimals)} = ${formatarVisor(r, s.decimals)}`,
      };
    }

    case "percent": {
      s = commit(s);
      const oldX = s.stack.x;
      const r = s.stack.y * (s.stack.x / 100);
      return {
        ...s,
        stack: { ...s.stack, x: r },
        entering: false,
        liftStack: true,
        lastX: oldX,
        lastAction: `${formatarVisor(oldX, s.decimals)}% de ${formatarVisor(s.stack.y, s.decimals)} = ${formatarVisor(r, s.decimals)}`,
      };
    }

    case "percentTotal": {
      s = commit(s);
      if (s.stack.y === 0) return { ...s, message: "Error 0" };
      const oldX = s.stack.x;
      const r = (s.stack.x / s.stack.y) * 100;
      return {
        ...s,
        stack: { ...s.stack, x: r },
        entering: false,
        liftStack: true,
        lastX: oldX,
        lastAction: `%T — ${formatarVisor(oldX, s.decimals)} é ${formatarVisor(r, s.decimals)}% de ${formatarVisor(s.stack.y, s.decimals)}`,
      };
    }

    case "deltaPercent": {
      s = commit(s);
      if (s.stack.y === 0) return { ...s, message: "Error 0", lastAction: "Erro: Y é zero" };
      const oldX = s.stack.x;
      const r = ((s.stack.x - s.stack.y) / s.stack.y) * 100;
      return {
        ...s,
        stack: { ...s.stack, x: r },
        entering: false,
        liftStack: true,
        lastX: oldX,
        lastAction: `Δ% de Y para X: ${formatarVisor(r, s.decimals)}%`,
      };
    }

    case "inv": {
      s = commit(s);
      if (s.stack.x === 0) return { ...s, message: "Error 0", lastAction: "Erro: 1/0" };
      const oldX = s.stack.x;
      const r = 1 / s.stack.x;
      return { ...s, stack: { ...s.stack, x: r }, entering: false, liftStack: true, lastX: oldX, lastAction: `1/x = ${formatarVisor(r, s.decimals)}` };
    }

    case "pow": {
      s = commit(s);
      const { x, y, z, t } = s.stack;
      const r = Math.pow(y, x);
      if (!isFinite(r)) return { ...s, message: "Error 0" };
      return {
        ...s,
        stack: { x: r, y: z, z: t, t },
        entering: false,
        liftStack: true,
        lastX: x,
        lastAction: `yˣ — ${formatarVisor(y, s.decimals)} elevado a ${formatarVisor(x, s.decimals)} = ${formatarVisor(r, s.decimals)}`,
      };
    }

    case "rolldown": {
      s = commit(s);
      const { x, y, z, t } = s.stack;
      return {
        ...s,
        stack: { x: y, y: z, z: t, t: x },
        entering: false,
        liftStack: false,
        lastAction: "R↓ — pilha rolada para baixo (X←Y, Y←Z, Z←T, T←X)",
      };
    }

    case "swapxy": {
      s = commit(s);
      const { x, y } = s.stack;
      return {
        ...s,
        stack: { ...s.stack, x: y, y: x },
        entering: false,
        lastAction: `x≷y — trocou X e Y: X=${formatarVisor(y, s.decimals)}, Y=${formatarVisor(x, s.decimals)}`,
      };
    }

    case "clx":
      return {
        ...s,
        stack: { ...s.stack, x: 0 },
        buffer: "0",
        entering: false,
        liftStack: false,
        lastAction: "CLx — X zerado",
      };

    case "ac":
      return { ...ESTADO_INICIAL, lastAction: "ON — calculadora reiniciada (pilha, memórias e financeiras zeradas)" };

    case "stoPrefix":
      return { ...s, pendingPrefix: s.pendingPrefix === "STO" ? null : "STO", lastAction: "STO — pressione um dígito de 0 a 9" };

    case "rclPrefix":
      return { ...s, pendingPrefix: s.pendingPrefix === "RCL" ? null : "RCL", lastAction: "RCL — pressione um dígito de 0 a 9" };

    case "shift":
      return {
        ...s,
        pendingShift: s.pendingShift === acao.which ? null : acao.which,
        lastAction:
          s.pendingShift === acao.which
            ? "Shift cancelado"
            : `Tecla ${acao.which.toUpperCase()} ativa — pressione a tecla da função ${acao.which === "f" ? "laranja" : "azul"}`,
      };

    case "decorative":
      return { ...s, lastAction: acao.msg };

    case "eex":
      return { ...s, lastAction: "EEX (notação científica) não implementada nesta simulação. Use f + EEX para depreciação DB." };

    case "sigmaPlus": {
      s = commit(s);
      const ponto: [number, number] = [s.stack.x, s.stack.y];
      const novos = [...s.pontosEstatistica, ponto];
      return {
        ...s,
        pontosEstatistica: novos,
        entering: false,
        lastAction: `Σ+ — ponto (x=${formatarVisor(ponto[0], s.decimals)}, y=${formatarVisor(ponto[1], s.decimals)}) adicionado. Total: ${novos.length}`,
        stack: { ...s.stack, x: novos.length },
      };
    }

    case "setDecimals":
      return { ...s, decimals: acao.n };

    case "tvm": {
      const nomes: Record<ChaveTVM, string> = { n: "n", i: "i", pv: "PV", pmt: "PMT", fv: "FV" };
      const wasEntering = s.entering;
      const oldX = s.stack.x;
      s = commit(s);

      if (wasEntering) {
        const novoTvm: TVM =
          acao.key === "i" ? { ...s.tvm, i: s.stack.x / 100 } : { ...s.tvm, [acao.key]: s.stack.x };
        return {
          ...s,
          tvm: novoTvm,
          liftStack: true,
          lastAction: `Armazenado ${nomes[acao.key]} = ${formatarVisor(s.stack.x, s.decimals)}`,
        };
      }

      const resultado = resolverTVM(s.tvm, acao.key, s.begin);
      if (resultado === null || !isFinite(resultado)) {
        return {
          ...s,
          message: "Error 4",
          lastAction: `Faltam dados para calcular ${nomes[acao.key]} (preencha os outros 4 registradores)`,
        };
      }
      const valorVisor = acao.key === "i" ? resultado * 100 : resultado;
      const novoTvm2: TVM = { ...s.tvm, [acao.key]: resultado };
      return {
        ...s,
        tvm: novoTvm2,
        stack: { ...s.stack, x: valorVisor },
        liftStack: true,
        lastX: oldX,
        lastAction: `Calculado ${nomes[acao.key]} = ${formatarVisor(valorVisor, s.decimals)}`,
      };
    }

    default:
      return s;
  }
}

function Key({
  onClick,
  children,
  f,
  g,
  className = "",
  ativa = false,
  small = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  f?: string;
  g?: string;
  className?: string;
  ativa?: boolean;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex flex-col items-center justify-between rounded-md shadow-[0_2px_0_rgba(0,0,0,0.4)] active:translate-y-px active:shadow-none transition select-none py-0.5 sm:py-1 min-h-12 sm:min-h-14 " +
        className +
        (ativa ? " ring-2 ring-offset-1 ring-amber-300" : "")
      }
    >
      <span className="text-[6.5px] sm:text-[8px] font-bold text-amber-400 leading-none h-2.5">{f ?? " "}</span>
      <span className={"font-bold text-white " + (small ? "text-[9px] sm:text-[11px]" : "text-[10.5px] sm:text-xs")}>{children}</span>
      <span className="text-[6.5px] sm:text-[8px] font-bold text-sky-400 leading-none h-2.5">{g ?? " "}</span>
    </button>
  );
}

export default function HP12C() {
  const [s, dispatch] = useReducer(reducer, ESTADO_INICIAL);

  const visor = s.entering ? s.buffer : formatarVisor(s.stack.x, s.decimals);
  const blackKey = "bg-neutral-900 hover:bg-neutral-800 dark:bg-black dark:hover:bg-neutral-900";

  const nomesRegs: { key: ChaveTVM; label: string }[] = [
    { key: "n", label: "n" },
    { key: "i", label: "i (%)" },
    { key: "pv", label: "PV" },
    { key: "pmt", label: "PMT" },
    { key: "fv", label: "FV" },
  ];

  return (
    <div className="max-w-md mx-auto">
      {/* Corpo bege da calculadora */}
      <div className="rounded-2xl bg-gradient-to-b from-[#ece3cf] to-[#d9cba9] dark:from-[#3a3326] dark:to-[#2a2419] p-3 sm:p-4 shadow-xl border border-[#b9a87e] dark:border-[#5a4e34]">
        {/* Visor + logo */}
        <div className="flex items-stretch gap-2 mb-3">
          <div className="flex-1 rounded-lg bg-neutral-800 p-1.5 shadow-inner">
            <div className="rounded bg-[#aab696] px-2 py-1.5">
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold text-neutral-700 mb-0.5 h-3">
                <span className={s.begin ? "opacity-100" : "opacity-0"}>BEGIN</span>
                <span className={s.pendingShift ? "opacity-100" : "opacity-0"}>
                  {s.pendingShift === "f" ? "f" : s.pendingShift === "g" ? "g" : ""}
                </span>
                <span className={s.pendingPrefix ? "opacity-100" : "opacity-0"}>{s.pendingPrefix}</span>
              </div>
              <div className="text-right font-mono text-xl sm:text-2xl font-bold text-neutral-900 truncate">
                {s.message ?? visor}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center px-1 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-neutral-900 flex items-center justify-center shadow">
              <span className="text-white font-black text-[11px] sm:text-xs italic">hp</span>
            </div>
            <span className="text-amber-800 dark:text-amber-500 font-serif font-bold text-xs sm:text-sm mt-0.5 tracking-tight">
              12C
            </span>
          </div>
        </div>

        <p className="text-[10.5px] text-[#5c4f33] dark:text-amber-200/70 mb-2 min-h-[2.2em] leading-snug px-0.5">
          {s.lastAction}
        </p>

        {/* Linha 1: n i PV PMT FV CHS 7 8 9 ÷ */}
        <div className="grid grid-cols-10 gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
          <Key onClick={() => dispatch({ type: "tvm", key: "n" })} className={blackKey} f="AMORT" g="12×">n</Key>
          <Key onClick={() => dispatch({ type: "tvm", key: "i" })} className={blackKey} f="INT" g="12÷">i</Key>
          <Key onClick={() => dispatch({ type: "tvm", key: "pv" })} className={blackKey} f="NPV" g="CFo" small>PV</Key>
          <Key onClick={() => dispatch({ type: "tvm", key: "pmt" })} className={blackKey} f="RND" g="N" small>PMT</Key>
          <Key onClick={() => dispatch({ type: "tvm", key: "fv" })} className={blackKey} f="IRR" small>FV</Key>
          <Key onClick={() => dispatch({ type: "chs" })} className={blackKey} g="DATE" small>CHS</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "7" })} className={blackKey} g="BEG">7</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "8" })} className={blackKey} g="END">8</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "9" })} className={blackKey} g="MEM">9</Key>
          <Key onClick={() => dispatch({ type: "op", op: "÷" })} className={blackKey}>÷</Key>
        </div>

        {/* Linha 2: yx 1/x %T Δ% EEX 4 5 6 × (col10 vazia) */}
        <div className="grid grid-cols-10 gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
          <Key onClick={() => dispatch({ type: "pow" })} className={blackKey} f="PRICE" small>yˣ</Key>
          <Key onClick={() => dispatch({ type: "inv" })} className={blackKey} f="YTM">1/x</Key>
          <Key onClick={() => dispatch({ type: "percentTotal" })} className={blackKey} f="SL" small>%T</Key>
          <Key onClick={() => dispatch({ type: "deltaPercent" })} className={blackKey} f="SOYD" small>Δ%</Key>
          <Key onClick={() => dispatch({ type: "eex" })} className={blackKey} f="DB" small>EEX</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "4" })} className={blackKey} g="D.MY" small>4</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "5" })} className={blackKey} g="M.DY" small>5</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "6" })} className={blackKey}>6</Key>
          <Key onClick={() => dispatch({ type: "op", op: "×" })} className={blackKey}>×</Key>
          <div />
        </div>

        {/* Linhas 3 e 4 + ENTER (span 2 linhas) */}
        <div className="grid grid-cols-10 grid-rows-2 gap-0.5 sm:gap-1">
          <div style={{ gridColumn: 10, gridRow: "1 / span 2" }}>
            <button
              onClick={() => dispatch({ type: "enter" })}
              className="h-full w-full flex flex-col items-center justify-between rounded-md bg-neutral-900 hover:bg-neutral-800 shadow-[0_2px_0_rgba(0,0,0,0.4)] active:translate-y-px active:shadow-none py-1"
            >
              <span className="text-[6.5px] sm:text-[8px] font-bold text-sky-400 leading-none">LSTx</span>
              <span
                className="font-bold text-white text-[10px] sm:text-xs tracking-widest"
                style={{ writingMode: "vertical-rl" }}
              >
                ENTER↑
              </span>
              <span className="h-1" />
            </button>
          </div>

          <Key onClick={() => dispatch({ type: "decorative", msg: "R/S (executar programa) não implementada nesta simulação." })} className={blackKey} small>R/S</Key>
          <Key onClick={() => dispatch({ type: "decorative", msg: "SST (passo a passo de programa) não implementada nesta simulação." })} className={blackKey} small>SST</Key>
          <Key onClick={() => dispatch({ type: "rolldown" })} className={blackKey} small>R↓</Key>
          <Key onClick={() => dispatch({ type: "clx" })} className={blackKey} small>CLx</Key>
          <Key onClick={() => dispatch({ type: "swapxy" })} className={blackKey} small>x≷y</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "1" })} className={blackKey} f="x̄,ȳ" small>1</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "2" })} className={blackKey} f="s" small>2</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "3" })} className={blackKey} f="ŷ,r" small>3</Key>
          <Key onClick={() => dispatch({ type: "op", op: "-" })} className={blackKey}>−</Key>

          <Key onClick={() => dispatch({ type: "ac" })} className={blackKey} small>ON</Key>
          <Key onClick={() => dispatch({ type: "shift", which: "f" })} className="bg-amber-500 hover:bg-amber-400" ativa={s.pendingShift === "f"}>f</Key>
          <Key onClick={() => dispatch({ type: "shift", which: "g" })} className="bg-sky-500 hover:bg-sky-400" ativa={s.pendingShift === "g"}>g</Key>
          <Key onClick={() => dispatch({ type: "stoPrefix" })} className={blackKey} ativa={s.pendingPrefix === "STO"} small>STO</Key>
          <Key onClick={() => dispatch({ type: "rclPrefix" })} className={blackKey} ativa={s.pendingPrefix === "RCL"} small>RCL</Key>
          <Key onClick={() => dispatch({ type: "digit", d: "0" })} className={blackKey}>0</Key>
          <Key onClick={() => dispatch({ type: "dot" })} className={blackKey}>.</Key>
          <Key onClick={() => dispatch({ type: "sigmaPlus" })} className={blackKey} g="Σ−" small>Σ+</Key>
          <Key onClick={() => dispatch({ type: "op", op: "+" })} className={blackKey}>+</Key>
        </div>

        <p className="text-center text-[8px] sm:text-[9px] tracking-[0.3em] text-[#8a7a54] dark:text-amber-700 font-semibold mt-3">
          HEWLETT · PACKARD
        </p>
      </div>

      {/* Painel de registradores */}
      <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Registradores financeiros
          </p>
          <div className="flex gap-1">
            {[0, 2, 4, 6].map((d) => (
              <button
                key={d}
                onClick={() => dispatch({ type: "setDecimals", n: d })}
                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  s.decimals === d
                    ? "bg-violet-600 text-white border-violet-600"
                    : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                }`}
                title="Casas decimais do visor"
              >
                {d}c
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {nomesRegs.map(({ key, label }) => {
            const bruto = s.tvm[key];
            const valor = bruto === undefined ? undefined : key === "i" ? bruto * 100 : bruto;
            return (
              <div key={key} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-center">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-500">{label}</div>
                <div className="font-mono text-[11px] sm:text-xs text-slate-800 dark:text-slate-200 truncate">
                  {valor === undefined ? "—" : formatarVisor(valor, 2)}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5">
          Pilha RPN (X / Y / Z / T)
        </p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {(["t", "z", "y", "x"] as const).map((r) => (
            <div key={r} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-center">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{r}</div>
              <div className="font-mono text-[11px] sm:text-xs text-slate-800 dark:text-slate-200 truncate">
                {formatarVisor(s.stack[r], 2)}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5">
          Registradores de memória (STO / RCL)
        </p>
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 mb-3">
          {Array.from({ length: 10 }, (_, i) => String(i)).map((k) => (
            <div key={k} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-1.5 py-1 text-center">
              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500">R{k}</div>
              <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate">
                {s.regs[k] === undefined ? "—" : formatarVisor(s.regs[k], 0)}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5">
          Pontos estatísticos (Σ+)
        </p>
        {s.pontosEstatistica.length === 0 ? (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Nenhum ponto ainda. Digite y ENTER x e pressione Σ+ para acumular.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {s.pontosEstatistica.map(([x, y], idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono bg-slate-50 dark:bg-slate-800 rounded px-1.5 py-0.5 text-slate-600 dark:text-slate-300"
              >
                ({formatarVisor(x, 1)}, {formatarVisor(y, 1)})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
