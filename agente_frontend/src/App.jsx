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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        {mostrarCadastro ? (
          <>
            <Register onRegister={() => setMostrarCadastro(false)} />
            <p className="text-sm mt-4 text-center">
              Já tem uma conta?{" "}
              <button
                onClick={() => setMostrarCadastro(false)}
                className="text-blue-600 underline"
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
            <p className="text-sm mt-4 text-center">
              Não tem conta?{" "}
              <button
                onClick={() => setMostrarCadastro(true)}
                className="text-blue-600 underline"
              >
                Cadastre-se
              </button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <Layout
      username={usuario}
      onLogout={() => {
        localStorage.removeItem("token");
        setLogado(false);
        setUsuario('');
      }}
    >
      <GPTInput />
      <ExpenseForm onAdd={adicionarGasto} />
      <TabelaGastos gastos={gastos} />
      <ExpenseChart />
    </Layout>
  );
}

export default App;
