import { useState } from 'react';

export default function GPTInput() {
  const [input, setInput] = useState('');
  const [resposta, setResposta] = useState(null);

  const handleEnviar = async () => {
    if (!input.trim()) return;

    const respostaSimulada = {
      categoria: "Alimentação",
      valor: 120.00,
      data: "2025-05-03",
      descricao: input,
    };

    setResposta(respostaSimulada);
    setInput('');
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <textarea
        className="w-full max-w-2xl h-24 p-4 border border-gray-300 rounded-xl shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Digite um comando como 'Gastei R$ 200 com mercado hoje'"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleEnviar}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
      >
        Enviar para o Agente
      </button>

      {resposta && (
        <div className="w-full max-w-2xl bg-gray-100 p-4 rounded-xl shadow-inner text-left">
          <h2 className="text-lg font-semibold mb-2">Resposta interpretada:</h2>
          <pre className="text-sm">{JSON.stringify(resposta, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
