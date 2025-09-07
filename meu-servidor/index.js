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

    const prompt = `
# INSTRUÇÃO PRINCIPAL
Você é um "Analista de Valuation", uma IA especialista em Value Investing. Sua única tarefa é realizar uma análise fundamentalista para o ticker informado, baseando-se EXCLUSIVAMENTE nos dados reais fornecidos. Apresente a resposta final em Markdown de forma clara e estruturada.

# DADOS REAIS DA AÇÃO (Fonte da Verdade)
- Ticker: ${stockData.ticker}
- Nome: ${stockData.companyName}
- Preço Atual: ${stockData.price}
- P/L: ${stockData.indicators.pl || 'Não Informado'}
- P/VP: ${stockData.indicators.pvp || 'Não Informado'}
- Dividend Yield: ${stockData.indicators.dy || 'Não Informado'}

# ETAPAS DE EXECUÇÃO OBRIGATÓRIAS
1. *Análise dos Indicadores:* Com base nos DADOS REAIS FORNECIDOS, faça uma breve análise do que os indicadores P/L, P/VP e Dividend Yield sugerem sobre a situação atual da empresa. Se um dado não foi informado, mencione isso.
2. *Premissas para o FCD:* Crie uma tabela Markdown com premissas ADICIONAIS e PLAUSÍVEIS para o cálculo do Fluxo de Caixa Descontado (FCD). Inclua estimativas realistas para: Crescimento do FCF, uma Taxa de Desconto (WACC) e uma Taxa de Crescimento na Perpetuidade (g).
3. *Resultado da Análise (Tabela Resumo):* Apresente uma tabela Markdown final com o resumo comparativo: Preço Justo Calculado, Preço Atual de Mercado e Potencial de Valorização.
4. *Conclusão e Disclaimer:* Escreva uma breve conclusão sobre o que a análise sugere e finalize SEMPRE com o disclaimer: "Esta é uma análise educacional baseada em dados reais e premissas estimadas. Não constitui recomendação de investimento."
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
    const t = ticker.toUpperCase() + ".SA"; // ✅ .SA = B3 (Brasil)

    // Buscar no Yahoo Finance
    const data = await yahooFinance.quoteSummary(t, { modules: ["summaryDetail", "defaultKeyStatistics", "price"] });

    if (!data) throw new Error(`Ticker ${t} não encontrado no Yahoo Finance`);

    const price = data.price?.regularMarketPrice || null;
    const pl = data.defaultKeyStatistics?.forwardPE || data.summaryDetail?.trailingPE;
    const pvp = data.defaultKeyStatistics?.priceToBook;
    const dy = data.summaryDetail?.dividendYield ? (data.summaryDetail.dividendYield * 100).toFixed(2) + "%" : "N/A";

    res.json({
      ticker: ticker.toUpperCase(),
      companyName: data.price?.longName || data.price?.shortName || ticker,
      price: price ? `R$ ${price.toFixed(2)}` : "N/A",
      indicators: {
        pl: pl ?? "N/A",
        pvp: pvp ?? "N/A",
        dy
      }
    });

  } catch (error) {
    console.error("❌ Erro ao buscar dados no Yahoo Finance:", error);
    res.status(500).json({ message: "Erro ao buscar dados da ação." });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});