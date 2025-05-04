# 💸 Agente Financeiro

Sistema completo com **backend em FastAPI + frontend em React (Vite)** para gestão de gastos pessoais com autenticação JWT.

---

## 📁 Estrutura do Projeto

agente_financeiro/
├── agente_backend/       # Backend FastAPI + SQLite
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── src/
├── agente_frontend/      # Frontend React com Tailwind e Heroicons
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
├── start.sh              # Script único para instalar e rodar tudo
└── README.md

---

## ⚙️ Requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

| Ferramenta | Versão recomendada |
|-----------|---------------------|
| Python    | 3.9 ou superior      |
| Node.js   | 18.x ou superior     |
| npm       | incluso com Node     |

---

## 🚀 Rodando com um único comando (recomendado)

Use o script `start.sh`:

```bash
chmod +x start.sh
./start.sh

Esse comando irá:

  - Criar e ativar um ambiente virtual Python

  - Instalar dependências do backend (FastAPI, SQLAlchemy, bcrypt etc)

  - Instalar dependências do frontend (React, Tailwind, Heroicons)

  - Iniciar o backend (uvicorn) na porta 8000

  - Iniciar o frontend (npm run dev) na porta 5173

---

## ⚙️ Rodando Manualmente (opcional)
### 🔹 Backend (FastAPI)

1 Acesse a pasta:
```css
cd agente_backend
```

2 Crie e ative o ambiente virtual:
```python
python -m venv .venv
source .venv/bin/activate
```
3 Instale as dependências:
```python
pip install -r requirements.txt
```
4 Inicie o servidor:
```python
    uvicorn main:app --reload --port 8000
```

---

## 🔹 Frontend (React + Vite)

1 Acesse a pasta:
```bash
cd agente_frontend
```

2 Instale as dependências:
``` bash
npm install
```

3 Rode o projeto:
```bash
    npm run dev
```

---

## 🔑 Autenticação

  - Registro de usuários com nome e senha

  - Login com JWT

  - Usuários só acessam a aplicação se estiverem liberados no banco

  - Administradores podem liberar usuários via rota protegida (/liberar/{username})

---

## 🧠 Tecnologias utilizadas

 - Backend: FastAPI · SQLite · SQLAlchemy · bcrypt · python-dotenv · JWT

 - Frontend: React · Vite · Tailwind CSS · Heroicons

 - Autenticação: JWT (com expiração + proteção de rotas)

---

## 📌 Observações

    O frontend se comunica com o backend em http://localhost:8000

    O backend permite requisições CORS de http://localhost:5173

    O banco SQLite (users.db) é criado automaticamente na primeira execução

---

## 📮 Contato

Desenvolvido por Iury Goulart da Fonseca
Para dúvidas técnicas, abra uma issue ou entre em contato pelo LinkedIn.
