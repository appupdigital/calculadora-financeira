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
  /** O que esse indicador mede e por que ele importa. */
  oQueE?: string;
  /** Como ler o número que sai da conta, com um exemplo concreto. */
  comoLer?: string;
}

export interface Categoria {
  id: string;
  titulo: string;
  icone: string;
  formulas: Formula[];
}

export const categorias: Categoria[] = [
  {
    id: "av-ah",
    titulo: "Análise Vertical e Horizontal",
    icone: "📊",
    formulas: [
      {
        nome: "Análise Vertical",
        sigla: "AV",
        formula: "AV = ( Rubrica ÷ Base ) × 100",
        vars: [
          { label: "Rubrica", desc: "a conta que você quer analisar (ex: Estoques, Despesas Financeiras)" },
          { label: "Base", desc: "Ativo Total (no Balanço) ou Receita Líquida (na DRE)" },
        ],
        oQueE: "Mostra o peso (%) que cada conta tem dentro do total. É a pergunta \"essa conta representa quanto do bolo inteiro?\". Serve pra ver se uma despesa ou um ativo está desproporcional em relação ao resto.",
        comoLer: "Se Estoques = R$ 40.000 e o Ativo Total = R$ 200.000, AV = 20%. Ou seja, 20% de tudo que a empresa tem está parado em estoque. Quanto maior o percentual de uma despesa na Receita, pior; quanto maior o percentual de caixa/disponibilidades no Ativo, geralmente melhor (mais liquidez).",
      },
      {
        nome: "Análise Horizontal",
        sigla: "AH",
        formula: "AH = ( Valor no ano T+n ÷ Valor no ano base T ) × 100",
        vars: [
          { label: "T", desc: "ano-base (ponto de partida da comparação, geralmente o mais antigo)" },
          { label: "T+n", desc: "ano que está sendo comparado com o ano-base" },
        ],
        oQueE: "Mostra a evolução de uma mesma conta ao longo do tempo. É a pergunta \"essa conta cresceu ou caiu em relação a X anos atrás?\". O ano-base sempre vale 100%.",
        comoLer: "Se a Receita era R$ 100.000 no ano-base e virou R$ 130.000 depois, AH = 130%, ou seja, cresceu 30% (130% − 100%). Se desse 85%, teria caído 15% no período. Compare o crescimento de Receita com o de Custos/Despesas: se as despesas crescem mais rápido que a receita, é sinal de alerta.",
      },
    ],
  },
  {
    id: "estrutura",
    titulo: "A) Índices de Estrutura de Capital",
    icone: "🏛️",
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
        oQueE: "Mostra quanto do dinheiro dos sócios (Patrimônio Líquido) está \"preso\" em bens de longo prazo (máquinas, imóveis, sistemas) em vez de sobrar capital de giro pra operação do dia a dia.",
        comoLer: "IPL = 60% significa que 60% do PL da empresa está imobilizado em ativos fixos, sobrando só 40% do PL pra financiar o giro (estoque, caixa, contas a receber). Acima de 100% quer dizer que nem todo o Ativo Permanente foi pago com capital próprio — parte veio de dívida, o que é mais arriscado.",
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
        oQueE: "Compara quanto a empresa deve a terceiros (bancos, fornecedores, etc.) com quanto é capital próprio dos sócios. É o termômetro de \"de quem é o dinheiro que toca a empresa\".",
        comoLer: "PCT = 150% significa que, pra cada R$1,00 de capital próprio (PL), a empresa deve R$1,50 a terceiros — ou seja, tem mais dívida do que patrimônio próprio. PCT = 50% já é mais seguro: a dívida é metade do capital próprio.",
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
        oQueE: "Do total que a empresa deve, mostra que fatia vence logo (curto prazo) e que fatia dá mais tempo pra pagar (longo prazo). Dívida concentrada no curto prazo aperta mais o caixa.",
        comoLer: "CE = 80% significa que 80% de toda a dívida da empresa vence em até 1 ano — pouco fôlego pra se reorganizar. CE = 20% é mais tranquilo: só uma fatia pequena da dívida é urgente, o resto é de longo prazo.",
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
        oQueE: "Mostra quanto do que a empresa possui (todos os seus ativos) foi financiado especificamente por dívida bancária (empréstimos/financiamentos), separando isso de dívidas operacionais como fornecedores.",
        comoLer: "EFSAT = 25% significa que um quarto de tudo que a empresa tem foi comprado com dinheiro de banco. É importante porque dívida financeira tem juros — diferente de uma dívida com fornecedor, por exemplo.",
      },
    ],
  },
  {
    id: "liquidez",
    titulo: "B) Índices de Liquidez",
    icone: "💧",
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
        oQueE: "É o raio-x completo: compara TUDO que a empresa tem a receber (curto + longo prazo) com TUDO que ela deve (curto + longo prazo). Mede a saúde financeira olhando pro todo, não só pro curto prazo.",
        comoLer: "LG = 1,2 significa que a empresa tem R$1,20 em bens e direitos pra cada R$1,00 de dívida total — sobra 20 centavos de \"colchão\". LG abaixo de 1,0 é sinal de alerta: a empresa deve mais do que tem, considerando tudo.",
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
        oQueE: "O índice de liquidez mais usado no dia a dia: mostra se a empresa consegue pagar as contas que vencem nos próximos 12 meses usando só o que ela tem disponível nesse mesmo prazo (caixa, estoque, contas a receber).",
        comoLer: "LC = 1,8 quer dizer que pra cada R$1,00 de dívida de curto prazo, a empresa tem R$1,80 em bens/direitos de curto prazo — boa folga. LC = 0,7 é preocupante: a empresa só tem 70 centavos pra cada R$1,00 que precisa pagar logo, ou seja, pode faltar dinheiro.",
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
        oQueE: "Versão mais rigorosa da Liquidez Corrente: tira o estoque da conta, porque estoque pode demorar (ou não ser possível) vender rápido. Mostra se a empresa paga as contas de curto prazo sem depender de vender mercadoria.",
        comoLer: "LS = 0,9 significa que, mesmo sem vender nenhum item do estoque, a empresa cobre 90% da dívida de curto prazo só com caixa e o que tem a receber. Pra comércio/indústria, LS costuma ser bem menor que LC — isso é normal, já que o estoque é parte relevante do negócio.",
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
        oQueE: "Mostra quantas vezes o lucro operacional da empresa \"cabe dentro\" da conta de juros que ela paga. É o indicador clássico de quão folgada (ou apertada) está a empresa pra honrar os juros das suas dívidas.",
        comoLer: "ICJ = 4 significa que o lucro operacional é 4 vezes maior que as despesas financeiras — boa margem de segurança. ICJ = 1 é o limite: o lucro operacional empata exatamente com os juros, sem sobrar nada. Abaixo de 1, a empresa nem consegue pagar os juros com o que gera de lucro operacional.",
      },
    ],
  },
  {
    id: "lucratividade",
    titulo: "C) Índices de Lucratividade e Desempenho",
    icone: "💰",
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
        oQueE: "Mostra quantas vezes, no período, a empresa \"girou\" (transformou em vendas) o total de ativos que ela tem. É uma medida de eficiência: quanto a empresa vende pra cada R$1,00 investido em ativos.",
        comoLer: "GA = 1,5 significa que, pra cada R$1,00 de ativo, a empresa gerou R$1,50 em vendas no período. Quanto maior o giro, mais eficiente a empresa é em usar o que tem pra vender — é por isso que supermercados (giro alto, margem baixa) e joalherias (giro baixo, margem alta) têm GA muito diferentes mesmo sendo lucrativos.",
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
        oQueE: "A clássica \"margem de lucro\": de cada R$1,00 vendido, quanto sobra de lucro líquido depois de pagar tudo (custos, despesas, impostos).",
        comoLer: "RSV = 8% significa que, de cada R$100,00 vendidos, R$8,00 viram lucro líquido pro dono. Os outros R$92,00 foram pra custo da mercadoria, despesas, impostos, etc. Margens \"boas\" variam muito por setor — varejo costuma ter RSV baixo (2-5%), serviços especializados podem passar de 20%.",
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
        oQueE: "Mostra o quão bem a empresa usa TUDO que ela possui (ativos) pra gerar lucro, não importa se esse ativo foi pago com dinheiro próprio ou de terceiros. É a \"nota geral\" de eficiência do negócio.",
        comoLer: "ROA = 9% significa que cada R$100,00 investidos em ativos geraram R$9,00 de lucro líquido no ano. Pelo Método Du Pont, dá pra entender a origem desse número: ROA = Giro do Ativo × Margem Líquida — ou a empresa lucra vendendo muito com margem apertada, ou vendendo pouco com margem alta (ou os dois).",
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
        oQueE: "O retorno que o DONO (sócio/acionista) está tendo sobre o dinheiro que ele mesmo investiu na empresa — diferente do ROA, que olha pra tudo (inclusive o que é financiado por dívida). É o número que mais interessa pra quem é dono do negócio.",
        comoLer: "ROE = 18% significa que, pra cada R$100,00 que o sócio tem investidos na empresa (capital próprio), ele ganhou R$18,00 de lucro no ano — um retorno de 18% ao ano sobre o próprio dinheiro. Vale comparar com o que esse dinheiro renderia em outro investimento (Tesouro, CDB, etc.): se o ROE é menor que a renda fixa, o risco do negócio pode não estar compensando.",
      },
      {
        nome: "Regra \"sete-dez\" (tempo pra dobrar o ativo)",
        sigla: "t*",
        formula: "t* = 72 ÷ ROA",
        vars: [
          { label: "t*", desc: "número de anos para o Ativo Total dobrar, mantendo o mesmo ROA" },
          { label: "ROA", desc: "Retorno sobre o Ativo, em % (ex: 7, 10)" },
        ],
        regra: "ROA de 7% ao ano → dobra em ≈10 anos · ROA de 10% → dobra em ≈7 anos",
        regraTipo: "info",
        oQueE: "Uma forma rápida (regra prática, aproximada) de traduzir o ROA em algo mais intuitivo: \"em quantos anos meu ativo dobra de tamanho, se eu mantiver esse mesmo retorno reinvestido?\". É a mesma lógica da \"regra dos 72\" usada em juros compostos.",
        comoLer: "Se ROA = 9%, t* = 72 ÷ 9 = 8 anos — ou seja, nesse ritmo de retorno, o Ativo Total da empresa dobraria em aproximadamente 8 anos. É uma estimativa, não uma previsão exata, mas ajuda a visualizar o efeito de retornos compostos ao longo do tempo.",
      },
    ],
  },
  {
    id: "prazos",
    titulo: "D) Índices de Prazos Médios",
    icone: "⏱️",
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
        oQueE: "Em quantos dias, em média, a empresa consegue vender (girar) o estoque que tem parado. Estoque parado é dinheiro parado — quanto mais rápido ele gira, melhor pro caixa.",
        comoLer: "PMRE = 45 dias significa que, em média, uma mercadoria fica 45 dias no estoque antes de ser vendida. Pra uma padaria isso seria péssimo (produto estraga), pra uma loja de móveis pode ser normal. Compare sempre com empresas do mesmo ramo.",
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
        oQueE: "Em quantos dias, em média, a empresa recebe o dinheiro das vendas que fez a prazo (fiado, boleto, cartão parcelado, etc.). Quanto mais rápido recebe, mais rápido o dinheiro volta pra girar o negócio de novo.",
        comoLer: "PMRV = 30 dias significa que, em média, a empresa demora 1 mês entre vender e efetivamente receber o dinheiro em caixa. Se esse prazo for muito maior que o prazo que ela mesma tem pra pagar fornecedores (PMPC), ela pode sofrer de falta de caixa mesmo vendendo bem.",
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
        oQueE: "Em quantos dias, em média, a empresa demora pra pagar os seus fornecedores. Diferente dos outros dois prazos, aqui \"maior\" costuma ser bom: significa que a empresa consegue usar o dinheiro do fornecedor como uma espécie de crédito gratuito antes de precisar pagar.",
        comoLer: "PMPC = 40 dias significa que, em média, a empresa só paga o fornecedor 40 dias depois da compra. Se ela recebe dos clientes antes disso (PMRV menor que PMPC), ela está \"financiando\" parte do seu giro com dinheiro de terceiros, sem custo — uma posição confortável.",
      },
    ],
  },
  {
    id: "ciclos",
    titulo: "Ciclo Operacional e Ciclo Financeiro",
    icone: "🔄",
    formulas: [
      {
        nome: "Ciclo Operacional",
        sigla: "CO",
        formula: "CO = PMRE + PMRV",
        vars: [
          { label: "PMRE", desc: "Prazo Médio de Rotação de Estoques (dias até vender o estoque)" },
          { label: "PMRV", desc: "Prazo Médio de Recebimento de Vendas (dias até receber do cliente)" },
        ],
        oQueE: "O tempo total, do início ao fim, que leva desde a compra da mercadoria até a empresa efetivamente receber o dinheiro da venda dela. Junta os dois prazos: tempo parado no estoque + tempo esperando o cliente pagar.",
        comoLer: "CO = 75 dias (45 de estoque + 30 de recebimento) significa que, da compra da mercadoria até o dinheiro cair na conta, passam-se 75 dias em média. Esse é o \"tamanho\" do ciclo operacional do negócio — quanto menor, mais rápido o dinheiro circula.",
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
        oQueE: "O número mais importante de capital de giro: quantos dias a empresa precisa \"bancar\" com o próprio dinheiro, porque já pagou o fornecedor mas ainda não recebeu do cliente. É o período em que o caixa da empresa fica exposto.",
        comoLer: "Se CO = 75 dias e PMPC = 40 dias, CF = 35 dias: a empresa precisa ter caixa suficiente pra bancar 35 dias de operação com dinheiro próprio. Se o fornecedor dá mais prazo que o ciclo operacional (PMPC > CO), o CF fica negativo — ótimo sinal, significa que a empresa opera praticamente sem precisar de capital de giro próprio.",
      },
    ],
  },
  {
    id: "investimentos",
    titulo: "Técnicas de Análise de Investimentos",
    icone: "📈",
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
        oQueE: "Traz todo o dinheiro que o investimento vai gerar no futuro pro valor de hoje (porque R$1,00 daqui a 3 anos vale menos que R$1,00 hoje) e soma com o quanto se gastou pra começar. O resultado diz se o projeto, no fim das contas, \"cria\" ou \"destrói\" valor.",
        comoLer: "VPL = R$ 15.000 (positivo) significa que, depois de recuperar o investimento inicial e render pelo menos a taxa k, ainda sobram R$ 15.000 em valor de hoje — o projeto vale a pena. VPL = −R$ 8.000 (negativo) significa que o projeto nem cobre a taxa mínima exigida; na prática, você ganharia mais aplicando o dinheiro à taxa k do que investindo no projeto.",
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
        oQueE: "É a taxa de retorno \"real\" e embutida no próprio projeto — a rentabilidade que ele de fato entrega, nascida só dos fluxos de caixa, sem você precisar arbitrar uma taxa de desconto. Serve pra comparar diretamente com outras opções de investimento (CDI, outro projeto, etc.).",
        comoLer: "TIR = 18% a.a. significa que o projeto rende, na prática, 18% ao ano sobre o capital investido. Compare sempre com a taxa k (sua taxa mínima de atratividade): se k = 12% e TIR = 18%, o projeto rende acima do mínimo exigido → aceita. Se TIR = 9% com k = 12%, o projeto rende menos do que você exige → rejeita.",
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
        oQueE: "Mostra quanto valor presente o projeto devolve pra cada R$1,00 investido — é o VPL só que em formato de \"índice\" (múltiplo), em vez de valor absoluto em reais. Útil pra comparar projetos de tamanhos diferentes.",
        comoLer: "IL = 1,3 significa que, pra cada R$1,00 investido, o projeto devolve R$1,30 em valor presente — ou seja, R$0,30 de ganho líquido por real investido. IL = 0,8 significa que o projeto só devolve 80 centavos por real investido: dá prejuízo em valor presente, mesmo que o dinheiro total recebido pareça maior que o investido.",
      },
      {
        nome: "Payback Simples",
        formula: "soma acumulada dos CFₜ até zerar o investimento inicial",
        vars: [
          { label: "CFₜ", desc: "fluxo de caixa recebido em cada período t (sem desconto)" },
        ],
        regra: "não considera o valor do dinheiro no tempo",
        regraTipo: "info",
        oQueE: "Responde a pergunta mais direta de todas: \"em quanto tempo eu recupero o dinheiro que investi?\", somando os fluxos de caixa ano a ano até bater o valor do investimento inicial — sem descontar nada, sem considerar juros.",
        comoLer: "Payback simples = 2,4 anos significa que, somando os fluxos de caixa recebidos, o investimento se paga em 2 anos e meio (aproximadamente). É uma medida de risco/velocidade de retorno, não de rentabilidade — por isso sempre se usa junto com o VPL ou a TIR, nunca sozinho.",
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
        oQueE: "A versão \"mais correta\" do payback: antes de somar os fluxos, traz cada um a valor presente (desconta pela taxa k), então em quanto tempo o investimento se paga considerando que dinheiro no futuro vale menos que dinheiro hoje.",
        comoLer: "Payback descontado = 3,1 anos (maior que o simples, que seria algo como 2,4 anos) — isso é sempre esperado, porque descontar os fluxos faz o retorno \"demorar mais\" a aparecer em termos de valor presente. Se o payback descontado nunca chega a bater o investimento dentro do prazo do projeto, isso é outro jeito de dizer que o VPL é negativo.",
      },
    ],
  },
];
