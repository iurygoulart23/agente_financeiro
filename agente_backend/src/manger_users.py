import sqlite3

def explorar_sqlite(caminho_db):
    try:
        conn = sqlite3.connect(caminho_db)
        cursor = conn.cursor()

        print(f"\n📁 Conectado ao banco de dados: {caminho_db}\n")

        # Listar usuários
        cursor.execute("SELECT id, username, liberado, is_admin FROM users")
        usuarios = cursor.fetchall()

        if not usuarios:
            print("⚠️ Nenhum usuário cadastrado.")
            return

        print("👤 Lista de usuários:")
        for i, (id, username, liberado, is_admin) in enumerate(usuarios, 1):
            status = f"liberado={bool(liberado)}, admin={bool(is_admin)}"
            print(f"  {i}. {username} (ID: {id}) – {status}")

        # Escolher usuário
        escolha = input("\nDigite o número do usuário para editar (ou Enter para cancelar): ")
        if not escolha.strip():
            print("❌ Operação cancelada.")
            return

        idx = int(escolha) - 1
        if idx < 0 or idx >= len(usuarios):
            print("❌ Número inválido.")
            return

        user_id = usuarios[idx][0]
        username = usuarios[idx][1]

        print(f"\n🛠️ Editando usuário: {username} (ID {user_id})")

        liberar = input("Liberar o usuário para uso do sistema? (s/n): ").strip().lower() == "s"
        admin = input("Tornar o usuário administrador? (s/n): ").strip().lower() == "s"

        cursor.execute("""
            UPDATE users
            SET liberado = ?, is_admin = ?
            WHERE id = ?
        """, (int(liberar), int(admin), user_id))
        conn.commit()

        print(f"✅ Usuário '{username}' atualizado com sucesso!")

    except Exception as e:
        print("❌ Erro ao acessar o banco de dados:", e)

    finally:
        conn.close()
        print("🔒 Conexão encerrada.")

# Executar o menu
explorar_sqlite("./../users.db")
