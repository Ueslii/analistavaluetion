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
    const { message, stockData } = req.body;
    if (!stockData || !stockData.ticker) {
      return res.status(400).json({ message: "Dados da ação (stockData) estão faltando no pedido." });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig:{ temperature: 0.2}});


    const formatCurrency = (val) => val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val) : 'N/A';
    const formatSimple = (val) => val ? val.toFixed(2).replace('.', ',') : 'N/A';
    const formatPercent = (val) => val ? `${(val * 100).toFixed(2)}%`.replace('.', ',') : 'N/A';

    
    const prompt = `
    # INSTRUÇÃO MESTRA
    Você é um "Analista de Valuation Sênior", especialista em modelagem financeira. Sua tarefa é realizar uma análise de Fluxo de Caixa Descontado (FCD) para o ticker informado, seguindo a metodologia mais precisa.

    # DADOS REAIS DA AÇÃO (Ponto de Partida)
    - Ticker: ${stockData.ticker}
    - Nome: ${stockData.companyName}
    - Preço Atual: ${stockData.price}
    - Ações em Circulação: ${stockData.sharesOutstanding}
    - Fluxo de Caixa Livre (Últimos 12M): ${stockData.indicators.fcf || 'Não Informado'}
    - Dívida Total: ${stockData.totalDebt || 'Não Informado'}
    - Caixa e Equivalentes: ${stockData.totalCash || 'Não Informado'}
    - P/L: ${stockData.indicators.pl || 'Não Informado'}
    - P/VP: ${stockData.indicators.pvp || 'Não Informado'}
    - Dividend Yield: ${stockData.indicators.dy || 'Não Informado'}

    # ETAPAS DE EXECUÇÃO OBRIGATÓRIAS

    1.  **Análise Preliminar e Contexto de Mercado:** Descreva o sentimento de mercado para o setor e, em seguida, analise a situação financeira da empresa com base nos dados fornecidos.

    2.  **Modelo de FCD - Projeções:** Crie uma tabela de projeção do FCF para os próximos 5 anos. Use o "Fluxo de Caixa Livre (Últimos 12M)" como ponto de partida. Justifique suas taxas de crescimento.

    3.  **Modelo de FCD - Premissas Finais:** Apresente e justifique o WACC e a Taxa de Crescimento na Perpetuidade (g).

    4.  **Cálculo do Enterprise Value (EV):** Calcule o Valor Presente dos FCFs projetados e o Valor Presente do Valor Terminal. A soma de ambos resulta no **Enterprise Value**. Mostre os cálculos.

    5.  **Cálculo do Equity Value (Valor de Mercado):**
        * **Calcule a Dívida Líquida:** Dívida Líquida = Dívida Total - Caixa e Equivalentes.
        * **Calcule o Equity Value:** Equity Value = Enterprise Value - Dívida Líquida.
        * **Calcule o Preço Justo por Ação:** Preço Justo = Equity Value / Ações em Circulação.

    6.  **Tabela Resumo:** Apresente a tabela final (Preço Justo, Preço Atual, Potencial de Valorização).

    7.  **Conclusão e Disclaimer:** Apresente sua conclusão e o disclaimer padrão.
      `;

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
    const modules = ["price", "summaryDetail", "defaultKeyStatistics", "financialData"];
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