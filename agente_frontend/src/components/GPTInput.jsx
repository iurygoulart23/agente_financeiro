// src/components/GPTInput.jsx
import { useState } from 'react';
import { formatDate, formatCurrency } from './../assets/dateformatter';

// Constantes para tipos de erro
const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  SERVER: 'server',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown'
};

// Utilitário para detectar tipo de erro
const detectErrorType = (error, status) => {
  if (!navigator.onLine) {
    return ERROR_TYPES.NETWORK;
  }
  
  if (status === 401 || status === 403) {
    return ERROR_TYPES.AUTH;
  }
  
  if (status >= 500) {
    return ERROR_TYPES.SERVER;
  }
  
  if (status === 400 || status === 422) {
    return ERROR_TYPES.VALIDATION;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

// Componente de exibição de erro
const ErrorDisplay = ({ type, message, onRetry, onLogout }) => {
  const getErrorInfo = () => {
    switch(type) {
      case ERROR_TYPES.NETWORK:
        return {
          title: 'Erro de conexão',
          description: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
          icon: 'wifi_off',
          action: { label: 'Tentar novamente', handler: onRetry }
        };
      case ERROR_TYPES.AUTH:
        return {
          title: 'Sessão expirada',
          description: 'Sua sessão expirou ou as credenciais são inválidas.',
          icon: 'lock',
          action: { label: 'Fazer login novamente', handler: onLogout }
        };
      case ERROR_TYPES.SERVER:
        return {
          title: 'Erro no servidor',
          description: 'Nosso servidor está enfrentando problemas. Tente novamente mais tarde.',
          icon: 'error',
          action: { label: 'Tentar novamente', handler: onRetry }
        };
      case ERROR_TYPES.VALIDATION:
        return {
          title: 'Dados inválidos',
          description: message || 'Os dados fornecidos são inválidos.',
          icon: 'warning',
          action: null
        };
      default:
        return {
          title: 'Erro inesperado',
          description: message || 'Ocorreu um erro inesperado.',
          icon: 'help',
          action: { label: 'Tentar novamente', handler: onRetry }
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
      <div className="flex items-start">
        <span className="material-icons text-red-500 mr-3">{errorInfo.icon}</span>
        <div>
          <h3 className="font-medium text-red-800">{errorInfo.title}</h3>
          <p className="text-sm text-red-600 mt-1">{errorInfo.description}</p>
          {errorInfo.action && (
            <button 
              onClick={errorInfo.action.handler}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
            >
              {errorInfo.action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function GPTInput() {
  const [input, setInput] = useState('');
  const [resposta, setResposta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [debug, setDebug] = useState([]);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const addDebug = (message) => {
    setDebug(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  const handleRetry = () => {
    // Só permite retry se tiver input
    if (input.trim()) {
      handleEnviar();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // Força recarregar para ir para tela de login
  };

  const handleEnviar = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setErro(null);
    setDebug([]);
    
    try {
      const token = getToken();
      if (!token) {
        setErro({ 
          type: ERROR_TYPES.AUTH, 
          message: 'Você precisa estar logado para usar esta função' 
        });
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
        let errorData = {};
        
        try {
          errorData = await response.json();
          errorText = errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          errorText = `Erro HTTP ${response.status}`;
        }
        
        addDebug(`Erro: ${errorText}`);
        
        // Detectar o tipo de erro
        const errorType = detectErrorType(null, response.status);
        setErro({ type: errorType, message: errorText });
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
      
      // Se o erro já foi definido no bloco anterior, não sobrescrevemos
      if (!erro) {
        // Verificar se é erro de rede
        if (!navigator.onLine || error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          setErro({ 
            type: ERROR_TYPES.NETWORK, 
            message: 'Não foi possível conectar ao servidor' 
          });
        } else {
          setErro({ 
            type: ERROR_TYPES.UNKNOWN, 
            message: error.message || 'Ocorreu um erro ao processar sua solicitação' 
          });
        }
      }
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
              <div>{formatCurrency(resposta.valor)}</div>
              
              <div className="font-medium">Data:</div>
              <div>{formatDate(resposta.data, 'medium')}</div>
              
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
          <h3 className="text-md font-semibold mb-2">
            Resumo de gastos {resposta.periodo}:
          </h3>
          <div className="bg-white p-3 rounded border">
            <div className="mb-3">
              <div className="font-medium text-lg">
                Total: {formatCurrency(resposta.total)}
              </div>
            </div>
            
            <div className="mb-3">
              <h4 className="font-medium mb-2">Por categoria:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(resposta.por_categoria).map(([categoria, valor]) => (
                  <React.Fragment key={categoria}>
                    <div>{categoria}:</div>
                    <div>{formatCurrency(valor)}</div>
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
                        <span className="font-medium">{formatCurrency(gasto.valor)}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(gasto.data, 'relative')} - {gasto.descricao}
                      </div>
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
        <ErrorDisplay 
          type={erro.type} 
          message={erro.message} 
          onRetry={handleRetry}
          onLogout={handleLogout}
        />
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