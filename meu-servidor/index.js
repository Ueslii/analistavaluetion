

// Importa a biblioteca Express que instalamos
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');


// Cria a nossa aplicação principal
const app = express();
const PORT = 3001;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json()); // Habilita o servidor para receber dados em formato JSON

// Cria uma "rota" ou 'endpoint' de teste.
// Quando alguém acessar nosso servidor no endereço '/api', nós responderemos com uma mensagem.
app.post('/chat', async (req, res) => {
    try {
        const { message }= req.body;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        const prompt = `Você é um Analista de Valuation especialista. Analise a ação mencionada na seguinte mensagem do usuário, fornecendo uma análise fundamentalista concisa sobre se ela parece estar com um preço justo ou não. Mensagem do usuário: "${message}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ message: text }); // Envia a resposta do Gemini de volta para o frontend

            } catch (error) {
                 console.error("Erro ao chamar a API do Gemini:", error);
                res.status(500).json({ message: "Erro ao se comunicar com a IA." });
            }
});
app.get('/api/stock/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params; // Pega o ticker da URL (ex: PETR4)

    // Chama a API da Brapi
    const response = await axios.get(`https://brapi.dev/api/quote/${ticker}`);
    const data = response.data.results[0];

    // Envia apenas os dados que nos interessam de volta para o frontend
    res.json({
      ticker: data.symbol,
      companyName: data.longName,
      price: `R$ ${data.regularMarketPrice.toFixed(2)}`,
      variation: `${data.regularMarketChangePercent.toFixed(2)}%`,
    });

  } catch (error) {
    console.error("Erro ao buscar dados na Brapi:", error.message);
    res.status(404).json({ message: "Ação não encontrada ou erro na API externa." });
  }
});
// Imicia o servidor e o faz "escutar" por pedidos na porta que definimos. 
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});
