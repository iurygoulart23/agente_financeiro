// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../assets/dateformatter';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function Dashboard({ username }) {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Token não encontrado');
        }
        
        // Buscar dados do dashboard personalizado
        const response = await fetch('http://localhost:8000/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Falha ao carregar dados do dashboard');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [username]); // Recarregar se o username mudar
  
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return null;
  }
  
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      {/* Cabeçalho personalizado */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Olá, {username}!
        </h2>
        <p className="text-gray-600">
          {getGreetingByTime()} Aqui está seu resumo financeiro.
        </p>
      </div>
      
      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card de despesas do mês */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-700 mb-1">Gastos do mês</h3>
          <p className="text-2xl font-bold text-blue-800">
            {formatCurrency(dashboardData.gastosMes)}
          </p>
          {dashboardData.comparacaoMesAnterior > 0 ? (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <span className="material-icons text-xs mr-1">arrow_upward</span>
              {dashboardData.comparacaoMesAnterior}% a mais que o mês anterior
            </p>
          ) : (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <span className="material-icons text-xs mr-1">arrow_downward</span>
              {Math.abs(dashboardData.comparacaoMesAnterior)}% a menos que o mês anterior
            </p>
          )}
        </div>
        
        {/* Card de categoria principal */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="text-sm font-medium text-purple-700 mb-1">Categoria principal</h3>
          <p className="text-xl font-bold text-purple-800 capitalize">
            {dashboardData.categoriaPrincipal.nome}
          </p>
          <p className="text-lg font-semibold text-purple-700">
            {formatCurrency(dashboardData.categoriaPrincipal.valor)}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            {dashboardData.categoriaPrincipal.porcentagem}% dos seus gastos
          </p>
        </div>
        
        {/* Card de meta ou estimativa */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-green-700 mb-1">Projeção do mês</h3>
          <p className="text-2xl font-bold text-green-800">
            {formatCurrency(dashboardData.projecaoMes)}
          </p>
          {dashboardData.projecaoMes > dashboardData.metaMensal ? (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <span className="material-icons text-xs mr-1">warning</span>
              {formatCurrency(dashboardData.projecaoMes - dashboardData.metaMensal)} acima da meta
            </p>
          ) : (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <span className="material-icons text-xs mr-1">check_circle</span>
              {formatCurrency(dashboardData.metaMensal - dashboardData.projecaoMes)} abaixo da meta
            </p>
          )}
        </div>
      </div>
      
      {/* Gráfico de gastos por categoria */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Gastos por categoria</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.gastosPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="valor" fill="#8884d8" name="Valor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Últimas transações */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Transações recentes</h3>
          <button className="text-blue-600 text-sm hover:underline">Ver todas</button>
        </div>
        
        <div className="space-y-2">
          {dashboardData.ultimasTransacoes.map((transacao, index) => (
            <div key={index} className="flex justify-between items-center p-3 border-b">
              <div>
                <p className="font-medium capitalize">{transacao.tipo}</p>
                <p className="text-sm text-gray-500">{formatDate(transacao.data, 'relative')}</p>
              </div>
              <p className="font-semibold text-gray-800">
                {formatCurrency(transacao.valor)}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dicas personalizadas */}
      {dashboardData.dicas && dashboardData.dicas.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <span className="material-icons mr-2 text-yellow-600">lightbulb</span>
            Dica personalizada
          </h3>
          <p className="text-gray-700">{dashboardData.dicas[0].texto}</p>
        </div>
      )}
    </div>
  );
}

// Função para saudação baseada na hora do dia
function getGreetingByTime() {
  const hour = new Date().getHours();
  
  if (hour < 12) return "Bom dia!";
  if (hour < 18) return "Boa tarde!";
  return "Boa noite!";
}