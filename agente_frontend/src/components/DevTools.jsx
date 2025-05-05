// src/components/DevTools.jsx
import { useState } from 'react';
import { formatDate } from '../assets/dateformatter';

export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Categorias pré-definidas
  const categorias = [
    'alimentação', 'transporte', 'moradia', 'lazer', 
    'saúde', 'educação', 'vestuário', 'outros'
  ];

  const resetForm = () => {
    setValor('');
    setTipo(categorias[0]);
    setData(new Date().toISOString().split('T')[0]);
    setDescricao('');
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/dev/add-test-expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          valor: parseFloat(valor),
          tipo,
          data,
          descricao
        })
      });

      const result = await response.json();

      if (response.ok) {
        setFeedback({
          type: 'success',
          message: 'Gasto de teste adicionado com sucesso!'
        });
        // Limpar o formulário, mas manter o ID do usuário
        setValor('');
        setDescricao('');
      } else {
        setFeedback({
          type: 'error',
          message: result.detail || 'Erro ao adicionar gasto de teste'
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: `Erro: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se o painel estiver fechado, mostrar apenas o botão para abrir
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700"
        title="Ferramentas de desenvolvimento"
      >
        <span className="material-icons">developer_mode</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg shadow-xl w-80 p-4 border border-gray-700 z-50">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <h3 className="text-lg font-medium text-purple-300">Ferramentas de Dev</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          <span className="material-icons">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ID do Usuário
          </label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 border rounded-md bg-gray-700 text-white border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="ID do usuário"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Valor
          </label>
          <input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full p-2 border rounded-md bg-gray-700 text-white border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Ex: 50.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Categoria
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full p-2 border rounded-md bg-gray-700 text-white border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Data
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full p-2 border rounded-md bg-gray-700 text-white border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 border rounded-md bg-gray-700 text-white border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Descrição do gasto"
            rows="2"
            required
          />
        </div>

        {feedback && (
          <div className={`p-2 rounded ${feedback.type === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
            {feedback.message}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition disabled:bg-purple-900 disabled:text-purple-300"
          >
            {isLoading ? 'Enviando...' : 'Adicionar Gasto'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
          >
            Limpar
          </button>
        </div>
      </form>

      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
        Esta ferramenta é apenas para desenvolvimento.
      </div>
    </div>
  );
}