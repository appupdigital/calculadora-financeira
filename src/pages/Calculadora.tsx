import { useState } from "react";
import { calcularIndices, calcularInvestimento, fmt } from "../lib/finance";

function OutBox({
  label,
  valor,
  kind,
}: {
  label: string;
  valor: string;
  kind: "good" | "bad" | "info";
}) {
  const color =
    kind === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : kind === "bad"
      ? "text-rose-600 dark:text-rose-400"
      : "text-slate-800 dark:text-slate-200";
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${color}`}>{valor}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </label>
  );
}

function CalculadoraInvestimento() {
  const [cf0, setCf0] = useState("");
  const [taxa, setTaxa] = useState("");
  const [fluxos, setFluxos] = useState(["", "", "", "", "", ""]);
  const [resultado, setResultado] = useState<ReturnType<typeof calcularInvestimento> | null>(null);
  const [erro, setErro] = useState("");

  function atualizarFluxo(i: number, v: string) {
    const novo = [...fluxos];
    novo[i] = v;
    setFluxos(novo);
  }

  function calcular() {
    const cf0Num = parseFloat(cf0) || 0;
    const k = (parseFloat(taxa) || 0) / 100;
    const vals = fluxos.filter((v) => v !== "").map((v) => parseFloat(v));
    if (vals.length === 0) {
      setErro("Informe ao menos 1 fluxo de caixa.");
      setResultado(null);
      return;
    }
    setErro("");
    setResultado(calcularInvestimento(cf0Num, k, vals));
  }

  function limpar() {
    setCf0("");
    setTaxa("");
    setFluxos(["", "", "", "", "", ""]);
    setResultado(null);
    setErro("");
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
        VPL · TIR · Payback · Índice de Lucratividade
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Informe o investimento inicial, a taxa mínima de atratividade (k) e até 6 fluxos de caixa futuros.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <Field label="Investimento inicial (CF₀)" value={cf0} onChange={setCf0} placeholder="ex: 50000" />
        <Field label="Taxa k (% a.a.)" value={taxa} onChange={setTaxa} placeholder="ex: 10" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {fluxos.map((v, i) => (
          <Field key={i} label={`CF${i + 1}`} value={v} onChange={(val) => atualizarFluxo(i, val)} placeholder="0" />
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={calcular}
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
        >
          Calcular
        </button>
        <button
          onClick={limpar}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Limpar
        </button>
      </div>

      {erro && <div className="text-sm text-rose-600 dark:text-rose-400 mb-4">{erro}</div>}

      {resultado && (
        <>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <OutBox
              label={`VPL (a ${(parseFloat(taxa) || 0).toFixed(2)}% a.a.)`}
              valor={`R$ ${fmt(resultado.vpl)}`}
              kind={resultado.vpl >= 0 ? "good" : "bad"}
            />
            <OutBox
              label="TIR"
              valor={resultado.tir !== null ? `${(resultado.tir * 100).toFixed(2)}%` : "sem raiz no intervalo"}
              kind={resultado.tir !== null && resultado.tir >= (parseFloat(taxa) || 0) / 100 ? "good" : "bad"}
            />
            <OutBox
              label="Índice de Lucratividade"
              valor={resultado.il.toFixed(3)}
              kind={resultado.il >= 1 ? "good" : "bad"}
            />
            <OutBox
              label="Payback simples"
              valor={resultado.paybackSimples !== null ? `${resultado.paybackSimples.toFixed(2)} anos` : "não recupera"}
              kind="info"
            />
            <OutBox
              label="Payback descontado"
              valor={
                resultado.paybackDescontado !== null ? `${resultado.paybackDescontado.toFixed(2)} anos` : "não recupera"
              }
              kind="info"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Critério: VPL&gt;0 e TIR&gt;k → aceitar · IL&gt;1 → aceitar (equivale a VPL&gt;0). TIR encontrada por
            bisseção numérica (aproximação).
          </p>
        </>
      )}
    </div>
  );
}

function CalculadoraIndices() {
  const [ac, setAc] = useState("");
  const [rlp, setRlp] = useState("");
  const [disp, setDisp] = useState("");
  const [drl, setDrl] = useState("");
  const [pc, setPc] = useState("");
  const [pnc, setPnc] = useState("");
  const [pl, setPl] = useState("");
  const [resultado, setResultado] = useState<ReturnType<typeof calcularIndices> | null>(null);

  function calcular() {
    setResultado(
      calcularIndices(
        parseFloat(ac) || 0,
        parseFloat(rlp) || 0,
        parseFloat(disp) || 0,
        parseFloat(drl) || 0,
        parseFloat(pc) || 0,
        parseFloat(pnc) || 0,
        parseFloat(pl) || 0
      )
    );
  }

  function limpar() {
    setAc("");
    setRlp("");
    setDisp("");
    setDrl("");
    setPc("");
    setPnc("");
    setPl("");
    setResultado(null);
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
        Índices de Liquidez e Endividamento
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Informe os valores do Balanço Patrimonial para calcular LG, LC, LS, PCT e CE.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <Field label="Ativo Circulante (AC)" value={ac} onChange={setAc} />
        <Field label="Realizável LP (RLP)" value={rlp} onChange={setRlp} />
        <Field label="Disponibilidades (DISP)" value={disp} onChange={setDisp} />
        <Field label="Duplicatas a Receber Líq. (DRL)" value={drl} onChange={setDrl} />
        <Field label="Passivo Circulante (PC)" value={pc} onChange={setPc} />
        <Field label="Passivo Não Circulante (PNC)" value={pnc} onChange={setPnc} />
        <Field label="Patrimônio Líquido (PL)" value={pl} onChange={setPl} />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={calcular}
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
        >
          Calcular
        </button>
        <button
          onClick={limpar}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Limpar
        </button>
      </div>

      {resultado && (
        <div className="grid sm:grid-cols-3 gap-3">
          <OutBox label="Liquidez Geral (LG)" valor={resultado.lg.toFixed(2)} kind={resultado.lg >= 1 ? "good" : "bad"} />
          <OutBox label="Liquidez Corrente (LC)" valor={resultado.lc.toFixed(2)} kind={resultado.lc >= 1 ? "good" : "bad"} />
          <OutBox label="Liquidez Seca (LS)" valor={resultado.ls.toFixed(2)} kind={resultado.ls >= 1 ? "good" : "bad"} />
          <OutBox
            label="Participação Cap. Terceiros (PCT)"
            valor={`${resultado.pct.toFixed(1)}%`}
            kind={resultado.pct <= 100 ? "good" : "bad"}
          />
          <OutBox label="Composição do Endividamento (CE)" valor={`${resultado.ce.toFixed(1)}%`} kind="info" />
        </div>
      )}
    </div>
  );
}

export default function Calculadora() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          🧮 Calculadora Financeira
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Calcule VPL, TIR, Payback, Índice de Lucratividade e os principais índices de liquidez e endividamento.
        </p>
      </div>
      <CalculadoraInvestimento />
      <CalculadoraIndices />
    </div>
  );
}
