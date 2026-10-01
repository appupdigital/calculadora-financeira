import { useState } from "react";
import Calculadora from "./pages/Calculadora";
import Formulas from "./pages/Formulas";
import HP12CPage from "./pages/HP12C";
import CalculatorIcon from "./components/CalculatorIcon";
import BottomNav from "./components/BottomNav";

type Aba = "calc" | "formulas" | "hp12c";

export default function App() {
  const [aba, setAba] = useState<Aba>("calc");

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 safe-top safe-x bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CalculatorIcon className="w-8 h-8 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
              Calculadora Financeira
            </span>
          </div>
          <nav className="hidden sm:flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
            <button
              onClick={() => setAba("calc")}
              className={`min-h-9 px-3 py-2 rounded-md text-sm font-semibold transition ${
                aba === "calc"
                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Calculadora
            </button>
            <button
              onClick={() => setAba("formulas")}
              className={`min-h-9 px-3 py-2 rounded-md text-sm font-semibold transition ${
                aba === "formulas"
                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Fórmulas
            </button>
            <button
              onClick={() => setAba("hp12c")}
              className={`min-h-9 px-3 py-2 rounded-md text-sm font-semibold transition ${
                aba === "hp12c"
                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              HP 12C
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 safe-x pb-20 sm:pb-0">
        {aba === "calc" ? <Calculadora /> : aba === "formulas" ? <Formulas /> : <HP12CPage />}
      </main>

      <footer className="hidden sm:block safe-x max-w-5xl mx-auto w-full px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-600">
        Feito para estudo de matemática financeira · Calculadora de VPL, TIR, Payback, IL e índices financeiros.
      </footer>

      <BottomNav aba={aba} onChange={setAba} />
    </div>
  );
}
