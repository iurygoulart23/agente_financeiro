import { useState } from 'react';
import { LockClosedIcon, UserIcon } from '@heroicons/react/20/solid';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // evita Login
    setErro(""); // Limpa o erro ao tentar fazer login

    console.log("Enviando login para o backend...");

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);

        const verifyRes = await fetch("http://localhost:8000/verify", {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        if (verifyRes.ok) {
          onLogin(username);
        } else {
          alert("Token inválido");
        }
      } else {
        alert("Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro na requisição de login:", error);
      alert("Erro na conexão com o servidor");
    }
  };

  return (
    <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold text-center text-blue-600">Login</h2>
    
      {erro && <div className="text-red-500 text-sm text-center">{erro}</div>}

      <div className="flex items-center border rounded px-3 py-2">
        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="username"
          className="p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      
      <div className="flex items-center border rounded px-3 py-2">
        <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="password"
          placeholder="password"
          className="p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Entrar
      </button>
    </form>
  );
}
