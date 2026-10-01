import { categorias } from "../data/formulas";
import FormulaCard from "../components/FormulaCard";

export default function Formulas() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          📐 Todas as fórmulas para analisar uma empresa
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Organizadas por bloco, com o significado de cada letra. Toque num atalho para pular direto.
        </p>
        <nav className="flex flex-wrap gap-2 mt-4">
          {categorias.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition"
            >
              {c.titulo}
            </a>
          ))}
        </nav>
      </div>

      <div className="space-y-10">
        {categorias.map((c) => (
          <section key={c.id} id={c.id} className="scroll-mt-20">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {c.titulo}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {c.formulas.map((f) => (
                <FormulaCard key={f.nome} f={f} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
