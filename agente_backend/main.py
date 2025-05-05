# agente_backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from sqlalchemy.orm import Session
from src.models import User
from src.db import SessionLocal, engine, Base
from src.db_mongo import save_expense, get_user_expenses
from src.process_input import processar_texto, processar_consulta
import bcrypt
from typing import Optional

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# Cria o banco e tabela se ainda não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # se seu frontend roda na porta 5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterRequest(BaseModel):
    username: str
    password: str
    
    class Config:
        extra = "forbid" 

class LoginRequest(BaseModel):
    username: str
    password: str

class ExpenseRequest(BaseModel):
    texto: str

class QueryRequest(BaseModel):
    consulta: str

# Dependência de sessão
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_from_token(request: Request, db: Session = Depends(get_db)):
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido ou ausente")
        
    token = token.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
            
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

def verificar_token_admin(request: Request):
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente ou inválido")

    token = token.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Acesso negado — apenas administradores")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

@app.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    print(f"Tentativa de login: {req.username}")
    
    user = db.query(User).filter(User.username == req.username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    if not user.liberado:
        raise HTTPException(status_code=403, detail="Usuário ainda não está liberado para utilizar o sistema")
    
    if not bcrypt.checkpw(req.password.encode(), user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token_data = {
        "sub": req.username,
        "exp": datetime.utcnow() + timedelta(hours=1),
        "is_admin": user.is_admin
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token}

@app.get("/verify")
def verify_token(request: Request):
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")
    token = token.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"message": "Token válido", "username": payload.get("sub")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

@app.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == req.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Usuário já existe")

    hashed_pw = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(
        username=req.username,
        hashed_password=hashed_pw.decode('utf-8'),
        liberado=False,
        is_admin=False
        )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Usuário criado com sucesso"}

@app.put("/liberar/{username}")
def liberar_usuario(username: str, request: Request, db: Session = Depends(get_db)):
    verificar_token_admin(request)

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user.liberado = True
    db.commit()
    return {"message": f"Usuário {username} liberado com sucesso"}

# Novas rotas para o assistente financeiro

@app.post("/processar-gasto")
def processar_gasto(req: ExpenseRequest, user: User = Depends(get_user_from_token)):
    """
    Processa um texto informado pelo usuário para identificar um gasto
    Exemplo: "gastei 50 reais com mercado hoje"
    """
    try:
        # Processar o texto e extrair informações estruturadas
        gasto = processar_texto(req.texto, user.id)
        
        # Se houve erro no processamento, retornar
        if "erro" in gasto:
            return {"status": "erro", "mensagem": gasto["erro"]}
        
        # Salvar no MongoDB - função save_expense garantirá consistência dos IDs
        save_expense(gasto)
        
        return {"status": "sucesso", "gasto": gasto}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar gasto: {str(e)}")

@app.post("/consultar-gastos")
def consultar_gastos(req: QueryRequest, user: User = Depends(get_user_from_token)):
    """
    Processa uma consulta do usuário sobre seus gastos
    Exemplo: "quais foram meus gastos do mês?"
    """
    try:
        # Processa a consulta para identificar o período e tipo de gasto
        parametros = processar_consulta(req.consulta, user.id)
        
        # Recupera os gastos do banco de dados
        gastos = get_user_expenses(
            user_id=parametros["user_id"],
            start_date=parametros.get("start_date"),
            end_date=parametros.get("end_date"),
            tipo=parametros.get("tipo")
        )
        
        # Calcula o total
        total = sum(gasto["valor"] for gasto in gastos)
        
        # Agrupa por categoria
        por_categoria = {}
        for gasto in gastos:
            categoria = gasto["tipo"]
            if categoria not in por_categoria:
                por_categoria[categoria] = 0
            por_categoria[categoria] += gasto["valor"]
        
        # Formata o período para mensagem
        periodo = "do mês atual"
        if "start_date" in parametros and "end_date" in parametros:
            inicio = datetime.strptime(parametros["start_date"], "%Y-%m-%d")
            fim = datetime.strptime(parametros["end_date"], "%Y-%m-%d")
            
            if inicio.month == fim.month and inicio.year == fim.year:
                if inicio.day == 1 and fim.day == calendar.monthrange(fim.year, fim.month)[1]:
                    periodo = f"do mês de {inicio.strftime('%B de %Y')}"
                else:
                    periodo = f"de {inicio.strftime('%d/%m/%Y')} a {fim.strftime('%d/%m/%Y')}"
            elif inicio.replace(month=1, day=1) == inicio and fim.replace(month=12, day=31) == fim:
                periodo = f"do ano {inicio.year}"
            else:
                periodo = f"de {inicio.strftime('%d/%m/%Y')} a {fim.strftime('%d/%m/%Y')}"
        
        resposta = {
            "status": "sucesso",
            "periodo": periodo,
            "total": total,
            "por_categoria": por_categoria,
            "gastos": gastos
        }
        
        return resposta
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consultar gastos: {str(e)}")

@app.get("/gastos")
def listar_gastos(
    user: User = Depends(get_user_from_token),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    tipo: Optional[str] = None
):
    """
    Lista gastos do usuário com filtros opcionais
    """
    try:
        gastos = get_user_expenses(user.id, start_date, end_date, tipo)
        return {"status": "sucesso", "gastos": gastos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar gastos: {str(e)}")