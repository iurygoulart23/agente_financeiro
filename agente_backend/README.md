# Assistente Financeiro com GPT

Este projeto implementa um assistente financeiro que utiliza processamento de linguagem natural via GPT para entender e categorizar gastos e consultas. O sistema permite que usuários registrem gastos e consultem seu histórico financeiro usando linguagem natural.

## Características

- Autenticação de usuários 
- Processamento de linguagem natural usando GPT
- Registro de gastos a partir de texto livre
- Consulta de gastos e análise de despesas
- Armazenamento em MongoDB para dados não estruturados

## Pré-requisitos

- Python 3.8+
- MongoDB
- Node.js 16+
- Npm ou Yarn
- Uma chave de API da OpenAI

## Estrutura do Projeto

```
assistente-financeiro/
  ├── agente_backend/         # Backend FastAPI
  │   ├── src/
  │   │   ├── database.py     # Conexão com MongoDB
  │   │   ├── db.py           # Conexão SQLite para usuários
  │   │   ├── gpt_processor.py # Processamento via GPT
  │   │   └── models.py       # Modelos SQLAlchemy
  │   ├── scripts/
  │   │   └── setup_mongodb.py # Script de configuração do MongoDB
  │   └── main.py             # Aplicação FastAPI
  │
  └── agente_frontend/        # Frontend React
      ├── src/
      │   ├── components/     # Componentes React
      │   └── services/       # Serviços de API
      └── ...
```

## Configuração

### Backend

1. Crie um arquivo `.env` na pasta `agente_backend/` com o seguinte conteúdo:

```
SECRET_KEY="sua_chave_secreta_para_jwt"
MONGO_URI="mongodb://localhost:27017"
DB_NAME="agente_financeiro"
OPENAI_API_KEY="sua_chave_da_api_openai"
```

2. Instale as dependências:

```bash
cd agente_backend
pip install -r requirements.txt
```

3. Configure o MongoDB:

```bash
python scripts/setup_mongodb.py
```

4. Inicie o servidor FastAPI:

```bash
uvicorn main:app --reload
```

### Frontend

1. Instale as dependências:

```bash
cd agente_frontend
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Uso

1. Registre-se e faça login no sistema
2. Na tela principal, use o componente Assistente Financeiro para:
   - Registrar gastos: "Gastei R$ 50 no mercado hoje"
   - Consultar gastos: "Quais foram meus gastos deste mês?"
   - Análises específicas: "Quanto gastei com alimentação na semana passada?"

## Fluxo de Funcionamento

1. **Registro de Gastos**
   - O usuário digita texto como "Gastei 50 reais com mercado hoje"
   - O backend envia o texto para a API do GPT
   - O GPT extrai informações estruturadas (valor, categoria, data)
   - Os dados são salvos no MongoDB associados ao usuário atual

2. **Consulta de Gastos**
   - O usuário digita texto como "Quais foram meus gastos do mês?"
   - O backend envia o texto para a API do GPT
   - O GPT interpreta o período e os filtros desejados
   - O MongoDB é consultado com os parâmetros extraídos
   - Os resultados são exibidos para o usuário de forma organizada

## Extensões Futuras

- Adicionar integração com planilhas para importação/exportação
- Implementar gráficos e visualizações avançadas
- Adicionar previsões e sugestões de economia
- Implementar notificações e alertas de orçamento