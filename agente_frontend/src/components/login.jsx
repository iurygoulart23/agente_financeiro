import { useState } from 'react';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

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
          const userData = await verifyRes.json();
          onLogin(userData.username);
        } else {
          setErro("Erro ao verificar token");
        }
      } else {
        setErro("Usuário ou senha incorretos");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErro("Erro de rede");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white px-6 py-4 rounded-xl shadow-md w-[300px]">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Login</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="flex items-center border border-gray-300 rounded px-3 py-1">
            <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-sm outline-none"
              required
            />
          </div>
          <div className="flex items-center border border-gray-300 rounded px-3 py-1">
            <LockClosedIcon className="h-4 w-4 text-gray-500 mr-2" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm outline-none"
              required
            />
          </div>
          {erro && <p className="text-red-500 text-xs">{erro}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
