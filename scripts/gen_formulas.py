#!/usr/bin/env python3
import json

def s(v):
    return json.dumps(v, ensure_ascii=False)

def var(label, desc):
    return {"label": label, "desc": desc}

def formula(nome, formula, vars_, sigla=None, regra=None, regraTipo=None, oQueE=None, comoLer=None):
    d = {"nome": nome}
    if sigla:
        d["sigla"] = sigla
    d["formula"] = formula
    d["vars"] = vars_
    if regra:
        d["regra"] = regra
    if regraTipo:
        d["regraTipo"] = regraTipo
    if oQueE:
        d["oQueE"] = oQueE
    if comoLer:
        d["comoLer"] = comoLer
    return d

categorias = [
    {
        "id": "av-ah",
        "titulo": "Análise Vertical e Horizontal",
        "icone": "📊",
        "formulas": [
            formula(
                "Análise Vertical", "AV = ( Rubrica ÷ Base ) × 100",
                [
                    var("Rubrica", "a conta que você quer analisar (ex: Estoques, Despesas Financeiras)"),
                    var("Base", "Ativo Total (no Balanço) ou Receita Líquida (na DRE)"),
                ],
                sigla="AV",
                oQueE='Mostra o peso (%) que cada conta tem dentro do total. É a pergunta "essa conta representa quanto do bolo inteiro?". Serve pra ver se uma despesa ou um ativo está desproporcional em relação ao resto.',
                comoLer="Se Estoques = R$ 40.000 e o Ativo Total = R$ 200.000, AV = 20%. Ou seja, 20% de tudo que a empresa tem está parado em estoque. Quanto maior o percentual de uma despesa na Receita, pior; quanto maior o percentual de caixa/disponibilidades no Ativo, geralmente melhor (mais liquidez).",
            ),
            formula(
                "Análise Horizontal", "AH = ( Valor no ano T+n ÷ Valor no ano base T ) × 100",
                [
                    var("T", "ano-base (ponto de partida da comparação, geralmente o mais antigo)"),
                    var("T+n", "ano que está sendo comparado com o ano-base"),
                ],
                sigla="AH",
                oQueE='Mostra a evolução de uma mesma conta ao longo do tempo. É a pergunta "essa conta cresceu ou caiu em relação a X anos atrás?". O ano-base sempre vale 100%.',
                comoLer="Se a Receita era R$ 100.000 no ano-base e virou R$ 130.000 depois, AH = 130%, ou seja, cresceu 30% (130% − 100%). Se desse 85%, teria caído 15% no período. Compare o crescimento de Receita com o de Custos/Despesas: se as despesas crescem mais rápido que a receita, é sinal de alerta.",
            ),
        ],
    },
    {
        "id": "estrutura",
        "icone": "🏛️",
        "titulo": "A) Índices de Estrutura de Capital",
        "formulas": [
            formula(
                "Imobilização do Patrimônio Líquido", "IPL = ( AP ÷ PL ) × 100",
                [
                    var("AP", "Ativo Permanente (Investimentos + Imobilizado + Intangível)"),
                    var("PL", "Patrimônio Líquido"),
                ],
                sigla="IPL", regra="quanto maior, pior", regraTipo="ruim",
                oQueE='Mostra quanto do dinheiro dos sócios (Patrimônio Líquido) está "preso" em bens de longo prazo (máquinas, imóveis, sistemas) em vez de sobrar capital de giro pra operação do dia a dia.',
                comoLer="IPL = 60% significa que 60% do PL da empresa está imobilizado em ativos fixos, sobrando só 40% do PL pra financiar o giro (estoque, caixa, contas a receber). Acima de 100% quer dizer que nem todo o Ativo Permanente foi pago com capital próprio — parte veio de dívida, o que é mais arriscado.",
            ),
            formula(
                "Participação de Capitais de Terceiros", "PCT = ( (PC + PNC) ÷ PL ) × 100",
                [
                    var("PC", "Passivo Circulante (dívidas de curto prazo)"),
                    var("PNC", "Passivo Não Circulante (dívidas de longo prazo)"),
                    var("PL", "Patrimônio Líquido"),
                ],
                sigla="PCT", regra="quanto maior, pior (mais dependência de capital de terceiros)", regraTipo="ruim",
                oQueE='Compara quanto a empresa deve a terceiros (bancos, fornecedores, etc.) com quanto é capital próprio dos sócios. É o termômetro de "de quem é o dinheiro que toca a empresa".',
                comoLer="PCT = 150% significa que, pra cada R$1,00 de capital próprio (PL), a empresa deve R$1,50 a terceiros — ou seja, tem mais dívida do que patrimônio próprio. PCT = 50% já é mais seguro: a dívida é metade do capital próprio.",
            ),
            formula(
                "Composição do Endividamento", "CE = ( PC ÷ (PC + PNC) ) × 100",
                [
                    var("PC", "Passivo Circulante (dívidas de curto prazo)"),
                    var("PNC", "Passivo Não Circulante (dívidas de longo prazo)"),
                ],
                sigla="CE", regra="resultado = % da dívida total que vence no curto prazo · quanto maior, pior", regraTipo="ruim",
                oQueE="Do total que a empresa deve, mostra que fatia vence logo (curto prazo) e que fatia dá mais tempo pra pagar (longo prazo). Dívida concentrada no curto prazo aperta mais o caixa.",
                comoLer="CE = 80% significa que 80% de toda a dívida da empresa vence em até 1 ano — pouco fôlego pra se reorganizar. CE = 20% é mais tranquilo: só uma fatia pequena da dívida é urgente, o resto é de longo prazo.",
            ),
            formula(
                "Endividamento Financeiro s/ Ativo Total", "EFSAT = ( PF ÷ AT ) × 100",
                [
                    var("PF", "Passivo Financeiro (empréstimos e financiamentos)"),
                    var("AT", "Ativo Total"),
                ],
                sigla="EFSAT", regra="quanto maior, pior", regraTipo="ruim",
                oQueE="Mostra quanto do que a empresa possui (todos os seus ativos) foi financiado especificamente por dívida bancária (empréstimos/financiamentos), separando isso de dívidas operacionais como fornecedores.",
                comoLer="EFSAT = 25% significa que um quarto de tudo que a empresa tem foi comprado com dinheiro de banco. É importante porque dívida financeira tem juros — diferente de uma dívida com fornecedor, por exemplo.",
            ),
        ],
    },
    {
        "id": "liquidez",
        "icone": "💧",
        "titulo": "B) Índices de Liquidez",
        "formulas": [
            formula(
                "Liquidez Geral", "LG = (AC + RLP) ÷ (PC + PNC)",
                [
                    var("AC", "Ativo Circulante"),
                    var("RLP", "Realizável a Longo Prazo (direitos a receber no longo prazo)"),
                    var("PC", "Passivo Circulante"),
                    var("PNC", "Passivo Não Circulante"),
                ],
                sigla="LG", regra="quanto maior, melhor", regraTipo="boa",
                oQueE="É o raio-x completo: compara TUDO que a empresa tem a receber (curto + longo prazo) com TUDO que ela deve (curto + longo prazo). Mede a saúde financeira olhando pro todo, não só pro curto prazo.",
                comoLer="LG = 1,2 significa que a empresa tem R$1,20 em bens e direitos pra cada R$1,00 de dívida total — sobra 20 centavos de \"colchão\". LG abaixo de 1,0 é sinal de alerta: a empresa deve mais do que tem, considerando tudo.",
            ),
            formula(
                "Liquidez Corrente", "LC = AC ÷ PC",
                [
                    var("AC", "Ativo Circulante (bens e direitos de curto prazo)"),
                    var("PC", "Passivo Circulante (dívidas de curto prazo)"),
                ],
                sigla="LC", regra="resultado = R$ de bens/direitos de curto prazo para cada R$1,00 de dívida de curto prazo · quanto maior, melhor", regraTipo="boa",
                oQueE="O índice de liquidez mais usado no dia a dia: mostra se a empresa consegue pagar as contas que vencem nos próximos 12 meses usando só o que ela tem disponível nesse mesmo prazo (caixa, estoque, contas a receber).",
                comoLer="LC = 1,8 quer dizer que pra cada R$1,00 de dívida de curto prazo, a empresa tem R$1,80 em bens/direitos de curto prazo — boa folga. LC = 0,7 é preocupante: a empresa só tem 70 centavos pra cada R$1,00 que precisa pagar logo, ou seja, pode faltar dinheiro.",
            ),
            formula(
                "Liquidez Seca (teste ácido)", "LS = (DISP + DRL) ÷ PC",
                [
                    var("DISP", "Disponibilidades (Caixa + Bancos + Aplicações Financeiras)"),
                    var("DRL", "Duplicatas a Receber Líquidas (créditos − provisão p/ devedores duvidosos)"),
                    var("PC", "Passivo Circulante"),
                ],
                sigla="LS", regra="exclui estoques do cálculo · quanto maior, melhor", regraTipo="boa",
                oQueE="Versão mais rigorosa da Liquidez Corrente: tira o estoque da conta, porque estoque pode demorar (ou não ser possível) vender rápido. Mostra se a empresa paga as contas de curto prazo sem depender de vender mercadoria.",
                comoLer="LS = 0,9 significa que, mesmo sem vender nenhum item do estoque, a empresa cobre 90% da dívida de curto prazo só com caixa e o que tem a receber. Pra comércio/indústria, LS costuma ser bem menor que LC — isso é normal, já que o estoque é parte relevante do negócio.",
            ),
            formula(
                "Cobertura de Juros", "ICJ = Lajir ÷ DF",
                [
                    var("Lajir", "Lucro Antes de Juros e Impostos (também chamado de EBIT)"),
                    var("DF", "Despesas Financeiras do período"),
                ],
                sigla="ICJ", regra="quanto maior, melhor", regraTipo="boa",
                oQueE='Mostra quantas vezes o lucro operacional da empresa "cabe dentro" da conta de juros que ela paga. É o indicador clássico de quão folgada (ou apertada) está a empresa pra honrar os juros das suas dívidas.',
                comoLer="ICJ = 4 significa que o lucro operacional é 4 vezes maior que as despesas financeiras — boa margem de segurança. ICJ = 1 é o limite: o lucro operacional empata exatamente com os juros, sem sobrar nada. Abaixo de 1, a empresa nem consegue pagar os juros com o que gera de lucro operacional.",
            ),
        ],
    },
    {
        "id": "lucratividade",
        "icone": "💰",
        "titulo": "C) Índices de Lucratividade e Desempenho",
        "formulas": [
            formula(
                "Giro do Ativo", "GA = VL ÷ ATm",
                [
                    var("VL", "Vendas Líquidas (= Receita Líquida)"),
                    var("ATm", "Ativo Total médio = (Ativo Total final + Ativo Total inicial) ÷ 2"),
                ],
                sigla="GA", regra="quanto maior, melhor", regraTipo="boa",
                oQueE='Mostra quantas vezes, no período, a empresa "girou" (transformou em vendas) o total de ativos que ela tem. É uma medida de eficiência: quanto a empresa vende pra cada R$1,00 investido em ativos.',
                comoLer="GA = 1,5 significa que, pra cada R$1,00 de ativo, a empresa gerou R$1,50 em vendas no período. Quanto maior o giro, mais eficiente a empresa é em usar o que tem pra vender — é por isso que supermercados (giro alto, margem baixa) e joalherias (giro baixo, margem alta) têm GA muito diferentes mesmo sendo lucrativos.",
            ),
            formula(
                "Retorno sobre as Vendas (margem líquida)", "RSV = ( LL ÷ VL ) × 100",
                [
                    var("LL", "Lucro Líquido do exercício"),
                    var("VL", "Vendas Líquidas (= Receita Líquida)"),
                ],
                sigla="RSV", regra="quanto maior, melhor", regraTipo="boa",
                oQueE='A clássica "margem de lucro": de cada R$1,00 vendido, quanto sobra de lucro líquido depois de pagar tudo (custos, despesas, impostos).',
                comoLer="RSV = 8% significa que, de cada R$100,00 vendidos, R$8,00 viram lucro líquido pro dono. Os outros R$92,00 foram pra custo da mercadoria, despesas, impostos, etc. Margens \"boas\" variam muito por setor — varejo costuma ter RSV baixo (2-5%), serviços especializados podem passar de 20%.",
            ),
            formula(
                "Retorno sobre o Ativo", "ROA = ( LL ÷ ATm ) × 100",
                [
                    var("LL", "Lucro Líquido do exercício"),
                    var("ATm", "Ativo Total médio = (Ativo Total final + Ativo Total inicial) ÷ 2"),
                ],
                sigla="RSA / ROA", regra="ROA = GA × RSV (Método Du Pont) · quanto maior, melhor", regraTipo="boa",
                oQueE='Mostra o quão bem a empresa usa TUDO que ela possui (ativos) pra gerar lucro, não importa se esse ativo foi pago com dinheiro próprio ou de terceiros. É a "nota geral" de eficiência do negócio.',
                comoLer="ROA = 9% significa que cada R$100,00 investidos em ativos geraram R$9,00 de lucro líquido no ano. Pelo Método Du Pont, dá pra entender a origem desse número: ROA = Giro do Ativo × Margem Líquida — ou a empresa lucra vendendo muito com margem apertada, ou vendendo pouco com margem alta (ou os dois).",
            ),
            formula(
                "Retorno sobre o Patrimônio Líquido", "ROE = ( LL ÷ PLma ) × 100",
                [
                    var("LL", "Lucro Líquido do exercício"),
                    var("PLma", "PL médio ajustado = (PL inicial + PL final − LL) ÷ 2"),
                ],
                sigla="ROE", regra="quanto maior, melhor", regraTipo="boa",
                oQueE="O retorno que o DONO (sócio/acionista) está tendo sobre o dinheiro que ele mesmo investiu na empresa — diferente do ROA, que olha pra tudo (inclusive o que é financiado por dívida). É o número que mais interessa pra quem é dono do negócio.",
                comoLer="ROE = 18% significa que, pra cada R$100,00 que o sócio tem investidos na empresa (capital próprio), ele ganhou R$18,00 de lucro no ano — um retorno de 18% ao ano sobre o próprio dinheiro. Vale comparar com o que esse dinheiro renderia em outro investimento (Tesouro, CDB, etc.): se o ROE é menor que a renda fixa, o risco do negócio pode não estar compensando.",
            ),
            formula(
                'Regra "sete-dez" (tempo pra dobrar o ativo)', "t* = 72 ÷ ROA",
                [
                    var("t*", "número de anos para o Ativo Total dobrar, mantendo o mesmo ROA"),
                    var("ROA", "Retorno sobre o Ativo, em % (ex: 7, 10)"),
                ],
                sigla="t*", regra="ROA de 7% ao ano → dobra em ≈10 anos · ROA de 10% → dobra em ≈7 anos", regraTipo="info",
                oQueE='Uma forma rápida (regra prática, aproximada) de traduzir o ROA em algo mais intuitivo: "em quantos anos meu ativo dobra de tamanho, se eu mantiver esse mesmo retorno reinvestido?". É a mesma lógica da "regra dos 72" usada em juros compostos.',
                comoLer="Se ROA = 9%, t* = 72 ÷ 9 = 8 anos — ou seja, nesse ritmo de retorno, o Ativo Total da empresa dobraria em aproximadamente 8 anos. É uma estimativa, não uma previsão exata, mas ajuda a visualizar o efeito de retornos compostos ao longo do tempo.",
            ),
        ],
    },
    {
        "id": "prazos",
        "icone": "⏱️",
        "titulo": "D) Índices de Prazos Médios",
        "formulas": [
            formula(
                "Prazo Médio de Rotação de Estoques", "PMRE = ( ESTm ÷ CPV ) × DP",
                [
                    var("ESTm", "Estoque médio = (estoque inicial + estoque final) ÷ 2"),
                    var("CPV", "Custo do Produto (ou mercadoria/serviço) Vendido"),
                    var("DP", "Dias do Período considerado (360 p/ ano, 90 p/ trimestre, 30 p/ mês)"),
                ],
                sigla="PMRE", regra="quanto maior, pior", regraTipo="ruim",
                oQueE="Em quantos dias, em média, a empresa consegue vender (girar) o estoque que tem parado. Estoque parado é dinheiro parado — quanto mais rápido ele gira, melhor pro caixa.",
                comoLer="PMRE = 45 dias significa que, em média, uma mercadoria fica 45 dias no estoque antes de ser vendida. Pra uma padaria isso seria péssimo (produto estraga), pra uma loja de móveis pode ser normal. Compare sempre com empresas do mesmo ramo.",
            ),
            formula(
                "Prazo Médio de Recebimento de Vendas", "PMRV = ( DRm ÷ VB ) × DP",
                [
                    var("DRm", "Duplicatas a Receber médias (média entre início e fim do período)"),
                    var("VB", "Vendas Brutas (Receita Bruta) do período"),
                    var("DP", "Dias do Período considerado (365 p/ ano, 90 p/ trimestre, 30 p/ mês)"),
                ],
                sigla="PMRV", regra="quanto maior, pior", regraTipo="ruim",
                oQueE="Em quantos dias, em média, a empresa recebe o dinheiro das vendas que fez a prazo (fiado, boleto, cartão parcelado, etc.). Quanto mais rápido recebe, mais rápido o dinheiro volta pra girar o negócio de novo.",
                comoLer="PMRV = 30 dias significa que, em média, a empresa demora 1 mês entre vender e efetivamente receber o dinheiro em caixa. Se esse prazo for muito maior que o prazo que ela mesma tem pra pagar fornecedores (PMPC), ela pode sofrer de falta de caixa mesmo vendendo bem.",
            ),
            formula(
                "Prazo Médio de Pagamento de Compras", "PMPC = ( FORNm ÷ C ) × DP",
                [
                    var("FORNm", "saldo médio da conta Fornecedores no período"),
                    var("C", "Compras do período = CMV + Estoque final − Estoque inicial"),
                    var("DP", "Dias do Período considerado"),
                ],
                sigla="PMPC", regra="quanto maior, melhor", regraTipo="boa",
                oQueE='Em quantos dias, em média, a empresa demora pra pagar os seus fornecedores. Diferente dos outros dois prazos, aqui "maior" costuma ser bom: significa que a empresa consegue usar o dinheiro do fornecedor como uma espécie de crédito gratuito antes de precisar pagar.',
                comoLer="PMPC = 40 dias significa que, em média, a empresa só paga o fornecedor 40 dias depois da compra. Se ela recebe dos clientes antes disso (PMRV menor que PMPC), ela está \"financiando\" parte do seu giro com dinheiro de terceiros, sem custo — uma posição confortável.",
            ),
        ],
    },
    {
        "id": "ciclos",
        "icone": "🔄",
        "titulo": "Ciclo Operacional e Ciclo Financeiro",
        "formulas": [
            formula(
                "Ciclo Operacional", "CO = PMRE + PMRV",
                [
                    var("PMRE", "Prazo Médio de Rotação de Estoques (dias até vender o estoque)"),
                    var("PMRV", "Prazo Médio de Recebimento de Vendas (dias até receber do cliente)"),
                ],
                sigla="CO",
                oQueE="O tempo total, do início ao fim, que leva desde a compra da mercadoria até a empresa efetivamente receber o dinheiro da venda dela. Junta os dois prazos: tempo parado no estoque + tempo esperando o cliente pagar.",
                comoLer="CO = 75 dias (45 de estoque + 30 de recebimento) significa que, da compra da mercadoria até o dinheiro cair na conta, passam-se 75 dias em média. Esse é o \"tamanho\" do ciclo operacional do negócio — quanto menor, mais rápido o dinheiro circula.",
            ),
            formula(
                "Ciclo Financeiro", "CF = CO − PMPC",
                [
                    var("CO", "Ciclo Operacional (PMRE + PMRV)"),
                    var("PMPC", "Prazo Médio de Pagamento de Compras (dias até pagar o fornecedor)"),
                ],
                sigla="CF", regra="quanto maior, pior — mais capital de giro próprio é necessário", regraTipo="ruim",
                oQueE='O número mais importante de capital de giro: quantos dias a empresa precisa "bancar" com o próprio dinheiro, porque já pagou o fornecedor mas ainda não recebeu do cliente. É o período em que o caixa da empresa fica exposto.',
                comoLer="Se CO = 75 dias e PMPC = 40 dias, CF = 35 dias: a empresa precisa ter caixa suficiente pra bancar 35 dias de operação com dinheiro próprio. Se o fornecedor dá mais prazo que o ciclo operacional (PMPC > CO), o CF fica negativo — ótimo sinal, significa que a empresa opera praticamente sem precisar de capital de giro próprio.",
            ),
        ],
    },
    {
        "id": "investimentos",
        "icone": "📈",
        "titulo": "Técnicas de Análise de Investimentos",
        "formulas": [
            formula(
                "Valor Presente Líquido", "VPL = CF₀ + CF₁/(1+k)¹ + CF₂/(1+k)² + ... + CFₙ/(1+k)ⁿ",
                [
                    var("CF₀", "fluxo de caixa no momento 0 (o investimento inicial, entra como valor negativo)"),
                    var("CF₁, CF₂ ... CFₙ", "fluxos de caixa esperados nos períodos 1, 2, ..., n (geralmente positivos)"),
                    var("k", "taxa mínima de atratividade / custo de capital (a taxa usada para descontar)"),
                    var("n", "número de períodos (anos, meses...) do projeto"),
                ],
                sigla="VPL", regra="VPL > 0 aceita · VPL < 0 rejeita", regraTipo="info",
                oQueE="Traz todo o dinheiro que o investimento vai gerar no futuro pro valor de hoje (porque R$1,00 daqui a 3 anos vale menos que R$1,00 hoje) e soma com o quanto se gastou pra começar. O resultado diz se o projeto, no fim das contas, \"cria\" ou \"destrói\" valor.",
                comoLer="VPL = R$ 15.000 (positivo) significa que, depois de recuperar o investimento inicial e render pelo menos a taxa k, ainda sobram R$ 15.000 em valor de hoje — o projeto vale a pena. VPL = −R$ 8.000 (negativo) significa que o projeto nem cobre a taxa mínima exigida; na prática, você ganharia mais aplicando o dinheiro à taxa k do que investindo no projeto.",
            ),
            formula(
                "Taxa Interna de Retorno", "0 = CF₀ + CF₁/(1+TIR)¹ + CF₂/(1+TIR)² + ... + CFₙ/(1+TIR)ⁿ",
                [
                    var("CF₀", "investimento inicial (negativo)"),
                    var("CF₁ ... CFₙ", "fluxos de caixa futuros"),
                    var("TIR", "a incógnita: a taxa que torna o VPL igual a zero"),
                ],
                sigla="TIR", regra="taxa que zera o VPL · TIR > k aceita · TIR < k rejeita", regraTipo="info",
                oQueE="É a taxa de retorno \"real\" e embutida no próprio projeto — a rentabilidade que ele de fato entrega, nascida só dos fluxos de caixa, sem você precisar arbitrar uma taxa de desconto. Serve pra comparar diretamente com outras opções de investimento (CDI, outro projeto, etc.).",
                comoLer="TIR = 18% a.a. significa que o projeto rende, na prática, 18% ao ano sobre o capital investido. Compare sempre com a taxa k (sua taxa mínima de atratividade): se k = 12% e TIR = 18%, o projeto rende acima do mínimo exigido → aceita. Se TIR = 9% com k = 12%, o projeto rende menos do que você exige → rejeita.",
            ),
            formula(
                "Índice de Lucratividade", "IL = [ Σ CFₜ/(1+i)ᵗ ] ÷ CF₀",
                [
                    var("Σ CFₜ/(1+i)ᵗ", "soma de todos os fluxos de caixa futuros trazidos a valor presente"),
                    var("CFₜ", "fluxo de caixa no período t"),
                    var("i", "taxa de desconto usada (mesma lógica do k do VPL)"),
                    var("t", "o período em que o fluxo ocorre (1, 2, 3...)"),
                    var("CF₀", "investimento inicial (valor absoluto, no denominador)"),
                ],
                sigla="IL", regra="IL > 1 aceita · IL = 1 → VPL = 0 · IL < 1 rejeita", regraTipo="info",
                oQueE="Mostra quanto valor presente o projeto devolve pra cada R$1,00 investido — é o VPL só que em formato de \"índice\" (múltiplo), em vez de valor absoluto em reais. Útil pra comparar projetos de tamanhos diferentes.",
                comoLer="IL = 1,3 significa que, pra cada R$1,00 investido, o projeto devolve R$1,30 em valor presente — ou seja, R$0,30 de ganho líquido por real investido. IL = 0,8 significa que o projeto só devolve 80 centavos por real investido: dá prejuízo em valor presente, mesmo que o dinheiro total recebido pareça maior que o investido.",
            ),
            formula(
                "Payback Simples", "soma acumulada dos CFₜ até zerar o investimento inicial",
                [var("CFₜ", "fluxo de caixa recebido em cada período t (sem desconto)")],
                regra="não considera o valor do dinheiro no tempo", regraTipo="info",
                oQueE='Responde a pergunta mais direta de todas: "em quanto tempo eu recupero o dinheiro que investi?", somando os fluxos de caixa ano a ano até bater o valor do investimento inicial — sem descontar nada, sem considerar juros.',
                comoLer="Payback simples = 2,4 anos significa que, somando os fluxos de caixa recebidos, o investimento se paga em 2 anos e meio (aproximadamente). É uma medida de risco/velocidade de retorno, não de rentabilidade — por isso sempre se usa junto com o VPL ou a TIR, nunca sozinho.",
            ),
            formula(
                "Payback Descontado", "soma acumulada dos CFₜ/(1+k)ᵗ até zerar o investimento",
                [
                    var("CFₜ", "fluxo de caixa do período t"),
                    var("k", "taxa mínima de atratividade usada para trazer cada fluxo a valor presente"),
                    var("t", "o período em que o fluxo ocorre"),
                ],
                regra="mesma lógica do payback simples, mas com os fluxos trazidos a valor presente antes de somar", regraTipo="info",
                oQueE="A versão \"mais correta\" do payback: antes de somar os fluxos, traz cada um a valor presente (desconta pela taxa k), então em quanto tempo o investimento se paga considerando que dinheiro no futuro vale menos que dinheiro hoje.",
                comoLer="Payback descontado = 3,1 anos (maior que o simples, que seria algo como 2,4 anos) — isso é sempre esperado, porque descontar os fluxos faz o retorno \"demorar mais\" a aparecer em termos de valor presente. Se o payback descontado nunca chega a bater o investimento dentro do prazo do projeto, isso é outro jeito de dizer que o VPL é negativo.",
            ),
        ],
    },
]

