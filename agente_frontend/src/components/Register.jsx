import { useState, useEffect } from 'react';

export default function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({
    length: true,
    uppercase: true,
    number: true,
    special: true
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar senha sempre que ela mudar
  useEffect(() => {
    const validatePassword = () => {
      const errors = {
        length: password.length < 8,
        uppercase: !/[A-Z]/.test(password),
        number: !/[0-9]/.test(password),
        special: !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      };
      
      setPasswordErrors(errors);
      setIsFormValid(!Object.values(errors).some(error => error) && username.length > 0);
    };
    
    validatePassword();
  }, [password, username]);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Verificar se a senha atende a todos os requisitos
    if (!isFormValid) {
      setMensagem("Por favor, corrija os erros de senha antes de continuar.");
      return;
    }

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

  // Componente para mostrar requisito de senha
  const PasswordRequirement = ({ isMet, text }) => (
    <div className="flex items-center gap-1 text-xs">
      <span className={`material-icons text-xs ${isMet ? 'text-red-500' : 'text-green-500'}`}>
        {isMet ? 'close' : 'check'}
      </span>
      <span className={isMet ? 'text-red-500' : 'text-green-500'}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="bg-white px-6 py-4 rounded-xl shadow-md w-[300px] mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Cadastro</h2>
      <form onSubmit={handleRegister} className="space-y-3">
        <div className="flex items-center border border-gray-300 rounded px-3 py-1">
          <span className="material-icons text-gray-500 mr-2">person</span>
          <input
            type="text"
            placeholder="Usuário"
            className="w-full text-sm outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center border border-gray-300 rounded px-3 py-1">
          <span className="material-icons text-gray-500 mr-2">lock</span>
          <input
            type="password"
            placeholder="Senha"
            className="w-full text-sm outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {/* Requisitos de senha */}
        {password.length > 0 && (
          <div className="bg-gray-50 p-2 rounded text-xs">
            <p className="mb-1 font-medium">Requisitos de senha:</p>
            <PasswordRequirement 
              isMet={passwordErrors.length} 
              text="Pelo menos 8 caracteres" 
            />
            <PasswordRequirement 
              isMet={passwordErrors.uppercase} 
              text="Pelo menos 1 letra maiúscula" 
            />
            <PasswordRequirement 
              isMet={passwordErrors.number} 
              text="Pelo menos 1 número" 
            />
            <PasswordRequirement 
              isMet={passwordErrors.special} 
              text="Pelo menos 1 caracter especial (ex: @, #, $, ...)" 
            />
          </div>
        )}
        
        {mensagem && (
          <p className={`text-xs ${mensagem.includes("sucesso") ? "text-green-600" : "text-red-500"}`}>
            {mensagem}
          </p>
        )}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full text-white text-sm py-2 rounded transition ${
            isFormValid 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}