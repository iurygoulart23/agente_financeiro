// src/components/GPTInput.jsx
import { useState } from 'react';

export default function GPTInput() {
  const [input, setInput] = useState('');
  const [resposta, setResposta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [debug, setDebug] = useState([]); // Para armazenar informações de debug

  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Adiciona informação de debug
  const addDebug = (message) => {
    setDebug(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  const handleEnviar = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setErro('');
    setDebug([]);
    
    try {
      const token = getToken();
      if (!token) {
        setErro('Você precisa estar logado para usar esta função');
        setIsLoading(false);
        return;
      }
      
      // Determine se é uma consulta ou um registro de gasto
      const isGasto = input.toLowerCase().includes('gast') || 
                      /r\$\s*\d+/.test(input.toLowerCase()) || 
                      /\d+\s*reais/.test(input.toLowerCase());
      
      const endpoint = isGasto ? '/processar-gasto' : '/consultar-gastos';
      const payload = isGasto ? { texto: input } : { consulta: input };
      
      addDebug(`Endpoint selecionado: ${endpoint}`);
      addDebug(`Payload: ${JSON.stringify(payload)}`);
      
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      addDebug(`Status da resposta: ${response.status}`);
      
      // Se houve erro HTTP
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          errorText = `Erro HTTP ${response.status}`;
        }
        
        addDebug(`Erro: ${errorText}`);
        throw new Error(errorText);
      }
      
      const data = await response.json();
      addDebug(`Resposta: ${JSON.stringify(data)}`);
      
      if (isGasto) {
        // Formatando a resposta para um gasto
        setResposta({
          tipo: 'gasto',
          categoria: data.gasto.tipo,
          valor: data.gasto.valor,
          data: data.gasto.data,
          descricao: data.gasto.descricao
        });
      } else {
        // Formatando a resposta para uma consulta
        setResposta({
          tipo: 'consulta',
          periodo: data.periodo,
          total: data.total,
          por_categoria: data.por_categoria,
          gastos: data.gastos
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      addDebug(`Erro capturado: ${error.message}`);
      setErro(error.message || 'Ocorreu um erro ao processar sua solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para gerar resposta legível a partir dos dados
  const gerarRespostaLegivel = () => {
    if (!resposta) return null;
    
    if (resposta.tipo === 'gasto') {
      return (
        <div className="w-full bg-gray-100 p-4 rounded-lg shadow-inner text-left mt-2">
          <h3 className="text-md font-semibold mb-2">Gasto registrado com sucesso:</h3>
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
      );
    } else {
      // Formatação da consulta
      return (
        <div className="w-full bg-gray-100 p-4 rounded-lg shadow-inner text-left mt-2">
          <h3 className="text-md font-semibold mb-2">Resumo de gastos {resposta.periodo}:</h3>
          <div className="bg-white p-3 rounded border">
            <div className="mb-3">
              <div className="font-medium text-lg">Total: R$ {resposta.total.toFixed(2)}</div>
            </div>
            
            <div className="mb-3">
              <h4 className="font-medium mb-2">Por categoria:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(resposta.por_categoria).map(([categoria, valor]) => (
                  <React.Fragment key={categoria}>
                    <div>{categoria}:</div>
                    <div>R$ {valor.toFixed(2)}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {resposta.gastos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Últimos gastos:</h4>
                <div className="max-h-60 overflow-y-auto">
                  {resposta.gastos.slice(0, 5).map((gasto, index) => (
                    <div key={index} className="text-sm border-b py-2">
                      <div className="flex justify-between">
                        <span>{gasto.tipo}</span>
                        <span className="font-medium">R$ {gasto.valor.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-600">{gasto.data} - {gasto.descricao}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full flex flex-col items-stretch gap-4">
      <h2 className="text-lg font-semibold mb-2">Assistente Financeiro</h2>
      
      <textarea
        className="w-full h-24 p-4 border border-gray-300 rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Digite um comando como 'Gastei R$ 200 com mercado hoje' ou 'Quais foram meus gastos deste mês?'"
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

      {erro && (
        <div className="w-full bg-red-100 text-red-700 p-3 rounded-lg">
          {erro}
        </div>
      )}

      {resposta && gerarRespostaLegivel()}
      
      {/* Área de Debug - mostra em desenvolvimento e oculta em produção */}
      {process.env.NODE_ENV !== 'production' && debug.length > 0 && (
        <div className="mt-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {debug.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}