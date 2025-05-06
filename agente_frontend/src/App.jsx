import { useState, useEffect } from 'react';
import Login from './components/login';
import Register from './components/Register';
import GPTInput from './components/GPTInput';
import Layout from './components/Layout';
import ExpenseForm from './components/ExpenseForm';
import TabelaGastos from './components/TabelaGastos';
import Dashboard from './components/Dashboard';
import { useAuth } from './contexts/AuthContext';
import ExpenseChart from './components/ExpenseChart';
import Onboarding from './components/Onboarding';
import ConfiguracaoMetas from './components/ConfiguracaoMetas';

// teste de desenvolvimento
import DevTools from './components/DevTools';

function App() {
  const [logado, setLogado] = useState(false);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState('home');
  const [usuario, setUsuario] = useState(''); // estado para exibir nome no header

  // Verificar se o usuário precisa passar pelo onboarding após login
  useEffect(() => {
    // Só verifica se o usuário estiver logado
    if (logado && usuario) {
      const verificarOnboarding = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch('http://localhost:8000/configuracoes', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            // Se o usuário não tem meta configurada, mostrar onboarding
            if (!data.meta_configurada) {
              setShowOnboarding(true);
            }
          }
        } catch (error) {
          console.error("Erro ao verificar configurações:", error);
        }
      };
      
      verificarOnboarding();
    }
  }, [logado, usuario]);

  const navegarPara = (pagina) => {
    console.log("Navegando para:", pagina); // Debugging opcional
    setPaginaAtual(pagina);
  };

  const adicionarGasto = (gasto) => {
    setGastos([...gastos, gasto]);
  };
  
  const handleOpenConfig = () => {
    setShowConfig(true);
  };
  
  const handleCloseConfig = () => {
    setShowConfig(false);
  };
  
  if (!logado) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-md">
          {mostrarCadastro ? (
            <>
              <Register onRegister={() => setMostrarCadastro(false)} />
              <p className="text-sm mt-4 text-center text-white">
                Já tem uma conta?{" "}
                <button
                  onClick={() => setMostrarCadastro(false)}
                  className="text-blue-400 underline"
                >
                  Faça login
                </button>
              </p>
            </>
          ) : (
            <>
              <Login
                onLogin={(username) => {
                  setUsuario(username);
                  setLogado(true);
                }}
              />
              <p className="text-sm mt-4 text-center text-white">
                Não tem conta?{" "}
                <button
                  onClick={() => setMostrarCadastro(true)}
                  className="text-blue-400 underline"
                >
                  Cadastre-se
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
  
  return (
      <Layout 
        username={usuario} 
        onLogout={() => setLogado(false)}
        navegarPara={navegarPara}
        paginaAtual={paginaAtual}
      >
      {paginaAtual === 'home' && (
        <div className="w-full flex justify-center">
          {/* Container principal com largura máxima e padding adequado */}
          <div className="w-full max-w-4xl px-4 sm:px-6 py-8 flex flex-col gap-8">
            
            {/* Dashboard é o primeiro componente a ser carregado */}
            <Dashboard username={usuario} />
            
            {/* Cada componente com suas próprias margens e tamanho controlado */}
            <div className="w-full bg-white rounded-lg shadow-md p-6">
              <GPTInput />
            </div>

            {logado && process.env.NODE_ENV !== 'production' && <DevTools />}
          
            <div className="w-full bg-white rounded-lg shadow-md p-6">
              <ExpenseChart gastos={gastos} />
            </div>
          </div>
        </div>
      )}
      {paginaAtual === 'config' && (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl px-4 sm:px-6 py-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <ConfiguracaoMetas 
                onVoltar={() => navegarPara('home')} 
              />
            </div>
          </div>
        </div>
      )}
      </Layout>
    );
}

export default App;