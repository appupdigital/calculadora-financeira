import type { Formula } from "../data/formulas";
import FormulaText from "./FormulaText";

function regraClasses(tipo?: "boa" | "ruim" | "info") {
  if (tipo === "boa") return "text-emerald-600 dark:text-emerald-400";
  if (tipo === "ruim") return "text-rose-600 dark:text-rose-400";
  return "text-slate-500 dark:text-slate-400";
}

function borderAccent(tipo?: "boa" | "ruim" | "info") {
  if (tipo === "boa") return "border-l-emerald-400 dark:border-l-emerald-600";
  if (tipo === "ruim") return "border-l-rose-400 dark:border-l-rose-600";
  return "border-l-violet-300 dark:border-l-violet-700";
}

export default function FormulaCard({ f }: { f: Formula }) {
  return (
    <div
      className={
        "rounded-xl border border-l-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm " +
        borderAccent(f.regraTipo)
      }
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{f.nome}</h3>
        {f.sigla && (
          <span className="shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
            {f.sigla}
          </span>
        )}
      </div>

      {f.oQueE && (
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{f.oQueE}</p>
      )}

      <div className="font-mono text-[13px] leading-relaxed sm:text-[15px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 mb-3 whitespace-pre-wrap break-words text-slate-800 dark:text-slate-200">
        <FormulaText texto={f.formula} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5">
        Variáveis
      </p>
      <ul className="space-y-1 mb-3">
        {f.vars.map((v) => (
          <li key={v.label} className="text-sm text-slate-600 dark:text-slate-300">
            <b className="text-slate-900 dark:text-slate-100 font-mono">
              <FormulaText texto={v.label} />
            </b>{" "}
            <span className="text-slate-500 dark:text-slate-400">= {v.desc}</span>
          </li>
        ))}
      </ul>

      {f.regra && (
        <div className={"text-xs font-medium mb-3 " + regraClasses(f.regraTipo)}>{f.regra}</div>
      )}

      {f.comoLer && (
        <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900 px-3 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-1">
            Como ler o resultado
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{f.comoLer}</p>
        </div>
      )}
    </div>
  );
}
