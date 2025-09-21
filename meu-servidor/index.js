// meu-servidor/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const yahooFinance = require('yahoo-finance2').default; // ✅ Yahoo Finance
const multer = require('multer');
const pdf = require('pdf-parse')

const app = express();
const PORT = 3001;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



const storage = multer.memoryStorage();
const upload = multer({ storage: storage });          

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
const formatLargeNumber = (num) => {
  if (num === null || num === undefined) return "N/A";
  if (Math.abs(num) >= 1e9) {
    return `R$ ${(num / 1e9).toFixed(2)} Bi`;
  }
  if (Math.abs(num) >= 1e6) {
    return `R$ ${(num / 1e6).toFixed(2)} Mi`;
  }
  return `R$ ${num.toFixed(2)}`;
};

app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo PDF foi enviado." });
    }

    const dataBuffer = req.file.buffer;
    const data = await pdf(dataBuffer);
    
    // Retorna o texto extraído para o frontend
    res.json({ text: data.text });

  } catch (error) {
    console.error("❌ Erro ao processar o PDF:", error);
    res.status(500).json({ message: "Erro ao ler o arquivo PDF." });
  }
});
        

// --- ROTA DO GEMINI ---
app.post('/chat', async (req, res) => {
  try {
    const { message, stockData, persona, pdfText,  } = req.body;
    if (!stockData || !stockData.ticker) {
      return res.status(400).json({ message: "Dados da ação (stockData) estão faltando no pedido." });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig:{ temperature: 0.3}});


    const formatCurrency = (val) => val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val) : 'N/A';
    const formatSimple = (val) => val ? val.toFixed(2).replace('.', ',') : 'N/A';
    const formatPercent = (val) => val ? `${(val * 100).toFixed(2)}%`.replace('.', ',') : 'N/A';

    
  const getValuationPrompt = (stockData, persona, pdfText) => {
  const { ticker, companyName, sector, price, sharesOutstanding, indicators, totalDebt, totalCash, fcf, marketCap  } = stockData;
  const { pl, pvp, dy, } = indicators;
      const pdfContext = pdfText 
        ? 
        `
          # 📄 DADOS FINANCEIROS DO PDF (Fonte Primária)
          Você TEM A OBRIGAÇÃO de usar os dados extraídos abaixo como fonte principal para validação e análise de números contábeis, incluindo: Caixa, Dívida, Receita, FCF, Despesas Financeiras, e outros.
          - Caso haja conflito entre o PDF e a API, dê prioridade ao PDF e JUSTIFIQUE.
          - Somente use os dados da API se o PDF estiver INCOMPLETO ou INCONSISTENTE.
          - Mencione o PDF explicitamente na conclusão como base da análise.
          ---
          ${pdfText.substring(0, 5000)}... 
          ---
          ` 
              : '';
  // INSTRUÇÃO BASE (COMUM A TODOS)
  let prompt;

  if (sector && sector.toLowerCase().includes('financial')) {
    // =================================================================
    // PROMPT PARA O SETOR FINANCEIRO (DDM)
    // =================================================================
    prompt = `# Persona e Objetivo
  Você é um "Analista de Valuation Sênior" para um investidor de perfil "${persona}". Seu objetivo é calcular o valor justo da ação ${ticker} usando o Modelo de Dividendos Descontados (DDM), apropriado para o setor financeiro, e apresentar uma conclusão prática.

  # Contexto (Dados Fornecidos)
  - Ticker: ${ticker}, Nome: ${companyName}
  - Setor: ${sector}
  - Preço Atual: ${price}
  - P/L: ${pl || 'N/A'}, P/VP: ${pvp || 'N/A'}, Dividend Yield (DY): ${dy || 'N/A'}
  ${pdfContext}

  # Regras & Metodologia DDM (Execução Obrigatória)

  1.  **Análise de Qualidade:** Com base nos dados, faça uma breve análise da situação atual da empresa. O P/L está alto ou baixo para o setor? O DY é sustentável?

  2.  **Definição das Premissas (Justificadas):**
      * **Custo do Equity (Ke) - Modelo CAPM:** Calcule o Ke. Use uma Taxa Livre de Risco (Rf) de 10.5% e um Prêmio de Risco de Mercado (MRP) de 7.5%. Assuma um Beta de 1.0 para bancos grandes ou 1.2 para bancos menores/digitais. Mostre o cálculo: Ke = Rf + Beta * MRP.
      * **Taxa de Crescimento dos Dividendos (g):** Defina uma taxa de crescimento perpétuo 'g' com base na persona:
          * **Conservadora:** g = 2.0% (crescimento modesto, abaixo da inflação).
          * **Realista:** g = 3.0% (alinhado com o crescimento nominal do PIB de longo prazo).
          * **Otimista:** g = 4.0% (assume ganhos de eficiência e market share).

  3.  **Cálculo do Valor Justo:**
      * Calcule o Dividendo por Ação do último ano (D0) usando: D0 = Preço Atual * DY.
      * Calcule o Dividendo esperado para o próximo ano (D1) usando: D1 = D0 * (1 + g).
      * Calcule o Preço Justo usando a fórmula de Gordon: Preço Justo = D1 / (Ke - g). Mostre todos os cálculos de forma clara.

  4.  **Resultado Final e Conclusão Prática:**
      * Apresente a tabela resumo (Preço Justo, Preço Atual, Potencial de Valorização/Desvalorização).
      * Escreva uma conclusão objetiva para o investidor, indicando se, com base neste modelo, a ação parece estar sendo negociada com um prêmio ou desconto em relação ao seu valor intrínseco. Finalize com o disclaimer padrão.`;

  } else {
    // =================================================================
    // PROMPT PARA OUTROS SETORES (FCD)
    // =================================================================
    let wacc;
    let fcfGrowthRate;
    switch (persona) {
      case 'Otimista': wacc = 0.12; fcfGrowthRate = 0.05; break; // WACC menor, crescimento maior
      case 'Conservadora': wacc = 0.15; fcfGrowthRate = 0.01; break; // WACC maior, crescimento menor
      default: wacc = 0.135; fcfGrowthRate = 0.03; break; // Médio
    }

    prompt = `
    
    # Persona e Objetivo
      Você é um "Analista de Valuation Sênior" para um investidor de perfil "${persona}". Seu objetivo é calcular o valor justo da ação ${ticker} usando o Fluxo de Caixa Descontado (FCD). Siga TODAS as etapas OBRIGATORIAMENTE.

      # Dados de Mercado (API)
      - Ticker: ${ticker}, Nome: ${companyName}
      - Preço Atual: ${price}
      - Market Cap (E): ${marketCap}
      - Ações em Circulação: ${sharesOutstanding}
      - Fluxo de Caixa Livre (TTM) / FCF: ${fcf}
      - Dívida Total (D): ${totalDebt}
      - Caixa e Equivalentes: ${totalCash}
      - P/L: ${pl || 'N/A'}, P/VP: ${pvp || 'N/A'}, DY: ${dy || 'N/A'}
      ${pdfContext}

      # Metodologia FCD - Execução Passo a Passo Obrigatória

      ## ETAPA 1: Análise Preliminar e Validação de Dados
      1.  Comece sua resposta com um resumo dos dados de mercado (API).
      2.  **Validação Cruzada com PDF:** Compare os dados da API com os dados do PDF. Se houver divergências (ex: Dívida Total), aponte-as e justifique qual fonte você usará para os cálculos (geralmente, os dados consolidados são preferíveis).

      ## ETAPA 2: Projeções de Fluxo de Caixa Livre (FCF)
      1.  **FCF Base (Ano 1):** Use o "Fluxo de Caixa Livre (TTM)" REAL fornecido pela API. NÃO ESTIME este número. Se o valor for nulo, e somente nesse caso, calcule-o a partir do PDF (Fluxo de Caixa Operacional - CAPEX) e justifique.
      2.  **Tabela de Projeção:** Crie uma tabela de projeção de FCF para 5 anos, usando a taxa de crescimento inicial de ${fcfGrowthRate * 100}% e reduzindo-a gradualmente.

      ## ETAPA 3: Cálculo do WACC (Custo Médio Ponderado de Capital)
      Esta é a etapa mais crítica. Siga o algoritmo abaixo:

      1.  **Custo do Capital Próprio (Ke):**
          * Calcule o Ke usando o modelo CAPM: "Ke = Rf + Beta * (Rm - Rf)".
          * Use as seguintes premissas: Taxa Livre de Risco (Rf) = 10.5%; Prêmio de Risco de Mercado ("Rm - Rf") = 7.5%.
          * Assuma um Beta (β) de 1.0, a menos que o setor seja notoriamente de baixo risco (ex: Utilities), onde um Beta de 0.8 pode ser usado. Justifique sua escolha.
          * Apresente o cálculo final do Ke.

      2.  **Custo da Dívida (Kd):**
          * **Passo 1:** No PDF, localize a "Demonstração do Resultado Consolidado".
          * **Passo 2:** Encontre a linha "Despesas Financeiras" ou "Resultado Financeiro" e extraia o valor acumulado no período.
          * **Passo 3:** Calcule o Custo da Dívida antes dos impostos com a fórmula: "Kd = Despesas Financeiras / Dívida Total". Use a "Dívida Total" fornecida pela API.
          * **Passo 4:** Calcule o Custo da Dívida após os impostos: "Kd_liquido = Kd * (1 - Taxa de Imposto)". Assuma uma Taxa de Imposto (IR/CSLL) de 34%, a menos que consiga calcular uma taxa efetiva a partir da DRE no PDF.
          * Apresente os valores encontrados e o cálculo.

      3.  **Cálculo Final do WACC:**
          * Use a fórmula padrão: "WACC = (E / (E + D)) * Ke + (D / (E + D)) * Kd_liquido".
          * Onde: "E" = Market Cap (API), "D" = Dívida Total (API).
          * Apresente o cálculo e o WACC final.

      4.  **Plano B (Somente se estritamente necessário):** Se o PDF não contiver de forma alguma uma DRE que permita identificar as "Despesas Financeiras", Você deve dizer na análise que o valor do WACC foi presumido por ausência de dados contábeis completos no PDF, e que isso afeta a precisão da avaliação..

      ## ETAPA 4: Cálculo do Valor Justo
      1.  Desconte os FCFs projetados usando o WACC que você calculou na Etapa 3.
      2.  Calcule o Valor Terminal e traga-o a valor presente.
      3.  Some tudo para encontrar o Enterprise Value (EV).
      4.  Subtraia a Dívida Líquida (Dívida Total - Caixa) para encontrar o Equity Value.
      5.  Divida pela quantidade de Ações em Circulação para chegar ao **Preço Justo por Ação**.

      ## ETAPA 5: Conclusão e Tabela Resumo
      1.  Apresente a tabela final comparando "Preço Justo" e "Preço Atual".
      2.  Escreva uma conclusão para o investidor "Realista", explicando o que o resultado significa e citando os dados do PDF que influenciaram sua análise qualitativa sobre os riscos e a qualidade da empresa.
      3.  Finalize com o disclaimer padrão.`;}
  return prompt;
}; 
    const prompt = getValuationPrompt(stockData, persona, pdfText);
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    res.json({ message: text });

  } catch (error) {
    console.error("❌ Erro ao chamar a API do Gemini:", error);
    res.status(500).json({ message: "Erro ao se comunicar com a IA." });
  }
});

