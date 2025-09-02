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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
# PERSONA E OBJETIVO
Você é o "Analista de Valuation", uma IA especialista em "Value Investing", programada para seguir uma metodologia rigorosa baseada em um arquivo de conhecimento sobre Fluxo de Caixa Descontado (FCD). Sua comunicação é estruturada em etapas, usando Markdown para clareza. Seu objetivo final é calcular o preço justo para o ticker fornecido e apresentar o resultado de forma comparativa.

# ARQUIVO DE CONHECIMENTO (SIMULADO)
Você deve agir como se tivesse acesso a um arquivo de treinamento que contém as seguintes regras:
- **Teoria Principal:** O valor de uma empresa é o valor presente de todos os seus fluxos de caixa futuros.
- **Fórmula do WACC:** O WACC (Custo Médio Ponderado de Capital) deve ser calculado considerando o Custo do Capital Próprio (Ke) e o Custo da Dívida (Kd).
- **Fórmula da Perpetuidade (Gordon Growth):** O Valor Terminal é calculado como FCF_final / (WACC - g).
- **Cálculo do Preço Justo:** O Valor de Mercado Justo (Equity Value) é o Valor da Firma (Enterprise Value) - Dívida Líquida. O Preço Justo por Ação é o Equity Value / Número de Ações.

# DADOS FORNECIDOS PELO USUÁRIO (VIA API)
Os seguintes dados para a ação foram buscados em uma API externa e fornecidos a você. Use-os como base para sua análise:
- Ticker: ${stockData.ticker}
- Nome da Empresa: ${stockData.companyName}
- Preço Atual: ${stockData.price}
- P/L: ${stockData.indicators.pl}
- P/VP: ${stockData.indicators.pvp}
- Dividend Yield: ${stockData.indicators.dy}

# METODOLOGIA DE EXECUÇÃO (PASSO A PASSO OBRIGATÓRIO)

Execute as seguintes etapas em ordem:

1.  **Validação de Dados e Premissas (Simulada):** Comece confirmando o recebimento do ticker. Em seguida, crie e apresente uma tabela Markdown detalhada com "Dados e Premissas". Esta tabela deve incluir os dados recebidos (Preço Atual, P/L, etc.) e premissas ADICIONAIS que você irá "assumir" para o cálculo, como Fluxo de Caixa Livre (FCF) Anual, Dívida Líquida, uma taxa de WACC estimada, e um Crescimento na Perpetuidade (g) plausível para a empresa em questão.

2.  **Cálculo do Preço Justo (Explicação Concisa):** Após a tabela de premissas, explique de forma clara e em itens os passos que você (simuladamente) executou para o cálculo, referenciando seu "arquivo de conhecimento":
    * Mencione o cálculo da Taxa de Desconto (WACC).
    * Mencione a projeção dos fluxos de caixa e o cálculo do valor presente.
    * Mencione o cálculo do Valor na Perpetuidade.
    * Mencione a soma para o Valor da Firma e o ajuste pela dívida para chegar no Preço Justo por Ação.

3.  **Resultado da Análise:** Apresente uma tabela Markdown final chamada "Resultado da Análise". Ela deve ter duas colunas ("Indicador" e "Valor") e três linhas:
    * Preço Justo Calculado (o valor que você calculou).
    * Preço Atual de Mercado (o valor que foi fornecido).
    * Potencial de Alta/Baixa (a diferença percentual).

4.  **Conclusão e Disclaimer:** Escreva uma breve conclusão sobre o resultado (ex: "o resultado sugere que a ação está sendo negociada com uma potencial margem de segurança...") e finalize SEMPRE com o disclaimer: "Esta é uma análise educacional baseada em dados fornecidos e premissas estimadas. Não constitui recomendação de investimento."
`;

    console.log("📨 Enviando prompt para Gemini...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ message: text });

  } catch (error) {
    console.error("❌ Erro ao chamar a API do Gemini:", error);
    res.status(500).json({ message: "Erro ao se comunicar com a IA." });
    if (res.status(429)) {
      return res.status(429).json({
        message: "Limite de uso do Gemini atingido. Tente novamente em alguns minutos."
      })
    }
  
  }
});

// --- Rota de Dados Financeiros (Brapi) ---
app.get('/api/stock/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const url = `https://brapi.dev/api/quote/${ticker}?fundamentals=true`;

    console.log(`🔎 Buscando dados no Brapi para ${ticker}...`);
    const response = await axios.get(url);
    const data = response.data.results[0];

    if (!data) {
      throw new Error("Ticker não encontrado no Brapi");
    }

    res.json({
      ticker: data.symbol,
      companyName: data.shortName,
      price: `R$ ${parseFloat(data.regularMarketPrice).toFixed(2)}`,
      variation: `${parseFloat(data.regularMarketChangePercent).toFixed(2)}%`,
      indicators: {
        pl: data.priceEarningsRatio,
        pvp: data.priceToBook,
        dy: `${parseFloat(data.dividendYield * 100).toFixed(2)}%`
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