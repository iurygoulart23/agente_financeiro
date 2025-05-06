// src/components/Onboarding.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [metaMensal, setMetaMensal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { user } = useAuth();

  const steps = [
    {
      title: "Bem-vindo ao Agente Financeiro",
      description: "Vamos configurar sua conta para você aproveitar ao máximo nosso assistente."
    },
    {
      title: "Defina sua meta mensal",
      description: "Qual o valor máximo que você pretende gastar por mês? Isso nos ajudará a monitorar seus gastos e fornecer dicas personalizadas."
    },
    {
      title: "Tudo pronto!",
      description: "Suas configurações foram salvas. Agora você pode começar a usar o assistente financeiro."
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!metaMensal) {
      setErro("Por favor, defina uma meta mensal");
      return;
    }

    setIsLoading(true);
    setErro('');

    try {
      const response = await fetch('http://localhost:8000/configurar-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          meta_mensal: parseFloat(metaMensal)
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar configurações");
      }

      handleNext();
    } catch (error) {
      setErro(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    onComplete && onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{steps[step].title}</h2>
          <p className="text-gray-600 mt-2">{steps[step].description}</p>
        </div>

        {step === 0 && (
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-700 text-center">
              Olá, <span className="font-semibold">{user?.username}</span>!<br />
              Estamos felizes em ter você aqui.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Meta de gastos mensais (R$)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={metaMensal}
              onChange={(e) => setMetaMensal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 2000.00"
            />
            {erro && <p className="text-red-500 text-sm mt-1">{erro}</p>}
            <p className="text-sm text-gray-500 mt-2">
              Esta meta ajudará você a controlar seus gastos e será usada para calcular previsões.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-700 text-center">
              Você definiu uma meta mensal de <span className="font-semibold">R$ {parseFloat(metaMensal).toFixed(2)}</span>.<br />
              Você pode alterar isso a qualquer momento nas configurações.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          {step === 0 && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Próximo
            </button>
          )}

          {step === 1 && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Começar a usar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}