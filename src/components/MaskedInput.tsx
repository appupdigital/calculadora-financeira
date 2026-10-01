import { formatDigits, sanitizeDigits } from "../lib/mask";

interface MaskedInputProps {
  label: string;
  digits: string;
  onChange: (digits: string) => void;
  casas?: number;
  prefixo?: string;
  sufixo?: string;
  negativo?: boolean;
}

export default function MaskedInput({
  label,
  digits,
  onChange,
  casas = 2,
  prefixo,
  sufixo,
  negativo = false,
}: MaskedInputProps) {
  const display = formatDigits(digits, casas);

  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</span>
      <div className="relative">
        {prefixo && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500">
            {negativo ? "-" : ""}
            {prefixo}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(sanitizeDigits(e.target.value))}
          className={
            "w-full min-h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 text-base sm:text-sm text-right font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 " +
            (prefixo ? "pl-12 " : "pl-3 ") +
            (sufixo ? "pr-9 " : "pr-3 ")
          }
        />
        {sufixo && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500">
            {sufixo}
          </span>
        )}
      </div>
    </label>
  );
}
