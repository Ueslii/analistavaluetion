// meu-servidor/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const yahooFinance = require('yahoo-finance2').default; // ✅ Yahoo Finance

const app = express();
const PORT = 3001;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());
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

// --- ROTA DO GEMINI ---
app.post('/chat', async (req, res) => {
  try {
    const { message, stockData, persona } = req.body;
    if (!stockData || !stockData.ticker) {
      return res.status(400).json({ message: "Dados da ação (stockData) estão faltando no pedido." });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig:{ temperature: 0.2}});


    const formatCurrency = (val) => val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val) : 'N/A';
    const formatSimple = (val) => val ? val.toFixed(2).replace('.', ',') : 'N/A';
    const formatPercent = (val) => val ? `${(val * 100).toFixed(2)}%`.replace('.', ',') : 'N/A';

    
    const getValuationPrompt = (stockData, persona) => {
  const { ticker, companyName, sector, price, sharesOutstanding, indicators, totalDebt, totalCash } = stockData;
  const { pl, pvp, dy, fcf } = indicators;

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

    prompt = `# Persona e Objetivo
  Você é um "Analista de Valuation Sênior" para um investidor de perfil "${persona}". Seu objetivo é calcular o valor justo da ação ${ticker} usando o Fluxo de Caixa Descontado (FCD) e apresentar uma conclusão prática.

  # Contexto (Dados Fornecidos)
  - Ticker: ${ticker}, Nome: ${companyName}
  - Setor: ${sector || 'Geral'}
  - Preço Atual: ${price}
  - Ações em Circulação: ${sharesOutstanding}
  - Fluxo de Caixa Livre (TTM): ${fcf || 'N/A'}
  - Dívida Total: ${totalDebt || 'N/A'}, Caixa e Equivalentes: ${totalCash || 'N/A'}
  - P/L: ${pl || 'N/A'}, P/VP: ${pvp || 'N/A'}, DY: ${dy || 'N/A'}

  # Regras & Metodologia FCD (Execução Obrigatória)

  1.  **Análise Preliminar:** Com base nos dados, faça uma breve análise da situação atual da empresa (alavancagem, múltiplos, etc.).

  2.  **Projeções de FCF (5 Anos):**
      * **FCF Base (Ano 1):** Use o "Fluxo de Caixa Livre (TTM)" fornecido como a base para o FCF do Ano 1. Se não for informado, estime-o de forma conservadora.
      * **Taxa de Crescimento:** Crie uma tabela de projeção para 5 anos, começando com uma taxa de crescimento de ${(fcfGrowthRate * 100).toFixed(1)}% no Ano 2 e reduzindo-a gradualmente em 1% a cada ano subsequente.

  3.  **Premissas de Desconto e Perpetuidade:**
      * **WACC (OBRIGATÓRIO):** Use um WACC de exatamente **${(wacc * 100).toFixed(1)}%**. Esta é uma premissa fixa para a análise de perfil "${persona}". **NÃO** calcule o WACC.
      * **Crescimento na Perpetuidade (g):** Use uma taxa 'g' de 2.5%.

  4.  **Cálculos de Valuation:**
      * Calcule o Valor Presente dos FCFs projetados usando o WACC fornecido.
      * Calcule o Valor Terminal e seu Valor Presente.
      * Some-os para encontrar o Enterprise Value (EV).
      * Subtraia a Dívida Líquida (Dívida Total - Caixa) do EV para encontrar o Equity Value.
      * Divida o Equity Value pelo número de Ações em Circulação para encontrar o Preço Justo. Mostre os cálculos de forma clara.

  5.  **Resultado Final e Conclusão Prática:**
      * Apresente a tabela resumo (Preço Justo, Preço Atual, Potencial de Valorização/Desvalorização).
      * Escreva uma conclusão objetiva para o investidor, indicando se, com base neste modelo, a ação parece estar sendo negociada com um prêmio ou desconto em relação ao seu valor intrínseco. Finalize com o disclaimer padrão.`;
  }
  return prompt;
}; 
    const prompt = getValuationPrompt(stockData, persona);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
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