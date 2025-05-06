// ConfiguracaoMetas.jsx como uma página completa
import { useState, useEffect } from 'react';
import { formatCurrency } from '../assets/dateformatter';

export default function ConfiguracaoMetas({ onVoltar }) {
  const [metaMensal, setMetaMensal] = useState('');
  const [metaOriginal, setMetaOriginal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Verificar se há mudanças no valor
  const hasMudancas = metaMensal !== metaOriginal.toString();

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:8000/configuracoes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar configurações");
        }

        const data = await response.json();
        setMetaMensal(data.meta_mensal.toString());
        setMetaOriginal(data.meta_mensal);
      } catch (error) {
        setErro("Não foi possível carregar suas configurações");
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchMeta();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErro('');
    setMensagem('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Sessão expirada");
      }

      const response = await fetch('http://localhost:8000/configurar-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meta_mensal: parseFloat(metaMensal)
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar configurações");
      }

      setMensagem("Meta atualizada com sucesso!");
      setMetaOriginal(parseFloat(metaMensal));
    } catch (error) {
      setErro(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Configurações de Meta</h2>
        <button 
          onClick={onVoltar}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <span className="material-icons mr-1">arrow_back</span>
          Voltar
        </button>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium text-lg mb-2">
              Meta de gastos mensais
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-600 text-lg">
                R$
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={metaMensal}
                onChange={(e) => setMetaMensal(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 2000.00"
              />
            </div>
            <p className="text-gray-500 mt-2">
              Esta meta é utilizada para cálculos de projeção e recomendações personalizadas.
            </p>
          </div>

          {erro && (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
              {mensagem}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || !hasMudancas}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                hasMudancas && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      )}

      {!isFetching && (
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Sua meta atual</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(metaOriginal)}
          </p>
        </div>
      )}
    </div>
  );
}