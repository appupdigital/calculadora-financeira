import HP12C from "../components/HP12C";

export default function HP12CPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <span>🧮</span>
          <span>Calculadora HP 12C</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
          Uma simulação da calculadora financeira mais usada do mundo, com lógica RPN (notação polonesa
          reversa) e as funções de matemática financeira (n, i, PV, PMT, FV) reais.
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,360px)_1fr] gap-8 items-start">
        <HP12C />

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <span>❓</span> O que é RPN e por que não existe "="?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
              A HP 12C não usa a notação tradicional (<b>2 + 3 =</b>). Em vez disso, usa a{" "}
              <b>Notação Polonesa Reversa (RPN)</b>: primeiro você digita os números, separando-os com{" "}
              <b>ENTER</b>, e só depois escolhe a operação.
            </p>
            <div className="font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              2 &nbsp;ENTER&nbsp; 3 &nbsp;+&nbsp; → mostra <b>5</b>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Por trás do visor existe uma <b>pilha de 4 registradores</b>: X (o que você vê), Y, Z e T.
              ENTER duplica o valor de X para Y e "empurra" a pilha para cima; uma operação consome X e Y e
              coloca o resultado de volta em X. Você pode acompanhar os 4 registradores no painel abaixo do
              teclado.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <span>📐</span> As 5 teclas financeiras (n, i, PV, PMT, FV)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Todo problema de juros compostos com parcelas iguais tem 5 variáveis. Se você souber 4 delas, a
              HP 12C calcula a 5ª automaticamente. A convenção de sinais é importante: dinheiro que{" "}
              <b>sai</b> do seu bolso é <b>negativo</b>; dinheiro que <b>entra</b> é <b>positivo</b>.
            </p>
            <ul className="space-y-1.5 text-sm">
              <li>
                <b className="font-mono text-amber-600 dark:text-amber-500">n</b>{" "}
                <span className="text-slate-500 dark:text-slate-400">= número de períodos (meses, anos...)</span>
              </li>
              <li>
                <b className="font-mono text-amber-600 dark:text-amber-500">i</b>{" "}
                <span className="text-slate-500 dark:text-slate-400">= taxa de juros por período, em % (ex.: 1 para 1% ao mês)</span>
              </li>
              <li>
                <b className="font-mono text-amber-600 dark:text-amber-500">PV</b>{" "}
                <span className="text-slate-500 dark:text-slate-400">= valor presente (o que existe hoje)</span>
              </li>
              <li>
                <b className="font-mono text-amber-600 dark:text-amber-500">PMT</b>{" "}
                <span className="text-slate-500 dark:text-slate-400">= prestação/pagamento periódico igual, repetido durante n períodos</span>
              </li>
              <li>
                <b className="font-mono text-amber-600 dark:text-amber-500">FV</b>{" "}
                <span className="text-slate-500 dark:text-slate-400">= valor futuro (saldo ao final de n períodos)</span>
              </li>
            </ul>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
              Para <b>guardar</b> um valor, digite o número e pressione a tecla correspondente. Para{" "}
              <b>calcular</b> a variável que falta, apenas pressione a tecla dela (sem digitar nada antes) —
              a calculadora usa as outras 4 que já estão guardadas.
            </p>
          </section>

          <section className="rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30 p-4 sm:p-5">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <span>✅</span> Exemplo passo a passo
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Quanto você acumula investindo <b>R$ 300 por mês</b>, durante <b>24 meses</b>, a{" "}
              <b>1,5% ao mês</b>, partindo de PV = 0?
            </p>
            <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-decimal list-inside font-mono">
              <li>f CLEAR FIN <span className="font-sans text-slate-500">(limpa as financeiras)</span></li>
              <li>24 → n</li>
              <li>1.5 → i</li>
              <li>0 → PV</li>
              <li>300 CHS → PMT <span className="font-sans text-slate-500">(sai do seu bolso: negativo)</span></li>
              <li>FV <span className="font-sans text-slate-500">(calcula o resultado)</span></li>
            </ol>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              O visor mostra <b>FV ≈ 8.590,06</b> (positivo: é dinheiro que volta para você no final).
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <span>🔑</span> Outras teclas úteis
            </h2>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              <li><b className="font-mono">CHS</b> — troca o sinal do número (+/−)</li>
              <li><b className="font-mono">CLx</b> — zera só o visor (X), sem mexer no resto da pilha</li>
              <li><b className="font-mono">AC</b> — zera tudo: pilha, memórias e registradores financeiros</li>
              <li><b className="font-mono">STO</b> + dígito — guarda o valor de X num dos 10 registradores de memória (R0–R9)</li>
              <li><b className="font-mono">RCL</b> + dígito (ou n/i/PV/PMT/FV) — traz um valor guardado de volta para X</li>
              <li><b className="font-mono">%</b> — calcula X% de Y (ex.: 200 ENTER 10 % → 20, que é 10% de 200)</li>
              <li><b className="font-mono">Δ%</b> — variação percentual entre Y e X</li>
              <li><b className="font-mono">1/x</b> — inverso do número no visor</li>
              <li><b className="font-mono">g BEG/END</b> — alterna entre prestações pagas no início (BEGIN) ou no fim (END) de cada período</li>
            </ul>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Dica: se você acabou de calcular um resultado e quiser usá-lo para alimentar outra variável
              financeira, digite o número de novo antes de pressionar a tecla — essa é uma peculiaridade
              real da HP 12C original, não um bug desta simulação.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
