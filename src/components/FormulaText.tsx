const SUBSCRIPT_MAP: Record<string, string> = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
  "ₜ": "t",
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "ⁿ": "n",
};

type Tipo = "normal" | "sub" | "sup";

function tipoDe(ch: string): Tipo {
  if (SUBSCRIPT_MAP[ch]) return "sub";
  if (SUPERSCRIPT_MAP[ch]) return "sup";
  return "normal";
}

function traduz(ch: string, tipo: Tipo): string {
  if (tipo === "sub") return SUBSCRIPT_MAP[ch];
  if (tipo === "sup") return SUPERSCRIPT_MAP[ch];
  return ch;
}

/**
 * Renderiza uma fórmula trocando os caracteres Unicode de sub/sobrescrito
 * (₀ ₁ ... ⁿ) por <sub>/<sup> de verdade, pra não depender da fonte do
 * aparelho ter esses glifos (no iOS eles às vezes caem numa fonte
 * diferente e ficam deslocados/ilegíveis).
 */
export default function FormulaText({ texto }: { texto: string }) {
  const partes: { tipo: Tipo; texto: string }[] = [];

  for (const ch of texto) {
    const tipo = tipoDe(ch);
    const valor = traduz(ch, tipo);
    const ultima = partes[partes.length - 1];
    if (ultima && ultima.tipo === tipo) {
      ultima.texto += valor;
    } else {
      partes.push({ tipo, texto: valor });
    }
  }

  return (
    <>
      {partes.map((p, i) => {
        if (p.tipo === "sub") return <sub key={i}>{p.texto}</sub>;
        if (p.tipo === "sup") return <sup key={i}>{p.texto}</sup>;
        return <span key={i}>{p.texto}</span>;
      })}
    </>
  );
}
