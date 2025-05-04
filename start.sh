#!/bin/bash

# Caminhos (ajuste se seu frontend/backend estiverem em pastas diferentes)
BACKEND_DIR="agente_backend"
FRONTEND_DIR="agente_frontend"

# --------- BACKEND SETUP ----------
echo "📦 Instalando dependências do backend..."

cd "$BACKEND_DIR" || { echo "❌ Pasta do backend não encontrada!"; exit 1; }

# Cria ambiente virtual se não existir
if [ ! -d ".venv" ]; then
  echo "⚙️ Criando ambiente virtual..."
  python3 -m venv .venv
fi

# Ativa ambiente virtual
source .venv/bin/activate

# Instala requirements.txt
if [ -f "requirements.txt" ]; then
  echo "📥 Instalando pacotes Python..."
  pip install --upgrade pip
  pip install -r requirements.txt
else
  echo "❌ requirements.txt não encontrado."
  exit 1
fi

# Exporta variáveis do .env se existir
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Roda o backend com uvicorn
echo "🚀 Iniciando backend em segundo plano..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

cd ..

# --------- FRONTEND SETUP ----------
echo "📦 Instalando dependências do frontend..."

cd "$FRONTEND_DIR" || { echo "❌ Pasta do frontend não encontrada!"; exit 1; }

# Instala Node.js deps
if [ -f "package.json" ]; then
  npm install
else
  echo "❌ package.json não encontrado."
  exit 1
fi

# Roda o frontend
echo "🎯 Iniciando frontend..."
npm run dev
