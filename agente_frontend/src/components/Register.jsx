import { useState } from 'react';

export default function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setMensagem("Cadastro realizado com sucesso! Você pode fazer login.");
        setUsername('');
        setPassword('');
        onRegister && onRegister(); // se quiser redirecionar ou algo após
      } else {
        const erro = await res.json();
        setMensagem("Erro: " + erro.detail);
      }
    } catch (error) {
      setMensagem("Erro na conexão com o servidor.");
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-center">Cadastro</h2>
      <input
        type="text"
        placeholder="username"
        className="p-2 border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        className="p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        Cadastrar
      </button>
      {mensagem && <p className="text-center text-sm text-gray-600">{mensagem}</p>}
    </form>
  );
}
