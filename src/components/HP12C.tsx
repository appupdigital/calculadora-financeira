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
  message: string | null;
  lastAction: string;
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
  message: null,
  lastAction: "Calculadora pronta. Digite um número e pressione ENTER.",
};

type Acao =
  | { type: "digit"; d: string }
  | { type: "dot" }
  | { type: "chs" }
  | { type: "backspace" }
  | { type: "enter" }
  | { type: "op"; op: "+" | "-" | "×" | "÷" }
  | { type: "percent" }
  | { type: "deltaPercent" }
  | { type: "inv" }
  | { type: "clx" }
  | { type: "ac" }
  | { type: "stoPrefix" }
  | { type: "rclPrefix" }
  | { type: "tvm"; key: ChaveTVM }
  | { type: "clearFin" }
  | { type: "toggleBegin" }
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

function reducer(state: State, acao: Acao): State {
  // qualquer tecla limpa a mensagem de erro anterior, exceto quando a própria ação define uma nova
  let s: State = { ...state, message: null };

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

    case "backspace": {
      if (!s.entering) return s;
      const novo = s.buffer.length > 1 ? s.buffer.slice(0, -1) : "0";
      return { ...s, buffer: novo === "-" ? "0" : novo };
    }

    case "enter": {
      s = commit(s);
      return {
        ...s,
        stack: { x: s.stack.x, y: s.stack.x, z: s.stack.y, t: s.stack.z },
        entering: false,
        liftStack: false,
        buffer: String(s.stack.x),
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
        return { ...s, message: "Error 0 (divisão por zero)", lastAction: "Erro: divisão por zero" };
      }
      return {
        ...s,
        stack: { x: r, y: z, z: t, t },
        entering: false,
        liftStack: true,
        buffer: String(r),
        lastAction: `${formatarVisor(y, s.decimals)} ${acao.op} ${formatarVisor(x, s.decimals)} = ${formatarVisor(r, s.decimals)}`,
      };
    }

    case "percent": {
      s = commit(s);
      const r = s.stack.y * (s.stack.x / 100);
      return {
        ...s,
        stack: { ...s.stack, x: r },
        entering: false,
        liftStack: true,
        lastAction: `${formatarVisor(s.stack.x, s.decimals)}% de ${formatarVisor(s.stack.y, s.decimals)} = ${formatarVisor(r, s.decimals)}`,
      };
    }

    case "deltaPercent": {
      s = commit(s);
      if (s.stack.y === 0) return { ...s, message: "Error 0", lastAction: "Erro: Y é zero" };
      const r = ((s.stack.x - s.stack.y) / s.stack.y) * 100;
      return {
        ...s,
        stack: { ...s.stack, x: r },
        entering: false,
        liftStack: true,
        lastAction: `Variação percentual de Y para X: ${formatarVisor(r, s.decimals)}%`,
      };
    }

    case "inv": {
      s = commit(s);
      if (s.stack.x === 0) return { ...s, message: "Error 0", lastAction: "Erro: 1/0" };
      const r = 1 / s.stack.x;
      return { ...s, stack: { ...s.stack, x: r }, entering: false, liftStack: true, lastAction: `1/x = ${formatarVisor(r, s.decimals)}` };
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
      return { ...ESTADO_INICIAL, lastAction: "AC — tudo zerado (pilha, registradores e financeiras)" };

    case "stoPrefix":
      return { ...s, pendingPrefix: s.pendingPrefix === "STO" ? null : "STO", lastAction: "STO — pressione um dígito de 0 a 9" };

    case "rclPrefix":
      return { ...s, pendingPrefix: s.pendingPrefix === "RCL" ? null : "RCL", lastAction: "RCL — pressione um dígito de 0 a 9, ou n / i / PV / PMT / FV" };

    case "clearFin":
      return { ...s, tvm: {}, lastAction: "CLEAR FIN — registradores n, i, PV, PMT e FV zerados" };

    case "toggleBegin":
      return { ...s, begin: !s.begin, lastAction: !s.begin ? "Modo BEGIN (pagamentos no início do período)" : "Modo END (pagamentos no fim do período)" };

    case "setDecimals":
      return { ...s, decimals: acao.n };

    case "tvm": {
      const nomes: Record<ChaveTVM, string> = { n: "n", i: "i", pv: "PV", pmt: "PMT", fv: "FV" };
      if (s.pendingPrefix === "RCL") {
        const v = acao.key === "i" ? (s.tvm.i ?? 0) * 100 : s.tvm[acao.key] ?? 0;
        return {
          ...s,
          stack: { ...s.stack, x: v },
          entering: false,
          liftStack: true,
          pendingPrefix: null,
          lastAction: `Recuperado ${nomes[acao.key]}: ${formatarVisor(v, s.decimals)}`,
        };
      }
      const wasEntering = s.entering;
      s = commit(s);
      if (s.pendingPrefix === "STO") s = { ...s, pendingPrefix: null };

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
        lastAction: `Calculado ${nomes[acao.key]} = ${formatarVisor(valorVisor, s.decimals)}`,
      };
    }

    default:
      return s;
  }
}

