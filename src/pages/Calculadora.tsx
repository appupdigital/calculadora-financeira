import { useState, type ReactNode } from "react";
import {
  calcularConversaoTaxa,
  calcularIndices,
  calcularInvestimento,
  calcularJuros,
  calcularLucratividade,
  calcularPrazosCiclos,
  fmt,
  type UnidadeTaxa,
} from "../lib/finance";
import { digitsToNumber } from "../lib/mask";
import MaskedInput from "../components/MaskedInput";
import PeriodoInput, { type UnidadePeriodo } from "../components/PeriodoInput";
import TaxaInput from "../components/TaxaInput";

function OutBox({
  label,
  valor,
  kind,
  destaque,
}: {
  label: string;
  valor: string;
  kind: "good" | "bad" | "info";
  destaque?: boolean;
}) {
  const color =
    kind === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : kind === "bad"
      ? "text-rose-600 dark:text-rose-400"
      : "text-slate-800 dark:text-slate-200";
  return (
    <div
      className={
        "rounded-lg border px-4 py-3 " +
        (destaque
          ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/40"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900")
      }
    >
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className={`text-lg font-bold font-mono ${color}`}>{valor}</div>
    </div>
  );
}

function Botoes({ onCalcular, onLimpar }: { onCalcular: () => void; onLimpar: () => void }) {
  return (
    <div className="flex gap-2 mb-5">
      <button
        onClick={onCalcular}
        className="min-h-11 flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold transition shadow-sm"
      >
        Calcular
      </button>
      <button
        onClick={onLimpar}
        className="min-h-11 flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        Limpar
      </button>
    </div>
  );
}

function CardCalc({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{titulo}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{descricao}</p>
      {children}
    </div>
  );
}

const vazios6 = ["", "", "", "", "", ""];

