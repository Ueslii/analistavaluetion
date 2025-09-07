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

// --- ROTA DO GEMINI ---
app.post('/chat', async (req, res) => {
  try {
    const { message, stockData } = req.body;
    if (!stockData || !stockData.ticker) {
      return res.status(400).json({ message: "Dados da ação (stockData) estão faltando no pedido." });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const formatCurrency = (val) => val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val) : 'N/A';
    const formatSimple = (val) => val ? val.toFixed(2).replace('.', ',') : 'N/A';
    const formatPercent = (val) => val ? `${(val * 100).toFixed(2)}%`.replace('.', ',') : 'N/A';

    const prompt = `
# INSTRUÇÃO MESTRA
Você é um "Analista de Valuation Sênior", especialista em modelagem financeira para empresas de commodities e energia. Sua tarefa é realizar uma análise de Fluxo de Caixa Descontado (FCD) para o ticker informado, sendo criterioso e realista nas suas premissas.

# DADOS REAIS DA AÇÃO (Ponto de Partida)
- Ticker: ${stockData.ticker}
- Nome: ${stockData.companyName}
- Preço Atual: ${formatCurrency(stockData.price)}
- Market Cap: ${formatCurrency(stockData.marketCap)}
- Ações em Circulação: ${formatCurrency(stockData.sharesOutstanding)}
- Fluxo de Caixa Livre (Últimos 12M): ${formatCurrency(stockData.ttmFreeCashFlow)}
- Dívida Total: ${formatCurrency(stockData.totalDebt)}
- WACC (Taxa de Desconto) Base: ${formatPercent(stockData.estimatedWACC)}

# CONTEXTO DE MERCADO
Considere o cenário atual: preços do petróleo, política de dividendos da empresa, plano de investimentos e o cenário macroeconômico brasileiro. Analistas de mercado estão otimistas com a geração de caixa no curto prazo.

# ETAPAS DE EXECUÇÃO OBRIGATÓRIAS
1.  **Análise Preliminar:** Com base nos dados e no contexto de mercado, faça uma análise curta sobre a situação da empresa.
2.  **Modelo de FCD - Projeções (Múltiplos Estágios):** Crie uma tabela de projeção do FCF para os próximos 5 anos. Em vez de uma taxa única, use um **modelo de 2 estágios**:
    * **Anos 1-3 (Crescimento Acelerado):** Use uma taxa de crescimento maior, justificando-a com base no contexto de mercado (ex: preços de commodities, projetos).
    * **Anos 4-5 (Crescimento Normalizado):** Use uma taxa de crescimento menor, representando uma normalização do mercado.
    Justifique suas escolhas para as taxas de crescimento.
3.  **Modelo de FCD - Premissas Finais:** Liste a Taxa de Desconto (WACC) e a Taxa de Crescimento na Perpetuidade (g) que você usará. Seja crítico sobre o WACC base; ajuste-o se achar necessário com base no risco percebido.
4.  **Cálculo e Resultado Final:** Execute o cálculo do FCD passo a passo, mostrando os valores presentes dos FCFs e da perpetuidade, para chegar ao Preço Justo por Ação.
5.  **Tabela Resumo:** Apresente a tabela final (Preço Justo, Preço Atual, Potencial de Valorização).
6.  **Análise de Sensibilidade:** Comente brevemente como o Preço Justo mudaria se a taxa de crescimento ou o WACC fossem um pouco diferentes (ex: +/- 1%). Isso mostra a sensibilidade do modelo.
7.  **Conclusão e Disclaimer:** Apresente sua conclusão final e o disclaimer padrão de não recomendação de investimento.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ message: text });

  } catch (error) {
    console.error("❌ Erro ao chamar a API do Gemini:", error);
    res.status(500).json({ message: "Erro ao se comunicar com a IA." });
  }
});

// --- ROTA DE DADOS FINANCEIROS (AGORA COM YAHOO FINANCE) ---
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

    // --- MONTAGEM SEGURA DO OBJETO DE RESPOSTA ---
    // Usamos o operador "?." (Optional Chaining) para evitar erros se um campo não existir.
    // Se o campo não existir, ele retornará 'null'.
    const data = {
      ticker: ticker.toUpperCase(),
      companyName: quoteSummary.price?.longName || quoteSummary.price?.shortName || ticker,
      price: quoteSummary.price?.regularMarketPrice ?? null,
      variation: quoteSummary.price?.regularMarketChangePercent ?? null,
      marketCap: quoteSummary.price?.marketCap ?? null,
      sharesOutstanding: quoteSummary.defaultKeyStatistics?.sharesOutstanding ?? null,
      ttmFreeCashFlow: quoteSummary.financialData?.freeCashflow ?? null,
      totalDebt: quoteSummary.financialData?.totalDebt ?? null,
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

    // Log final para vermos exatamente o que estamos enviando para o frontend
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