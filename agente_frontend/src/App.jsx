import { useState } from 'react';
import Login from './components/login';
import Register from './components/Register';
import GPTInput from './components/GPTInput';
import Layout from './components/Layout';
import ExpenseForm from './components/ExpenseForm';
import TabelaGastos from './components/TabelaGastos';
import ExpenseChart from './components/ExpenseChart';

function App() {
  const [logado, setLogado] = useState(false);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [usuario, setUsuario] = useState(''); // novo estado para exibir nome no header

  const adicionarGasto = (gasto) => {
    setGastos([...gastos, gasto]);
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
    <Layout username={usuario} onLogout={() => setLogado(false)}>
      <div className="w-full flex justify-center bg-red-100">
        <div className="w-full max-w-3xl px-6 sm:px-10 md:px-16 lg:px-24 flex flex-col gap-12 bg-red-100">
          <GPTInput />
          <ExpenseForm onAddExpense={adicionarGasto} />
          <ExpenseChart gastos={gastos} />
          <TabelaGastos gastos={gastos} />
          </div>
      </div>
    </Layout>
  );
}

export default App;
