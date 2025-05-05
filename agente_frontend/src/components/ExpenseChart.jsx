import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function ExpenseChart({ gastos = [] }) {
  const [dadosChart, setDadosChart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes'); // 'mes', 'ano', 'semana'

  // Buscar dados do backend para o gráfico
  useEffect(() => {
    // Se temos dados locais, usamos eles
    if (gastos.length > 0) {
      const dadosFormatados = gastos.map(g => ({ 
        categoria: g.categoria, 
        gastos: g.valor 
      }));
      setDadosChart(dadosFormatados);
      return;
    }
    
    // Caso contrário, buscamos do backend
    const fetchData = async () => {
      setIsLoading(true);
      setErro(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return; // Se não houver token, não podemos buscar dados
        }
        
        // Determinar datas baseadas no período selecionado
        const hoje = new Date();
        let startDate, endDate;
        
        if (periodoSelecionado === 'semana') {
          // Último 7 dias
          startDate = new Date(hoje);
          startDate.setDate(hoje.getDate() - 7);
          endDate = hoje;
        } else if (periodoSelecionado === 'mes') {
          // Mês atual
          startDate = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          endDate = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        } else if (periodoSelecionado === 'ano') {
          // Ano atual
          startDate = new Date(hoje.getFullYear(), 0, 1);
          endDate = new Date(hoje.getFullYear(), 11, 31);
        }
        
        // Formatar datas para a API
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        // Fazer a chamada da API
        const response = await fetch(`http://localhost:8000/gastos?start_date=${formattedStartDate}&end_date=${formattedEndDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        
        const data = await response.json();
        
        if (data.status === 'sucesso' && data.gastos) {
          // Agrupar por categoria para o gráfico
          const gastosPorCategoria = {};
          
          data.gastos.forEach(gasto => {
            const categoria = gasto.tipo;
            if (!gastosPorCategoria[categoria]) {
              gastosPorCategoria[categoria] = 0;
            }
            gastosPorCategoria[categoria] += gasto.valor;
          });
          
          // Converter para o formato do gráfico
          const dadosFormatados = Object.entries(gastosPorCategoria).map(
            ([categoria, valor]) => ({ categoria, gastos: valor })
          );
          
          setDadosChart(dadosFormatados);
        } else {
          setDadosChart([]);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        setErro('Não foi possível carregar os dados do gráfico');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [gastos, periodoSelecionado]);

  // Componente de seleção de período
  const PeriodSelector = () => (
    <div className="flex space-x-1 mb-4">
      <button
        className={`px-3 py-1 text-sm rounded-md ${periodoSelecionado === 'semana' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        onClick={() => setPeriodoSelecionado('semana')}
      >
        Semana
      </button>
      <button
        className={`px-3 py-1 text-sm rounded-md ${periodoSelecionado === 'mes' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        onClick={() => setPeriodoSelecionado('mes')}
      >
        Mês
      </button>
      <button
        className={`px-3 py-1 text-sm rounded-md ${periodoSelecionado === 'ano' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        onClick={() => setPeriodoSelecionado('ano')}
      >
        Ano
      </button>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Resumo de Gastos</h2>
        <PeriodSelector />
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {erro}
        </div>
      )}
      
      {!isLoading && !erro && dadosChart.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200">
          <span className="material-icons text-gray-400 text-4xl mb-2">
            bar_chart
          </span>
          <p className="text-gray-500">Nenhum gasto registrado no período.</p>
          <p className="text-sm text-gray-400 mt-1">
            Adicione gastos para visualizar o gráfico.
          </p>
        </div>
      )}
      
      {!isLoading && !erro && dadosChart.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="categoria" 
              label={{ value: "Categoria", position: "insideBottom", offset: -5 }} 
            />
            <YAxis 
              label={{ value: 'R$', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
            <Legend />
            <Bar 
              dataKey="gastos" 
              name="Valor" 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}