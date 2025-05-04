from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from sqlalchemy.orm import Session
from src.models import User
from src.db import SessionLocal, engine, Base
import bcrypt

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

# Dependência de sessão
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
    
    if not user.liberado:
        raise HTTPException(status_code=403, detail="Usuário ainda não está liberado para utilizar o sistema")
    
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    
    if not user or not bcrypt.checkpw(req.password.encode(), user.hashed_password.encode()):
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
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"message": "Token válido"}
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