import { useState } from 'react';

export default function GPTInput() {
  const [input, setInput] = useState('');
  const [resposta, setResposta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnviar = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    
    // Simula um tempo de processamento
    setTimeout(() => {
      const respostaSimulada = {
        categoria: "Alimentação",
        valor: 120.00,
        data: "2025-05-03",
        descricao: input,
      };
      
      setResposta(respostaSimulada);
      setInput('');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col items-stretch gap-4">
      <h2 className="text-lg font-semibold mb-2">Assistente Financeiro</h2>
      
      <textarea
        className="w-full h-24 p-4 border border-gray-300 rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Digite um comando como 'Gastei R$ 200 com mercado hoje'"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      
      <button
        onClick={handleEnviar}
        disabled={isLoading || !input.trim()}
        className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processando...' : 'Enviar para o Agente'}
      </button>

      {resposta && (
        <div className="w-full bg-gray-100 p-4 rounded-lg shadow-inner text-left mt-2">
          <h3 className="text-md font-semibold mb-2">Resposta interpretada:</h3>
          <div className="bg-white p-3 rounded border">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Categoria:</div>
              <div>{resposta.categoria}</div>
              
              <div className="font-medium">Valor:</div>
              <div>R$ {resposta.valor.toFixed(2)}</div>
              
              <div className="font-medium">Data:</div>
              <div>{resposta.data}</div>
              
              <div className="font-medium">Descrição:</div>
              <div>{resposta.descricao}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}