function Tecla({
  onClick,
  children,
  sub,
  className = "",
  ativa = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  sub?: string;
  className?: string;
  ativa?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "relative flex flex-col items-center justify-center rounded-lg h-12 sm:h-14 text-[13px] sm:text-sm font-bold shadow-sm active:scale-95 active:shadow-inner transition select-none " +
        className +
        (ativa ? " ring-2 ring-amber-400" : "")
      }
    >
      <span>{children}</span>
      {sub && <span className="absolute -bottom-4 text-[9px] font-normal text-amber-700 dark:text-amber-500 hidden sm:block">{sub}</span>}
    </button>
  );
}

export default function HP12C() {
  const [s, dispatch] = useReducer(reducer, ESTADO_INICIAL);

  const visor = s.entering ? s.buffer : formatarVisor(s.stack.x, s.decimals);

  const btnDigit = "bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600";
  const btnFn = "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500";
  const btnGold = "bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 hover:from-amber-300 hover:to-amber-500";
  const btnOp = "bg-slate-500 text-white hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500";
  const btnRed = "bg-rose-600 text-white hover:bg-rose-500";

  const nomesRegs: { key: ChaveTVM; label: string }[] = [
    { key: "n", label: "n" },
    { key: "i", label: "i (%)" },
    { key: "pv", label: "PV" },
    { key: "pmt", label: "PMT" },
    { key: "fv", label: "FV" },
  ];

  return (
    <div className="max-w-md mx-auto">
      {/* Corpo da calculadora */}
      <div className="rounded-3xl bg-gradient-to-b from-neutral-800 to-neutral-900 p-4 sm:p-5 shadow-xl border border-neutral-700">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-amber-500 font-black tracking-wide text-sm">HP 12C</span>
          <span className="text-[10px] text-neutral-400">estilo · RPN</span>
        </div>

        {/* Visor */}
        <div className="rounded-xl bg-[#c7d1b9] dark:bg-[#aab696] px-3 py-2 mb-3 shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-700 mb-0.5">
            <span className={s.begin ? "opacity-100" : "opacity-0"}>BEGIN</span>
            <span className={s.pendingPrefix ? "opacity-100" : "opacity-0"}>{s.pendingPrefix}</span>
          </div>
          <div className="text-right font-mono text-2xl sm:text-3xl font-bold text-neutral-900 truncate" data-testid="visor">
            {s.message ?? visor}
          </div>
        </div>

        <p className="text-[11px] text-neutral-300 mb-3 min-h-[2.5em] leading-snug px-0.5">{s.lastAction}</p>

        {/* Teclado */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          <Tecla onClick={() => dispatch({ type: "tvm", key: "n" })} className={btnGold} sub="12÷">n</Tecla>
          <Tecla onClick={() => dispatch({ type: "tvm", key: "i" })} className={btnGold} sub="%">i</Tecla>
          <Tecla onClick={() => dispatch({ type: "tvm", key: "pv" })} className={btnGold}>PV</Tecla>
          <Tecla onClick={() => dispatch({ type: "tvm", key: "pmt" })} className={btnGold}>PMT</Tecla>
          <Tecla onClick={() => dispatch({ type: "tvm", key: "fv" })} className={btnGold}>FV</Tecla>

          <Tecla onClick={() => dispatch({ type: "stoPrefix" })} className={btnFn} ativa={s.pendingPrefix === "STO"}>STO</Tecla>
          <Tecla onClick={() => dispatch({ type: "rclPrefix" })} className={btnFn} ativa={s.pendingPrefix === "RCL"}>RCL</Tecla>
          <Tecla onClick={() => dispatch({ type: "clx" })} className={btnFn}>CLx</Tecla>
          <Tecla onClick={() => dispatch({ type: "clearFin" })} className={btnFn}>f CLEAR FIN</Tecla>
          <Tecla onClick={() => dispatch({ type: "toggleBegin" })} className={btnFn}>g BEG/END</Tecla>

          <Tecla onClick={() => dispatch({ type: "digit", d: "7" })} className={btnDigit}>7</Tecla>
          <Tecla onClick={() => dispatch({ type: "digit", d: "8" })} className={btnDigit}>8</Tecla>
          <Tecla onClick={() => dispatch({ type: "digit", d: "9" })} className={btnDigit}>9</Tecla>
          <Tecla onClick={() => dispatch({ type: "op", op: "÷" })} className={btnOp}>÷</Tecla>
          <Tecla onClick={() => dispatch({ type: "inv" })} className={btnFn}>1/x</Tecla>

          <Tecla onClick={() => dispatch({ type: "digit", d: "4" })} className={btnDigit}>4</Tecla>
          <Tecla onClick={() => dispatch({ type: "digit", d: "5" })} className={btnDigit}>5</Tecla>
          <Tecla onClick={() => dispatch({ type: "digit", d: "6" })} className={btnDigit}>6</Tecla>
          <Tecla onClick={() => dispatch({ type: "op", op: "×" })} className={btnOp}>×</Tecla>
          <Tecla onClick={() => dispatch({ type: "percent" })} className={btnFn}>%</Tecla>

          <Tecla onClick={() => dispatch({ type: "digit", d: "1" })} className={btnDigit}>1</Tecla>
          <Tecla onClick={() => dispatch({ type: "digit", d: "2" })} className={btnDigit}>2</Tecla>
          <Tecla onClick={() => dispatch({ type: "digit", d: "3" })} className={btnDigit}>3</Tecla>
          <Tecla onClick={() => dispatch({ type: "op", op: "-" })} className={btnOp}>−</Tecla>
          <Tecla onClick={() => dispatch({ type: "deltaPercent" })} className={btnFn}>Δ%</Tecla>

          <Tecla onClick={() => dispatch({ type: "digit", d: "0" })} className={btnDigit}>0</Tecla>
          <Tecla onClick={() => dispatch({ type: "dot" })} className={btnDigit}>.</Tecla>
          <Tecla onClick={() => dispatch({ type: "chs" })} className={btnFn}>CHS</Tecla>
          <Tecla onClick={() => dispatch({ type: "op", op: "+" })} className={btnOp}>+</Tecla>
          <Tecla onClick={() => dispatch({ type: "ac" })} className={btnRed}>AC</Tecla>

          <Tecla onClick={() => dispatch({ type: "backspace" })} className={btnFn + " col-span-2"}>⌫ Apagar</Tecla>
          <Tecla onClick={() => dispatch({ type: "enter" })} className={btnGold + " col-span-3"}>ENTER ↑</Tecla>
        </div>
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
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {Array.from({ length: 10 }, (_, i) => String(i)).map((k) => (
            <div key={k} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-1.5 py-1 text-center">
              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500">R{k}</div>
              <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate">
                {s.regs[k] === undefined ? "—" : formatarVisor(s.regs[k], 0)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
