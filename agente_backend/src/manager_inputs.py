import os
from pymongo import MongoClient
from datetime import datetime
from pprint import pprint
from dotenv import load_dotenv

# Carregar variáveis de ambiente (opcional)
try:
    load_dotenv()
except ImportError:
    print("Pacote python-dotenv não encontrado. Usando URI padrão.")

# Configurações
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "agente_financeiro")

def conectar_mongodb():
    """Conecta ao MongoDB e retorna o objeto de conexão"""
    try:
        print(f"Conectando ao MongoDB: {MONGO_URI}")
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Verificar conexão
        client.admin.command('ping')
        print("Conexão estabelecida com sucesso!")
        
        return client
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}")
        return None

def listar_bancos_dados(client):
    """Lista todos os bancos de dados"""
    if not client:
        return
    
    print("\n=== Bancos de Dados Disponíveis ===")
    dbs = client.list_database_names()
    for i, db_name in enumerate(dbs, 1):
        print(f"{i}. {db_name}")
    
    return dbs

def listar_colecoes(client, db_name):
    """Lista todas as coleções de um banco de dados"""
    if not client:
        return
    
    db = client[db_name]
    print(f"\n=== Coleções em '{db_name}' ===")
    collections = db.list_collection_names()
    
    if not collections:
        print(f"Nenhuma coleção encontrada no banco '{db_name}'")
        return []
    
    for i, col_name in enumerate(collections, 1):
        print(f"{i}. {col_name}")
    
    return collections

def mostrar_documentos(client, db_name, collection_name, limit=10):
    """Mostra os documentos de uma coleção"""
    if not client:
        return
    
    db = client[db_name]
    collection = db[collection_name]
    
    count = collection.count_documents({})
    print(f"\n=== Documentos em '{collection_name}' (Total: {count}) ===")
    
    if count == 0:
        print(f"Nenhum documento encontrado na coleção '{collection_name}'")
        return
    
    documents = collection.find().limit(limit)
    
    for i, doc in enumerate(documents, 1):
        print(f"\n--- Documento {i} ---")
        pprint(doc)
    
    if count > limit:
        print(f"\nMostrando {limit} de {count} documentos.")

def buscar_por_usuario(client, db_name, user_id):
    """Busca todos os documentos para um usuário específico"""
    if not client:
        return
    
    db = client[db_name]
    
    # Verifica se a coleção de gastos existe
    if "expenses" not in db.list_collection_names():
        print("Coleção 'expenses' não encontrada!")
        return
    
    expenses = db["expenses"]
    
    # Busca por user_id
    docs = expenses.find({"user_id": user_id})
    count = expenses.count_documents({"user_id": user_id})
    
    print(f"\n=== Gastos do usuário ID {user_id} (Total: {count}) ===")
    
    if count == 0:
        print(f"Nenhum gasto encontrado para o usuário com ID {user_id}")
        return
    
    total_gastos = 0
    gastos_por_categoria = {}
    
    for i, doc in enumerate(docs, 1):
        print(f"\n--- Gasto {i} ---")
        pprint(doc)
        
        # Acumular para estatísticas
        if "valor" in doc:
            total_gastos += doc["valor"]
            
            categoria = doc.get("tipo", "Sem categoria")
            if categoria not in gastos_por_categoria:
                gastos_por_categoria[categoria] = 0
            gastos_por_categoria[categoria] += doc["valor"]
    
    # Mostrar estatísticas
    if total_gastos > 0:
        print("\n=== Resumo de Gastos ===")
        print(f"Total: R$ {total_gastos:.2f}")
        
        print("\nPor Categoria:")
        for categoria, valor in gastos_por_categoria.items():
            porcentagem = (valor / total_gastos) * 100
            print(f"- {categoria}: R$ {valor:.2f} ({porcentagem:.1f}%)")

def inserir_documento_teste(client, db_name):
    """Insere um documento de teste na coleção expenses"""
    if not client:
        return
    
    db = client[db_name]
    collection = db["expenses"]
    
    # Documento de teste
    documento = {
        "user_id": 1,
        "data": datetime.now().strftime("%Y-%m-%d"),
        "tipo": "alimentação",
        "valor": 50.0,
        "descricao": "Gasto de teste inserido pelo script"
    }
    
    try:
        result = collection.insert_one(documento)
        print(f"\nDocumento de teste inserido com ID: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print(f"Erro ao inserir documento: {e}")
        return None

def menu_principal():
    """Menu principal interativo"""
    client = conectar_mongodb()
    
    if not client:
        print("Não foi possível conectar ao MongoDB. Verifique se o servidor está rodando.")
        return
    
    while True:
        print("\n===== MongoDB Explorer =====")
        print("1. Listar bancos de dados")
        print("2. Listar coleções")
        print("3. Mostrar documentos de uma coleção")
        print("4. Buscar gastos de um usuário específico")
        print("5. Inserir documento de teste")
        print("0. Sair")
        
        opcao = input("\nEscolha uma opção: ")
        
        if opcao == "0":
            break
        
        elif opcao == "1":
            listar_bancos_dados(client)
        
        elif opcao == "2":
            db_name = input("Nome do banco de dados: ") or DB_NAME
            listar_colecoes(client, db_name)
        
        elif opcao == "3":
            db_name = input("Nome do banco de dados: ") or DB_NAME
            collections = listar_colecoes(client, db_name)
            
            if collections:
                col_name = input("Nome da coleção: ")
                if col_name in collections:
                    limit = input("Número de documentos (padrão 10): ")
                    limit = int(limit) if limit.isdigit() else 10
                    mostrar_documentos(client, db_name, col_name, limit)
                else:
                    print("Coleção não encontrada!")
        
        elif opcao == "4":
            db_name = input("Nome do banco de dados: ") or DB_NAME
            try:
                user_id = int(input("ID do usuário: "))
                buscar_por_usuario(client, db_name, user_id)
            except ValueError:
                print("ID do usuário deve ser um número inteiro!")
        
        elif opcao == "5":
            db_name = input("Nome do banco de dados: ") or DB_NAME
            inserir_documento_teste(client, db_name)
        
        else:
            print("Opção inválida!")
    
    print("Encerrando conexão com MongoDB...")
    client.close()
    print("Até logo!")

if __name__ == "__main__":
    menu_principal()