function CalculadoraInvestimento() {
  const [cf0, setCf0] = useState("");
  const [taxa, setTaxa] = useState("");
  const [unidadeTaxa, setUnidadeTaxa] = useState<UnidadeTaxa>("ano");
  const [fluxos, setFluxos] = useState(vazios6);
  const [resultado, setResultado] = useState<ReturnType<typeof calcularInvestimento> | null>(null);
  const [kAnualPct, setKAnualPct] = useState(0);
  const [erro, setErro] = useState("");

  function atualizarFluxo(i: number, v: string) {
    const novo = [...fluxos];
    novo[i] = v;
    setFluxos(novo);
  }

  // Os fluxos CF1..CF6 representam períodos anuais, então a taxa é sempre
  // convertida para o equivalente ao ano antes de calcular.
  function taxaAnual(): number {
    const t = digitsToNumber(taxa) / 100;
    return unidadeTaxa === "mes" ? Math.pow(1 + t, 12) - 1 : t;
  }

  function calcular() {
    const cf0Num = digitsToNumber(cf0);
    const k = taxaAnual();
    const vals = fluxos.filter((v) => v !== "" && digitsToNumber(v) !== 0).map((v) => digitsToNumber(v));
    if (vals.length === 0) {
      setErro("Informe ao menos 1 fluxo de caixa.");
      setResultado(null);
      return;
    }
    setErro("");
    setKAnualPct(k * 100);
    setResultado(calcularInvestimento(cf0Num, k, vals));
  }

  function limpar() {
    setCf0("");
    setTaxa("");
    setUnidadeTaxa("ano");
    setFluxos(vazios6);
    setResultado(null);
    setErro("");
  }

  return (
    <CardCalc
      titulo="VPL · TIR · Payback · Índice de Lucratividade"
      descricao="Informe o investimento inicial, a taxa mínima de atratividade (k) e até 6 fluxos de caixa futuros (cada CF representa um ano)."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <MaskedInput label="Investimento inicial (CF₀)" digits={cf0} onChange={setCf0} prefixo="R$" />
        <TaxaInput label="Taxa k" digits={taxa} onChange={setTaxa} unidade={unidadeTaxa} onUnidadeChange={setUnidadeTaxa} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {fluxos.map((v, i) => (
          <MaskedInput key={i} label={`CF${i + 1}`} digits={v} onChange={(val) => atualizarFluxo(i, val)} prefixo="R$" />
        ))}
      </div>

      <Botoes onCalcular={calcular} onLimpar={limpar} />

      {erro && <div className="text-sm text-rose-600 dark:text-rose-400 mb-4">{erro}</div>}

      {resultado && (
        <>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <OutBox
              label={`VPL (a ${kAnualPct.toFixed(2)}% a.a.)`}
              valor={`R$ ${fmt(resultado.vpl)}`}
              kind={resultado.vpl >= 0 ? "good" : "bad"}
              destaque
            />
            <OutBox
              label="TIR"
              valor={resultado.tir !== null ? `${(resultado.tir * 100).toFixed(2)}%` : "sem raiz no intervalo"}
              kind={resultado.tir !== null && resultado.tir >= kAnualPct / 100 ? "good" : "bad"}
              destaque
            />
            <OutBox
              label="Índice de Lucratividade"
              valor={resultado.il.toFixed(3)}
              kind={resultado.il >= 1 ? "good" : "bad"}
              destaque
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
    </CardCalc>
  );
}

function CalculadoraIndicesLiquidez() {
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
        digitsToNumber(ac),
        digitsToNumber(rlp),
        digitsToNumber(disp),
        digitsToNumber(drl),
        digitsToNumber(pc),
        digitsToNumber(pnc),
        digitsToNumber(pl)
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
    <CardCalc
      titulo="Índices de Liquidez e Endividamento"
      descricao="Informe os valores do Balanço Patrimonial para calcular LG, LC, LS, PCT e CE."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <MaskedInput label="Ativo Circulante (AC)" digits={ac} onChange={setAc} prefixo="R$" />
        <MaskedInput label="Realizável LP (RLP)" digits={rlp} onChange={setRlp} prefixo="R$" />
        <MaskedInput label="Disponibilidades (DISP)" digits={disp} onChange={setDisp} prefixo="R$" />
        <MaskedInput label="Duplicatas a Receber Líq. (DRL)" digits={drl} onChange={setDrl} prefixo="R$" />
        <MaskedInput label="Passivo Circulante (PC)" digits={pc} onChange={setPc} prefixo="R$" />
        <MaskedInput label="Passivo Não Circulante (PNC)" digits={pnc} onChange={setPnc} prefixo="R$" />
        <MaskedInput label="Patrimônio Líquido (PL)" digits={pl} onChange={setPl} prefixo="R$" />
      </div>

      <Botoes onCalcular={calcular} onLimpar={limpar} />

      {resultado && (
        <div className="grid sm:grid-cols-3 gap-3">
          <OutBox label="Liquidez Geral (LG)" valor={resultado.lg.toFixed(2)} kind={resultado.lg >= 1 ? "good" : "bad"} destaque />
          <OutBox label="Liquidez Corrente (LC)" valor={resultado.lc.toFixed(2)} kind={resultado.lc >= 1 ? "good" : "bad"} destaque />
          <OutBox label="Liquidez Seca (LS)" valor={resultado.ls.toFixed(2)} kind={resultado.ls >= 1 ? "good" : "bad"} destaque />
          <OutBox
            label="Participação Cap. Terceiros (PCT)"
            valor={`${resultado.pct.toFixed(1)}%`}
            kind={resultado.pct <= 100 ? "good" : "bad"}
          />
          <OutBox label="Composição do Endividamento (CE)" valor={`${resultado.ce.toFixed(1)}%`} kind="info" />
        </div>
      )}
    </CardCalc>
  );
}

function CalculadoraLucratividade() {
  const [vl, setVl] = useState("");
  const [ll, setLl] = useState("");
  const [atInicial, setAtInicial] = useState("");
  const [atFinal, setAtFinal] = useState("");
  const [plInicial, setPlInicial] = useState("");
  const [plFinal, setPlFinal] = useState("");
  const [resultado, setResultado] = useState<ReturnType<typeof calcularLucratividade> | null>(null);

  function calcular() {
    setResultado(
      calcularLucratividade(
        digitsToNumber(vl),
        digitsToNumber(ll),
        digitsToNumber(atInicial),
        digitsToNumber(atFinal),
        digitsToNumber(plInicial),
        digitsToNumber(plFinal)
      )
    );
  }

  function limpar() {
    setVl("");
    setLl("");
    setAtInicial("");
    setAtFinal("");
    setPlInicial("");
    setPlFinal("");
    setResultado(null);
  }

  return (
    <CardCalc
      titulo="Lucratividade e Desempenho (Método Du Pont)"
      descricao="Calcule Giro do Ativo, Margem Líquida, ROA e ROE a partir da DRE e do Balanço."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <MaskedInput label="Vendas Líquidas (VL)" digits={vl} onChange={setVl} prefixo="R$" />
        <MaskedInput label="Lucro Líquido (LL)" digits={ll} onChange={setLl} prefixo="R$" />
        <MaskedInput label="Ativo Total inicial" digits={atInicial} onChange={setAtInicial} prefixo="R$" />
        <MaskedInput label="Ativo Total final" digits={atFinal} onChange={setAtFinal} prefixo="R$" />
        <MaskedInput label="PL inicial" digits={plInicial} onChange={setPlInicial} prefixo="R$" />
        <MaskedInput label="PL final" digits={plFinal} onChange={setPlFinal} prefixo="R$" />
      </div>

      <Botoes onCalcular={calcular} onLimpar={limpar} />

      {resultado && (
        <div className="grid sm:grid-cols-3 gap-3">
          <OutBox label="Giro do Ativo (GA)" valor={resultado.ga.toFixed(2) + "x"} kind="info" />
          <OutBox label="Retorno s/ Vendas (RSV)" valor={resultado.rsv.toFixed(2) + "%"} kind="info" />
          <OutBox label="Retorno s/ Ativo (ROA)" valor={resultado.roa.toFixed(2) + "%"} kind="good" destaque />
          <OutBox label="Retorno s/ PL (ROE)" valor={resultado.roe.toFixed(2) + "%"} kind="good" destaque />
          <OutBox
            label="Tempo p/ dobrar o Ativo (regra 72/ROA)"
            valor={isFinite(resultado.tempoDobrar) ? resultado.tempoDobrar.toFixed(1) + " anos" : "—"}
            kind="info"
          />
        </div>
      )}
    </CardCalc>
  );
}

function CalculadoraPrazosCiclos() {
  const [estInicial, setEstInicial] = useState("");
  const [estFinal, setEstFinal] = useState("");
  const [cpv, setCpv] = useState("");
  const [drInicial, setDrInicial] = useState("");
  const [drFinal, setDrFinal] = useState("");
  const [vendasBrutas, setVendasBrutas] = useState("");
  const [fornInicial, setFornInicial] = useState("");
  const [fornFinal, setFornFinal] = useState("");
  const [dp, setDp] = useState("360");
  const [resultado, setResultado] = useState<ReturnType<typeof calcularPrazosCiclos> | null>(null);

  function calcular() {
    setResultado(
      calcularPrazosCiclos(
        digitsToNumber(estInicial),
        digitsToNumber(estFinal),
        digitsToNumber(cpv),
        digitsToNumber(drInicial),
        digitsToNumber(drFinal),
        digitsToNumber(vendasBrutas),
        digitsToNumber(fornInicial),
        digitsToNumber(fornFinal),
        digitsToNumber(dp, 0)
      )
    );
  }

  function limpar() {
    setEstInicial("");
    setEstFinal("");
    setCpv("");
    setDrInicial("");
    setDrFinal("");
    setVendasBrutas("");
    setFornInicial("");
    setFornFinal("");
    setDp("360");
    setResultado(null);
  }

  return (
    <CardCalc
      titulo="Prazos Médios e Ciclos (PMRE · PMRV · PMPC)"
      descricao="Informe os saldos inicial/final e o período (DP) para calcular os prazos médios e os ciclos operacional e financeiro."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <MaskedInput label="Estoque inicial" digits={estInicial} onChange={setEstInicial} prefixo="R$" />
        <MaskedInput label="Estoque final" digits={estFinal} onChange={setEstFinal} prefixo="R$" />
        <MaskedInput label="CPV / CMV" digits={cpv} onChange={setCpv} prefixo="R$" />
        <MaskedInput label="Duplicatas a Receber inicial" digits={drInicial} onChange={setDrInicial} prefixo="R$" />
        <MaskedInput label="Duplicatas a Receber final" digits={drFinal} onChange={setDrFinal} prefixo="R$" />
        <MaskedInput label="Vendas Brutas" digits={vendasBrutas} onChange={setVendasBrutas} prefixo="R$" />
        <MaskedInput label="Fornecedores inicial" digits={fornInicial} onChange={setFornInicial} prefixo="R$" />
        <MaskedInput label="Fornecedores final" digits={fornFinal} onChange={setFornFinal} prefixo="R$" />
        <MaskedInput label="Dias do período (DP)" digits={dp} onChange={setDp} casas={0} />
      </div>

      <Botoes onCalcular={calcular} onLimpar={limpar} />

      {resultado && (
        <div className="grid sm:grid-cols-3 gap-3">
          <OutBox label="PMRE (rotação de estoques)" valor={resultado.pmre.toFixed(1) + " dias"} kind="info" />
          <OutBox label="PMRV (recebimento de vendas)" valor={resultado.pmrv.toFixed(1) + " dias"} kind="info" />
          <OutBox label="PMPC (pagamento a fornecedores)" valor={resultado.pmpc.toFixed(1) + " dias"} kind="info" />
          <OutBox label="Ciclo Operacional (CO)" valor={resultado.co.toFixed(1) + " dias"} kind="good" destaque />
          <OutBox
            label="Ciclo Financeiro (CF)"
            valor={resultado.cf.toFixed(1) + " dias"}
            kind={resultado.cf <= 0 ? "good" : "bad"}
            destaque
          />
        </div>
      )}
    </CardCalc>
  );
}

function CalculadoraJuros() {
  const [pv, setPv] = useState("");
  const [taxa, setTaxa] = useState("");
  const [unidadeTaxa, setUnidadeTaxa] = useState<UnidadeTaxa>("ano");
  const [n, setN] = useState("");
  const [unidade, setUnidade] = useState<UnidadePeriodo>("anos");
  const [resultado, setResultado] = useState<ReturnType<typeof calcularJuros> | null>(null);

  function calcular() {
    const periodos = digitsToNumber(n, 0);
    setResultado(
      calcularJuros(digitsToNumber(pv), digitsToNumber(taxa) / 100, unidadeTaxa, periodos, unidade)
    );
  }

  function limpar() {
    setPv("");
    setTaxa("");
    setUnidadeTaxa("ano");
    setN("");
    setUnidade("anos");
    setResultado(null);
  }

  return (
    <CardCalc
      titulo="Juros Simples × Juros Compostos"
      descricao="Compare o montante de um capital aplicado a juros simples e a juros compostos pelo mesmo período."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <MaskedInput label="Capital inicial (PV)" digits={pv} onChange={setPv} prefixo="R$" />
        <TaxaInput label="Taxa (i)" digits={taxa} onChange={setTaxa} unidade={unidadeTaxa} onUnidadeChange={setUnidadeTaxa} />
        <PeriodoInput
          label="Número de períodos (n)"
          digits={n}
          onChange={setN}
          unidade={unidade}
          onUnidadeChange={setUnidade}
        />
      </div>

      <Botoes onCalcular={calcular} onLimpar={limpar} />

      {resultado && (
        <div className="grid sm:grid-cols-2 gap-3">
          <OutBox label="Montante (juros simples)" valor={`R$ ${fmt(resultado.montanteSimples)}`} kind="info" />
          <OutBox label="Montante (juros compostos)" valor={`R$ ${fmt(resultado.montanteComposto)}`} kind="good" destaque />
          <OutBox label="Juros ganhos (simples)" valor={`R$ ${fmt(resultado.jurosSimples)}`} kind="info" />
          <OutBox label="Juros ganhos (compostos)" valor={`R$ ${fmt(resultado.jurosCompostos)}`} kind="good" destaque />
        </div>
      )}
    </CardCalc>
  );
}

function CalculadoraTaxas() {
  const [taxa, setTaxa] = useState("");
  const [origem, setOrigem] = useState<UnidadeTaxa>("mes");
  const [resultado, setResultado] = useState<ReturnType<typeof calcularConversaoTaxa> | null>(null);

  function calcular() {
    setResultado(calcularConversaoTaxa(digitsToNumber(taxa) / 100, origem));
  }

  function limpar() {
    setTaxa("");
    setOrigem("mes");
    setResultado(null);
  }

  const destino = origem === "mes" ? "ano" : "mes";
  const rotuloOrigem = origem === "mes" ? "ao mês" : "ao ano";
  const rotuloDestino = destino === "mes" ? "ao mês" : "ao ano";

  return (
    <CardCalc
      titulo="Calculadora de Taxas"
      descricao="Converta uma taxa de juros entre mês e ano, pela forma proporcional (juros simples) e pela equivalente (juros compostos)."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <TaxaInput label="Taxa de partida" digits={taxa} onChange={setTaxa} unidade={origem} onUnidadeChange={setOrigem} />
      </div>

      <Botoes onCalcular={calcular} onLimpar={limpar} />

      {resultado && (
        <>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <OutBox
              label={`Taxa proporcional (${rotuloDestino}, juros simples)`}
              valor={`${(resultado.proporcional * 100).toFixed(3)}%`}
              kind="info"
            />
            <OutBox
              label={`Taxa equivalente (${rotuloDestino}, juros compostos)`}
              valor={`${(resultado.equivalente * 100).toFixed(3)}%`}
              kind="good"
              destaque
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Convertendo {digitsToNumber(taxa).toFixed(2)}% {rotuloOrigem} para {rotuloDestino}. A proporcional é usada em
            juros simples (multiplica/divide por 12); a equivalente é usada em juros compostos (potência de 12).
          </p>
        </>
      )}
    </CardCalc>
  );
}

const modelos = [
  { id: "investimento", titulo: "VPL · TIR · Payback · IL", icone: "📈", Componente: CalculadoraInvestimento },
  { id: "liquidez", titulo: "Liquidez e Endividamento", icone: "💧", Componente: CalculadoraIndicesLiquidez },
  { id: "lucratividade", titulo: "Lucratividade (Du Pont)", icone: "💰", Componente: CalculadoraLucratividade },
  { id: "prazos", titulo: "Prazos Médios e Ciclos", icone: "🔄", Componente: CalculadoraPrazosCiclos },
  { id: "juros", titulo: "Juros Simples × Compostos", icone: "🧮", Componente: CalculadoraJuros },
  { id: "taxas", titulo: "Conversor de Taxas", icone: "🔁", Componente: CalculadoraTaxas },
] as const;

export default function Calculadora() {
  const [modelo, setModelo] = useState<(typeof modelos)[number]["id"]>("investimento");
  const ativo = modelos.find((m) => m.id === modelo) ?? modelos[0];
  const Componente = ativo.Componente;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          🧮 Calculadora Financeira
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {modelos.map((m) => (
          <button
            key={m.id}
            onClick={() => setModelo(m.id)}
            className={
              "flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 text-center transition " +
              (modelo === m.id
                ? "border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 shadow-sm"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-violet-200 dark:hover:border-violet-800")
            }
          >
            <span className="text-xl">{m.icone}</span>
            <span className="text-xs font-semibold leading-tight">{m.titulo}</span>
          </button>
        ))}
      </div>

      <Componente />
    </div>
  );
}
