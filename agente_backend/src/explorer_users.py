import sqlite3

def explorar_sqlite(caminho_db):
    try:
        conn = sqlite3.connect(caminho_db)
        cursor = conn.cursor()

        print(f"\n📁 Conectado ao banco de dados: {caminho_db}\n")

        # Listar tabelas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tabelas = cursor.fetchall()
        if not tabelas:
            print("⚠️ Nenhuma tabela encontrada no banco de dados.")
            return

        print("📋 Tabelas encontradas:")
        for i, (tabela,) in enumerate(tabelas, 1):
            print(f"  {i}. {tabela}")
        print()

        # Para cada tabela, mostrar colunas e dados
        for (tabela,) in tabelas:
            print(f"🔎 Explorando tabela: {tabela}")

            # Mostrar colunas
            cursor.execute(f"PRAGMA table_info({tabela});")
            colunas = cursor.fetchall()
            nomes_colunas = [col[1] for col in colunas]
            print("   📌 Colunas:", ", ".join(nomes_colunas))

            # Mostrar até 10 registros
            cursor.execute(f"SELECT * FROM {tabela} LIMIT 10;")
            dados = cursor.fetchall()
            print(f"   📄 {len(dados)} linhas encontradas (mostrando até 10):")
            for linha in dados:
                print("   ", linha)
            print()

    except Exception as e:
        print("❌ Erro ao acessar o banco de dados:", e)

    finally:
        conn.close()
        print("🔒 Conexão encerrada.")


explorar_sqlite("users.db")