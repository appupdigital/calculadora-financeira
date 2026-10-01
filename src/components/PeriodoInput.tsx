import MaskedInput from "./MaskedInput";

export type UnidadePeriodo = "meses" | "anos";

interface PeriodoInputProps {
  label: string;
  digits: string;
  onChange: (digits: string) => void;
  unidade: UnidadePeriodo;
  onUnidadeChange: (u: UnidadePeriodo) => void;
}

export default function PeriodoInput({ label, digits, onChange, unidade, onUnidadeChange }: PeriodoInputProps) {
  return (
    <div>
      <MaskedInput label={label} digits={digits} onChange={onChange} casas={0} />
      <div className="mt-1.5 inline-flex rounded-md bg-slate-100 dark:bg-slate-800 p-0.5">
        {(["meses", "anos"] as UnidadePeriodo[]).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onUnidadeChange(u)}
            className={`min-h-7 px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition ${
              unidade === u
                ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
