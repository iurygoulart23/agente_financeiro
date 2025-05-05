# agente_backend/src/database.py
import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from dotenv import load_dotenv
from bson.objectid import ObjectId
from sqlalchemy.orm import Session
from src.models import User
from src.db import SessionLocal
from datetime import datetime

load_dotenv()

# Obter URI de conexão do MongoDB das variáveis de ambiente
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "agente_financeiro")

# Conectar ao MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Coleções
users_collection = db["users"]
expenses_collection = db["expenses"]

# Índices para pesquisa eficiente
expenses_collection.create_index([("user_id", ASCENDING), ("data", DESCENDING)])
expenses_collection.create_index([("user_id", ASCENDING), ("tipo", ASCENDING)])

def ensure_user_exists(user_id):
    """
    Garante que um usuário existe no MongoDB com o mesmo ID do SQLite
    """
    # Verificar se o usuário já existe no MongoDB
    mongo_user = users_collection.find_one({"sqlite_id": user_id})
    
    if not mongo_user:
        # Se não existir, cria um novo documento de usuário no MongoDB
        # Obter informações do usuário do SQLite
        db_session = SessionLocal()
        try:
            user_sqlite = db_session.query(User).filter(User.id == user_id).first()
            if user_sqlite:
                new_user = {
                    "sqlite_id": user_id,
                    "username": user_sqlite.username,
                    "created_at": datetime.utcnow()
                }
                result = users_collection.insert_one(new_user)
                return str(result.inserted_id)
            else:
                # Se não encontrar o usuário no SQLite, algo está errado
                raise ValueError(f"Usuário com ID {user_id} não encontrado no SQLite")
        finally:
            db_session.close()
    else:
        # Retorna o ID do MongoDB para o usuário
        return str(mongo_user["_id"])
    
def get_user_expenses(user_id, start_date=None, end_date=None, tipo=None):
    """
    Recupera despesas do usuário com filtros opcionais de data e tipo
    """
    # Garantir que o usuário exista no MongoDB
    ensure_user_exists(user_id)
    
    query = {"user_id": user_id}
    
    if start_date and end_date:
        query["data"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["data"] = {"$gte": start_date}
    elif end_date:
        query["data"] = {"$lte": end_date}
    
    if tipo:
        query["tipo"] = tipo
    
    # Buscar documentos e converter para formato serializável
    return [convert_mongo_doc(doc) for doc in expenses_collection.find(query)]


def save_expense(expense_data):
    """
    Salva uma nova despesa no banco de dados
    """
    # Garantir que o usuário exista no MongoDB
    ensure_user_exists(expense_data["user_id"])
    
    # Salvar o gasto
    result = expenses_collection.insert_one(expense_data)
    
    # Adicionar o ID ao documento original
    expense_data["_id"] = result.inserted_id
    
    # Converter para formato serializável
    return convert_mongo_doc(expense_data)

def convert_mongo_doc(doc):
    """Converte um documento do MongoDB para um formato JSON serializável"""
    if doc is None:
        return None
    
    result = {}
    for key, value in doc.items():
        # Converter ObjectId para string
        if isinstance(value, ObjectId):
            result[key] = str(value)
        # Lidar com listas que podem conter ObjectId
        elif isinstance(value, list):
            result[key] = [
                str(item) if isinstance(item, ObjectId) else item
                for item in value
            ]
        # Lidar com dicionários aninhados
        elif isinstance(value, dict):
            result[key] = convert_mongo_doc(value)
        else:
            result[key] = value
    
    return result