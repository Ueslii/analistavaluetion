# 🤖 Analista de Valuation com IA (Gemini)

![Prévia do Projeto](https://i.imgur.com/vH4kY4p.png) ## 📜 Descrição

O Analista de Valuation é uma aplicação web full-stack que utiliza a inteligência artificial do Google Gemini para realizar análises fundamentalistas de ações da bolsa brasileira (B3). O usuário pode inserir o ticker de uma ação e receber, em uma interface de chat, uma análise estruturada baseada no modelo de Fluxo de Caixa Descontado (FCD), enquanto um painel de dados exibe informações de mercado em tempo real.

Este projeto foi construído do zero para demonstrar um conjunto completo de habilidades de desenvolvimento, desde a criação da interface e experiência do usuário até a implementação de um backend seguro que consome múltiplas APIs de terceiros.

## ✨ Funcionalidades Principais

* **Chat com IA:** Interface de chat interativa para solicitar análises de ações.
* **Prompt Engineering Avançado:** Um prompt detalhado no backend força o Gemini a atuar como um especialista e a formatar as respostas em tabelas e seções.
* **Painel de Dados Dinâmico:** Um painel lateral que busca e exibe dados de mercado em tempo real (preço, variação, indicadores) da ação analisada.
* **Backend Seguro:** Um servidor Node.js/Express que protege as chaves de API e gerencia a lógica de negócios.
* **Design Responsivo:** A interface é totalmente adaptável para desktops, tablets e celulares, utilizando uma estratégia "Mobile-First".
* **Modo de Desenvolvimento:** O backend inclui um "interruptor" para usar dados mockados, permitindo o desenvolvimento do frontend sem esgotar as cotas das APIs.

## 🚀 Tecnologias Utilizadas

#### **Frontend**
* **React** com **TypeScript**
* **Vite** como ambiente de desenvolvimento
* **Tailwind CSS** para estilização
* **Heroicons** para a iconografia

#### **Backend**
* **Node.js** com **Express**
* **Axios** para chamadas a APIs externas
* **dotenv** para gerenciamento de variáveis de ambiente

#### **APIs**
* **Google Gemini API (gemini-1.5-pro)** para a análise de IA.
* **Alpha Vantage API** para os dados financeiros e de mercado.

## ⚙️ Como Rodar o Projeto Localmente

**Pré-requisitos:** Node.js (v18+)

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    ```

2.  **Configure o Backend (`meu-servidor`):**
    ```bash
    cd meu-servidor
    npm install
    ```
    * Crie um arquivo `.env` na raiz de `/meu-servidor` e adicione suas chaves de API:
        ```
        GEMINI_API_KEY="SUA_CHAVE_GEMINI"
        ALPHA_VANTAGE_API_KEY="SUA_CHAVE_ALPHA_VANTAGE"
        ```
    * Inicie o servidor backend:
        ```bash
        node index.js
        ```

3.  **Configure o Frontend (`meu-analista`):**
    ```bash
    cd ../meu-analista
    npm install
    ```
    * Inicie a aplicação React:
        ```bash
        npm run dev
        ```

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3001`.