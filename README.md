# 🤖 Analista de Valuation com IA (Gemini)

# 🤖 Analista de Valuation com IA (Gemini)

![Prévia do Projeto](https://i.imgur.com/vH4kY4p.png)

## 📜 Descrição

O Analista de Valuation é uma aplicação web full-stack que utiliza a inteligência artificial do Google Gemini para realizar análises fundamentalistas de ações da bolsa brasileira (B3). O objetivo foi criar uma aplicação capaz de não apenas mostrar dados, mas "raciocinar" sobre eles, aplicando metodologias como Fluxo de Caixa Descontado (FCD) de forma automatizada.

Este projeto foi construído para consolidar conhecimentos em integração de LLMs com sistemas tradicionais (React + Node.js).

## ⚠️ Status do Projeto e Limitações Conhecidas

**Este projeto foi finalizado como um MVP (Minimum Viable Product) para fins de estudo e portfólio. O código está disponível "as-is" (como está).**

Se você clonar este repositório, esteja ciente das seguintes limitações arquiteturais:

1.  **Limites da API do Gemini:** O projeto utiliza a camada gratuita da API do Google Gemini. É comum enfrentar erros de *Rate Limit* (Erro 429) ou instabilidade na resposta se houver muitas requisições consecutivas.
2.  **Premissas do Valuation:** A IA *estima* as taxas de crescimento e desconto (WACC) baseada nos indicadores básicos (P/L, P/VP, DY). O sistema **não** consome balanços patrimoniais completos, o que pode gerar distorções no cálculo do Preço Justo.
3.  **Escopo de Mercado:** O sistema está otimizado para tickers da B3 (sufixo `.SA`).
4.  **Persistência:** Não há banco de dados conectado. O histórico do chat é perdido ao recarregar a página.

## ✨ Funcionalidades

* **Chat com IA:** Interface interativa para solicitar análises de ações.
* **RAG Simplificado:** O backend injeta dados financeiros reais no prompt do modelo para evitar alucinações.
* **Painel de Dados:** Exibição de preço e indicadores em tempo real.
* **Design Responsivo:** Interface "Mobile-First" com Tailwind CSS.

## 🚀 Tecnologias Utilizadas

#### **Frontend**
* **React** com **TypeScript** e **Vite**
* **Tailwind CSS**

#### **Backend**
* **Node.js** com **Express**
* **Yahoo Finance API** (via biblioteca `yahoo-finance2`) para dados de mercado.
* **Google Gemini API** (modelo `gemini-1.5-flash`) para raciocínio analítico.

## ⚙️ Como Rodar Localmente

**Pré-requisitos:** Node.js (v18+) e uma chave de API do Google Gemini.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/analista-valuation.git](https://github.com/seu-usuario/analista-valuation.git)
    ```

2.  **Backend:**
    ```bash
    cd meu-servidor
    npm install
    # Crie um arquivo .env com:
    # GEMINI_API_KEY="SUA_CHAVE"
    node index.js
    ```

3.  **Frontend:**
    ```bash
    cd meu-analista
    npm install
    npm run dev
    ```

---
*Desenvolvido como projeto de estudo de arquitetura Full Stack e IA Generativa.*