app.get('/api/stock/:ticker', async (req, res) => {
  try {
    
    const { ticker } = req.params;
    const t = ticker.toUpperCase() + ".SA";

    // Módulos que vamos solicitar
    const modules = ["price", "summaryDetail", "defaultKeyStatistics", "financialData", "assetProfile"];
    const quoteSummary = await yahooFinance.quoteSummary(t, { modules });

    // Adicionamos um log para ver a resposta crua da API no terminal do servidor
    console.log(`Resposta crua do Yahoo Finance para ${t}:`, JSON.stringify(quoteSummary, null, 2));

    if (!quoteSummary) {
      throw new Error(`Nenhuma resposta do Yahoo Finance para ${t}.`);
    }

    // Buscando o histórico
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    const history = await yahooFinance.historical(t, { period1: startDate, period2: endDate, interval: "1d" });


    const data = {
      ticker: ticker.toUpperCase(),
      companyName: quoteSummary.price?.longName || quoteSummary.price?.shortName || ticker,
      sector: quoteSummary.assetProfile?.sector || null,
      price: quoteSummary.price?.regularMarketPrice ?? null,
      variation: quoteSummary.price?.regularMarketChangePercent ?? null,
      marketCap: quoteSummary.price?.marketCap ?? null,
      sharesOutstanding: quoteSummary.defaultKeyStatistics?.sharesOutstanding ?? null,
      ttmFreeCashFlow: quoteSummary.financialData?.freeCashflow ?? null,
      totalDebt: quoteSummary.financialData?.totalDebt ?? null,
      totalCash: quoteSummary.financialData?.totalCash ?? null,
      fcf: quoteSummary.financialData?.freeCashflow ?? null,
      estimatedWACC: 0.12, // Premissa inicial
      
      history: history.map(h => ({
        date: new Date(h.date).toLocaleDateString('pt-BR'),
        close: h.close
      })).reverse(),
      indicators: {
        pl: quoteSummary.summaryDetail?.trailingPE ?? null,
        pvp: quoteSummary.defaultKeyStatistics?.priceToBook ?? null,
        dy: quoteSummary.summaryDetail?.dividendYield ?? null,
      }
    };

    console.log('Backend está enviando para o frontend:', JSON.stringify(data, null, 2));

    res.json(data);

  } catch (error) {
    console.error(`❌ Erro detalhado ao buscar dados para ${req.params.ticker}:`, error);
    res.status(404).json({ message: `Erro ao buscar dados para o ticker ${req.params.ticker}. Verifique se o código está correto e tente novamente.` });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});