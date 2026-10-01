import CalculatorIcon from "./CalculatorIcon";
import SigmaIcon from "./SigmaIcon";
import HP12CIcon from "./HP12CIcon";

type Aba = "calc" | "formulas" | "hp12c";

export default function BottomNav({ aba, onChange }: { aba: Aba; onChange: (a: Aba) => void }) {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 safe-bottom safe-x bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-3">
        <button
          onClick={() => onChange("calc")}
          className={`flex flex-col items-center gap-0.5 py-2 min-h-14 transition ${
            aba === "calc" ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <CalculatorIcon className="w-6 h-6" />
          <span className="text-[11px] font-semibold">Calculadora</span>
        </button>
        <button
          onClick={() => onChange("formulas")}
          className={`flex flex-col items-center gap-0.5 py-2 min-h-14 transition ${
            aba === "formulas" ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <SigmaIcon className="w-6 h-6" />
          <span className="text-[11px] font-semibold">Fórmulas</span>
        </button>
        <button
          onClick={() => onChange("hp12c")}
          className={`flex flex-col items-center gap-0.5 py-2 min-h-14 transition ${
            aba === "hp12c" ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <HP12CIcon className="w-6 h-6" />
          <span className="text-[11px] font-semibold">HP 12C</span>
        </button>
      </div>
    </nav>
  );
}
