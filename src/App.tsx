import { useState } from "react";
import Calculadora from "./pages/Calculadora";
import Formulas from "./pages/Formulas";

type Aba = "calc" | "formulas";

export default function App() {
  const [aba, setAba] = useState<Aba>("calc");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Calculadora Financeira
            </span>
          </div>
          <nav className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setAba("calc")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition ${
                aba === "calc"
                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Calculadora
            </button>
            <button
              onClick={() => setAba("formulas")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition ${
                aba === "formulas"
                  ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Fórmulas
            </button>
          </nav>
        </div>
      </header>

      <main>{aba === "calc" ? <Calculadora /> : <Formulas />}</main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-600">
        Feito para estudo de matemática financeira · Calculadora de VPL, TIR, Payback, IL e índices financeiros.
      </footer>
    </div>
  );
}
