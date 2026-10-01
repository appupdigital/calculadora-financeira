export interface Variavel {
  label: string;
  desc: string;
}

export interface Formula {
  nome: string;
  sigla?: string;
  formula: string;
  vars: Variavel[];
  regra?: string;
  regraTipo?: "boa" | "ruim" | "info";
}

export interface Categoria {
  id: string;
  titulo: string;
  formulas: Formula[];
}

export const categorias: Categoria[] = [
  {
    id: "av-ah",
    titulo: "Análise Vertical e Horizontal",
    formulas: [
      {
        nome: "Análise Vertical",
        sigla: "AV",
        formula: "AV = ( Rubrica ÷ Base ) × 100",
        vars: [
          { label: "Rubrica", desc: "a conta que você quer analisar (ex: Estoques, Despesas Financeiras)" },
          { label: "Base", desc: "Ativo Total (no Balanço) ou Receita Líquida (na DRE)" },
        ],
      },
      {
        nome: "Análise Horizontal",
        sigla: "AH",
        formula: "AH = ( Valor no ano T+n ÷ Valor no ano base T ) × 100",
        vars: [
          { label: "T", desc: "ano-base (ponto de partida da comparação, geralmente o mais antigo)" },
          { label: "T+n", desc: "ano que está sendo comparado com o ano-base" },
        ],
      },
    ],
  },
  {
    id: "estrutura",
    titulo: "A) Índices de Estrutura de Capital",
    formulas: [
      {
        nome: "Imobilização do Patrimônio Líquido",
        sigla: "IPL",
        formula: "IPL = ( AP ÷ PL ) × 100",
        vars: [
          { label: "AP", desc: "Ativo Permanente (Investimentos + Imobilizado + Intangível)" },
          { label: "PL", desc: "Patrimônio Líquido" },
        ],
        regra: "quanto maior, pior",
        regraTipo: "ruim",
      },
      {
        nome: "Participação de Capitais de Terceiros",
        sigla: "PCT",
        formula: "PCT = ( (PC + PNC) ÷ PL ) × 100",
        vars: [
          { label: "PC", desc: "Passivo Circulante (dívidas de curto prazo)" },
          { label: "PNC", desc: "Passivo Não Circulante (dívidas de longo prazo)" },
          { label: "PL", desc: "Patrimônio Líquido" },
        ],
        regra: "quanto maior, pior (mais dependência de capital de terceiros)",
        regraTipo: "ruim",
      },
      {
        nome: "Composição do Endividamento",
        sigla: "CE",
        formula: "CE = ( PC ÷ (PC + PNC) ) × 100",
        vars: [
          { label: "PC", desc: "Passivo Circulante (dívidas de curto prazo)" },
          { label: "PNC", desc: "Passivo Não Circulante (dívidas de longo prazo)" },
        ],
        regra: "resultado = % da dívida total que vence no curto prazo · quanto maior, pior",
        regraTipo: "ruim",
      },
      {
        nome: "Endividamento Financeiro s/ Ativo Total",
        sigla: "EFSAT",
        formula: "EFSAT = ( PF ÷ AT ) × 100",
        vars: [
          { label: "PF", desc: "Passivo Financeiro (empréstimos e financiamentos)" },
          { label: "AT", desc: "Ativo Total" },
        ],
        regra: "quanto maior, pior",
        regraTipo: "ruim",
      },
    ],
  },
  {
    id: "liquidez",
    titulo: "B) Índices de Liquidez",
    formulas: [
      {
        nome: "Liquidez Geral",
        sigla: "LG",
        formula: "LG = (AC + RLP) ÷ (PC + PNC)",
        vars: [
          { label: "AC", desc: "Ativo Circulante" },
          { label: "RLP", desc: "Realizável a Longo Prazo (direitos a receber no longo prazo)" },
          { label: "PC", desc: "Passivo Circulante" },
          { label: "PNC", desc: "Passivo Não Circulante" },
        ],
        regra: "quanto maior, melhor",
        regraTipo: "boa",
      },
      {
        nome: "Liquidez Corrente",
        sigla: "LC",
        formula: "LC = AC ÷ PC",
        vars: [
          { label: "AC", desc: "Ativo Circulante (bens e direitos de curto prazo)" },
          { label: "PC", desc: "Passivo Circulante (dívidas de curto prazo)" },
        ],
        regra: "resultado = R$ de bens/direitos de curto prazo para cada R$1,00 de dívida de curto prazo · quanto maior, melhor",
        regraTipo: "boa",
      },
      {
        nome: "Liquidez Seca (teste ácido)",
        sigla: "LS",
        formula: "LS = (DISP + DRL) ÷ PC",
        vars: [
          { label: "DISP", desc: "Disponibilidades (Caixa + Bancos + Aplicações Financeiras)" },
          { label: "DRL", desc: "Duplicatas a Receber Líquidas (créditos − provisão p/ devedores duvidosos)" },
          { label: "PC", desc: "Passivo Circulante" },
        ],
        regra: "exclui estoques do cálculo · quanto maior, melhor",
        regraTipo: "boa",
      },
      {
        nome: "Cobertura de Juros",
        sigla: "ICJ",
        formula: "ICJ = Lajir ÷ DF",
        vars: [
          { label: "Lajir", desc: "Lucro Antes de Juros e Impostos (também chamado de EBIT)" },
          { label: "DF", desc: "Despesas Financeiras do período" },
        ],
        regra: "quanto maior, melhor",
        regraTipo: "boa",
      },
    ],
  },
  {
    id: "lucratividade",
    titulo: "C) Índices de Lucratividade e Desempenho",
    formulas: [
      {
        nome: "Giro do Ativo",
        sigla: "GA",
        formula: "GA = VL ÷ ATm",
        vars: [
          { label: "VL", desc: "Vendas Líquidas (= Receita Líquida)" },
          { label: "ATm", desc: "Ativo Total médio = (Ativo Total final + Ativo Total inicial) ÷ 2" },
        ],
        regra: "quanto maior, melhor",
        regraTipo: "boa",
      },
      {
        nome: "Retorno sobre as Vendas (margem líquida)",
        sigla: "RSV",
        formula: "RSV = ( LL ÷ VL ) × 100",
        vars: [
          { label: "LL", desc: "Lucro Líquido do exercício" },
          { label: "VL", desc: "Vendas Líquidas (= Receita Líquida)" },
        ],
        regra: "quanto maior, melhor",
        regraTipo: "boa",
      },
      {
        nome: "Retorno sobre o Ativo",
        sigla: "RSA / ROA",
        formula: "ROA = ( LL ÷ ATm ) × 100",
        vars: [
          { label: "LL", desc: "Lucro Líquido do exercício" },
          { label: "ATm", desc: "Ativo Total médio = (Ativo Total final + Ativo Total inicial) ÷ 2" },
        ],
        regra: "ROA = GA × RSV (Método Du Pont) · quanto maior, melhor",
        regraTipo: "boa",
      },
      {
        nome: "Retorno sobre o Patrimônio Líquido",
        sigla: "ROE",
        formula: "ROE = ( LL ÷ PLma ) × 100",
        vars: [
          { label: "LL", desc: "Lucro Líquido do exercício" },
          { label: "PLma", desc: "PL médio ajustado = (PL inicial + PL final − LL) ÷ 2" },
        ],
        regra: "quanto maior, melhor",
        regraTipo: "boa",
      },
      {
        nome: 'Regra "sete-dez" (tempo pra dobrar o ativo)',
        sigla: "t*",
        formula: "t* = 72 ÷ ROA",
        vars: [
          { label: "t*", desc: "número de anos para o Ativo Total dobrar, mantendo o mesmo ROA" },
          { label: "ROA", desc: "Retorno sobre o Ativo, em % (ex: 7, 10)" },
        ],
        regra: "ROA de 7% ao ano → dobra em ≈10 anos · ROA de 10% → dobra em ≈7 anos",
        regraTipo: "info",
      },
    ],
  },
  {
    id: "prazos",
    titulo: "D) Índices de Prazos Médios",
    formulas: [
      {
        nome: "Prazo Médio de Rotação de Estoques",
        sigla: "PMRE",
        formula: "PMRE = ( ESTm ÷ CPV ) × DP",
        vars: [
          { label: "ESTm", desc: "Estoque médio = (estoque inicial + estoque final) ÷ 2" },
          { label: "CPV", desc: "Custo do Produto (ou mercadoria/serviço) Vendido" },
          { label: "DP", desc: "Dias do Período considerado (360 p/ ano, 90 p/ trimestre, 30 p/ mês)" },
        ],
        regra: "quanto maior, pior",
        regraTipo: "ruim",
      },
      {
        nome: "Prazo Médio de Recebimento de Vendas",
        sigla: "PMRV",
        formula: "PMRV = ( DRm ÷ VB ) × DP",
        vars: [
          { label: "DRm", desc: "Duplicatas a Receber médias (média entre início e fim do período)" },
          { label: "VB", desc: "Vendas Brutas (Receita Bruta) do período" },
          { label: "DP", desc: "Dias do Período considerado (365 p/ ano, 90 p/ trimestre, 30 p/ mês)" },
        ],
        regra: "quanto maior, pior",
        regraTipo: "ruim",
      },
      {
        nome: "Prazo Médio de Pagamento de Compras",
        sigla: "PMPC",
        formula: "PMPC = ( FORNm ÷ C ) × DP",
        vars: [
          { label: "FORNm", desc: "saldo médio da conta Fornecedores no período" },
          { label: "C", desc: "Compras do período = CMV + Estoque final − Estoque inicial" },
          { label: "DP", desc: "Dias do Período considerado" },
        ],
        regra: "quanto maior, melhor",
        regraTipo: "boa",
      },
    ],
  },
  {
    id: "ciclos",
    titulo: "Ciclo Operacional e Ciclo Financeiro",
    formulas: [
      {
        nome: "Ciclo Operacional",
        sigla: "CO",
        formula: "CO = PMRE + PMRV",
        vars: [
          { label: "PMRE", desc: "Prazo Médio de Rotação de Estoques (dias até vender o estoque)" },
          { label: "PMRV", desc: "Prazo Médio de Recebimento de Vendas (dias até receber do cliente)" },
        ],
      },
      {
        nome: "Ciclo Financeiro",
        sigla: "CF",
        formula: "CF = CO − PMPC",
        vars: [
          { label: "CO", desc: "Ciclo Operacional (PMRE + PMRV)" },
          { label: "PMPC", desc: "Prazo Médio de Pagamento de Compras (dias até pagar o fornecedor)" },
        ],
        regra: "quanto maior, pior — mais capital de giro próprio é necessário",
        regraTipo: "ruim",
      },
    ],
  },
  {
    id: "investimentos",
    titulo: "Técnicas de Análise de Investimentos",
    formulas: [
      {
        nome: "Valor Presente Líquido",
        sigla: "VPL",
        formula: "VPL = CF₀ + CF₁/(1+k)¹ + CF₂/(1+k)² + ... + CFₙ/(1+k)ⁿ",
        vars: [
          { label: "CF₀", desc: "fluxo de caixa no momento 0 (o investimento inicial, entra como valor negativo)" },
          { label: "CF₁, CF₂ ... CFₙ", desc: "fluxos de caixa esperados nos períodos 1, 2, ..., n (geralmente positivos)" },
          { label: "k", desc: "taxa mínima de atratividade / custo de capital (a taxa usada para descontar)" },
          { label: "n", desc: "número de períodos (anos, meses...) do projeto" },
        ],
        regra: "VPL > 0 aceita · VPL < 0 rejeita",
        regraTipo: "info",
      },
      {
        nome: "Taxa Interna de Retorno",
        sigla: "TIR",
        formula: "0 = CF₀ + CF₁/(1+TIR)¹ + CF₂/(1+TIR)² + ... + CFₙ/(1+TIR)ⁿ",
        vars: [
          { label: "CF₀", desc: "investimento inicial (negativo)" },
          { label: "CF₁ ... CFₙ", desc: "fluxos de caixa futuros" },
          { label: "TIR", desc: "a incógnita: a taxa que torna o VPL igual a zero" },
        ],
        regra: "taxa que zera o VPL · TIR > k aceita · TIR < k rejeita",
        regraTipo: "info",
      },
      {
        nome: "Índice de Lucratividade",
        sigla: "IL",
        formula: "IL = [ Σ CFₜ/(1+i)ᵗ ] ÷ CF₀",
        vars: [
          { label: "Σ CFₜ/(1+i)ᵗ", desc: "soma de todos os fluxos de caixa futuros trazidos a valor presente" },
          { label: "CFₜ", desc: "fluxo de caixa no período t" },
          { label: "i", desc: "taxa de desconto usada (mesma lógica do k do VPL)" },
          { label: "t", desc: "o período em que o fluxo ocorre (1, 2, 3...)" },
          { label: "CF₀", desc: "investimento inicial (valor absoluto, no denominador)" },
        ],
        regra: "IL > 1 aceita · IL = 1 → VPL = 0 · IL < 1 rejeita",
        regraTipo: "info",
      },
      {
        nome: "Payback Simples",
        formula: "soma acumulada dos CFₜ até zerar o investimento inicial",
        vars: [{ label: "CFₜ", desc: "fluxo de caixa recebido em cada período t (sem desconto)" }],
        regra: "não considera o valor do dinheiro no tempo",
        regraTipo: "info",
      },
      {
        nome: "Payback Descontado",
        formula: "soma acumulada dos CFₜ/(1+k)ᵗ até zerar o investimento",
        vars: [
          { label: "CFₜ", desc: "fluxo de caixa do período t" },
          { label: "k", desc: "taxa mínima de atratividade usada para trazer cada fluxo a valor presente" },
          { label: "t", desc: "o período em que o fluxo ocorre" },
        ],
        regra: "mesma lógica do payback simples, mas com os fluxos trazidos a valor presente antes de somar",
        regraTipo: "info",
      },
    ],
  },
];
