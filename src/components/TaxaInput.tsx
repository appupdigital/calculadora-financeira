import MaskedInput from "./MaskedInput";

export type UnidadeTaxa = "mes" | "ano";

interface TaxaInputProps {
  label: string;
  digits: string;
  onChange: (digits: string) => void;
  unidade: UnidadeTaxa;
  onUnidadeChange: (u: UnidadeTaxa) => void;
}

export default function TaxaInput({ label, digits, onChange, unidade, onUnidadeChange }: TaxaInputProps) {
  return (
    <div>
      <MaskedInput label={label} digits={digits} onChange={onChange} sufixo="%" />
      <div className="mt-1.5 inline-flex rounded-md bg-slate-100 dark:bg-slate-800 p-0.5">
        {(
          [
            ["mes", "ao mês"],
            ["ano", "ao ano"],
          ] as [UnidadeTaxa, string][]
        ).map(([u, texto]) => (
          <button
            key={u}
            type="button"
            onClick={() => onUnidadeChange(u)}
            className={`min-h-7 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              unidade === u
                ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>
    </div>
  );
}