header = """export interface Variavel {
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

export const categorias: Categoria[] = """

def emit_formula(f, indent):
    pad = "  " * indent
    pad2 = "  " * (indent + 1)
    lines = [pad + "{"]
    lines.append(pad2 + f"nome: {s(f['nome'])},")
    if "sigla" in f:
        lines.append(pad2 + f"sigla: {s(f['sigla'])},")
    lines.append(pad2 + f"formula: {s(f['formula'])},")
    lines.append(pad2 + "vars: [")
    for v in f["vars"]:
        lines.append(pad2 + "  " + f"{{ label: {s(v['label'])}, desc: {s(v['desc'])} }},")
    lines.append(pad2 + "],")
    if "regra" in f:
        lines.append(pad2 + f"regra: {s(f['regra'])},")
    if "regraTipo" in f:
        lines.append(pad2 + f"regraTipo: {s(f['regraTipo'])},")
    if "oQueE" in f:
        lines.append(pad2 + f"oQueE: {s(f['oQueE'])},")
    if "comoLer" in f:
        lines.append(pad2 + f"comoLer: {s(f['comoLer'])},")
    lines.append(pad + "},")
    return "\n".join(lines)

out = [header + "["]
for cat in categorias:
    out.append("  {")
    out.append(f"    id: {s(cat['id'])},")
    out.append(f"    titulo: {s(cat['titulo'])},")
    out.append(f"    icone: {s(cat['icone'])},")
    out.append("    formulas: [")
    for f in cat["formulas"]:
        out.append(emit_formula(f, 3))
    out.append("    ],")
    out.append("  },")
out.append("];")
out.append("")

with open("src/data/formulas.ts", "w", encoding="utf-8") as fh:
    fh.write("\n".join(out))

print("wrote", len("\n".join(out)), "bytes")
