// meu-servidor/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Configuração ---
const app = express();
const PORT = 3001;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Rota de Análise com Gemini ---
app.post('/chat', async (req, res) => {
  try {
    const { message, stockData } = req.body;

    // Proteção caso o frontend envie dados incompletos
    if (!stockData || !stockData.ticker) {
      return res.status(400).json({ message: "Dados da ação (stockData) estão faltando no pedido." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // O prompt final, combinando o seu detalhamento com mais robustez
    const prompt = `
# PERSONA E OBJETIVO
Você é o "Analista de Valuation", uma IA especialista em "Value Investing". Sua missão é criar uma análise de Fluxo de Caixa Descontado (FCD) para o ticker fornecido, usando os dados reais fornecidos. Sua comunicação deve ser estruturada e em etapas, usando Markdown.

# ARQUIVO DE CONHECIMENTO (SIMULADO)
Aja como se seu conhecimento viesse de um manual com estas regras:
- **Teoria Principal:** O valor de uma empresa é o valor presente de seus fluxos de caixa futuros.
- **Fórmulas Chave:** WACC, Crescimento de Gordon (Perpetuidade), e o cálculo final do Preço Justo (Enterprise Value - Dívida Líquida / Ações).

# DADOS REAIS FORNECIDOS (VIA API EXTERNA)
Use estes dados como a fonte da verdade para sua análise:
- Ticker: ${stockData.ticker}
- Nome da Empresa: ${stockData.companyName}
- Preço Atual: ${stockData.price}
- P/L: ${stockData.indicators.pl || 'Não disponível na API'}
- P/VP: ${stockData.indicators.pvp || 'Não disponível na API'}
- Dividend Yield: ${stockData.indicators.dy || 'Não disponível na API'}

# METODOLOGIA DE EXECUÇÃO (OBRIGATÓRIO)
Execute as seguintes etapas em ordem, sem pular nenhuma:

1.  **Validação e Premissas:** Confirme o recebimento do ticker. Crie uma tabela Markdown "Dados e Premissas" contendo os dados reais recebidos. Para os dados faltantes (como FCF, Dívida, WACC, etc.), você DEVE criar premissas PLAUSÍVEIS e realistas para a empresa em questão e incluí-las na tabela, indicando que são estimativas.

2.  **Cálculo do Preço Justo (Explicação):** Explique de forma concisa os passos que você (simuladamente) executou para o cálculo do FCD, referenciando seu "arquivo de conhecimento".

3.  **Resultado da Análise:** Apresente uma tabela Markdown final chamada "Resultado da Análise", com as colunas "Indicador" e "Valor", e as linhas: Preço Justo Calculado, Preço Atual de Mercado e Potencial de Alta/Baixa.

4.  **Conclusão e Disclaimer:** Escreva uma breve conclusão sobre o resultado (ex: "indicando uma potencial margem de segurança...") e finalize SEMPRE com o disclaimer: "Esta é uma análise educacional baseada em dados reais e premissas estimadas. Não constitui recomendação de investimento."
`;

    console.log("📨 Enviando prompt final para o Gemini...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ message: text });

  } catch (error) {
    console.error("❌ Erro ao chamar a API do Gemini:", error);
    res.status(500).json({ message: "Erro ao se comunicar com a IA." });
  }
});

// --- Rota de Dados Financeiros (Brapi) ---
app.get('/api/stock/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const t = ticker.toUpperCase();
    const token = process.env.BRAPI_API_KEY;

    // Usando os parâmetros corretos para buscar mais dados
    const url = `https://brapi.dev/api/quote/${t}?fundamental=true&dividends=true&token=${token}`;
    
    console.log(`🔎 Buscando dados no Brapi para ${t}...`);
    const response = await axios.get(url);
    const data = response.data?.results?.[0];

    if (!data) {
      throw new Error(`Ticker ${t} não encontrado no Brapi`);
    }

    // Funções para formatar os dados de forma segura
    const formatValue = (value) => value ?? null;
    const formatPercentage = (value) => (value !== null && value !== undefined) ? `${(value * 100).toFixed(2)}%` : null;

    res.json({
      ticker: data.symbol || t,
      companyName: data.longName || data.shortName,
      price: data.regularMarketPrice ? `R$ ${data.regularMarketPrice.toFixed(2)}` : 'N/A',
      variation: data.regularMarketChangePercent ? `${data.regularMarketChangePercent.toFixed(2)}%` : 'N/A',
      indicators: {
        pl: formatValue(data.trailingPE),
        pvp: formatValue(data.priceToBook),
        dy: formatPercentage(data.trailingAnnualDividendYield)
      }
    });

  } catch (error) {
    console.error("❌ Erro ao buscar dados no Brapi:", error.message);
    res.status(404).json({ message: "Ação não encontrada ou erro na API externa." });
  }
});

// --- Inicia Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});